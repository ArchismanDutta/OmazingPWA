const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1',
  signatureVersion: 'v4'
});

// Create S3 instance
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: process.env.AWS_REGION || 'ap-south-1'
});

// Get bucket name based on environment
const getBucketName = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production'
    ? process.env.AWS_S3_BUCKET_PROD
    : process.env.AWS_S3_BUCKET_DEV;
};

// Check if S3 storage is enabled
const isS3Enabled = () => {
  return process.env.MEDIA_STORAGE_TYPE === 's3';
};

// Get CloudFront domain based on environment
const getCloudFrontDomain = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production'
    ? process.env.CLOUDFRONT_DOMAIN_PROD
    : process.env.CLOUDFRONT_DOMAIN_DEV;
};

// Generate CloudFront URL
const getCloudFrontUrl = (fileKey) => {
  const domain = getCloudFrontDomain();
  if (!domain) {
    console.warn('CloudFront domain not configured, falling back to S3 direct access');
    return null;
  }
  return `https://${domain}/${fileKey}`;
};

module.exports = {
  s3,
  getBucketName,
  isS3Enabled,
  getCloudFrontDomain,
  getCloudFrontUrl
};