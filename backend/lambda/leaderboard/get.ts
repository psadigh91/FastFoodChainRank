import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const LEADERBOARD_TABLE = process.env.LEADERBOARD_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Get leaderboard request:', JSON.stringify(event, null, 2));

  try {
    const { city = 'Los Angeles', limit = '100' } = event.queryStringParameters || {};

    // Query leaderboard for specific city, sorted by points (descending)
    const command = new QueryCommand({
      TableName: LEADERBOARD_TABLE,
      IndexName: 'CityPointsIndex',
      KeyConditionExpression: 'city = :city',
      ExpressionAttributeValues: {
        ':city': city,
      },
      Limit: parseInt(limit),
      ScanIndexForward: false, // Descending order (highest points first)
    });

    const result = await docClient.send(command);
    const entries = result.Items || [];

    // Add rank to each entry
    const rankedEntries = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        leaderboard: rankedEntries,
        count: rankedEntries.length,
        city,
      }),
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to get leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
