import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({});
const RECEIPTS_BUCKET = process.env.RECEIPTS_BUCKET!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Upload receipt request:', JSON.stringify(event, null, 2));

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
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Missing required fields: fileName, contentType',
        }),
      };
    }

    // Validate content type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Invalid content type. Only JPEG, PNG, and HEIC images are allowed.',
        }),
      };
    }

    // Generate unique key for S3
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const receiptId = uuidv4();
    const s3Key = `receipts/${userId}/${receiptId}.${fileExtension}`;

    // Generate presigned URL for upload (expires in 5 minutes)
    const command = new PutObjectCommand({
      Bucket: RECEIPTS_BUCKET,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Public URL for the receipt (after upload)
    const receiptUrl = `https://${RECEIPTS_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${s3Key}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        uploadUrl,
        receiptUrl,
        receiptId,
        expiresIn: 300,
      }),
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to generate upload URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
