import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const REVIEWS_TABLE = process.env.REVIEWS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Get location reviews request:', JSON.stringify(event, null, 2));

  try {
    const locationId = event.pathParameters?.locationId;
    const { limit = '50', menuItem } = event.queryStringParameters || {};

    if (!locationId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'locationId is required' }),
      };
    }

    const queryParams: any = {
      TableName: REVIEWS_TABLE,
      IndexName: 'LocationIndex',
      KeyConditionExpression: 'locationId = :locationId',
      ExpressionAttributeValues: {
        ':locationId': locationId,
      },
      Limit: parseInt(limit),
      ScanIndexForward: false, // Most recent first
    };

    // Add filter for specific menu item if provided
    if (menuItem) {
      queryParams.FilterExpression = 'menuItem = :menuItem';
      queryParams.ExpressionAttributeValues[':menuItem'] = menuItem;
    }

    const command = new QueryCommand(queryParams);
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
        locationId,
      }),
    };
  } catch (error) {
    console.error('Error getting location reviews:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to get reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
