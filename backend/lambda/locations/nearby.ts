import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const LOCATIONS_TABLE = process.env.LOCATIONS_TABLE!;

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Nearby locations request:', JSON.stringify(event, null, 2));

  try {
    const { lat, lng, radius = '20', limit = '50' } = event.queryStringParameters || {};

    if (!lat || !lng) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'lat and lng query parameters are required' }),
      };
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Scan all locations (in production, use DynamoDB Geo Library or geohashing)
    const command = new ScanCommand({
      TableName: LOCATIONS_TABLE,
    });

    const result = await docClient.send(command);
    const locations = result.Items || [];

    // Calculate distance for each location and filter by radius
    const nearbyLocations = locations
      .map((location) => ({
        ...location,
        distance: calculateDistance(userLat, userLng, location.lat, location.lng),
      }))
      .filter((location) => location.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        locations: nearbyLocations,
        count: nearbyLocations.length,
        searchRadius,
        center: { lat: userLat, lng: userLng },
      }),
    };
  } catch (error) {
    console.error('Error finding nearby locations:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to find nearby locations',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
