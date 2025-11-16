#!/usr/bin/env python3
"""
Simple end-to-end tester that posts the form to the running local server.

Usage:
  ./scripts/e2e_send.py --to you@example.com --subject "Test" --body "<p>hi</p>"

Requires a running server at http://127.0.0.1:8000 and a valid RESEND_API_KEY in .env.
"""
import os
import sys
import argparse
import requests
from dotenv import load_dotenv


def main():
    load_dotenv()

    parser = argparse.ArgumentParser()
    parser.add_argument("--to", required=True)
    parser.add_argument("--subject", required=True)
    parser.add_argument("--body", required=True)
    parser.add_argument("--from", dest="from_email", default=os.getenv("DEFAULT_FROM", ""))
    parser.add_argument("--url", default=os.getenv("BASE_URL", "http://127.0.0.1:8000"))
    args = parser.parse_args()

    if not os.getenv("RESEND_API_KEY"):
        print("RESEND_API_KEY is not set in environment. Aborting.")
        sys.exit(2)

    data = {
        "from_email": args.from_email,
        "to_email": args.to,
        "subject": args.subject,
        "body": args.body,
    }

    resp = requests.post(args.url.rstrip('/') + "/send", data=data, timeout=20)
    print("Status:", resp.status_code)
    text = resp.text
    # crude check for success message
    if "Email sent!" in text:
        print("E2E: Looks like the app reported success")
    else:
        print("E2E: No success marker found; output follows:\n---\n")
        print(text[:4000])


if __name__ == "__main__":
    main()
