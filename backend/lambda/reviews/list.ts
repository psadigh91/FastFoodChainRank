import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const REVIEWS_TABLE = process.env.REVIEWS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('List reviews request:', JSON.stringify(event, null, 2));

  try {
    const {
      locationId,
      userId,
      menuItem,
      verified,
      limit = '50',
    } = event.queryStringParameters || {};

    let command;

    // Query by locationId if provided (most common use case)
    if (locationId) {
      command = new QueryCommand({
        TableName: REVIEWS_TABLE,
        IndexName: 'LocationIndex',
        KeyConditionExpression: 'locationId = :locationId',
        ExpressionAttributeValues: {
          ':locationId': locationId,
        },
        Limit: parseInt(limit),
        ScanIndexForward: false, // Most recent first
      });
    }
    // Query by userId if provided
    else if (userId) {
      command = new QueryCommand({
        TableName: REVIEWS_TABLE,
        IndexName: 'UserIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        Limit: parseInt(limit),
        ScanIndexForward: false,
      });
    }
    // Otherwise scan (less efficient but flexible)
    else {
      const filterExpressions: string[] = [];
      const expressionAttributeValues: Record<string, any> = {};

      if (menuItem) {
        filterExpressions.push('menuItem = :menuItem');
        expressionAttributeValues[':menuItem'] = menuItem;
      }

      if (verified !== undefined) {
        filterExpressions.push('verified = :verified');
        expressionAttributeValues[':verified'] = verified === 'true';
      }

      command = new ScanCommand({
        TableName: REVIEWS_TABLE,
        FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
        ExpressionAttributeValues:
          Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
        Limit: parseInt(limit),
      });
    }

    const result = await docClient.send(command);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        reviews: result.Items || [],
        count: result.Items?.length || 0,
        lastEvaluatedKey: result.LastEvaluatedKey,
      }),
    };
  } catch (error) {
    console.error('Error listing reviews:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to list reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
