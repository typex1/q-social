import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class QSocialStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const messagesTable = new dynamodb.Table(this, 'MessagesTable', {
      tableName: 'q-social-messages',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      defaultRootObject: 'index.html'
    });

    const createMessageFn = new lambda.Function(this, 'CreateMessageFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'messages.createMessage',
      code: lambda.Code.fromAsset('../backend/aws/dist'),
      environment: {
        TABLE_NAME: messagesTable.tableName,
        CORS_ORIGIN: `https://${distribution.distributionDomainName}`
      }
    });

    const getMessagesFn = new lambda.Function(this, 'GetMessagesFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'messages.getMessages',
      code: lambda.Code.fromAsset('../backend/aws/dist'),
      environment: {
        TABLE_NAME: messagesTable.tableName,
        CORS_ORIGIN: `https://${distribution.distributionDomainName}`
      }
    });

    messagesTable.grantWriteData(createMessageFn);
    messagesTable.grantReadData(getMessagesFn);

    const api = new apigateway.RestApi(this, 'QSocialApi', {
      restApiName: 'Q-Social API',
      defaultCorsPreflightOptions: {
        allowOrigins: [`https://${distribution.distributionDomainName}`],
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const apiResource = api.root.addResource('api');
    const messages = apiResource.addResource('messages');
    messages.addMethod('POST', new apigateway.LambdaIntegration(createMessageFn));
    messages.addMethod('GET', new apigateway.LambdaIntegration(getMessagesFn));

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL'
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 Bucket Name for Frontend'
    });
  }
}
