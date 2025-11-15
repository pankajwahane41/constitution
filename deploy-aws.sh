#!/bin/bash

# Constitution Learning Hub AWS Deployment Script
# This script deploys the application to AWS S3 + CloudFront

set -e  # Exit on any error

echo "🚀 Constitution Learning Hub - AWS Deployment"
echo "=============================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing..."
    npm install -g pnpm
fi

# Load environment variables
if [ -f .env.aws ]; then
    echo "📋 Loading AWS configuration..."
    export $(cat .env.aws | grep -v '^#' | xargs)
else
    echo "⚠️  .env.aws file not found. Using default values."
fi

# Set default values if not provided
export AWS_S3_BUCKET=${AWS_S3_BUCKET:-"constitution-learning-hub-$(date +%s)"}
export AWS_REGION=${AWS_REGION:-"us-east-1"}
export AWS_PROFILE=${AWS_PROFILE:-"default"}

echo "📦 Bucket: $AWS_S3_BUCKET"
echo "🌍 Region: $AWS_REGION"
echo "👤 Profile: $AWS_PROFILE"

# Function to deploy infrastructure
deploy_infrastructure() {
    echo ""
    echo "🏗️  Deploying CloudFormation stack..."
    
    STACK_NAME="constitution-learning-hub-stack"
    
    aws cloudformation deploy \
        --template-file cloudformation-template.json \
        --stack-name $STACK_NAME \
        --parameter-overrides BucketName=$AWS_S3_BUCKET \
        --capabilities CAPABILITY_IAM \
        --region $AWS_REGION \
        --profile $AWS_PROFILE
    
    echo "✅ CloudFormation stack deployed successfully"
    
    # Get the CloudFront Distribution ID
    DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $AWS_REGION \
        --profile $AWS_PROFILE \
        --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
        --output text)
    
    if [ ! -z "$DISTRIBUTION_ID" ]; then
        echo "📡 CloudFront Distribution ID: $DISTRIBUTION_ID"
        export AWS_CLOUDFRONT_DISTRIBUTION_ID=$DISTRIBUTION_ID
        
        # Update .env.aws file with the distribution ID
        if [ -f .env.aws ]; then
            sed -i "s/AWS_CLOUDFRONT_DISTRIBUTION_ID=.*/AWS_CLOUDFRONT_DISTRIBUTION_ID=$DISTRIBUTION_ID/" .env.aws
        fi
    fi
}

# Function to deploy application
deploy_application() {
    echo ""
    echo "🚀 Deploying application..."
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    pnpm install --prefer-offline
    
    # Install deployment dependencies
    echo "📦 Installing deployment dependencies..."
    npm install aws-sdk mime-types --no-save
    
    # Deploy using Node.js script
    node aws-deploy.js
}

# Main deployment flow
case "${1:-all}" in
    "infrastructure"|"infra")
        deploy_infrastructure
        ;;
    "application"|"app")
        deploy_application
        ;;
    "all"|*)
        deploy_infrastructure
        deploy_application
        ;;
esac

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Information:"
echo "=========================="

# Get stack outputs
if command -v aws &> /dev/null; then
    STACK_NAME="constitution-learning-hub-stack"
    
    echo "Getting deployment URLs..."
    aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $AWS_REGION \
        --profile $AWS_PROFILE \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL` || OutputKey==`WebsiteURL`].[OutputKey,OutputValue]' \
        --output table
fi

echo ""
echo "🔗 Your Constitution Learning Hub is now live!"
echo "💡 It may take up to 15 minutes for CloudFront to fully propagate."