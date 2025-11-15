// DNS Validation Verification Script
// This script helps verify that DNS validation records are properly configured

import dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);
const resolveTxt = promisify(dns.resolveTxt);

const DOMAIN = 'constitution.bhspune.com';
const CERTIFICATE_ID = '33294d52-8371-40be-8758-704615326af7';

async function checkDNSValidation() {
    console.log('🔍 Checking DNS validation status for:', DOMAIN);
    console.log('📋 Certificate ID:', CERTIFICATE_ID);
    console.log('⏰ Current time:', new Date().toLocaleString());
    console.log('');

    try {
        // Check if the validation CNAME record exists
        const validationDomain = `_acme-challenge.${DOMAIN}`;
        
        console.log(`🔎 Looking for validation record: ${validationDomain}`);
        
        try {
            const cnameRecords = await resolveCname(validationDomain);
            console.log('✅ CNAME validation record found:', cnameRecords);
            
            // Check if the target validation domain resolves
            for (const target of cnameRecords) {
                try {
                    const targetRecords = await resolveCname(target);
                    console.log(`✅ Target validation record resolves: ${target} -> ${targetRecords}`);
                } catch (err) {
                    console.log(`⚠️  Target validation record check: ${target} - ${err.message}`);
                }
            }
        } catch (err) {
            console.log('❌ CNAME validation record not found or not propagated yet:', err.message);
            console.log('');
            console.log('📝 What to do:');
            console.log('1. Log into your domain registrar (where you bought bhspune.com)');
            console.log('2. Go to DNS management section');
            console.log('3. Add the CNAME record provided by AWS Certificate Manager');
            console.log('4. Wait 5-30 minutes for DNS propagation');
            console.log('5. Run this script again to verify');
        }

        // Check basic domain resolution
        console.log('');
        console.log('🌐 Checking basic domain resolution:');
        
        try {
            const aRecords = await promisify(dns.resolve4)(DOMAIN.replace('constitution.', ''));
            console.log('✅ Base domain resolves:', aRecords);
        } catch (err) {
            console.log('⚠️  Base domain resolution:', err.message);
        }

    } catch (error) {
        console.error('❌ Error during DNS check:', error);
    }

    console.log('');
    console.log('📋 Next steps after DNS validation:');
    console.log('1. Wait for certificate validation to complete (usually 5-30 minutes)');
    console.log('2. Check certificate status in AWS Certificate Manager');
    console.log('3. Once validated, attach certificate to CloudFront distribution');
    console.log('4. Update CloudFront alternate domain names');
    console.log('5. Update DNS A/CNAME records to point to CloudFront');
}

// Run the check
checkDNSValidation().catch(console.error);

// Set up periodic checking
console.log('🔄 Starting DNS validation checker...');
console.log('Press Ctrl+C to stop');
console.log('');

checkDNSValidation();
setInterval(checkDNSValidation, 60000); // Check every minute