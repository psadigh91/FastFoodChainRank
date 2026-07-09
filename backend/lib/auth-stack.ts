import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'ChainRankUserPool', {
      userPoolName: 'ChainRankUsers',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Don't delete users in production
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: false,
          mutable: true,
        },
        familyName: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        points: new cognito.NumberAttribute({ min: 0, max: 1000000, mutable: true }),
        level: new cognito.NumberAttribute({ min: 1, max: 10, mutable: true }),
      },
    });

    // User Pool Client (for frontend)
    this.userPoolClient = new cognito.UserPoolClient(this, 'ChainRankUserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: 'ChainRankWebClient',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: false,
          implicitCodeGrant: false,
        },
      },
      preventUserExistenceErrors: true,
      refreshTokenValidity: cdk.Duration.days(30),
      accessTokenValidity: cdk.Duration.minutes(60),
      idTokenValidity: cdk.Duration.minutes(60),
    });

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'ChainRankUserPoolId',
    });

    new cdk.CfnOutput(this, 'UserPoolArn', {
      value: this.userPool.userPoolArn,
      description: 'Cognito User Pool ARN',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'ChainRankUserPoolClientId',
    });

    new cdk.CfnOutput(this, 'UserPoolProviderUrl', {
      value: this.userPool.userPoolProviderUrl,
      description: 'Cognito User Pool Provider URL',
    });
  }
}
