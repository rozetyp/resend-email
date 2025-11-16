#!/usr/bin/env python3
"""
E2E test: Send email with client-provided API key
Tests the new API key form parameter feature
"""

import requests
import sys
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://127.0.0.1:8000"
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

if not RESEND_API_KEY:
    print("❌ RESEND_API_KEY not set in .env")
    sys.exit(1)

# Test data
from_email = "test@govconapi.com"
to_email = "antonzaytsev@gmail.com"
subject = "Test with Client Key"
body = "<p>This email was sent using a client-provided API key passed to the backend.</p>"

print(f"🚀 Testing E2E flow with client-provided API key")
print(f"   Backend URL: {BASE_URL}")
print(f"   From: {from_email}")
print(f"   To: {to_email}")
print()

payload = {
    "from_email": from_email,
    "to_email": to_email,
    "subject": subject,
    "body": body,
    "api_key": RESEND_API_KEY,  # <-- Client provides their own key
}

try:
    resp = requests.post(f"{BASE_URL}/send", data=payload, timeout=10)
    print(f"📡 Response status: {resp.status_code}")
    print(f"📋 Response body:")
    print(resp.text[:500])
    
    if resp.status_code == 200:
        if "error" in resp.text.lower() and "not verified" in resp.text.lower():
            print("\n⚠️  Domain not verified in Resend (expected if using restricted key)")
            print("✓ But API key parameter was accepted by backend!")
        elif "error" not in resp.text.lower():
            print("\n✓ Email sent successfully!")
        else:
            print("\n⚠️  Sent but got an error response")
    else:
        print(f"\n❌ Failed with status {resp.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
