@echo off
setlocal EnableDelayedExpansion

REM Constitution Learning Hub AWS Deployment Script (Windows)
REM This script deploys the application to AWS S3 + CloudFront

echo 🚀 Constitution Learning Hub - AWS Deployment
echo ==============================================

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ AWS CLI is not installed. Please install it first:
    echo    https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-windows.html
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install it first.
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Installing...
    npm install -g pnpm
)

REM Load environment variables from .env.aws
if exist .env.aws (
    echo 📋 Loading AWS configuration...
    for /f "usebackq tokens=1,* delims==" %%i in (`.env.aws`) do (
        if not "%%i"=="" if not "%%i:~0,1%"=="#" (
            set "%%i=%%j"
        )
    )
) else (
    echo ⚠️  .env.aws file not found. Using default values.
)

REM Set default values if not provided
if not defined AWS_S3_BUCKET (
    for /f %%i in ('powershell -command "Get-Date -UFormat %%s"') do set timestamp=%%i
    set AWS_S3_BUCKET=constitution-learning-hub-!timestamp!
)
if not defined AWS_REGION set AWS_REGION=us-east-1
if not defined AWS_PROFILE set AWS_PROFILE=default

echo 📦 Bucket: %AWS_S3_BUCKET%
echo 🌍 Region: %AWS_REGION%
echo 👤 Profile: %AWS_PROFILE%

REM Function to deploy infrastructure
if "%1"=="infrastructure" goto :deploy_infrastructure
if "%1"=="infra" goto :deploy_infrastructure
if "%1"=="application" goto :deploy_application
if "%1"=="app" goto :deploy_application
goto :deploy_all

:deploy_infrastructure
echo.
echo 🏗️  Deploying CloudFormation stack...

set STACK_NAME=constitution-learning-hub-stack

aws cloudformation deploy ^
    --template-file cloudformation-template.json ^
    --stack-name %STACK_NAME% ^
    --parameter-overrides BucketName=%AWS_S3_BUCKET% ^
    --capabilities CAPABILITY_IAM ^
    --region %AWS_REGION% ^
    --profile %AWS_PROFILE%

if %errorlevel% neq 0 (
    echo ❌ CloudFormation deployment failed
    exit /b 1
)

echo ✅ CloudFormation stack deployed successfully

REM Get the CloudFront Distribution ID
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %AWS_REGION% --profile %AWS_PROFILE% --query "Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue" --output text') do set DISTRIBUTION_ID=%%i

if not "%DISTRIBUTION_ID%"=="" (
    echo 📡 CloudFront Distribution ID: %DISTRIBUTION_ID%
    set AWS_CLOUDFRONT_DISTRIBUTION_ID=%DISTRIBUTION_ID%
)

if "%1"=="infrastructure" goto :end
if "%1"=="infra" goto :end

:deploy_application
echo.
echo 🚀 Deploying application...

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install --prefer-offline

REM Install deployment dependencies
echo 📦 Installing deployment dependencies...
npm install aws-sdk mime-types --no-save

REM Deploy using Node.js script
node aws-deploy.js

if %errorlevel% neq 0 (
    echo ❌ Application deployment failed
    exit /b 1
)

goto :show_results

:deploy_all
call :deploy_infrastructure
if %errorlevel% neq 0 exit /b 1
call :deploy_application
if %errorlevel% neq 0 exit /b 1

:show_results
echo.
echo 🎉 Deployment completed successfully!
echo.
echo 📋 Deployment Information:
echo ==========================

REM Get stack outputs
set STACK_NAME=constitution-learning-hub-stack
echo Getting deployment URLs...
aws cloudformation describe-stacks ^
    --stack-name %STACK_NAME% ^
    --region %AWS_REGION% ^
    --profile %AWS_PROFILE% ^
    --query "Stacks[0].Outputs[?OutputKey==`CloudFrontURL` || OutputKey==`WebsiteURL`].[OutputKey,OutputValue]" ^
    --output table

echo.
echo 🔗 Your Constitution Learning Hub is now live!
echo 💡 It may take up to 15 minutes for CloudFront to fully propagate.

:end