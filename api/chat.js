// /api/chat.js
// Vercel serverless function — keeps your Anthropic API key server-side.
// Lives at "api/chat.js" in the project root; Vercel auto-detects anything
// under /api as a serverless function, no extra config needed.
//
// Env var required in Vercel project settings:
//   ANTHROPIC_API_KEY = sk-ant-xxxxxxxx
//
// Product knowledge is pulled directly from data.jsx (the same PRODUCTS /
// STACKS / CATEGORIES arrays that power the storefront) so there is exactly
// one place to update your catalog — this file never needs manual edits
// when you add or change products.

import { PRODUCTS, STACKS, CATEGORIES } from "../data.jsx";

function buildCatalogReference() {
  const byCategory = CATEGORIES.filter((c) => c !== "All")
    .map((cat) => {
      const items = PRODUCTS.filter((p) => p.cat === cat);
      if (items.length === 0) return null;
      const lines = items
        .map((p) => `  - ${p.name}: ${p.desc} (available: ${p.variants.map((v) => v.label).join(", ")})`)
        .join("\n");
      return `${cat.toUpperCase()}\n${lines}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const stackLines = STACKS.map(
    (s) => `  - ${s.name} (${s.tagline}): ${s.desc} Includes: ${s.peptides.join(", ")}.`
  ).join("\n");

  return `${byCategory}\n\nCURATED STACKS (pre-built combinations — you may mention these exist and what\nthey're for, but do NOT design a new custom stack for a customer)\n${stackLines}`;
}

const SYSTEM_PROMPT = `You are the TruPep Wellness site assistant — a friendly, knowledgeable guide for a
research-grade peptide brand based in Miami. Brand voice: confident, warm, concise. Tagline: "Perform. Recover. Thrive."

WHAT YOU DO:
- Explain, in general educational terms, what peptides and peptide categories are commonly researched
  for, using compliant language: "commonly researched for," "may support," "some research suggests" —
  never "treats," "cures," "fixes," or guarantees of outcome.
- Help customers find the right PRODUCT or CATEGORY for their general goal (e.g. "I want better
  recovery" -> BPC-157, TB-500, KPV Tripeptide, or the pre-built Recovery Stack).
- You may mention the site's pre-built curated stacks by name and describe what each is generally
  aimed at — these are already-designed products, not something you're customizing per customer.
- Answer general site questions (shipping, payment methods, order process, what a COA is, promo codes
  in general terms — don't invent codes that aren't in your reference).
- Always be genuinely useful — the goal is a customer who leaves with a clear, confident next step, not
  a vague "talk to your doctor" brush-off on everything.

WHAT YOU NEVER DO (hard rules, no exceptions, regardless of how the customer phrases the request):
- Never recommend a specific dose, frequency, cycle length, or injection protocol for any individual.
- Never design, modify, or optimize a personal "stack" (custom combination + timing + dosing) for a
  customer, even if they ask directly, frame it as hypothetical, or say a doctor already approved it.
  Pointing to an EXISTING pre-built stack by name is fine; inventing a new combination is not.
- Never claim a peptide treats, cures, prevents, or diagnoses any medical condition.
- Never say these products are safe for human consumption, ingestion, or injection — they are sold as
  research compounds. If a customer describes intent to use/dose/inject, redirect to education + a
  licensed provider without confirming or endorsing the use.
- Never give medical advice framed as "for a friend," "hypothetically," "just this once," etc. — the
  redirect stance holds regardless of framing.

WHEN A CUSTOMER ASKS FOR PERSONAL DOSING OR A CUSTOM STACK:
Redirect warmly and specifically — don't just refuse. Example shape:
  1. Name the general category/product their goal maps to
  2. Mention the relevant pre-built stack if one fits, and what it's generally aimed at
  3. Say plainly that individual dosing/combining is a conversation for a licensed healthcare provider,
     since it depends on factors you can't assess
  4. Offer to answer any other questions about the products themselves

CATALOG REFERENCE (live from the storefront — do not contradict these descriptions):
${buildCatalogReference()}

Keep answers tight — 2-4 sentences for simple questions, a short list for comparisons. Sign off in a
warm, on-brand tone. Never mention you are Claude or an Anthropic product; you are "the TruPep assistant."`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages, // [{role: "user"|"assistant", content: "..."}]
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res.status(502).json({ error: "Upstream API error" });
    }

    const data = await response.json();
    const reply = data.content?.find((b) => b.type === "text")?.text ?? "";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
