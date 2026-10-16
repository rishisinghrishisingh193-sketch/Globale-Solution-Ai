# Globale Solution AI — Starter Website
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "index.html"))
);

app.get("/style.css", (req, res) =>
  res.sendFile(path.join(__dirname, "style.css"))
);

app.get("/app.js", (req, res) =>
  res.sendFile(path.join(__dirname, "app.js"))
);
A responsive ChatGPT-style chat interface with a Node.js backend and optional Razorpay order/signature-verification starter.

## What works in this starter
- Mobile-friendly chat UI, prompt suggestions, new chat, chat history for the current browser session.
- AI responses through the OpenAI API when a valid API key and funded API account are configured.
- Optional Razorpay order creation and payment-signature verification endpoints.

## Important before taking money
This is a starter, **not a complete production subscription service**. It currently does not include user accounts, a database, paid-access enforcement, subscription renewals/cancellations, refunds, tax invoices, abuse protection, or payment webhooks. A successful payment signature alone does not activate a subscription. Add these and test them before selling access. Do not advertise a paid plan as working until it is fully implemented.

## Run locally
1. Install Node.js 20 or newer.
2. Unzip the project and open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add your own `OPENAI_API_KEY` to `.env`. Keep it private; never put it in browser JavaScript or upload `.env`.
6. Run `npm start`.
7. Open `http://localhost:3000` in your browser.

If you skip the API key, the design still opens but chat replies will show a configuration message.

## AI API key
Create an API key in your AI provider account and check API billing/limits. API usage may cost money. Set spending limits where available. Never share your secret key in a public repository or with customers.

## Optional Razorpay test setup
1. Create a Razorpay merchant account and use test-mode keys first.
2. Put `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`.
3. The backend can create an order and verify a signature, but this starter does not include the checkout UI or subscription/user database. Implement those, payment webhooks, and server-side paid access before accepting live payments.
4. Never use live keys until your merchant account and website are approved and the full flow has been tested.

## Deploy online
Deploy to a Node.js hosting provider that supports environment variables (for example, Render or Railway):
1. Upload the project to a private Git repository (do not include `.env`).
2. Create a new web service from the repository.
3. Set build/install command to `npm install` and start command to `npm start`.
4. Add `OPENAI_API_KEY`, `OPENAI_MODEL`, and `PORT` only if your host requires it. Add payment keys only after the payment workflow is completed.
5. Deploy and test `/`, `/api/config`, and a real chat.
6. Add a domain and HTTPS in the host's dashboard.

Hosting and AI API usage may have charges. Free hosting tiers may sleep or have limits.

## Suggested next production steps
- Add authentication and database-backed accounts.
- Add usage quotas per account and server-side rate limiting.
- Integrate Razorpay Checkout, webhook verification, and subscription records.
- Enforce paid access on the server, not just by hiding buttons in the browser.
- Add privacy policy, terms, contact/support, cancellation/refund policy, and an accurate pricing page.
- Add monitoring, backups, logging controls, and abuse prevention.

## Brand note
This is an independent AI assistant starter called Globale Solution. It is not affiliated with or endorsed by OpenAI and should not use OpenAI/ChatGPT logos or imply that it is the official ChatGPT website.
