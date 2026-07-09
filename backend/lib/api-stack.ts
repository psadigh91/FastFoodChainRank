import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { DatabaseStack } from './database-stack';
import { StorageStack } from './storage-stack';
import { AuthStack } from './auth-stack';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
  databaseStack: DatabaseStack;
  storageStack: StorageStack;
  authStack: AuthStack;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { databaseStack, storageStack, authStack } = props;

    // API Gateway
    this.api = new apigateway.RestApi(this, 'ChainRankApi', {
      restApiName: 'ChainRank API',
      description: 'ChainRank REST API for locations, reviews, and users',
      defaultCorsPreflightOptions: {
        // SECURITY: Restrict CORS in production - set CORS_ORIGINS environment variable
        allowOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        // SECURITY: Rate limiting to prevent DDoS attacks and high AWS bills
        throttlingRateLimit: 1000,    // requests per second
        throttlingBurstLimit: 2000,   // concurrent requests
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [authStack.userPool],
      identitySource: 'method.request.header.Authorization',
    });

    // Environment variables for Lambda functions
    const lambdaEnvironment = {
      USERS_TABLE: databaseStack.usersTable.tableName,
      LOCATIONS_TABLE: databaseStack.locationsTable.tableName,
      REVIEWS_TABLE: databaseStack.reviewsTable.tableName,
      LEADERBOARD_TABLE: databaseStack.leaderboardTable.tableName,
      RECEIPTS_BUCKET: storageStack.receiptsBucket.bucketName,
      USER_POOL_ID: authStack.userPool.userPoolId,
      REGION: this.region,
    };

    // Lambda execution role with necessary permissions
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant DynamoDB permissions
    databaseStack.usersTable.grantReadWriteData(lambdaRole);
    databaseStack.locationsTable.grantReadWriteData(lambdaRole);
    databaseStack.reviewsTable.grantReadWriteData(lambdaRole);
    databaseStack.leaderboardTable.grantReadWriteData(lambdaRole);

    // Grant S3 permissions
    storageStack.receiptsBucket.grantReadWrite(lambdaRole);

    // Grant Textract permissions
    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['textract:DetectDocumentText', 'textract:AnalyzeDocument'],
        resources: ['*'],
      })
    );

    // Lambda Layer for shared dependencies
    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/layers/shared')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Shared utilities and AWS SDK',
    });

    // Helper function to create Lambda
    const createLambda = (name: string, handler: string) => {
      return new lambda.Function(this, name, {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
        handler,
        environment: lambdaEnvironment,
        role: lambdaRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
        layers: [sharedLayer],
        logRetention: logs.RetentionDays.ONE_WEEK,
      });
    };

    // ========== LOCATIONS ENDPOINTS ==========
    const locationsResource = this.api.root.addResource('locations');

    // GET /locations (list all locations)
    const listLocationsLambda = createLambda('ListLocationsFunction', 'locations/list.handler');
    locationsResource.addMethod('GET', new apigateway.LambdaIntegration(listLocationsLambda));

    // GET /locations/nearby?lat=X&lng=Y
    const nearbyResource = locationsResource.addResource('nearby');
    const nearbyLocationsLambda = createLambda('NearbyLocationsFunction', 'locations/nearby.handler');
    nearbyResource.addMethod('GET', new apigateway.LambdaIntegration(nearbyLocationsLambda));

    // GET /locations/{locationId}
    const locationIdResource = locationsResource.addResource('{locationId}');
    const getLocationLambda = createLambda('GetLocationFunction', 'locations/get.handler');
    locationIdResource.addMethod('GET', new apigateway.LambdaIntegration(getLocationLambda));

    // GET /locations/{locationId}/reviews
    const locationReviewsResource = locationIdResource.addResource('reviews');
    const locationReviewsLambda = createLambda('LocationReviewsFunction', 'reviews/by-location.handler');
    locationReviewsResource.addMethod('GET', new apigateway.LambdaIntegration(locationReviewsLambda));

    // ========== REVIEWS ENDPOINTS ==========
    const reviewsResource = this.api.root.addResource('reviews');

    // GET /reviews (list reviews with filters)
    const listReviewsLambda = createLambda('ListReviewsFunction', 'reviews/list.handler');
    reviewsResource.addMethod('GET', new apigateway.LambdaIntegration(listReviewsLambda));

    // POST /reviews (create review - requires auth)
    const createReviewLambda = createLambda('CreateReviewFunction', 'reviews/create.handler');
    reviewsResource.addMethod('POST', new apigateway.LambdaIntegration(createReviewLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // GET /reviews/{reviewId}
    const reviewIdResource = reviewsResource.addResource('{reviewId}');
    const getReviewLambda = createLambda('GetReviewFunction', 'reviews/get.handler');
    reviewIdResource.addMethod('GET', new apigateway.LambdaIntegration(getReviewLambda));

    // ========== RECEIPTS ENDPOINTS ==========
    const receiptsResource = this.api.root.addResource('receipts');

    // POST /receipts/upload (get presigned URL - requires auth)
    const uploadResource = receiptsResource.addResource('upload');
    const uploadReceiptLambda = createLambda('UploadReceiptFunction', 'receipts/upload.handler');
    uploadResource.addMethod('POST', new apigateway.LambdaIntegration(uploadReceiptLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // POST /receipts/verify (verify receipt with Textract - requires auth)
    const verifyResource = receiptsResource.addResource('verify');
    const verifyReceiptLambda = createLambda('VerifyReceiptFunction', 'receipts/verify.handler');
    verifyResource.addMethod('POST', new apigateway.LambdaIntegration(verifyReceiptLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // ========== LEADERBOARD ENDPOINTS ==========
    const leaderboardResource = this.api.root.addResource('leaderboard');

    // GET /leaderboard (get top users)
    const getLeaderboardLambda = createLambda('GetLeaderboardFunction', 'leaderboard/get.handler');
    leaderboardResource.addMethod('GET', new apigateway.LambdaIntegration(getLeaderboardLambda));

    // GET /leaderboard/me (get my rank - requires auth)
    const meResource = leaderboardResource.addResource('me');
    const getMyRankLambda = createLambda('GetMyRankFunction', 'leaderboard/me.handler');
    meResource.addMethod('GET', new apigateway.LambdaIntegration(getMyRankLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // ========== USER ENDPOINTS ==========
    const usersResource = this.api.root.addResource('users');

    // GET /users/me (get current user profile - requires auth)
    const userMeResource = usersResource.addResource('me');
    const getMeUserLambda = createLambda('GetMeUserFunction', 'users/me.handler');
    userMeResource.addMethod('GET', new apigateway.LambdaIntegration(getMeUserLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // PUT /users/me (update user profile - requires auth)
    const updateMeUserLambda = createLambda('UpdateMeUserFunction', 'users/update.handler');
    userMeResource.addMethod('PUT', new apigateway.LambdaIntegration(updateMeUserLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: 'ChainRankApiUrl',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
    });
  }
}
