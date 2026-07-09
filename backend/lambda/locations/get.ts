import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const LOCATIONS_TABLE = process.env.LOCATIONS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Get location request:', JSON.stringify(event, null, 2));

  try {
    const locationId = event.pathParameters?.locationId;

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

    const command = new GetCommand({
      TableName: LOCATIONS_TABLE,
      Key: { locationId },
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Location not found' }),
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
    console.error('Error getting location:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to get location',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
