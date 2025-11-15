# Custom Domain Setup Guide for Constitution Learning Hub

## 🎯 Goal
Set up a custom domain (like `constitution-hub.yourdomain.com`) for your Constitution Learning Hub instead of using the CloudFront default URL.

## 📋 Prerequisites
- A domain name you own (e.g., from GoDaddy, Namecheap, Google Domains, etc.)
- Access to your domain's DNS settings

## 🚀 Setup Steps

### Step 1: Choose Your Subdomain
Decide what subdomain you want to use. Examples:
- `constitution.yourdomain.com`
- `learn.yourdomain.com`
- `constitution-hub.yourdomain.com`
- `app.yourdomain.com`

### Step 2: Configure the Setup Script
1. Open `setup-custom-domain.js`
2. Find this line:
   ```javascript
   const CUSTOM_DOMAIN = 'constitution-hub.yourdomain.com';
   ```
3. Replace with your actual domain:
   ```javascript
   const CUSTOM_DOMAIN = 'constitution.mydomain.com'; // Your actual domain
   ```

### Step 3: Request SSL Certificate
```bash
node setup-custom-domain.js
```

This will:
- Request an SSL certificate from AWS Certificate Manager
- Show you DNS validation records to add

### Step 4: Add DNS Validation Records
The script will show you records like:
```
Name: _abc123.constitution.mydomain.com
Value: _xyz789.acm-validations.aws
Type: CNAME
```

Add these CNAME records to your DNS provider (GoDaddy, Namecheap, etc.)

### Step 5: Wait for Certificate Validation
Check status with:
```bash
node check-certificate-status.js
```

Wait until status shows "ISSUED" (usually 5-30 minutes)

### Step 6: Configure CloudFront
Once certificate is issued, run:
```bash
node setup-custom-domain.js
```

This will update your CloudFront distribution with the custom domain.

### Step 7: Add Final DNS Record
Add a CNAME record in your DNS:
```
Name: constitution (or whatever subdomain you chose)
Value: d3h2h7c886l04y.cloudfront.net
Type: CNAME
```

### Step 8: Test Your Custom Domain
Wait 5-30 minutes for DNS propagation, then visit:
`https://constitution.yourdomain.com`

## 🎁 What You Get
- ✅ Professional custom domain
- ✅ Free SSL certificate (auto-renewing)
- ✅ HTTPS redirect
- ✅ Global CDN performance
- ✅ Better branding and SEO

## 🛠️ Troubleshooting

### Certificate Stuck in "PENDING_VALIDATION"
- Double-check DNS records are added correctly
- Wait longer (can take up to 72 hours in rare cases)
- Try deleting and requesting a new certificate

### Domain Not Working
- Check DNS propagation: https://dnschecker.org/
- Verify CNAME record points to CloudFront domain
- Clear browser cache (Ctrl+Shift+R)

### Need Help?
1. Check certificate status: `node check-certificate-status.js`
2. Verify DNS records are correct
3. Contact your DNS provider for help adding records

## 💡 Domain Provider Guides

### GoDaddy
1. Go to DNS Management
2. Add CNAME record
3. Host: your-subdomain, Points to: cloudfront-domain

### Namecheap
1. Go to Advanced DNS
2. Add CNAME record
3. Host: your-subdomain, Value: cloudfront-domain

### Cloudflare
1. Go to DNS settings
2. Add CNAME record
3. Name: your-subdomain, Content: cloudfront-domain
4. Make sure proxy is OFF (gray cloud)

## 🚀 Quick Start
1. Own a domain? ✅
2. Edit `CUSTOM_DOMAIN` in setup script ✅  
3. Run: `node setup-custom-domain.js` ✅
4. Add DNS records ✅
5. Wait and enjoy! ✅