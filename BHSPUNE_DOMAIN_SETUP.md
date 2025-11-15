# Custom Domain Setup for bhspune.com
## Constitution Learning Hub

🎉 **Domain:** bhspune.com  
🌐 **Suggested URL:** https://constitution.bhspune.com

## 📋 Manual Setup Steps

### Step 1: Request SSL Certificate
1. Go to **AWS Certificate Manager**: https://console.aws.amazon.com/acm/
2. Click **"Request a certificate"**
3. Choose **"Request a public certificate"**
4. Enter domain names:
   - Primary: `constitution.bhspune.com`
   - Alternative: `www.constitution.bhspune.com` (optional)
5. Choose **"DNS validation"**
6. Click **"Request"**

### Step 2: Add DNS Validation Records
AWS will show you CNAME records to add. They look like:
```
Name: _abc123def456.constitution.bhspune.com
Value: _xyz789abc123.acm-validations.aws
Type: CNAME
```

**Add these to your bhspune.com DNS settings:**
- Login to your domain provider (where you bought bhspune.com)
- Go to DNS management
- Add the CNAME records exactly as shown
- Save changes

### Step 3: Wait for Certificate Validation
- Usually takes 5-30 minutes
- Check status in ACM console
- Status will change from "Pending validation" to "Issued"

### Step 4: Update CloudFront Distribution
1. Go to **CloudFront Console**: https://console.aws.amazon.com/cloudfront/
2. Find distribution: **EH8QL9M0ZCKY9**
3. Click on the Distribution ID
4. Click **"Edit"**
5. In **"Alternate domain names (CNAMEs)"**:
   - Add: `constitution.bhspune.com`
6. In **"Custom SSL certificate"**:
   - Select your new certificate for constitution.bhspune.com
7. Change **"Viewer protocol policy"** to: **"Redirect HTTP to HTTPS"**
8. Click **"Save changes"**

### Step 5: Add Final DNS Record
In your bhspune.com DNS settings, add:
```
Type: CNAME
Name: constitution
Value: d3h2h7c886l04y.cloudfront.net
TTL: 300 (or default)
```

### Step 6: Test Your Domain
Wait 5-30 minutes for changes to propagate, then visit:
**https://constitution.bhspune.com**

## 🎁 Alternative Subdomain Options
If you prefer a different subdomain, you can use:
- `learn.bhspune.com`
- `civics.bhspune.com`  
- `app.bhspune.com`
- `hub.bhspune.com`

Just replace "constitution" with your preferred name in all the steps above.

## 🕒 Timeline
- Certificate request: Instant
- DNS validation: 5-30 minutes
- CloudFront update: 15-30 minutes  
- DNS propagation: 5-30 minutes
- **Total: 30-90 minutes**

## ✅ Final Result
You'll have:
- **https://constitution.bhspune.com** (your custom URL)
- Free SSL certificate (auto-renewing)
- HTTPS redirect for security
- Global CDN performance
- Professional branding

## 🆘 Need Help?
- **Certificate stuck?** Check DNS records are added correctly
- **Domain not working?** Check DNS propagation at: https://dnschecker.org/
- **CloudFront issues?** Verify the distribution ID: EH8QL9M0ZCKY9

---
**Current CloudFront URL:** https://d3h2h7c886l04y.cloudfront.net
**Future Custom URL:** https://constitution.bhspune.com