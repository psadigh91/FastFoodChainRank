import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Get current user request:', JSON.stringify(event, null, 2));

  try {
    // Get user ID from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims?.sub;
    const email = event.requestContext.authorizer?.claims?.email;

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

    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    });

    const result = await docClient.send(command);

    // If user doesn't exist in DynamoDB yet, create initial record
    if (!result.Item) {
      const newUser = {
        userId,
        email,
        points: 0,
        level: 1,
        badges: [],
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(newUser),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to get user',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
