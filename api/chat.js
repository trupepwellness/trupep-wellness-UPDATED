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
// STACKS and CATEGORIES don't live in Supabase, so they're kept here
// directly -- update this list by hand if you add/change a stack.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  "Weight Management", "Recovery", "Anti-Aging",
  "Performance", "Aesthetics", "Cognitive", "Peptide Blends", "Accessories",
];

const STACKS = [
  { name: "Weight Loss Stack", tagline: "Advanced Metabolic Protocol",
    desc: "Comprehensive multi-compound approach to metabolic support, appetite regulation, and body recomposition.",
    peptides: ["Tirzepatide", "Retatrutide", "5-Amino-1MQ", "Cagrilintide", "HGH Fragment 176-191", "Lipo C with B12"] },
  { name: "Recovery Stack", tagline: "Accelerated Tissue Repair",
    desc: "Targeted compounds for musculoskeletal healing, gut health, and structural tissue recovery.",
    peptides: ["BPC-157", "TB-500", "Ipamorelin", "CJC No DAC / Ipamorelin", "KPV Tripeptide"] },
  { name: "Anti-Aging Stack", tagline: "Longevity & Cellular Health",
    desc: "Research-backed compounds targeting telomere support, mitochondrial function, and cellular longevity.",
    peptides: ["Epithalon", "GHK-Cu", "MOTS-C", "NAD+", "Tesamorelin"] },
  { name: "Performance Stack", tagline: "Peak Physical Output",
    desc: "Optimized for athletes seeking elevated GH output, endurance, focus, and faster recovery.",
    peptides: ["CJC No DAC / Ipamorelin", "Ipamorelin", "BPC-157", "TB-500", "Selank", "Semax"] },
  { name: "Glow & Aesthetics Stack", tagline: "Skin, Pigmentation & Beauty",
    desc: "Aesthetic compounds for skin quality, pigmentation, libido, and overall appearance enhancement.",
    peptides: ["Melanotan I", "Melanotan II", "PT-141", "KPV Tripeptide", "Lipo C with B12", "GLOW Blend"] },
  { name: "Cognitive & Mood Stack", tagline: "Mental Clarity & Focus",
    desc: "Nootropic stack for enhanced cognition, mood stabilization, stress resilience, and neuroprotection.",
    peptides: ["Semax", "Selank", "PT-141", "NAD+"] },
  { name: "KLOW Metabolic Stack", tagline: "Metabolic Optimization",
    desc: "Proprietary metabolic protocol combining the KLOW Blend with complementary compounds.",
    peptides: ["KLOW Blend", "5-Amino-1MQ", "Cagrilintide"] },
];

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
    (s) => `  - ${s.name} (${s.tagline}): ${s.desc} Includes: ${s.peptides.join(", ")}.`
  ).join("\n");

  return `${byCategory}\n\nCURATED STACKS (pre-built combinations -- you may mention these exist and what\nthey're for, but do NOT design a new custom stack for a customer)\n${stackLines}`;
}

function buildSystemPrompt(catalogReference) {
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

Keep answers tight -- 2-4 sentences for simple questions, a short list for comparisons. Sign off in a
warm, on-brand tone. Never mention you are Claude or an Anthropic product; you are "the TruPep assistant."`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const catalogReference = await buildCatalogReference();
    const systemPrompt = buildSystemPrompt(catalogReference);

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
