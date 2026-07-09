import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Update user request:', JSON.stringify(event, null, 2));

  try {
    // Get user ID from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { username, firstName, lastName } = body;

    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    if (username !== undefined) {
      updateExpressions.push('#username = :username');
      expressionAttributeNames['#username'] = 'username';
      expressionAttributeValues[':username'] = username;
    }

    if (firstName !== undefined) {
      updateExpressions.push('firstName = :firstName');
      expressionAttributeValues[':firstName'] = firstName;
    }

    if (lastName !== undefined) {
      updateExpressions.push('lastName = :lastName');
      expressionAttributeValues[':lastName'] = lastName;
    }

    if (updateExpressions.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'No fields to update',
          message: 'Provide at least one field: username, firstName, lastName',
        }),
      };
    }

    // Add updatedAt timestamp
    updateExpressions.push('updatedAt = :now');
    expressionAttributeValues[':now'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames:
        Object.keys(expressionAttributeNames).length > 0
          ? expressionAttributeNames
          : undefined,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        user: result.Attributes,
        message: 'User updated successfully',
      }),
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
