import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  app.use(cors());
  
  // Webhook needs raw body
  app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
    // Handle Stripe webhooks here
    res.json({ received: true });
  });

  app.use(express.json());

  // Registration OTP Mock (In a real app, integrate with an SMS/Email service)
  app.post("/api/auth/send-otp", (req, res) => {
    const { contact, type } = req.body;
    console.log(`Sending OTP to ${contact} via ${type}`);
    // Simulate OTP sending
    res.json({ success: true, message: "OTP sent successfully (Simulated)" });
  });

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const { bookId, title, price, userId } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: title,
                metadata: { bookId },
              },
              unit_amount: price * 100, // Price in paisa
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/dashboard?payment=success&bookId=${bookId}`,
        cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/bookstore?payment=cancel`,
        metadata: {
          bookId,
          userId,
        },
      });

      res.json({ id: session.id });
    } catch (error) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
