#!/usr/bin/env node

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { execSync } = require('child_process');

// Configuration
const config = {
  bucket: process.env.AWS_S3_BUCKET || 'constitution-learning-hub',
  region: process.env.AWS_REGION || 'us-east-1',
  distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
  buildDir: 'dist',
  profile: process.env.AWS_PROFILE || 'default'
};

console.log('🚀 Starting AWS deployment...');
console.log(`📦 Bucket: ${config.bucket}`);
console.log(`🌍 Region: ${config.region}`);

// Configure AWS
AWS.config.update({
  region: config.region,
  credentials: new AWS.SharedIniFileCredentials({ profile: config.profile })
});

const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();

// Build the project first
function buildProject() {
  console.log('🔨 Building project...');
  try {
    execSync('pnpm run build:prod', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Get all files recursively
function getAllFiles(dir, baseDir = dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.push({
        local: fullPath,
        remote: relativePath
      });
    }
  }
  
  return files;
}

// Upload file to S3
async function uploadFile(file) {
  const content = fs.readFileSync(file.local);
  const contentType = mime.lookup(file.local) || 'application/octet-stream';
  
  const params = {
    Bucket: config.bucket,
    Key: file.remote,
    Body: content,
    ContentType: contentType,
    ACL: 'public-read'
  };

  // Set cache control headers
  if (file.remote.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    params.CacheControl = 'public, max-age=31536000'; // 1 year
  } else if (file.remote === 'index.html' || file.remote.endsWith('.html')) {
    params.CacheControl = 'public, max-age=0, must-revalidate';
  }

  try {
    await s3.upload(params).promise();
    console.log(`✅ Uploaded: ${file.remote}`);
  } catch (error) {
    console.error(`❌ Failed to upload ${file.remote}:`, error.message);
    throw error;
  }
}

// Upload all files
async function uploadFiles() {
  const buildPath = path.join(process.cwd(), config.buildDir);
  
  if (!fs.existsSync(buildPath)) {
    throw new Error(`Build directory ${buildPath} does not exist. Run build first.`);
  }

  const files = getAllFiles(buildPath);
  console.log(`📁 Found ${files.length} files to upload`);

  // Upload files in parallel (with concurrency limit)
  const concurrency = 10;
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    await Promise.all(batch.map(uploadFile));
  }

  console.log('✅ All files uploaded successfully');
}

// Create CloudFront invalidation
async function invalidateCloudFront() {
  if (!config.distributionId) {
    console.log('⚠️  No CloudFront distribution ID provided, skipping invalidation');
    return;
  }

  console.log('🔄 Creating CloudFront invalidation...');
  
  try {
    const params = {
      DistributionId: config.distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: 1,
          Items: ['/*']
        }
      }
    };

    const result = await cloudfront.createInvalidation(params).promise();
    console.log(`✅ CloudFront invalidation created: ${result.Invalidation.Id}`);
  } catch (error) {
    console.error('❌ CloudFront invalidation failed:', error.message);
  }
}

// Configure S3 bucket for static website hosting
async function configureBucket() {
  console.log('🔧 Configuring S3 bucket...');
  
  try {
    // Check if bucket exists
    try {
      await s3.headBucket({ Bucket: config.bucket }).promise();
      console.log('✅ Bucket exists');
    } catch (error) {
      if (error.statusCode === 404) {
        console.log('🆕 Creating bucket...');
        await s3.createBucket({ Bucket: config.bucket }).promise();
        console.log('✅ Bucket created');
      } else {
        throw error;
      }
    }

    // Configure static website hosting
    const websiteConfig = {
      Bucket: config.bucket,
      WebsiteConfiguration: {
        IndexDocument: { Suffix: 'index.html' },
        ErrorDocument: { Key: 'index.html' } // SPA routing
      }
    };

    await s3.putBucketWebsite(websiteConfig).promise();
    console.log('✅ Website hosting configured');

    // Set public read policy
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${config.bucket}/*`
      }]
    };

    await s3.putBucketPolicy({
      Bucket: config.bucket,
      Policy: JSON.stringify(policy)
    }).promise();
    console.log('✅ Public read policy applied');

  } catch (error) {
    console.error('❌ Bucket configuration failed:', error.message);
    throw error;
  }
}

// Main deployment function
async function deploy() {
  try {
    buildProject();
    await configureBucket();
    await uploadFiles();
    await invalidateCloudFront();
    
    const websiteUrl = `http://${config.bucket}.s3-website-${config.region}.amazonaws.com`;
    console.log('\n🎉 Deployment completed successfully!');
    console.log(`🌐 Website URL: ${websiteUrl}`);
    if (config.distributionId) {
      console.log('⚡ CloudFront invalidation in progress...');
    }
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deploy();
}

module.exports = { deploy, config };