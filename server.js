
// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const DERIV_TOKEN = process.env.DERIV_API_TOKEN;
const DERIV_APP_ID = process.env.DERIV_APP_ID || "1089";
const MODE = process.env.MODE || "live";

if (!DERIV_TOKEN) {
  console.warn("⚠️ Missing Deriv API token. Set DERIV_API_TOKEN in Render settings.");
}

// ✅ WebSocket wrapper
async function connectDeriv() {
  const WebSocket = await import("ws");
  const wsUrl = `wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`;
  const ws = new WebSocket.default(wsUrl);
  return ws;
}

// 🧩 Route: test if token loaded
app.get("/test", (req, res) => {
  res.send(DERIV_TOKEN ? "Token Loaded ✅" : "No Token ❌");
});

// 💰 Route: Get balance
app.get("/balance", async (req, res) => {
  try {
    const ws = await connectDeriv();

    ws.on("open", () => {
      ws.send(JSON.stringify({ authorize: DERIV_TOKEN }));
    });

    ws.on("message", (msg) => {
      const data = JSON.parse(msg);
      if (data.msg_type === "authorize") {
        ws.send(JSON.stringify({ balance: 1 }));
      } else if (data.msg_type === "balance") {
        res.json({
          balance: data.balance.balance,
          currency: data.balance.currency,
        });
        ws.close();
      } else if (data.error) {
        res.json({ error: data.error.message });
        ws.close();
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📈 Route: Get proposal
app.post("/proposal", async (req, res) => {
  const { symbol, amount, duration, contract_type } = req.body;
  try {
    const ws = await connectDeriv();
    ws.on("open", () => {
      ws.send(JSON.stringify({ authorize: DERIV_TOKEN }));
    });

    ws.on("message", (msg) => {
      const data = JSON.parse(msg);
      if (data.msg_type === "authorize") {
        ws.send(
          JSON.stringify({
            proposal: 1,
            amount,
            basis: "stake",
            contract_type,
            currency: "USD",
            duration,
            duration_unit: "m",
            symbol,
          })
        );
      } else if (data.msg_type === "proposal") {
        res.json(data.proposal);
        ws.close();
      } else if (data.error) {
        res.json({ error: data.error.message });
        ws.close();
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛒 Route: Buy contract
app.post("/buy", async (req, res) => {
  const { proposal_id } = req.body;
  try {
    const ws = await connectDeriv();
    ws.on("open", () => {
      ws.send(JSON.stringify({ authorize: DERIV_TOKEN }));
    });

    ws.on("message", (msg) => {
      const data = JSON.parse(msg);
      if (data.msg_type === "authorize") {
        ws.send(JSON.stringify({ buy: proposal_id, price: 10 }));
      } else if (data.msg_type === "buy") {
        res.json({
          status: "Trade successful ✅",
          contract_id: data.buy.contract_id,
        });
        ws.close();
      } else if (data.error) {
        res.json({ error: data.error.message });
        ws.close();
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ MKTraders server running on port ${PORT}`));
