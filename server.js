require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const OpenAI = require("openai");
const Razorpay = require("razorpay");

const app = express();
app.use(express.json({ limit: "8mb" }));

const PORT = process.env.PORT || 3000;
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const VISION_MODEL = process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b";
const client = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    })
  : null;

const hasRazorpay = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const razorpay = hasRazorpay
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

app.get("/api/config", (req, res) => {
  res.json({
    brand: "Globale Solution",
    paymentsConfigured: hasRazorpay,
    proPricePaise: Number(process.env.PRO_PLAN_PRICE_PAISE || 9900),
    razorpayKeyId: hasRazorpay ? process.env.RAZORPAY_KEY_ID : null
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        error: "AI abhi configure nahi hai. Site owner ko server par GROQ_API_KEY add karni hogi."
      });
    }
    const messages = req.body && req.body.messages;
    const image = req.body && req.body.image;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return res.status(400).json({ error: "Please send 1–20 chat messages." });
    }
    const safeMessages = messages.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 4000)
    })).filter(m => m.content.trim());
    if (
  image &&
  (typeof image !== "string" ||
   !/^data:image\/(jpeg|png|webp|gif);base64,/.test(image))
) {
  return res.status(400).json({ error: "Please upload a valid image." });
}

    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "A user message is required." });
    }

    const finalMessages = [...safeMessages];

if (image) {
  const lastIndex = finalMessages.length - 1;
  const lastMessage = finalMessages[lastIndex];

  finalMessages[lastIndex] = {
    role: "user",
    content: [
      { type: "text", text: lastMessage.content || "इस फोटो को समझाइए।" },
      { type: "image_url", image_url: { url: image } }
    ]
  };
}

const response = await client.chat.completions.create({
  model: image ? VISION_MODEL : MODEL,
  messages: [
    {
      role: "system",
      content: "You are Globale Solution AI, a helpful assistant. Reply clearly and match the user's language."
    },
    ...finalMessages
  ],
  max_tokens: 700
});
    });
    res.json({ reply: response.choices?.[0]?.message?.content || "Sorry, no answer was returned." });
  } catch (err) {
    console.error("Chat API error:", err.message);
    res.status(500).json({ error: "AI request failed. Check your API key, account billing, and server logs." });
  }
});

app.post("/api/create-order", async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ error: "Payment gateway is not configured yet." });
    const amount = Number(process.env.PRO_PLAN_PRICE_PAISE || 9900);
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: "gs_" + Date.now(),
      notes: { product: "Globale Solution Pro monthly plan - starter demo" }
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Order error:", err.message);
    res.status(500).json({ error: "Could not create payment order." });
  }
});

app.post("/api/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!hasRazorpay || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ verified: false, error: "Payment details are incomplete." });
  }
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(razorpay_signature));
  const verified = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!verified) return res.status(400).json({ verified: false, error: "Payment verification failed." });

  // IMPORTANT: This demo verifies a payment signature but does not create user accounts,
  // persist subscriptions, or enforce paid access. Add a database + webhook before selling.
  res.json({ verified: true, message: "Payment signature verified. Subscription activation still needs a database/backend workflow." });
});


app.use(express.static(__dirname));
app.listen(PORT, () => console.log(`Globale Solution AI running at http://localhost:${PORT}`));
