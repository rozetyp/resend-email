# Resend Pad

Send email from your browser with your own Resend API key. No code, no accounts, no storage.

**Live:** https://resendpad.up.railway.app ([about](https://resendpad.up.railway.app/landing.html))

## How it works

1. Paste your Resend API key (kept only in the page; never stored)
2. Click **Load Domains** to pick a verified sender, or type the From address
3. Add recipients: comma-separated To, CC and BCC, validated as you type
4. Write the email in the rich text editor and attach files if needed
5. Click **Send**
6. Open the **Sent** tab to see delivery status and read any sent email

## Features

- **Rich text editor** (Quill): bold, italic, headings, lists, links, code blocks. Output is rewritten with inline styles so spacing holds up in Gmail and Outlook.
- **Attachments:** multiple files, base64-encoded in the browser.
- **Multiple recipients** for To, CC and BCC.
- **Sent tab:** your latest emails with their delivery status (delivered, bounced, opened, clicked); click a row to read the full body.
- **Reply threading:** click **Connect Thread** and paste either the raw headers of the original email (Gmail: *Show original*) or the JSON from Resend's `GET /emails/:id`. Resend Pad fills To and Subject and sets `In-Reply-To` and `References`, so your reply lands in the same conversation in Gmail, Outlook, Apple Mail and Thunderbird.

## API key permissions

- **Full access:** everything, including Load Domains and the Sent tab.
- **Sending access:** sending works if you type the From address yourself; Load Domains and the Sent tab will fail.

Create keys at [resend.com/api-keys](https://resend.com/api-keys). You need at least one verified domain.

## Privacy

- The key travels only in the `Authorization` header, from your browser through the proxy to Resend. It is never stored or logged.
- Email content, recipients, subjects and headers are never logged or stored. The server logs only method, route and status code.
- No accounts, no database, no analytics, no cookies.

## Why a proxy?

Resend's API rejects requests made directly from a browser (CORS). `api-proxy.js` forwards four calls to `api.resend.com` and returns the response unchanged:

| Route | Resend endpoint |
|---|---|
| `POST /api/send` | `POST /emails` |
| `GET /api/domains` | `GET /domains` |
| `GET /api/sent` | `GET /emails` |
| `GET /api/email/:id` | `GET /emails/:id` |

Everything else is served from `public/`.

## Run it yourself

Requires Node.js 18+. There are no dependencies to install.

```bash
git clone https://github.com/rozetyp/resend-email.git
cd resend-email
node api-proxy.js
# http://localhost:3001
```

Set `PORT` to change the port. Any host that runs a long-lived Node process works (Railway, Render, Fly.io, a VPS). Serverless platforms such as Vercel or Netlify need the proxy rewritten as functions.

On Railway, `railway.json` already sets the start command: connect the repo, or run `railway up`. [Railway referral link](https://railway.com?referralCode=CEnEQp) (gives both of us $5 credit).

## Project layout

```
api-proxy.js   Node http server: Resend proxy + static files
public/        Everything the browser can load (app, landing page, icons, sitemap)
```

## License

[MIT](LICENSE)

## Support

[Open an issue](https://github.com/rozetyp/resend-email/issues).
