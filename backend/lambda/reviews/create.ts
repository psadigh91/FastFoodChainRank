import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const REVIEWS_TABLE = process.env.REVIEWS_TABLE!;
const LOCATIONS_TABLE = process.env.LOCATIONS_TABLE!;
const USERS_TABLE = process.env.USERS_TABLE!;
const LEADERBOARD_TABLE = process.env.LEADERBOARD_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Create review request:', JSON.stringify(event, null, 2));

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
    const { locationId, menuItem, rating, comment, receiptUrl } = body;

    // Validate required fields
    if (!locationId || !menuItem || !rating) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Missing required fields: locationId, menuItem, rating',
        }),
      };
    }

    // Validate rating range
    if (rating < 1 || rating > 10) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Rating must be between 1 and 10' }),
      };
    }

    // Verify location exists
    const locationCommand = new GetCommand({
      TableName: LOCATIONS_TABLE,
      Key: { locationId },
    });
    const locationResult = await docClient.send(locationCommand);

    if (!locationResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Location not found' }),
      };
    }

    // Create review
    const reviewId = uuidv4();
    const now = new Date().toISOString();

    const review = {
      reviewId,
      userId,
      locationId,
      menuItem,
      rating,
      comment: comment || '',
      receiptUrl: receiptUrl || null,
      verified: !!receiptUrl, // Auto-verify if receipt provided
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: REVIEWS_TABLE,
        Item: review,
      })
    );

    // Update location's average rating and review count
    const location = locationResult.Item;
    const currentMenuItemRating = location.menuItems?.[menuItem] || { avgRating: 0, count: 0 };

    const newCount = currentMenuItemRating.count + 1;
    const newAvgRating =
      (currentMenuItemRating.avgRating * currentMenuItemRating.count + rating) / newCount;

    const updatedMenuItems = {
      ...location.menuItems,
      [menuItem]: {
        avgRating: newAvgRating,
        count: newCount,
      },
    };

    // Calculate overall location rating
    const allRatings = Object.values(updatedMenuItems).map((item: any) => ({
      rating: item.avgRating,
      count: item.count,
    }));
    const totalReviews = allRatings.reduce((sum, item) => sum + item.count, 0);
    const weightedSum = allRatings.reduce((sum, item) => sum + item.rating * item.count, 0);
    const overallRating = totalReviews > 0 ? weightedSum / totalReviews : 0;

    await docClient.send(
      new UpdateCommand({
        TableName: LOCATIONS_TABLE,
        Key: { locationId },
        UpdateExpression:
          'SET menuItems = :menuItems, averageRating = :avgRating, reviewCount = :reviewCount, updatedAt = :now',
        ExpressionAttributeValues: {
          ':menuItems': updatedMenuItems,
          ':avgRating': overallRating,
          ':reviewCount': totalReviews,
          ':now': now,
        },
      })
    );

    // Update user points and review count
    const pointsEarned = receiptUrl ? 10 : 5; // More points with receipt

    await docClient.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        UpdateExpression:
          'ADD points :points, reviewCount :one SET updatedAt = :now',
        ExpressionAttributeValues: {
          ':points': pointsEarned,
          ':one': 1,
          ':now': now,
        },
      })
    );

    // Update leaderboard
    const userCommand = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    });
    const userResult = await docClient.send(userCommand);
    const user = userResult.Item;

    if (user) {
      await docClient.send(
        new PutCommand({
          TableName: LEADERBOARD_TABLE,
          Item: {
            pk: 'LEADERBOARD',
            sk: `USER#${userId}`,
            userId,
            username: user.username || user.email,
            city: location.city,
            points: user.points + pointsEarned,
            reviewCount: user.reviewCount + 1,
            badges: user.badges || [],
            lastUpdated: now,
          },
        })
      );
    }

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        review,
        pointsEarned,
        message: 'Review created successfully',
      }),
    };
  } catch (error) {
    console.error('Error creating review:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to create review',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
