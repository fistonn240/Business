import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Stripe lazily
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for demo purposes (can be replaced with Firebase)
  let goals = [
    { id: 1, title: "Launch Business Website", status: "completed", category: "Business" },
    { id: 2, title: "Achieve $10k Monthly Revenue", status: "in-progress", category: "Business" },
    { id: 3, title: "Run 5km Daily", status: "pending", category: "Life" },
  ];

  // API Routes
  app.get("/api/goals", (req, res) => {
    res.json(goals);
  });

  app.post("/api/goals", (req, res) => {
    const newGoal = { id: Date.now(), ...req.body };
    goals.push(newGoal);
    res.status(201).json(newGoal);
  });

  app.delete("/api/goals/:id", (req, res) => {
    goals = goals.filter(g => g.id !== parseInt(req.params.id));
    res.status(204).send();
  });

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    const { planName, price } = req.body;
    const stripeClient = getStripe();

    if (!stripeClient) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card', 'cashapp', 'link', 'amazon_pay'], // Expanded methods
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Ascend ${planName} Plan`,
                description: `Professional strategic growth tools for your business.`,
              },
              unit_amount: parseInt(price.replace('$', '')) * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/billing?success=true`,
        cancel_url: `${req.headers.origin}/billing?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
