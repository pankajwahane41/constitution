// Simple DNS Validation Checker for Certificate
// Run this to check if your DNS validation record is working

const https = require('https');
const dns = require('dns');

const VALIDATION_RECORD = '_9be6cd6999274b7c4fbfc02de2ccd9eb.constitution.bhspune.com';
const EXPECTED_VALUE = '_70871e39cf5fcc2fe766269d98894c96.jkddzztszm.acm-validations.aws.';
const CERTIFICATE_ID = '33294d52-8371-40be-8758-704615326af7';

function checkDNSValidation() {
    console.log('🔍 Checking DNS validation for certificate:', CERTIFICATE_ID);
    console.log('📋 Looking for CNAME record:', VALIDATION_RECORD);
    console.log('🎯 Expected value:', EXPECTED_VALUE);
    console.log('⏰ Check time:', new Date().toLocaleString());
    console.log('');

    dns.resolveCname(VALIDATION_RECORD, (err, addresses) => {
        if (err) {
            console.log('❌ DNS validation record not found yet');
            console.log('💡 This is normal if you just added the record');
            console.log('⏳ DNS propagation can take 5-60 minutes');
            console.log('');
            console.log('🔧 What to check:');
            console.log('1. Make sure you added the CNAME record to your domain registrar');
            console.log('2. Try different name formats if you got "invalid DNS sub name" error:');
            console.log('   - _9be6cd6999274b7c4fbfc02de2ccd9eb.constitution.bhspune.com');
            console.log('   - _9be6cd6999274b7c4fbfc02de2ccd9eb.constitution');
            console.log('3. Remove trailing dots if your registrar doesn\'t accept them');
            console.log('4. Wait and try this checker again');
        } else {
            console.log('✅ DNS validation record found!');
            console.log('📍 Resolved to:', addresses);
            
            if (addresses.includes(EXPECTED_VALUE.replace(/\.$/, ''))) {
                console.log('🎉 Perfect! The validation record is correct');
                console.log('⏳ AWS should validate your certificate within 30 minutes');
                console.log('📊 Check certificate status in AWS Certificate Manager console');
            } else {
                console.log('⚠️  Record found but value doesn\'t match expected');
                console.log('🔍 Expected:', EXPECTED_VALUE);
                console.log('🔍 Found:', addresses);
            }
        }
        
        console.log('');
        console.log('📋 Certificate Status Check:');
        console.log('🌐 Go to AWS Certificate Manager console');
        console.log('🔍 Find certificate:', CERTIFICATE_ID);
        console.log('📊 Status should change from "Pending validation" to "Issued"');
        console.log('');
    });
}

console.log('🚀 DNS Validation Checker Started');
console.log('🔄 This will check every 2 minutes');
console.log('⏹️  Press Ctrl+C to stop');
console.log('');

// Initial check
checkDNSValidation();

// Check every 2 minutes
setInterval(checkDNSValidation, 120000);