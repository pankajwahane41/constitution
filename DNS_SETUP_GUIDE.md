# DNS Validation Setup Guide for bhspune.com

## Current Certificate Details
- **Certificate ID**: `33294d52-8371-40be-8758-704615326af7`
- **Domain**: `constitution.bhspune.com`
- **Status**: Pending DNS validation

## DNS Records to Add

Based on your AWS Certificate Manager validation requirements:

### CNAME Record for Certificate Validation

**Record Type**: CNAME
**Name/Host**: `_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution.bhspune.com`
**Value/Points to**: `_70871e39cf5fcc2fe766269d98894c96.jkddzztszm.acm-validations.aws.`
**TTL**: 300 (or default)

## Common DNS Provider Formats

### If your registrar asks for subdomain only:
- **Name**: `_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution`
- **Value**: `_70871e39cf5fcc2fe766269d98894c96.jkddzztszm.acm-validations.aws.`

### If your registrar asks for full domain:
- **Name**: `_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution.bhspune.com`
- **Value**: `_70871e39cf5fcc2fe766269d98894c96.jkddzztszm.acm-validations.aws.`

### If your registrar strips the domain automatically:
- **Name**: `_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution`
- **Value**: `_70871e39cf5fcc2fe766269d98894c96.jkddzztszm.acm-validations.aws`

## Troubleshooting "Invalid DNS Sub Name" Error

### Option 1: Remove trailing dots
Some registrars don't like trailing dots. Try:
- **Name**: `_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution.bhspune.com`
- **Value**: `_70871e39cf5fcc2fe766269d98894c96.jkddzztszm.acm-validations.aws`

### Option 2: Use relative subdomain
If you're managing DNS for `bhspune.com`, try:
- **Name**: `_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution`
- **Value**: `_70871e39cf5fcc2fe766269d98894c96.jkddzztszm.acm-validations.aws`

### Option 3: Check if you need to create constitution subdomain first
Some registrars require you to:
1. First create a subdomain record for `constitution.bhspune.com` (A record pointing to a placeholder IP)
2. Then add the validation CNAME under that subdomain

## Step-by-Step Instructions

### Step 1: Log into your domain registrar
(Where you purchased bhspune.com)

### Step 2: Find DNS Management
Look for:
- DNS Settings
- DNS Management
- Nameserver Management
- Domain Management

### Step 3: Add CNAME Record
1. Click "Add Record" or "Add DNS Record"
2. Select "CNAME" as record type
3. Enter the name (try different formats above if one doesn't work)
4. Enter the value (AWS validation string)
5. Set TTL to 300 seconds if asked
6. Save the record

### Step 4: Wait for Propagation
- DNS changes can take 5-60 minutes to propagate
- AWS will automatically detect the record and validate the certificate

## Common Registrar-Specific Notes

### GoDaddy
- Use format: `_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution`
- Remove trailing dots from both name and value

### Namecheap
- Host: `_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution`
- Value: `_70871e39cf5fcc2fe766269d98894c96.jkddzztszm.acm-validations.aws`

### Cloudflare
- Name: `_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution.bhspune.com`
- Content: `_70871e39cf5fcc2fe766269d98894c96.jkddzztszm.acm-validations.aws.`
- Keep trailing dots if using Cloudflare

### Google Domains
- Use full format with trailing dots as provided by AWS

## Verification

After adding the DNS record, you can verify it's working by:

1. **Wait 10-15 minutes** for DNS propagation
2. **Check AWS Certificate Manager** - status should change from "Pending validation" to "Issued"
3. **Use online DNS lookup tools** like:
   - https://mxtoolbox.com/SuperTool.aspx
   - https://www.whatsmydns.net/

## Next Steps After Certificate Validation

Once your certificate is validated and issued:
1. ✅ Certificate will be available in AWS Certificate Manager
2. 🔄 Update CloudFront distribution with the certificate
3. 🔄 Add `constitution.bhspune.com` as alternate domain name in CloudFront
4. 🔄 Update DNS A record to point to CloudFront distribution
5. 🎉 Your site will be available at `https://constitution.bhspune.com`

## Need Help?

If you're still getting the "invalid DNS sub name" error:
1. Tell me which registrar you're using (GoDaddy, Namecheap, etc.)
2. Share a screenshot of the DNS management interface
3. I can provide specific instructions for your registrar