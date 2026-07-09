import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
  public readonly usersTable: dynamodb.Table;
  public readonly locationsTable: dynamodb.Table;
  public readonly reviewsTable: dynamodb.Table;
  public readonly leaderboardTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Users Table
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'ChainRank-Users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Don't delete in production
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // GSI for email lookup
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'EmailIndex',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Locations Table
    this.locationsTable = new dynamodb.Table(this, 'LocationsTable', {
      tableName: 'ChainRank-Locations',
      partitionKey: { name: 'locationId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // GSI for querying by chain and city
    this.locationsTable.addGlobalSecondaryIndex({
      indexName: 'ChainCityIndex',
      partitionKey: { name: 'chain', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'city', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Reviews Table
    this.reviewsTable = new dynamodb.Table(this, 'ReviewsTable', {
      tableName: 'ChainRank-Reviews',
      partitionKey: { name: 'reviewId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // GSI for querying reviews by location
    this.reviewsTable.addGlobalSecondaryIndex({
      indexName: 'LocationIndex',
      partitionKey: { name: 'locationId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for querying reviews by user
    this.reviewsTable.addGlobalSecondaryIndex({
      indexName: 'UserIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Leaderboard Table
    this.leaderboardTable = new dynamodb.Table(this, 'LeaderboardTable', {
      tableName: 'ChainRank-Leaderboard',
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // GSI for querying by city and points (for rankings)
    this.leaderboardTable.addGlobalSecondaryIndex({
      indexName: 'CityPointsIndex',
      partitionKey: { name: 'city', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'points', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'UsersTableName', {
      value: this.usersTable.tableName,
      description: 'DynamoDB Users Table Name',
    });

    new cdk.CfnOutput(this, 'LocationsTableName', {
      value: this.locationsTable.tableName,
      description: 'DynamoDB Locations Table Name',
    });

    new cdk.CfnOutput(this, 'ReviewsTableName', {
      value: this.reviewsTable.tableName,
      description: 'DynamoDB Reviews Table Name',
    });

    new cdk.CfnOutput(this, 'LeaderboardTableName', {
      value: this.leaderboardTable.tableName,
      description: 'DynamoDB Leaderboard Table Name',
    });
  }
}
