import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const LOCATIONS_TABLE = process.env.LOCATIONS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('List locations request:', JSON.stringify(event, null, 2));

  try {
    const { chain, city, limit = '50' } = event.queryStringParameters || {};

    let command;

    // If chain and city are provided, use GSI for efficient query
    if (chain && city) {
      command = new QueryCommand({
        TableName: LOCATIONS_TABLE,
        IndexName: 'ChainCityIndex',
        KeyConditionExpression: 'chain = :chain AND city = :city',
        ExpressionAttributeValues: {
          ':chain': chain,
          ':city': city,
        },
        Limit: parseInt(limit),
      });
    } else {
      // Otherwise, scan the table
      command = new ScanCommand({
        TableName: LOCATIONS_TABLE,
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
        locations: result.Items || [],
        count: result.Items?.length || 0,
      }),
    };
  } catch (error) {
    console.error('Error listing locations:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to list locations',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
