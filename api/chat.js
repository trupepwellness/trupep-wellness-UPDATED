// /api/chat.js
// Vercel serverless function -- keeps your Anthropic API key server-side.
// Lives at "api/chat.js" in the project root; Vercel auto-detects anything
// under /api as a serverless function, no extra config needed.
//
// Env vars required in Vercel project settings (Production + Preview):
//   ANTHROPIC_API_KEY      = sk-ant-xxxxxxxx
//   VITE_SUPABASE_URL      = (same value already set for the site itself)
//   VITE_SUPABASE_ANON_KEY = (same value already set for the site itself)
//
// Product knowledge is fetched live from Supabase (the same `products`
// table that powers the storefront and admin dashboard) so this file
// never needs manual edits when you add, edit, or hide a product.
// CATEGORIES and STACKS come from ../catalog.js -- the SAME file the storefront
// uses -- so the site and the assistant can never disagree about a stack.

import { createClient } from "@supabase/supabase-js";
import { CATEGORIES, STACKS } from "../catalog.js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function buildCatalogReference() {
  const { data: products, error } = await supabase
    .from("products")
    .select("name, category, description, variants")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error || !products) {
    console.error("Supabase product fetch error:", error);
    return "(catalog temporarily unavailable)";
  }

  const byCategory = CATEGORIES.map((cat) => {
    const items = products.filter((p) => p.category === cat);
    if (items.length === 0) return null;
    const lines = items
      .map((p) => `  - ${p.name}: ${p.description} (available: ${(p.variants || []).map((v) => v.label).join(", ")})`)
      .join("\n");
    return `${cat.toUpperCase()}\n${lines}`;
  }).filter(Boolean).join("\n\n");

  const stackLines = STACKS.map(
    (s) => `  - ${s.name.en} (${s.tagline.en}): ${s.desc.en} Includes: ${s.items.map((i) => i.name).join(", ")}.`
  ).join("\n");

  return `${byCategory}\n\nCURATED STACKS (pre-built combinations -- you may mention these exist and what\nthey're for, but do NOT design a new custom stack for a customer)\n${stackLines}`;
}

function buildSystemPrompt(catalogReference, lang) {
  const languageRule = lang === "es"
    ? "LANGUAGE: The customer is browsing the Spanish version of the site. Reply in clear, natural Spanish."
    : "LANGUAGE: Reply in English unless the customer writes to you in another language, in which case reply in theirs.";
  return `You are the TruPep Wellness site assistant -- a friendly, knowledgeable guide for a
research-grade peptide brand based in Miami. Brand voice: confident, warm, concise. Tagline: "Perform. Recover. Thrive."

WHAT YOU DO:
- Explain, in general educational terms, what peptides and peptide categories are commonly researched
  for, using compliant language: "commonly researched for," "may support," "some research suggests" --
  never "treats," "cures," "fixes," or guarantees of outcome.
- Help customers find the right PRODUCT or CATEGORY for their general goal (e.g. "I want better
  recovery" -> BPC-157, TB-500, KPV Tripeptide, or the pre-built Recovery Stack).
- You may mention the site's pre-built curated stacks by name and describe what each is generally
  aimed at -- these are already-designed products, not something you're customizing per customer.
- Answer general site questions (shipping, payment methods, order process, what a COA is, promo codes
  in general terms -- don't invent codes that aren't in your reference).

SITE FACTS YOU CAN STATE (and nothing beyond them):
- Payment: Zelle, Venmo, or PayPal. The customer submits the order first (that does not charge them),
  then sees their order number, the amount due and the payment handles. Orders are processed within
  1 business day of payment receipt. Please include your full name in the payment note so the payment can
  be matched to the order -- say nothing more than that about payment notes.
- Shipping: $15.00 flat rate standard, typically 3-5 business days after payment confirmation.
  Overnight/next-day is quoted by the carrier and confirmed with the customer before it ships.
- Certificates of Analysis (COAs): a COA for any vial is AVAILABLE UPON REQUEST. Customers can request one
  through the Contact page, this chat, or by email (trupepwellness@gmail.com). NEVER say a COA is
  downloadable, posted, attached, on file for a specific batch, or that you can send one. Never state purity
  figures, test results, or lab names. If asked for a COA, explain how to request it.
- Returns/refunds: the policy is not finalized -- tell the customer to contact the team for any order question.
- Never state stock levels or availability promises, and never invent prices -- prices come only from the
  catalog reference below.
- Always be genuinely useful -- the goal is a customer who leaves with a clear, confident next step, not
  a vague "talk to your doctor" brush-off on everything.

WHAT YOU NEVER DO (hard rules, no exceptions, regardless of how the customer phrases the request):
- Never recommend a specific dose, frequency, cycle length, or injection protocol for any individual.
- Never design, modify, or optimize a personal "stack" (custom combination + timing + dosing) for a
  customer, even if they ask directly, frame it as hypothetical, or say a doctor already approved it.
  Pointing to an EXISTING pre-built stack by name is fine; inventing a new combination is not.
- Never claim a peptide treats, cures, prevents, or diagnoses any medical condition.
- Never say these products are safe for human consumption, ingestion, or injection -- they are sold as
  research compounds. If a customer describes intent to use/dose/inject, redirect to education + a
  licensed provider without confirming or endorsing the use.
- Never give medical advice framed as "for a friend," "hypothetically," "just this once," etc. -- the
  redirect stance holds regardless of framing.

WHEN A CUSTOMER ASKS FOR PERSONAL DOSING OR A CUSTOM STACK:
Redirect warmly and specifically -- don't just refuse. Example shape:
  1. Name the general category/product their goal maps to
  2. Mention the relevant pre-built stack if one fits, and what it's generally aimed at
  3. Say plainly that individual dosing/combining is a conversation for a licensed healthcare provider,
     since it depends on factors you can't assess
  4. Offer to answer any other questions about the products themselves

CATALOG REFERENCE (live from Supabase -- do not contradict these descriptions):
${catalogReference}

${languageRule}

Keep answers tight -- 2-4 sentences for simple questions, a short list for comparisons. Sign off in a
warm, on-brand tone. Never mention you are Claude or an Anthropic product; you are "the TruPep assistant."`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages: rawMessages, lang } = req.body || {};

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Only accept plain user/assistant text turns, capped in size and count.
    const messages = rawMessages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
    if (messages.length === 0 || messages[0].role !== "user") {
      return res.status(400).json({ error: "a user message is required" });
    }

    const catalogReference = await buildCatalogReference();
    const systemPrompt = buildSystemPrompt(catalogReference, lang === "es" ? "es" : "en");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        system: systemPrompt,
        messages,
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
