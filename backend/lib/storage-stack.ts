import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
  public readonly receiptsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for receipt images
    this.receiptsBucket = new s3.Bucket(this, 'ReceiptsBucket', {
      bucketName: `chainrank-receipts-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          // Move old receipts to cheaper storage after 90 days
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          // SECURITY: Restrict CORS in production - set CORS_ORIGINS environment variable
          allowedOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
    });

    // CloudFormation Output
    new cdk.CfnOutput(this, 'ReceiptsBucketName', {
      value: this.receiptsBucket.bucketName,
      description: 'S3 Bucket for receipt images',
    });

    new cdk.CfnOutput(this, 'ReceiptsBucketArn', {
      value: this.receiptsBucket.bucketArn,
      description: 'S3 Bucket ARN',
    });
  }
}
