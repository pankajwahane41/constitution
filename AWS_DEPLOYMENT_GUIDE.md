# AWS S3 + CloudFront Deployment Guide

This guide will help you deploy the Constitution Learning Hub to AWS S3 with CloudFront CDN for optimal performance and global distribution.

## Prerequisites

### 1. AWS Account Setup
- Create an AWS account at https://aws.amazon.com/
- Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
- Configure AWS credentials:
  ```bash
  aws configure
  ```

### 2. Required Tools
- Node.js (v16 or higher)
- pnpm (installed automatically if missing)
- AWS CLI v2

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Configure AWS settings:**
   ```bash
   # Copy and edit the AWS configuration file
   cp .env.aws.example .env.aws
   # Edit .env.aws with your settings
   ```

2. **Deploy everything:**
   ```bash
   # Windows
   deploy-aws.bat

   # Linux/Mac
   bash deploy-aws.sh
   ```

### Option 2: Step-by-Step Deployment

1. **Deploy Infrastructure First:**
   ```bash
   # Windows
   deploy-aws.bat infrastructure

   # Linux/Mac
   bash deploy-aws.sh infrastructure
   ```

2. **Deploy Application:**
   ```bash
   # Windows
   deploy-aws.bat application

   # Linux/Mac
   bash deploy-aws.sh application
   ```

### Option 3: Using npm scripts
```bash
pnpm run deploy:aws           # Full deployment
pnpm run deploy:aws:infra     # Infrastructure only
pnpm run deploy:aws:app       # Application only
```

## Configuration

### Environment Variables (.env.aws)

```bash
# S3 Bucket Name (must be globally unique)
AWS_S3_BUCKET=constitution-learning-hub-your-unique-suffix

# AWS Region
AWS_REGION=us-east-1

# AWS Profile (from ~/.aws/credentials)
AWS_PROFILE=default

# CloudFront Distribution ID (auto-populated after first deployment)
AWS_CLOUDFRONT_DISTRIBUTION_ID=

# Optional: Custom Domain
# CUSTOM_DOMAIN=your-domain.com

# Build Configuration
BUILD_MODE=prod
```

## Deployment Architecture

### Infrastructure Components

1. **S3 Bucket**: Hosts static files with website hosting enabled
2. **CloudFront Distribution**: Global CDN for fast content delivery
3. **CloudFormation Stack**: Infrastructure as Code for reproducible deployments

### File Structure After Deployment

```
S3 Bucket (constitution-learning-hub)
├── index.html (main app file)
├── assets/
│   ├── *.js (JavaScript bundles)
│   ├── *.css (CSS stylesheets)
│   └── *.png, *.jpg, *.svg (images)
├── data/ (JSON data files)
└── educational_content/ (learning materials)
```

## Advanced Configuration

### Custom Domain Setup

1. **Purchase a domain** (Route 53 or external registrar)
2. **Request SSL Certificate** in AWS Certificate Manager
3. **Update CloudFormation template** with domain configuration
4. **Deploy with custom domain:**
   ```bash
   aws cloudformation deploy \
     --template-file cloudformation-template.json \
     --stack-name constitution-learning-hub-stack \
     --parameter-overrides \
       BucketName=your-bucket-name \
       DomainName=your-domain.com
   ```

### Performance Optimization

The deployment automatically configures:
- **Gzip compression** for text files
- **Long-term caching** for assets (1 year)
- **No caching** for HTML files (immediate updates)
- **SPA routing** (all routes serve index.html)

### Cache Invalidation

CloudFront cache is automatically invalidated after each deployment. Manual invalidation:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## Monitoring and Maintenance

### View Deployment Status
```bash
# Check CloudFormation stack
aws cloudformation describe-stacks \
  --stack-name constitution-learning-hub-stack

# Check S3 bucket
aws s3 ls s3://your-bucket-name --recursive

# Check CloudFront distribution
aws cloudfront list-distributions
```

### Update Deployment
Simply run the deployment script again to update your application:
```bash
deploy-aws.bat application  # Update app only
deploy-aws.bat             # Update everything
```

### Rollback
```bash
# Rollback to previous version (if using versioning)
aws s3 sync s3://your-bucket-name-backup/ s3://your-bucket-name/
```

## Cost Optimization

### Estimated Costs (per month)
- **S3 Storage**: ~$1-5 (depending on content size)
- **CloudFront**: ~$1-10 (depending on traffic)
- **Data Transfer**: Varies with usage

### Cost-Saving Tips
1. Enable S3 lifecycle policies for old versions
2. Use CloudFront regional price classes
3. Monitor usage with AWS Cost Explorer

## Troubleshooting

### Common Issues

1. **Bucket name already exists**: Update `AWS_S3_BUCKET` in `.env.aws`
2. **Permission denied**: Check AWS credentials and IAM permissions
3. **Build fails**: Ensure Node.js and dependencies are installed
4. **CloudFront not updating**: Wait 15 minutes for propagation or create invalidation

### Required AWS Permissions

Your AWS user/role needs these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "cloudformation:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### Support

For deployment issues:
1. Check AWS CloudFormation events in AWS Console
2. Review deployment logs in terminal
3. Verify AWS credentials and permissions
4. Ensure all prerequisites are installed

## Security Best Practices

1. **Use IAM roles** instead of root account
2. **Enable CloudTrail** for audit logging
3. **Set up CloudWatch** for monitoring
4. **Use least privilege** IAM policies
5. **Enable S3 versioning** for backups

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up CI/CD pipeline for automatic deployments
4. Enable SSL certificate for custom domain
5. Configure Route 53 for DNS management

Your Constitution Learning Hub is now live on AWS! 🎉