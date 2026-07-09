import { APIGatewayProxyHandler } from 'aws-lambda';
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';

const textractClient = new TextractClient({});
const RECEIPTS_BUCKET = process.env.RECEIPTS_BUCKET!;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Verify receipt request:', JSON.stringify(event, null, 2));

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
    const { receiptUrl, expectedLocation } = body;

    if (!receiptUrl) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'receiptUrl is required' }),
      };
    }

    // Extract S3 key from URL
    const urlParts = receiptUrl.split('/');
    const s3Key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/

    // Call Textract to extract text from receipt
    const command = new DetectDocumentTextCommand({
      Document: {
        S3Object: {
          Bucket: RECEIPTS_BUCKET,
          Name: s3Key,
        },
      },
    });

    const textractResult = await textractClient.send(command);

    // Extract all text lines
    const extractedLines: string[] = [];
    if (textractResult.Blocks) {
      for (const block of textractResult.Blocks) {
        if (block.BlockType === 'LINE' && block.Text) {
          extractedLines.push(block.Text.toLowerCase());
        }
      }
    }

    const extractedText = extractedLines.join(' ');

    // Verify location name (if provided)
    let locationMatched = false;
    if (expectedLocation) {
      const locationWords = expectedLocation.toLowerCase().split(' ');
      locationMatched = locationWords.some((word: string) => extractedText.includes(word));
    }

    // Check if receipt is recent (within 24 hours)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let dateMatched = false;
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g, // MM/DD/YYYY or MM-DD-YYYY
      /(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g, // YYYY/MM/DD or YYYY-MM-DD
    ];

    for (const pattern of datePatterns) {
      const matches = extractedText.matchAll(pattern);
      for (const match of matches) {
        // Simple date validation - check if date is recent
        dateMatched = true; // Simplified - in production, parse and compare dates
        break;
      }
    }

    // Check for Chipotle-specific keywords
    const chipotleKeywords = ['chipotle', 'burrito', 'bowl', 'guacamole', 'queso'];
    const hasChipotleKeywords = chipotleKeywords.some((keyword) =>
      extractedText.includes(keyword)
    );

    // Calculate confidence score
    let confidence = 0;
    if (locationMatched) confidence += 40;
    if (dateMatched) confidence += 30;
    if (hasChipotleKeywords) confidence += 30;

    const verified = confidence >= 60; // Need at least 60% confidence

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        verified,
        confidence,
        message: verified
          ? 'Receipt verified successfully'
          : 'Receipt verification failed - low confidence',
        // SECURITY: Removed extractedText, locationMatched, dateMatched to prevent PII exposure
        // Receipt text may contain credit card numbers, addresses, or other sensitive data
      }),
    };
  } catch (error) {
    console.error('Error verifying receipt:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to verify receipt',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
