#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { StorageStack } from '../lib/storage-stack';
import { AuthStack } from '../lib/auth-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Stack 1: Database (DynamoDB Tables)
const databaseStack = new DatabaseStack(app, 'ChainRankDatabaseStack', {
  env,
  description: 'ChainRank DynamoDB tables for users, locations, reviews, and leaderboard',
});

// Stack 2: Storage (S3 for receipts)
const storageStack = new StorageStack(app, 'ChainRankStorageStack', {
  env,
  description: 'ChainRank S3 bucket for receipt images',
});

// Stack 3: Authentication (Cognito)
const authStack = new AuthStack(app, 'ChainRankAuthStack', {
  env,
  description: 'ChainRank Cognito User Pool and Client',
});

// Stack 4: API (API Gateway + Lambda functions)
const apiStack = new ApiStack(app, 'ChainRankApiStack', {
  env,
  description: 'ChainRank REST API with Lambda functions',
  databaseStack,
  storageStack,
  authStack,
});

// Add tags to all stacks
[databaseStack, storageStack, authStack, apiStack].forEach(stack => {
  cdk.Tags.of(stack).add('Project', 'ChainRank');
  cdk.Tags.of(stack).add('Environment', 'Production');
});
