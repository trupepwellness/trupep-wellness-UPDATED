// catalog.js — single source of truth for category + stack data.
// Imported by BOTH the storefront (main.jsx) and the chat function (api/chat.js),
// so editing a stack or category here updates the site and the assistant together.
//
// Product names, descriptions and prices are NOT here — they live in the Supabase
// `products` table. Stack items reference products by their Supabase `id` (slug),
// so stack pricing is always read live from the catalog and can never drift from it.

export const CATEGORIES = [
  "Weight Management", "Recovery", "Anti-Aging",
  "Performance", "Aesthetics", "Cognitive", "Peptide Blends", "Accessories",
];

// GHK-Cu removed from Glow stack per earlier update — still available individually in the catalog.
// `items[].id` = products.id in Supabase. `items[].name` = English product name (used by the chat
// assistant and as a display fallback if a product has been hidden or renamed).
export const STACKS = [
  {
    id: "weightloss",
    name: { en: "Weight Loss Stack", es: "Stack para Pérdida de Peso" },
    tagline: { en: "Advanced Metabolic Protocol", es: "Protocolo Metabólico Avanzado" },
    desc: {
      en: "Comprehensive multi-compound approach to metabolic support, appetite regulation, and body recomposition.",
      es: "Enfoque integral de varios compuestos para el apoyo metabólico, la regulación del apetito y la recomposición corporal.",
    },
    items: [
      { id: "tirzepatide", name: "Tirzepatide" },
      { id: "retatrutide", name: "Retatrutide" },
      { id: "5amino", name: "5-Amino-1MQ" },
      { id: "cagrilintide", name: "Cagrilintide" },
      { id: "hghfrag", name: "HGH Fragment 176-191" },
      { id: "lipoc", name: "Lipo C with B12" },
    ],
  },
  {
    id: "recovery",
    name: { en: "Recovery Stack", es: "Stack de Recuperación" },
    tagline: { en: "Accelerated Tissue Repair", es: "Reparación Tisular Acelerada" },
    desc: {
      en: "Targeted compounds for musculoskeletal healing, gut health, and structural tissue recovery.",
      es: "Compuestos dirigidos a la curación musculoesquelética, la salud intestinal y la recuperación del tejido estructural.",
    },
    items: [
      { id: "bpc157", name: "BPC-157" },
      { id: "tb500", name: "TB-500" },
      { id: "ipamorelin", name: "Ipamorelin" },
      { id: "cjcipamorelin", name: "CJC No DAC / Ipamorelin" },
      { id: "kpv", name: "KPV Tripeptide" },
    ],
  },
  {
    id: "antiaging",
    name: { en: "Anti-Aging Stack", es: "Stack Antienvejecimiento" },
    tagline: { en: "Longevity & Cellular Health", es: "Longevidad y Salud Celular" },
    desc: {
      en: "Research-backed compounds targeting telomere support, mitochondrial function, and cellular longevity.",
      es: "Compuestos respaldados por investigación que apuntan al apoyo de los telómeros, la función mitocondrial y la longevidad celular.",
    },
    items: [
      { id: "epithalon", name: "Epithalon" },
      { id: "ghkcu", name: "GHK-Cu" },
      { id: "motsc", name: "MOTS-C" },
      { id: "nad", name: "NAD+" },
      { id: "tesamorelin", name: "Tesamorelin" },
    ],
  },
  {
    id: "performance",
    name: { en: "Performance Stack", es: "Stack de Rendimiento" },
    tagline: { en: "Peak Physical Output", es: "Máximo Rendimiento Físico" },
    desc: {
      en: "Optimized for athletes seeking elevated GH output, endurance, focus, and faster recovery.",
      es: "Optimizado para atletas que buscan mayor liberación de GH, resistencia, enfoque y una recuperación más rápida.",
    },
    items: [
      { id: "cjcipamorelin", name: "CJC No DAC / Ipamorelin" },
      { id: "ipamorelin", name: "Ipamorelin" },
      { id: "bpc157", name: "BPC-157" },
      { id: "tb500", name: "TB-500" },
      { id: "selank", name: "Selank" },
      { id: "semax", name: "Semax" },
    ],
  },
  {
    id: "glow",
    name: { en: "Glow & Aesthetics Stack", es: "Stack Glow y Estética" },
    tagline: { en: "Skin, Pigmentation & Beauty", es: "Piel, Pigmentación y Belleza" },
    desc: {
      en: "Aesthetic compounds for skin quality, pigmentation, libido, and overall appearance enhancement.",
      es: "Compuestos estéticos para la calidad de la piel, la pigmentación, la libido y la mejora general de la apariencia.",
    },
    items: [
      { id: "melanotanI", name: "Melanotan I" },
      { id: "melanotanII", name: "Melanotan II" },
      { id: "pt141", name: "PT-141" },
      { id: "kpv", name: "KPV Tripeptide" },
      { id: "lipoc", name: "Lipo C with B12" },
      { id: "glowblend", name: "GLOW Blend" },
    ],
  },
  {
    id: "cognitive",
    name: { en: "Cognitive & Mood Stack", es: "Stack Cognitivo y de Estado de Ánimo" },
    tagline: { en: "Mental Clarity & Focus", es: "Claridad Mental y Enfoque" },
    desc: {
      en: "Nootropic stack for enhanced cognition, mood stabilization, stress resilience, and neuroprotection.",
      es: "Stack nootrópico para mejorar la cognición, estabilizar el estado de ánimo, aumentar la resiliencia al estrés y la neuroprotección.",
    },
    items: [
      { id: "semax", name: "Semax" },
      { id: "selank", name: "Selank" },
      { id: "pt141", name: "PT-141" },
      { id: "nad", name: "NAD+" },
    ],
  },
  {
    id: "klow",
    name: { en: "KLOW Metabolic Stack", es: "Stack Metabólico KLOW" },
    tagline: { en: "Metabolic Optimization", es: "Optimización Metabólica" },
    desc: {
      en: "Proprietary metabolic protocol combining the KLOW Blend with complementary compounds.",
      es: "Protocolo metabólico exclusivo que combina la mezcla KLOW con compuestos complementarios.",
    },
    items: [
      { id: "klowblend", name: "KLOW Blend" },
      { id: "5amino", name: "5-Amino-1MQ" },
      { id: "cagrilintide", name: "Cagrilintide" },
    ],
  },
];
