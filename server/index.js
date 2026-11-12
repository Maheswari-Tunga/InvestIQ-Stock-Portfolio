import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiEnabled: Boolean(client) });
});

app.post("/api/analyze", async (req, res) => {
  const { holdings = [], totalValue = 0 } = req.body ?? {};
  if (!Array.isArray(holdings) || holdings.length === 0) {
    return res.status(400).json({ error: "Add at least one holding before requesting an analysis." });
  }

  const summary = holdings.map((h) => ({
    symbol: String(h.symbol || "").toUpperCase(),
    shares: Number(h.shares) || 0,
    price: Number(h.price) || 0,
    value: (Number(h.shares) || 0) * (Number(h.price) || 0),
    change: Number(h.change) || 0
  }));
  const computedTotal = summary.reduce((sum, h) => sum + h.value, 0);
  const safeTotal = Number(totalValue) || computedTotal;

  if (client) {
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: "You are an educational portfolio analysis assistant. Explain concentration, diversification, and observed performance in plain language. Do not give personalized financial advice, promise returns, or tell the user to buy or sell. State that figures are based only on the supplied data."
          },
          {
            role: "user",
            content: `Analyze this sample portfolio. Total value: ${safeTotal}. Holdings: ${JSON.stringify(summary)}. Return concise sections: Overview, Diversification, Risks to review, Questions to consider.`
          }
        ]
      });
      return res.json({ analysis: completion.choices[0]?.message?.content || "No analysis returned.", source: "OpenAI" });
    } catch (error) {
      console.error("OpenAI request failed:", error.message);
      return res.status(502).json({ error: "AI analysis is temporarily unavailable. Please try again." });
    }
  }

  const largest = [...summary].sort((a, b) => b.value - a.value)[0];
  const weight = safeTotal ? (largest.value / safeTotal) * 100 : 0;
  const gainers = summary.filter((h) => h.change > 0).length;
  const losers = summary.filter((h) => h.change < 0).length;
  const analysis = [
    "Overview",
    `The portfolio contains ${summary.length} holdings with an estimated value of $${safeTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}.`,
    "",
    "Diversification",
    `${largest.symbol} is the largest holding at approximately ${weight.toFixed(1)}% of the supplied portfolio value.`,
    "",
    "Risks to review",
    weight > 40
      ? "The largest holding represents a substantial share of the portfolio. Consider whether this concentration matches your risk tolerance."
      : "No single holding exceeds 40% of the supplied portfolio value. Review sector and industry overlap as well.",
    `${gainers} holding(s) show a positive sample daily change and ${losers} show a negative sample daily change.`,
    "",
    "Questions to consider",
    "Are your holdings spread across different sectors? Does your allocation match your time horizon and risk tolerance?",
    "",
    "Demo mode: this summary uses the sample prices entered in the dashboard, not live market data. It is educational information, not financial advice."
  ].join("\n");
  return res.json({ analysis, source: "Built-in demo analysis" });
});

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => console.log(`Analysis API running at http://localhost:${port}`));