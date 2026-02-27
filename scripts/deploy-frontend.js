const fs = require('fs');
const { execSync } = require('child_process');

try {
  const outputs = JSON.parse(fs.readFileSync('cdk-outputs.json', 'utf8'));
  const stackOutputs = outputs.QSocialStack;
  const apiUrl = stackOutputs.ApiUrl;
  const distributionUrl = stackOutputs.DistributionUrl;
  const bucketName = stackOutputs.BucketName;

  const envContent = `NEXT_PUBLIC_ENV=aws
NEXT_PUBLIC_API_URL=${apiUrl}
`;

  fs.writeFileSync('.env.production.local', envContent);

  console.log('Building frontend...');
  execSync('npm run build:frontend', { stdio: 'inherit' });

  console.log('Uploading to S3...');
  execSync(`aws s3 sync out/ s3://${bucketName}/ --delete`, { stdio: 'inherit' });

  // Get the actual CloudFront distribution ID from CloudFormation
  const distributionIdCmd = `aws cloudformation describe-stack-resources --stack-name QSocialStack --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId" --output text`;
  const distributionId = execSync(distributionIdCmd, { encoding: 'utf8' }).trim();
  
  console.log('Invalidating CloudFront cache...');
  execSync(`aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*"`, { stdio: 'inherit' });

  console.log('\nDeployment complete!');
  console.log(`API URL: ${apiUrl}`);
  console.log(`App URL: ${distributionUrl}`);
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}
