#!/bin/bash

# GitHub Pages Deployment Script for Constitution Learning Hub
# This script will deploy your built application to GitHub Pages

echo "🚀 Deploying Constitution Learning Hub to GitHub Pages..."

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOL
# Dependencies
node_modules/
.pnp
.pnp.js

# Production build (we'll deploy dist separately)
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# AWS credentials and deployment scripts
deploy-*.js
fix-permissions.js
check-status.js
rootkey*.csv

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOL
    
    echo "📄 Adding project files..."
    git add .
    git commit -m "Initial commit: Constitution Learning Hub project"
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm run build
fi

# Deploy to gh-pages branch
echo "🌐 Deploying to GitHub Pages..."

# Create gh-pages branch if it doesn't exist
git checkout -B gh-pages

# Remove everything except dist and .git
find . -maxdepth 1 ! -name 'dist' ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Move dist contents to root
mv dist/* .
mv dist/.* . 2>/dev/null || true
rmdir dist

# Add CNAME file if you have a custom domain (optional)
# echo "your-domain.com" > CNAME

# Create .nojekyll to bypass Jekyll processing
touch .nojekyll

# Commit and push
git add .
git commit -m "Deploy Constitution Learning Hub to GitHub Pages"

echo "✅ Deployment complete!"
echo ""
echo "🔗 Your app will be available at:"
echo "   https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Push this repository to GitHub"
echo "2. Enable GitHub Pages in repository settings"
echo "3. Set source to 'gh-pages' branch"
echo ""
echo "🔄 To update the deployment, run this script again after making changes"