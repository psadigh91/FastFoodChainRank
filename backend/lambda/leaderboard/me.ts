import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const LEADERBOARD_TABLE = process.env.LEADERBOARD_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Get my rank request:', JSON.stringify(event, null, 2));

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

    // Get user's leaderboard entry
    const getUserCommand = new GetCommand({
      TableName: LEADERBOARD_TABLE,
      Key: {
        pk: 'LEADERBOARD',
        sk: `USER#${userId}`,
      },
    });

    const userResult = await docClient.send(getUserCommand);
    const userEntry = userResult.Item;

    if (!userEntry) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'User not found on leaderboard',
          message: 'Submit a review to appear on the leaderboard',
        }),
      };
    }

    // Get all entries with more points to determine rank
    const queryCommand = new QueryCommand({
      TableName: LEADERBOARD_TABLE,
      IndexName: 'CityPointsIndex',
      KeyConditionExpression: 'city = :city AND points > :points',
      ExpressionAttributeValues: {
        ':city': userEntry.city,
        ':points': userEntry.points,
      },
      Select: 'COUNT',
    });

    const countResult = await docClient.send(queryCommand);
    const rank = (countResult.Count || 0) + 1;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ...userEntry,
        rank,
      }),
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to get user rank',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
