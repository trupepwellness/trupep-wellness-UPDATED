import LOGO from "./logoData.js";
import { LOGO2 } from "./logoData.js";
import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  Sun, Moon, ShoppingBag, User, Menu, X, ChevronDown, ChevronRight, ArrowRight, ArrowLeft,
  Search, Check, Plus, Minus, Mail, Phone, MapPin, Send, MessageCircle, MessageSquare,
  FlaskConical, Award, ShieldCheck, Sparkles, Truck, Scale, RefreshCw, Hourglass, Zap, Brain,
  Flame, Droplets, Snowflake, Copy, Trash2, CircleHelp, Calculator, BookOpen, FileText,
  Microscope, Layers, Clock, Lock, Info,
} from "lucide-react";
import { CATEGORIES, STACKS } from "./catalog.js";
import { translate } from "./i18n.js";

// ── SUPABASE ────────────────────────────────────────────────────
// Add these to a .env file at the project root (Vite requires the VITE_ prefix),
// and to the Vercel project's Environment Variables:
//   VITE_SUPABASE_URL=https://xxxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-public-key
// If they are missing the site still renders (so it never white-screens) and
// shows a "couldn't load the catalog" message instead of products.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || "https://missing-env.invalid", supabaseAnonKey || "missing-env");

// ── SITE CONFIG ─────────────────────────────────────────────────
const FORMSPREE = "https://formspree.io/f/xvzyzgqa";
const CONTACT_EMAIL = "trupepwellness@gmail.com";
const CONTACT_PHONE = "423-444-3668";
const SHIPPING_STANDARD = 15;

// Payment handles — exactly as they were already in the site code.
const PAY_METHODS = [
  { id: "zelle",  handle: "(423) 444-3668 — Tristan Trujillo", copy: "(423) 444-3668" },
  { id: "venmo",  handle: "@TruPepWellness", copy: "@TruPepWellness" },
  { id: "paypal", handle: "@ItsTrinchy", copy: "@ItsTrinchy" },
];

// The admin dashboard is not linked anywhere on the site. It lives at
// https://www.trupepwellness.com/#/<ADMIN_ROUTE> — see the PR notes.
const ADMIN_ROUTE = "ops-tp7k2m";

// Set to true once Tristan has approved the real returns policy text
// (removes the "draft" banner from the Returns page).
const RETURNS_POLICY_APPROVED = false;

const PROMO_CODES = {
  GOLDSTART5:5, PEPTIDE10:10, TRUPEP15:15, MIAMI20:20, VENOM25:25,
  PRIDE25:25, LUIS25:25,
  BLACKGOLD30:30, BLAZING35:35, KINGPEP40:40, GODMODE45:45,
  ULTRAVIP50:50, DIAMOND55:55,
};

const TESTIMONIALS = [
  { name:"Marcus R.",  stars:5, text:"Down 34 lbs in 12 weeks on the weight loss stack. The results speak for themselves." },
  { name:"Sophia L.",  stars:5, text:"My skin has never looked better. The glow stack completely transformed my complexion." },
  { name:"James T.",   stars:5, text:"Recovery time cut in half after switching to BPC-157 and TB-500. Total game changer." },
  { name:"Daniela M.", stars:5, text:"The cognitive stack keeps me sharp during 14-hour trading sessions. Remarkable clarity." },
  { name:"Rafael C.",  stars:5, text:"TruPep's quality and customer service are unmatched. Loyal customer for life." },
];

const VIDEOS = [
  { id:"n8vk8DfwRHg", title:"How To Properly Reconstitute Peptides" },
  { id:"tcEWjyQfDLc", title:"Reconstitution & Injection — Full Demo" },
  { id:"jrLV99dJi14", title:"Peptide Safe Injection Techniques" },
  { id:"zU5EYw06wtw", title:"Benefits & Risks of Peptide Therapeutics" },
];

// ── STORAGE (localStorage / sessionStorage, never throws) ───────
const store = {
  get(k, d = null) { try { const v = window.localStorage.getItem(k); return v === null ? d : v; } catch (_) { return d; } },
  set(k, v) { try { window.localStorage.setItem(k, v); } catch (_) {} },
  sget(k, d = null) { try { const v = window.sessionStorage.getItem(k); return v === null ? d : v; } catch (_) { return d; } },
  sset(k, v) { try { window.sessionStorage.setItem(k, v); } catch (_) {} },
};

// ── ANALYTICS (anonymous, first-party, aggregate-only) ──────────
// Events go to this project's own `site_events` table. NEVER put names, emails,
// phone numbers, addresses, IPs or anything identifying in an event. The only
// identifier is a random per-tab session code (not derived from the device),
// used to count distinct visits. Fire-and-forget: failures are swallowed and the
// site keeps working if the table doesn't exist yet.
const ANALYTICS_TYPES = new Set(["page_view","item_view","search","filter","add_to_cart","stack_buy_all","checkout_start","order_placed","share","chat_open","calculator_used","theme_toggle","lang_toggle"]);
const analytics = { queue: [], timer: null, off: false, sid: null };
function analyticsSession() {
  if (analytics.sid) return analytics.sid;
  let id = store.sget("tp_sid");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    store.sset("tp_sid", id);
  }
  analytics.sid = id;
  return id;
}
// Search terms: keep only short, plain terms. Anything that looks like personal
// data (email, phone number, long digit runs, URLs) is dropped, not logged.
function cleanSearchTerm(raw) {
  const t = String(raw || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (t.length < 3 || t.length > 40) return null;
  if (/@|https?:|www\./.test(t)) return null;
  if (/\d[\d\s().+-]{6,}\d/.test(t)) return null;
  return t;
}
function flushAnalytics() {
  clearTimeout(analytics.timer); analytics.timer = null;
  if (analytics.off || !analytics.queue.length) return;
  const rows = analytics.queue.splice(0, 50);
  try {
    Promise.resolve(supabase.from("site_events").insert(rows)).then((res) => {
      if (res && res.error) analytics.off = true; // table missing / blocked: stop trying this session
    }).catch(() => { analytics.off = true; });
  } catch (_) { analytics.off = true; }
}
function track(type, slug, extra) {
  try {
    if (analytics.off || !ANALYTICS_TYPES.has(type) || !supabaseUrl) return;
    if (window.location.hash.includes(ADMIN_ROUTE)) return; // never track the admin area
    const row = { event_type: type, item_slug: slug ? String(slug).slice(0, 60) : null, search_term: null, meta: { s: analyticsSession(), l: document.documentElement.lang || "en", w: window.innerWidth < 700 ? "m" : "d", ...(extra || {}) } };
    if (type === "search") { row.search_term = cleanSearchTerm(slug); row.item_slug = null; if (!row.search_term) return; }
    analytics.queue.push(row);
    if (analytics.queue.length >= 20) flushAnalytics();
    else if (!analytics.timer) analytics.timer = setTimeout(flushAnalytics, 2500);
  } catch (_) {}
}
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushAnalytics);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushAnalytics(); });
}

// ── DESIGN TOKENS ───────────────────────────────────────────────
// Colors are CSS variables (see the `G` stylesheet) so the light/dark switch
// re-themes every surface — storefront, account and admin — at once.
const fg = (a) => `rgba(var(--fg-rgb),${a})`;
const gl = (a) => `rgba(var(--gold-rgb),${a})`;
const ln = (a) => `rgba(var(--line-rgb),${a})`;
const GOLD   = "var(--gold)";
const GOLD2  = "var(--gold2)";
const FILL   = "var(--gold-fill)";
const FILL2  = "var(--gold-fill2)";
const INK    = "var(--ink)";
const BG     = "var(--bg)";
const FG     = "var(--fg)";
const OK     = "var(--ok)";
const ERR    = "var(--err)";
const SERIF  = "'Cormorant Garamond', serif";
const SANS   = "'Montserrat', sans-serif";
const DIM    = fg(0.88);
const DIM2   = fg(0.68);
const DIM3   = fg(0.52);
const BORDER = "var(--border)";
const GLASS  = "var(--glass)";
const GLASS2 = "var(--glass2)";
const fmt    = (n) => `$${Number(n).toFixed(2)}`;

// ── GLOBAL CSS ──────────────────────────────────────────────────
const G = `
  :root{
    --bg:#0A0A0A; --bg2:#101010;
    --fg:#FFFFFF; --fg-rgb:255,255,255; --ink:#0A0A0A;
    --gold:#F0C84A; --gold-rgb:240,200,74; --gold2:#F5D980;
    --gold-fill:#F0C84A; --gold-fill2:#F5D980; --gold-deep:#B8922E;
    --line-rgb:201,168,76;
    --border:rgba(201,168,76,.36); --border-strong:rgba(201,168,76,.7);
    --glass:rgba(255,255,255,.04); --glass2:rgba(255,255,255,.075);
    --card-bg:linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.03));
    --card-shadow:none;
    --card-shadow-hover:0 16px 46px rgba(0,0,0,.55),0 0 0 1px rgba(240,200,74,.28);
    --input-bg:rgba(255,255,255,.06);
    --nav-bg:rgba(10,10,10,.74); --nav-bg-solid:rgba(10,10,10,.96);
    --overlay:rgba(0,0,0,.66);
    --ok:#7fd48a; --err:#ff7b7b; --warn:#e0a84a;
    --hero-glow:rgba(201,168,76,.13);
    --drawer-bg:linear-gradient(180deg,#131313,#0c0c0c);
    --logo-filter:drop-shadow(0 0 30px rgba(240,200,74,.55)) drop-shadow(0 10px 18px rgba(0,0,0,.85));
  }
  :root[data-theme="light"]{
    --bg:#FAF6EE; --bg2:#F2EBDB;
    --fg:#1B160C; --fg-rgb:27,22,12; --ink:#14110A;
    --gold:#85620F; --gold-rgb:133,98,15; --gold2:#A9801C;
    --gold-fill:#D4AF37; --gold-fill2:#E7C96B; --gold-deep:#B08C1C;
    --line-rgb:150,115,30;
    --border:rgba(150,115,30,.32); --border-strong:rgba(150,115,30,.62);
    --glass:rgba(255,255,255,.62); --glass2:#FFFFFF;
    --card-bg:#FFFFFF;
    --card-shadow:0 1px 2px rgba(80,55,10,.06),0 10px 30px rgba(80,55,10,.07);
    --card-shadow-hover:0 20px 48px rgba(80,55,10,.15),0 0 0 1px rgba(133,98,15,.3);
    --input-bg:#FFFFFF;
    --nav-bg:rgba(250,246,238,.82); --nav-bg-solid:rgba(250,246,238,.97);
    --overlay:rgba(36,26,6,.46);
    --ok:#2c7a3b; --err:#b3261e; --warn:#8a5a00;
    --hero-glow:rgba(212,175,55,.2);
    --drawer-bg:linear-gradient(180deg,#FFFFFF,#FBF7EE);
    --logo-filter:drop-shadow(0 0 24px rgba(212,175,55,.45)) drop-shadow(0 8px 14px rgba(80,55,10,.25));
  }

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth;color-scheme:dark;-webkit-text-size-adjust:100%}
  html[data-theme="light"]{color-scheme:light}
  body{background:var(--bg);color:var(--fg);font-family:${SANS};font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden;transition:background-color .35s ease,color .35s ease}
  a{color:inherit;text-decoration:none}
  button{cursor:pointer;border:none;background:none;font-family:inherit;color:inherit}
  input,textarea,select{outline:none;font-family:inherit;color:var(--fg);background:var(--input-bg)}
  select option{background:var(--bg2);color:var(--fg)}
  img{max-width:100%}
  ::selection{background:rgba(var(--gold-rgb),.35)}
  ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:var(--gold);border-radius:3px}
  :focus-visible{outline:2px solid var(--gold);outline-offset:2px;border-radius:2px}
  .skip{position:fixed;left:12px;top:-60px;z-index:1000;background:var(--gold-fill);color:var(--ink);padding:10px 16px;font-size:12px;font-weight:600;border-radius:3px;transition:top .2s}
  .skip:focus{top:12px}

  @keyframes pageIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideRight{from{transform:translateX(104%)}to{transform:none}}
  @keyframes popIn{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:none}}
  @keyframes ddIn{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}
  @keyframes ddItem{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
  @keyframes menuIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
  @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes heroBreathe{0%,100%{opacity:.6}50%{opacity:1}}
  @keyframes particle{0%{transform:translateY(0) translateX(0);opacity:0}15%{opacity:1}85%{opacity:.6}100%{transform:translateY(-120vh) translateX(var(--dx,20px));opacity:0}}
  @keyframes logoRingCCW{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(-360deg)}}
  @keyframes bump{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
  @keyframes shimmerLine{0%{background-position:-200% 0}100%{background-position:200% 0}}

  .page-enter{animation:pageIn .55s cubic-bezier(.2,.7,.2,1) both}
  .reveal{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
  .reveal.visible{opacity:1;transform:none}
  .logo-ring-ccw{animation:logoRingCCW 9s linear infinite}
  .bump{animation:bump .35s ease}

  /* layout */
  .page{padding:116px 24px 90px}
  .wrap{max-width:1200px;margin:0 auto}
  .wrap-md{max-width:920px;margin:0 auto}
  .wrap-sm{max-width:760px;margin:0 auto}
  .eyebrow{font-size:10px;letter-spacing:.34em;text-transform:uppercase;color:var(--gold);font-weight:600}
  .display{font-family:${SERIF};font-weight:300;letter-spacing:-.005em;line-height:1.08}
  .rule{height:1px;background:linear-gradient(90deg,transparent,var(--border-strong),transparent);border:0}
  .grid-auto{display:grid;gap:24px}

  /* surfaces */
  .card{border:1px solid var(--border);border-radius:6px;background:var(--card-bg);box-shadow:var(--card-shadow);transition:transform .4s cubic-bezier(.2,.7,.2,1),box-shadow .4s ease,border-color .3s ease}
  .card-hover:hover{transform:translateY(-4px);border-color:var(--gold);box-shadow:var(--card-shadow-hover)}
  .panel{border:1px solid var(--border);border-radius:8px;background:var(--glass2);box-shadow:var(--card-shadow)}

  /* controls */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 30px;font-size:10px;letter-spacing:.2em;font-weight:600;text-transform:uppercase;font-family:${SANS};border-radius:2px;border:1px solid var(--gold-fill);position:relative;transition:transform .2s ease,box-shadow .25s ease,background .25s ease,color .25s ease,filter .2s ease;white-space:nowrap}
  .btn-gold{background:linear-gradient(135deg,var(--gold-deep) 0%,var(--gold-fill) 42%,var(--gold-fill2) 62%,var(--gold-fill) 82%,var(--gold-deep) 100%);background-size:220% 220%;color:var(--ink)}
  .btn-gold:hover{transform:translateY(-1px);filter:brightness(1.07);box-shadow:0 8px 26px rgba(var(--gold-rgb),.34)}
  .btn-outline{background:transparent;color:var(--gold);border-color:var(--gold)}
  .btn-outline:hover{background:var(--gold-fill);color:var(--ink);border-color:var(--gold-fill);transform:translateY(-1px);box-shadow:0 8px 26px rgba(var(--gold-rgb),.25)}
  .btn-sm{padding:10px 20px;font-size:9.5px}
  .btn-block{width:100%}
  .btn:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}
  .btn:active{transform:translateY(0)}
  .pill{padding:7px 16px;font-size:11px;letter-spacing:.04em;border-radius:999px;border:1px solid var(--border);color:${DIM};background:transparent;transition:all .2s ease}
  .pill:hover{border-color:var(--gold);color:var(--gold)}
  .pill.on{border-color:var(--gold);color:var(--gold);background:rgba(var(--gold-rgb),.12)}
  .chip{padding:8px 16px;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;border-radius:999px;border:1px solid var(--border);color:${DIM2};background:var(--glass);transition:all .2s ease}
  .chip:hover{border-color:var(--gold);color:var(--gold)}
  .chip.on{border-color:var(--gold);color:var(--gold);background:rgba(var(--gold-rgb),.12)}
  .input{width:100%;padding:12px 15px;font-size:13px;border:1px solid var(--border);border-radius:4px;background:var(--input-bg);color:var(--fg);transition:border-color .2s ease,box-shadow .2s ease}
  .input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(var(--gold-rgb),.16)}
  .input::placeholder{color:${fg(0.45)}}
  .link{color:var(--gold);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
  .icon-btn{width:38px;height:38px;border-radius:50%;border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;background:var(--glass);transition:border-color .2s ease,box-shadow .2s ease,background .2s ease;position:relative;flex-shrink:0}
  .icon-btn:hover{border-color:var(--gold);box-shadow:0 0 16px rgba(var(--gold-rgb),.25)}

  /* language + theme toggles */
  .seg{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:999px;background:var(--glass);overflow:hidden;height:34px;flex-shrink:0}
  .seg button{padding:0 11px;height:100%;font-size:10.5px;font-weight:600;letter-spacing:.12em;color:${DIM2};transition:background .2s ease,color .2s ease}
  .seg button+button{border-left:1px solid var(--border)}
  .seg button[aria-pressed="true"]{background:var(--gold-fill);color:var(--ink)}
  .seg button:hover:not([aria-pressed="true"]){color:var(--gold)}
  .theme-btn{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 12px;border:1px solid var(--border);border-radius:999px;background:var(--glass);font-size:10.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${DIM};transition:border-color .2s ease,color .2s ease;flex-shrink:0}
  .theme-btn:hover{border-color:var(--gold);color:var(--gold)}
  .theme-btn svg{transition:transform .5s cubic-bezier(.2,.7,.2,1)}
  .theme-btn:hover svg{transform:rotate(25deg)}

  /* nav */
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:var(--nav-bg);backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);border-bottom:1px solid transparent;transition:background .3s ease,border-color .3s ease}
  .nav.scrolled{background:var(--nav-bg-solid);border-bottom-color:var(--border)}
  .nav-link{position:relative;display:inline-flex;align-items:center;gap:5px;padding:8px 2px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:${DIM2};transition:color .2s ease}
  .nav-link::after{content:"";position:absolute;left:0;right:0;bottom:2px;height:1px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.2,.7,.2,1)}
  .nav-link:hover,.nav-link.on{color:var(--gold)}
  .nav-link:hover::after,.nav-link.on::after{transform:scaleX(1)}
  .nav-link svg{transition:transform .3s ease}
  .dd{position:relative}
  .dd.open .nav-link svg{transform:rotate(180deg)}
  .dd-panel{position:absolute;top:calc(100% + 10px);left:-18px;min-width:290px;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--nav-bg-solid);backdrop-filter:blur(18px);box-shadow:0 24px 60px rgba(0,0,0,.45);transform-origin:top left;animation:ddIn .26s cubic-bezier(.2,.7,.2,1) both;z-index:5}
  .dd-item{display:flex;align-items:center;gap:13px;width:100%;text-align:left;padding:11px 13px;border-radius:5px;animation:ddItem .34s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i,0) * 55ms + 40ms);transition:background .2s ease}
  .dd-item:hover{background:rgba(var(--gold-rgb),.1)}
  .dd-item .ico{width:34px;height:34px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0;transition:background .2s ease,color .2s ease}
  .dd-item:hover .ico{background:var(--gold-fill);color:var(--ink);border-color:var(--gold-fill)}
  .dd-item .lbl{font-size:12px;font-weight:600;letter-spacing:.04em;color:var(--fg)}
  .dd-item .sub{font-size:10.5px;color:${DIM3};margin-top:1px}
  .mmenu{background:var(--nav-bg-solid);border-top:1px solid var(--border);max-height:calc(100vh - 64px);overflow-y:auto;animation:menuIn .28s ease both}
  .mm-head{padding:18px 24px 8px;font-size:9.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);font-weight:600}
  .mm-link{display:flex;align-items:center;gap:13px;width:100%;text-align:left;padding:14px 24px;font-size:14px;letter-spacing:.06em;font-weight:500;color:var(--fg);border-bottom:1px solid ${ln(0.14)};animation:ddItem .32s ease both;animation-delay:calc(var(--i,0) * 40ms)}
  .mm-link.on{color:var(--gold);background:rgba(var(--gold-rgb),.08)}
  .mm-link svg{color:var(--gold);flex-shrink:0}

  /* product placeholder + media */
  .media{position:relative;overflow:hidden;border-radius:4px;border:1px solid var(--border);background:var(--bg2)}
  .media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.2,.7,.2,1)}
  .card-hover:hover .media img{transform:scale(1.045)}
  .ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:radial-gradient(ellipse at 50% 38%,rgba(var(--gold-rgb),.2),transparent 68%),linear-gradient(160deg,var(--bg2),var(--bg))}
  html[data-theme="light"] .ph{background:radial-gradient(ellipse at 50% 38%,rgba(var(--gold-rgb),.16),transparent 70%),linear-gradient(160deg,#FFFDF8,#F3EBD9)}
  .ph-ring{width:62%;aspect-ratio:1;max-width:150px;border-radius:50%;border:1px solid var(--border-strong);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 40px rgba(var(--gold-rgb),.1)}
  .ph-mono{font-family:${SERIF};font-size:clamp(44px,9vw,68px);font-weight:300;color:var(--gold);line-height:1}
  .ph-brand{font-size:8px;letter-spacing:.42em;text-transform:uppercase;color:${DIM3}}
  .clamp3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}

  /* accordion */
  .acc{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s cubic-bezier(.2,.7,.2,1)}
  .acc.open{grid-template-rows:1fr}
  .acc>div{overflow:hidden;min-height:0}

  /* misc */
  .badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:600}
  .step-dot{width:26px;height:26px;border-radius:50%;border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--gold);flex-shrink:0;font-weight:600}
  .hide-mobile{}
  @media(max-width:959px){.hide-nav{display:none!important}}
  @media(min-width:960px){.show-nav{display:none!important}}
  @media(max-width:768px){.hide-mobile{display:none!important}.page{padding:100px 16px 70px}}
  @media(max-width:1180px){.theme-label{display:none}}
  .nav-in{padding:0 24px}
  @media(max-width:560px){.nav-in{padding:0 14px!important}.hide-xs{display:none!important}.nav-ctl{gap:6px!important}}
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
    .reveal{opacity:1;transform:none}
  }
`;

// ── MISC HELPERS ────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

// Fade-up on scroll. Elements already in view show immediately; a safety
// timer guarantees nothing can ever stay hidden.
function useReveal(dep) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal:not(.visible)"));
    if (!els.length) return;
    if (typeof IntersectionObserver === "undefined") { els.forEach((e) => e.classList.add("visible")); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    els.forEach((el) => obs.observe(el));
    const safety = setTimeout(() => els.forEach((e) => e.classList.add("visible")), 2600);
    return () => { obs.disconnect(); clearTimeout(safety); };
  }, [dep]);
}

const orderNumberOf = (id) => `TP-${String(id || "").replace(/-/g, "").slice(0, 8).toUpperCase()}`;
const minPrice = (p) => (p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : 0);
const startingVariant = (p) => p.variants.reduce((a, v) => (a === null || v.price < a.price ? v : a), null);

// ── THEME ───────────────────────────────────────────────────────
const ThemeContext = createContext({ theme: "dark", toggle: () => {} });
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => (store.get("tp_theme", "dark") === "light" ? "light" : "dark"));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    store.set("tp_theme", theme);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", theme === "light" ? "#FAF6EE" : "#0A0A0A");
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => { const n = t === "dark" ? "light" : "dark"; setTimeout(() => track("theme_toggle", n), 0); return n; }), []);
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
const useTheme = () => useContext(ThemeContext);

// ── LANGUAGE ────────────────────────────────────────────────────
const LangContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });
function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => (store.get("tp_lang", "en") === "es" ? "es" : "en"));
  const setLang = useCallback((l) => { setLangState((prev) => { if (prev !== l) setTimeout(() => track("lang_toggle", l), 0); return l; }); }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    store.set("tp_lang", lang);
  }, [lang]);
  const t = useCallback((path, vars) => translate(lang, path, vars), [lang]);
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}
const useI18n = () => useContext(LangContext);

// Renders **bold** segments with the gold accent.
function Rich({ text, color = GOLD }) {
  const parts = String(text).split("**");
  return <>{parts.map((s, i) => (i % 2 ? <strong key={i} style={{ color, fontWeight: 600 }}>{s}</strong> : <React.Fragment key={i}>{s}</React.Fragment>))}</>;
}

// ── ROUTER (hash-based: back/forward + deep links, zero hosting config) ─
const PAGES = new Set(["home","products","stacks","calculator","howto","faq","about","contact","shipping","returns","terms","privacy","disclaimer","labresults","account"]);

function routeFromHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [pathPart, queryPart = ""] = raw.split("?");
  let segs = [];
  try { segs = pathPart.split("/").filter(Boolean).map(decodeURIComponent); } catch (_) { segs = []; }
  const query = Object.fromEntries(new URLSearchParams(queryPart));
  const first = segs[0] || "";
  if (first === ADMIN_ROUTE) return { page: "admin", param: null, query };
  if (first === "product" && segs[1]) return { page: "product", param: segs[1], query };
  if (PAGES.has(first)) return { page: first, param: null, query };
  return { page: "home", param: null, query };
}

function hashFor(page, param, query) {
  const path = page === "home" ? "" : page === "product" ? `product/${encodeURIComponent(param)}` : page === "admin" ? ADMIN_ROUTE : page;
  const qs = query && Object.keys(query).length ? `?${new URLSearchParams(query).toString()}` : "";
  return `#/${path}${qs}`;
}

const RouterContext = createContext({ route: { page: "home", param: null, query: {} }, go: () => {}, entered: true, enter: () => {} });
function RouterProvider({ children }) {
  const [route, setRoute] = useState(routeFromHash);
  const [entered, setEntered] = useState(() => store.sget("tp_entered") === "1");
  useEffect(() => {
    const on = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = useCallback((page, opts = {}) => {
    const h = hashFor(page, opts.param, opts.query);
    if (window.location.hash === h) { setRoute(routeFromHash()); window.scrollTo(0, 0); }
    else window.location.hash = h;
  }, []);
  const enter = useCallback((to) => {
    store.sset("tp_entered", "1");
    setEntered(true);
    if (to) go(to);
  }, [go]);
  return <RouterContext.Provider value={{ route, go, entered, enter }}>{children}</RouterContext.Provider>;
}
const useRouter = () => useContext(RouterContext);

// ── PRODUCTS CONTEXT ────────────────────────────────────────────
// The live catalog (name, price, image, description, stock, COA) lives in the
// Supabase `products` table and is edited from the Admin dashboard. Optional
// columns name_es / description_es (see SETUP notes) provide Spanish copy and
// fall back to English when empty or when the columns don't exist yet.
const ProductsContext = createContext({ products: [], loading: true, error: false, refresh: () => {} });

function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("products").select("*").eq("active", true).order("name", { ascending: true });
    if (err) {
      setError(true);
    } else {
      setError(false);
      setProducts((data || []).map((p) => ({
        id: p.id,
        name: p.name,
        name_es: p.name_es || null,
        cat: p.category,
        desc: p.description,
        desc_es: p.description_es || null,
        variants: (Array.isArray(p.variants) ? p.variants : [])
          .map((v) => ({ label: String(v.label), price: Number(v.price) }))
          .filter((v) => v.label && Number.isFinite(v.price)),
        image_url: p.image_url,
        stock_quantity: p.stock_quantity,
        low_stock_threshold: p.low_stock_threshold,
        batch_number: p.batch_number,
        coa_url: p.coa_url,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return <ProductsContext.Provider value={{ products, loading, error, refresh }}>{children}</ProductsContext.Provider>;
}
const useProducts = () => useContext(ProductsContext);
const pName = (p, lang) => (lang === "es" && p.name_es ? p.name_es : p.name);
const pDesc = (p, lang) => (lang === "es" && p.desc_es ? p.desc_es : p.desc);

// ── AUTH CONTEXT ────────────────────────────────────────────────
// Tracks the customer's Supabase Auth session plus their `customers` row.
// Guest checkout works without any of this.
const AuthContext = createContext({ session: null, customer: null, loading: true, recovery: false, clearRecovery: () => {}, refreshCustomer: () => {}, signOut: () => {} });
function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);

  async function loadCustomer(userId) {
    if (!userId) { setCustomer(null); return; }
    const { data, error } = await supabase.from("customers").select("*").eq("auth_user_id", userId).maybeSingle();
    if (!error) setCustomer(data);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadCustomer(data.session?.user?.id).then(() => setLoading(false));
    }).catch(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      loadCustomer(sess?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshCustomer = () => loadCustomer(session?.user?.id);
  const signOut = () => supabase.auth.signOut();
  const clearRecovery = () => setRecovery(false);
  return (
    <AuthContext.Provider value={{ session, customer, loading, recovery, clearRecovery, refreshCustomer, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
const useAuth = () => useContext(AuthContext);

// ── CART (persists in localStorage; re-priced against the live catalog) ─
const CART_KEY = "tp_cart_v1";
function loadCart() {
  try {
    const raw = JSON.parse(store.get(CART_KEY, "[]"));
    if (!Array.isArray(raw)) return [];
    return raw.filter((i) => i && typeof i.id === "string" && i.variant && typeof i.variant.label === "string" && Number.isFinite(Number(i.variant.price)) && Number(i.qty) > 0)
      .map((i) => ({ key: i.key || `${i.id}::${i.variant.label}`, id: i.id, name: String(i.name || i.id), variant: { label: i.variant.label, price: Number(i.variant.price) }, qty: Math.min(99, Math.floor(Number(i.qty))) }));
  } catch (_) { return []; }
}

function useCart(products) {
  const [cart, setCart] = useState(loadCart);
  useEffect(() => { store.set(CART_KEY, JSON.stringify(cart)); }, [cart]);

  // Once the live catalog is in, refresh prices/names and drop anything that's gone.
  useEffect(() => {
    if (!products.length) return;
    setCart((c) => {
      let changed = false;
      const next = [];
      for (const i of c) {
        const p = products.find((x) => x.id === i.id);
        const v = p && p.variants.find((x) => x.label === i.variant.label);
        if (!p || !v) { changed = true; continue; }
        if (v.price !== i.variant.price || p.name !== i.name) { changed = true; next.push({ ...i, name: p.name, variant: v }); }
        else next.push(i);
      }
      return changed ? next : c;
    });
  }, [products]);

  const addMany = useCallback((entries) => {
    setCart((c) => {
      let next = c;
      for (const { product, variant, qty = 1 } of entries) {
        const key = `${product.id}::${variant.label}`;
        const ex = next.find((i) => i.key === key);
        next = ex
          ? next.map((i) => (i.key === key ? { ...i, qty: Math.min(99, i.qty + qty) } : i))
          : [...next, { key, id: product.id, name: product.name, variant: { label: variant.label, price: variant.price }, qty }];
      }
      return next;
    });
  }, []);
  const add = useCallback((product, variant) => addMany([{ product, variant, qty: 1 }]), [addMany]);
  const remove = useCallback((key) => setCart((c) => c.filter((i) => i.key !== key)), []);
  const setQty = useCallback((key, qty) =>
    setCart((c) => (qty < 1 ? c.filter((i) => i.key !== key) : c.map((i) => (i.key === key ? { ...i, qty: Math.min(99, qty) } : i)))), []);
  const clear = useCallback(() => setCart([]), []);
  const total = cart.reduce((s, i) => s + i.variant.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return { cart, add, addMany, remove, setQty, clear, total, count };
}

// ── SHARED UI ───────────────────────────────────────────────────
function Btn({ children, onClick, outline, small, block, type = "button", disabled, className = "", style, ...rest }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style} {...rest}
      className={`btn ${outline ? "btn-outline" : "btn-gold"} ${small ? "btn-sm" : ""} ${block ? "btn-block" : ""} ${className}`}>
      {children}
    </button>
  );
}

function SectionHead({ eyebrow, title, sub, align = "center" }) {
  return (
    <div className="reveal" style={{ textAlign: align, marginBottom: 52 }}>
      <div className="eyebrow" style={{ marginBottom: 16 }}>{eyebrow}</div>
      <h1 className="display" style={{ fontSize: "clamp(34px,5.4vw,60px)", marginBottom: sub ? 16 : 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 14, color: DIM, maxWidth: 560, margin: align === "center" ? "0 auto" : 0, lineHeight: 1.9 }}>{sub}</p>}
    </div>
  );
}

function GoldRule({ margin = "44px 0" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin }} aria-hidden="true">
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${BORDER})` }} />
      <div style={{ width: 5, height: 5, transform: "rotate(45deg)", background: GOLD }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${BORDER}, transparent)` }} />
    </div>
  );
}

// Product photo, or a finished-looking placeholder tile when no photo is set
// (or if the photo URL fails to load) — never a broken-image icon.
function ProductMedia({ product, ratio = "4 / 3", eager = false }) {
  const [bad, setBad] = useState(false);
  useEffect(() => { setBad(false); }, [product.image_url]);
  const initial = (product.name || "T").trim().charAt(0).toUpperCase();
  return (
    <div className="media" style={{ aspectRatio: ratio }}>
      {product.image_url && !bad ? (
        <img src={product.image_url} alt={product.name} loading={eager ? "eager" : "lazy"} onError={() => setBad(true)} />
      ) : (
        <div className="ph" aria-hidden="true">
          <div className="ph-ring"><div className="ph-mono">{initial}</div></div>
          <div className="ph-brand">TruPep</div>
        </div>
      )}
    </div>
  );
}

const STACK_ICONS = { weightloss: Scale, recovery: RefreshCw, antiaging: Hourglass, performance: Zap, glow: Sparkles, cognitive: Brain, klow: Flame };
const PILLAR_ICONS = { recovery: RefreshCw, performance: Zap, longevity: Hourglass, aesthetics: Sparkles, metabolism: Scale, cognitive: Brain };
const HOWTO_ICONS = { droplets: Droplets, snowflake: Snowflake, shield: ShieldCheck };

function LangToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="seg" role="group" aria-label={t("nav.language")}>
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">EN</button>
      <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")} lang="es">ES</button>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const toLight = theme === "dark";
  const Icon = toLight ? Sun : Moon;
  return (
    <button type="button" className="theme-btn" onClick={toggle} title={toLight ? t("nav.toLight") : t("nav.toDark")} aria-label={toLight ? t("nav.toLight") : t("nav.toDark")}>
      <Icon size={15} strokeWidth={1.7} />
      <span className="theme-label">{toLight ? t("nav.themeLight") : t("nav.themeDark")}</span>
    </button>
  );
}

function TrustBar() {
  const { t } = useI18n();
  const items = [
    [FlaskConical, t("home.trust.lab")],
    [Award, t("home.trust.grade")],
    [ShieldCheck, t("home.trust.checkout")],
    [Sparkles, t("home.trust.quality")],
    [Truck, t("home.trust.shipping")],
    [MessageCircle, t("home.trust.consult")],
  ];
  return (
    <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "22px 24px", background: `linear-gradient(90deg, ${gl(0.05)}, ${gl(0.12)}, ${gl(0.05)})` }}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px 44px" }}>
        {items.map(([Icon, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon size={17} strokeWidth={1.5} color="var(--gold)" />
            <span style={{ fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NAV ─────────────────────────────────────────────────────────
function Nav({ count, onCart, bumpKey }) {
  const { t } = useI18n();
  const { route, go } = useRouter();
  const { session } = useAuth();
  const mobile = useWidth() < 960;
  const [open, setOpen] = useState(false);
  const [dd, setDd] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef(null);
  const navRef = useRef(null);
  const page = route.page === "product" ? "products" : route.page;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { setOpen(false); setDd(null); }, [route.page, route.param]);
  useEffect(() => {
    const onDoc = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setDd(null); };
    const onKey = (e) => { if (e.key === "Escape") { setDd(null); setOpen(false); } };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const groups = [
    { id: "shop", label: t("nav.shop"), items: [
      ["products", "nav.catalog", "nav.catalogSub", FlaskConical],
      ["stacks", "nav.stacks", "nav.stacksSub", Layers],
      ["calculator", "nav.calculator", "nav.calculatorSub", Calculator],
    ] },
    { id: "learn", label: t("nav.learn"), items: [
      ["howto", "nav.howto", "nav.howtoSub", BookOpen],
      ["faq", "nav.faq", "nav.faqSub", CircleHelp],
      ["labresults", "nav.labresults", "nav.labresultsSub", Microscope],
    ] },
  ];
  const singles = [["about", t("nav.about")], ["contact", t("nav.contact")]];

  const hoverOpen = (id) => { clearTimeout(closeTimer.current); setDd(id); };
  const hoverClose = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setDd(null), 140); };

  return (
    <nav ref={navRef} className={`nav ${scrolled ? "scrolled" : ""}`} aria-label="Main">
      <div className="wrap nav-in" style={{ height: 66, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <button type="button" onClick={() => go("home")} aria-label={`TruPep Wellness — ${t("nav.home")}`} style={{ display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }}>
          <img src={LOGO} alt="" width="38" height="38" style={{ width: 38, height: 38, objectFit: "contain", filter: "drop-shadow(0 0 10px rgba(var(--gold-rgb),.35))" }} />
          <span style={{ textAlign: "left" }}>
            <span style={{ display: "block", fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: GOLD, letterSpacing: "0.14em", lineHeight: 1 }}>TruPep</span>
            <span className="hide-mobile" style={{ display: "block", fontSize: 7.5, letterSpacing: "0.44em", color: DIM2, textTransform: "uppercase", marginTop: 3 }}>Wellness</span>
          </span>
        </button>

        {!mobile && (
          <div style={{ display: "flex", gap: 34, alignItems: "center" }}>
            {groups.map((g) => {
              const isOpen = dd === g.id;
              const active = g.items.some((i) => i[0] === page);
              return (
                <div key={g.id} className={`dd ${isOpen ? "open" : ""}`} onMouseEnter={() => hoverOpen(g.id)} onMouseLeave={hoverClose}>
                  <button type="button" className={`nav-link ${active ? "on" : ""}`} aria-haspopup="true" aria-expanded={isOpen}
                    onClick={() => setDd(isOpen ? null : g.id)}>
                    {g.label}<ChevronDown size={12} strokeWidth={2} />
                  </button>
                  {isOpen && (
                    <div className="dd-panel" role="menu">
                      {g.items.map(([id, label, sub, Icon], i) => (
                        <button type="button" key={id} role="menuitem" className="dd-item" style={{ "--i": i }} onClick={() => { setDd(null); go(id); }}>
                          <span className="ico"><Icon size={16} strokeWidth={1.6} /></span>
                          <span><span className="lbl" style={{ display: "block" }}>{t(label)}</span><span className="sub" style={{ display: "block" }}>{t(sub)}</span></span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {singles.map(([id, label]) => (
              <button type="button" key={id} className={`nav-link ${page === id ? "on" : ""}`} onClick={() => go(id)}>{label}</button>
            ))}
          </div>
        )}

        <div className="nav-ctl" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LangToggle />
          <ThemeToggle />
          <button type="button" className="icon-btn hide-xs" onClick={() => go("account")} title={session ? t("nav.account") : t("nav.login")} aria-label={session ? t("nav.account") : t("nav.login")}
            style={page === "account" ? { borderColor: "var(--gold)" } : undefined}>
            <User size={16} strokeWidth={1.6} />
            {session && <span aria-label={t("nav.loggedIn")} style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: OK, border: `2px solid var(--bg)` }} />}
          </button>
          <button type="button" className="icon-btn" onClick={onCart} aria-label={`${t("nav.cart")}${count ? ` (${count})` : ""}`}>
            <ShoppingBag size={16} strokeWidth={1.6} />
            {count > 0 && (
              <span key={bumpKey} className="bump" style={{ position: "absolute", top: -4, right: -4, background: `linear-gradient(135deg,var(--gold-fill),var(--gold-fill2))`, color: INK, fontSize: 9, fontWeight: 700, borderRadius: 999, minWidth: 17, height: 17, padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>
            )}
          </button>
          {mobile && (
            <button type="button" className="icon-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? t("nav.closeMenu") : t("nav.menu")}>
              {open ? <X size={17} strokeWidth={1.7} /> : <Menu size={17} strokeWidth={1.7} />}
            </button>
          )}
        </div>
      </div>

      {mobile && open && (
        <div className="mmenu">
          {groups.map((g, gi) => (
            <div key={g.id}>
              <div className="mm-head">{g.label}</div>
              {g.items.map(([id, label, , Icon], i) => (
                <button type="button" key={id} className={`mm-link ${page === id ? "on" : ""}`} style={{ "--i": gi * 3 + i }} onClick={() => go(id)}>
                  <Icon size={17} strokeWidth={1.5} />{t(label)}
                </button>
              ))}
            </div>
          ))}
          <div className="mm-head">TruPep</div>
          {[...singles, ["account", session ? t("nav.account") : t("nav.login")]].map(([id, label], i) => (
            <button type="button" key={id} className={`mm-link ${page === id ? "on" : ""}`} style={{ "--i": 6 + i }} onClick={() => go(id)}>
              <ChevronRight size={17} strokeWidth={1.5} />{label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ── FOOTER ──────────────────────────────────────────────────────
function Footer() {
  const { t } = useI18n();
  const { go } = useRouter();
  const col = (title, links) => (
    <div>
      <div className="eyebrow" style={{ marginBottom: 18, fontSize: 9.5 }}>{title}</div>
      {links.map(([label, id]) => (
        <button type="button" key={id} onClick={() => go(id)} style={{ display: "block", padding: "6px 0", color: DIM, fontSize: 12.5, letterSpacing: "0.03em", transition: "color .2s ease", textAlign: "left" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")} onMouseLeave={(e) => (e.currentTarget.style.color = DIM)}>{label}</button>
      ))}
    </div>
  );
  return (
    <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "60px 24px 30px", marginTop: 30, background: "var(--bg2)" }}>
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 44, marginBottom: 46 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
              <img src={LOGO} alt="" width="36" height="36" style={{ width: 36, height: 36, objectFit: "contain" }} />
              <div style={{ fontFamily: SERIF, fontSize: 20, color: GOLD, letterSpacing: "0.12em" }}>TruPep Wellness</div>
            </div>
            <div style={{ fontSize: 12, color: DIM, lineHeight: 1.9, maxWidth: 260 }}>{t("footer.tagline")}</div>
          </div>
          {col(t("footer.navigate"), [[t("nav.catalog"), "products"], [t("nav.stacks"), "stacks"], [t("nav.calculator"), "calculator"], [t("nav.howto"), "howto"], [t("nav.labresults"), "labresults"], [t("nav.about"), "about"]])}
          {col(t("footer.support"), [[t("nav.faq"), "faq"], [t("nav.shipping"), "shipping"], [t("nav.returns"), "returns"], [t("nav.contact"), "contact"]])}
          {col(t("footer.legal"), [[t("footer.terms"), "terms"], [t("footer.privacy"), "privacy"], [t("footer.disclaimerLink"), "disclaimer"]])}
          <div>
            <div className="eyebrow" style={{ marginBottom: 18, fontSize: 9.5 }}>{t("footer.contact")}</div>
            <div style={{ fontSize: 12.5, color: DIM, lineHeight: 2.3 }}>
              <div><a href={`mailto:${CONTACT_EMAIL}`} className="hover-gold" style={{ transition: "color .2s" }}>{CONTACT_EMAIL}</a></div>
              <div><a href={`tel:${CONTACT_PHONE.replace(/\D/g, "")}`} className="hover-gold">{CONTACT_PHONE}</a></div>
              <div>{t("contact.miami")}</div>
            </div>
          </div>
        </div>
        <GoldRule margin="0 0 26px" />
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontSize: 11, color: DIM2, lineHeight: 1.85, maxWidth: 720 }}>{t("footer.disclaimer")}</p>
          <div style={{ fontSize: 11, color: DIM2 }}>{t("footer.copyright", { year: new Date().getFullYear() })}</div>
        </div>
      </div>
    </footer>
  );
}

const catLabel = (t, c) => { const v = t(`products.cat.${c}`); return v.startsWith("products.cat.") ? c : v; };
const topicForCategory = (c) => ({
  "Weight Management": "Weight Management", Recovery: "Recovery & Healing", "Anti-Aging": "Anti-Aging & Longevity",
  Performance: "Performance", Aesthetics: "Aesthetics", Cognitive: "Cognitive Support",
}[c] || "General Inquiry");

// ── INTRO (entry screen: 18+ notice, log in / guest) ────────────
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {particles.map((i) => {
        const left = `${4 + ((i * 71) % 92)}%`;
        const delay = `${(i * 1.3) % 10}s`;
        const dur = `${20 + ((i * 1.7) % 16)}s`;
        const size = 3 + (i % 3);
        const dx = `${-40 + ((i * 41) % 80)}px`;
        return (
          <div key={i} style={{
            position: "absolute", bottom: "-12px", left, width: size, height: size, borderRadius: "50%",
            background: i % 2 ? "var(--gold-fill2)" : "var(--gold-fill)", "--dx": dx,
            animation: `particle ${dur} ${delay} ease-in infinite`,
            boxShadow: `0 0 ${size * 3}px rgba(var(--gold-rgb),.6)`, opacity: 0.9,
          }} />
        );
      })}
    </div>
  );
}

function FloatingHeroLogo() {
  return (
    <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto 22px", animation: "floatY 4.2s ease-in-out infinite" }}>
      <div className="logo-ring-ccw" style={{
        position: "absolute", top: "50%", left: "50%", width: "114%", height: "114%", borderRadius: "50%", pointerEvents: "none",
        background: "conic-gradient(transparent 0deg, rgba(var(--gold-rgb),.95) 2deg, rgba(255,247,190,1) 4deg, rgba(var(--gold-rgb),.95) 6deg, transparent 9deg, transparent 360deg)",
        maskImage: "radial-gradient(transparent 47%, black 49%, black 51%, transparent 53%)",
        WebkitMaskImage: "radial-gradient(transparent 47%, black 49%, black 51%, transparent 53%)", filter: "blur(.6px)",
      }} />
      <div style={{ position: "absolute", inset: -46, borderRadius: "50%", background: "radial-gradient(circle, rgba(var(--gold-rgb),.26) 0%, rgba(var(--gold-rgb),.07) 48%, transparent 68%)", filter: "blur(20px)", pointerEvents: "none" }} />
      <img src={LOGO2} alt="TruPep Wellness" width="200" height="200" style={{ position: "relative", width: 200, height: 200, objectFit: "contain", display: "block", filter: "var(--logo-filter)" }} />
    </div>
  );
}

function IntroPage() {
  const { t } = useI18n();
  const { enter } = useRouter();
  const { session, customer, loading } = useAuth();
  return (
    <div className="page-enter" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "84px 20px 50px", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: 14, right: 14, zIndex: 20, display: "flex", gap: 8, alignItems: "center" }}>
        <LangToggle />
        <ThemeToggle />
      </div>
      <FloatingParticles />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, var(--hero-glow) 0%, transparent 62%)", animation: "heroBreathe 7s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 430, width: "100%" }}>
        <FloatingHeroLogo />
        <h1 className="display" style={{ fontSize: 36, marginBottom: 8 }}>TruPep Wellness</h1>
        <div style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: DIM2, marginBottom: 26 }}>{t("intro.tagline")}</div>
        <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.9, marginBottom: 26 }}><Rich text={t("intro.notice")} /></p>
        {loading ? (
          <div style={{ color: DIM2, fontSize: 12 }}>{t("common.loading")}</div>
        ) : session ? (
          <>
            <div style={{ fontSize: 14, color: DIM, marginBottom: 20 }}>
              {customer?.name ? t("intro.welcomeBackNamed", { name: customer.name.split(" ")[0] }) : t("intro.welcomeBack")}
            </div>
            <Btn onClick={() => enter()}>{t("intro.enter")}</Btn>
          </>
        ) : (
          <AccountAuthForm compact onAuthed={() => enter()} onGuest={() => enter()} />
        )}
      </div>
    </div>
  );
}

// ── HOME ────────────────────────────────────────────────────────
function HomePage({ onAdd }) {
  const { t } = useI18n();
  const { go } = useRouter();
  const { products } = useProducts();
  useReveal(products.length);
  const featuredIds = ["retatrutide", "bpc157", "nad", "tb500"];
  let featured = products.filter((p) => featuredIds.includes(p.id));
  if (!featured.length) featured = products.slice(0, 4);
  const n = products.length;
  const stats = [
    [n ? `${n}+` : "—", t("home.stats.compounds")],
    [String(STACKS.length), t("home.stats.stacks")],
    [t("home.stats.miami"), t("home.stats.based")],
    [t("home.stats.free"), t("home.stats.consultation")],
  ];
  return (
    <>
      <section style={{ position: "relative", overflow: "hidden", padding: "150px 24px 96px", textAlign: "center" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 38%, var(--hero-glow) 0%, transparent 64%)", animation: "heroBreathe 7s ease-in-out infinite", pointerEvents: "none" }} />
        <img aria-hidden="true" alt="" src={LOGO2} style={{ position: "absolute", top: "50%", left: "50%", width: "min(620px,92vw)", transform: "translate(-50%,-52%)", opacity: 0.07, pointerEvents: "none", filter: "saturate(.8)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 26, animation: "fadeUp .7s ease both" }}>{t("home.eyebrow")}</div>
          <h1 className="display" style={{ fontSize: "clamp(46px,8vw,104px)", marginBottom: 26, animation: "fadeUp .8s .08s ease both" }}>
            {t("home.h1a")}<br /><span style={{ color: GOLD }}>{t("home.h1b")}</span>
          </h1>
          <p style={{ fontSize: 15, color: DIM, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.9, animation: "fadeUp .8s .18s ease both" }}>
            {t("home.sub", { n: n || "25", s: STACKS.length })}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp .8s .28s ease both" }}>
            <Btn onClick={() => go("products")}>{t("home.ctaShop")}<ArrowRight size={14} /></Btn>
            <Btn outline onClick={() => go("stacks")}>{t("home.ctaStacks")}</Btn>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="reveal" style={{ padding: "56px 24px 8px" }}>
        <div className="wrap" style={{ maxWidth: 940, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", textAlign: "center" }}>
          {stats.map(([num, label], i) => (
            <div key={label} style={{ padding: "18px 12px", borderLeft: i ? `1px solid ${BORDER}` : "none" }}>
              <div className="display" style={{ fontSize: 40, color: GOLD, marginBottom: 6 }}>{num}</div>
              <div style={{ fontSize: 10.5, letterSpacing: "0.2em", color: DIM2, textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "56px 24px 40px" }}>
        <div className="wrap">
          <SectionHead eyebrow={t("home.featured")} title={t("home.featuredTitle")} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 24 }}>
            {featured.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
          </div>
          <div className="reveal" style={{ textAlign: "center", marginTop: 44 }}>
            <Btn outline onClick={() => go("products")}>{n ? t("home.viewAll", { n }) : t("home.viewAllGeneric")}</Btn>
          </div>
        </div>
      </section>

      <section style={{ padding: "76px 24px 84px", background: "var(--bg2)", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="wrap">
          <SectionHead eyebrow={t("home.testimonialsEyebrow")} title={t("home.testimonialsTitle")} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 22 }}>
            {TESTIMONIALS.map((q, i) => (
              <figure key={i} className="card reveal" style={{ padding: 28, margin: 0 }}>
                <div style={{ color: GOLD, marginBottom: 12, fontSize: 15, letterSpacing: 3 }} aria-label={`${q.stars} / 5`}>{"★".repeat(q.stars)}</div>
                <blockquote style={{ fontSize: 13.5, color: DIM, lineHeight: 1.9, marginBottom: 16 }}>“{q.text}”</blockquote>
                <figcaption style={{ fontSize: 11, letterSpacing: "0.18em", color: DIM2 }}>— {q.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal" style={{ padding: "88px 24px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 className="display" style={{ fontSize: "clamp(30px,4.6vw,52px)", marginBottom: 18 }}>
            {t("home.ctaTitleA")}{" "}<span style={{ color: GOLD }}>{t("home.ctaTitleB")}</span>
          </h2>
          <p style={{ fontSize: 14.5, color: DIM, lineHeight: 1.9, marginBottom: 34 }}>{t("home.ctaText")}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => go("calculator")}>{t("home.ctaCalc")}</Btn>
            <Btn outline onClick={() => go("contact", { query: { topic: "General Inquiry" } })}>{t("home.ctaConsult")}</Btn>
          </div>
        </div>
      </section>
    </>
  );
}

// ── PRODUCT CARD ────────────────────────────────────────────────
function ProductCard({ product, onAdd }) {
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const [sel, setSel] = useState(0);
  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const v = product.variants[Math.min(sel, product.variants.length - 1)];
  if (!v) return null;
  const name = pName(product, lang);
  const open = () => go("product", { param: product.id });
  const low = Number.isFinite(product.stock_quantity) && product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 0);
  const handleAdd = () => {
    onAdd(product, v);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };
  return (
    <article className="card card-hover" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <button type="button" onClick={open} aria-label={`${t("common.viewDetails")}: ${name}`} style={{ display: "block", padding: 14, paddingBottom: 0, textAlign: "left" }}>
        <ProductMedia product={product} />
      </button>
      <div style={{ padding: "18px 22px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span>{catLabel(t, product.cat)}</span>
          {low && <span className="badge" style={{ padding: "2px 8px", color: "var(--warn)", border: "1px solid var(--warn)" }}>{t("card.lowStock")}</span>}
        </div>
        <h3 style={{ margin: 0 }}>
          <button type="button" onClick={open} className="display" style={{ fontSize: 25, textAlign: "left", fontWeight: 400, lineHeight: 1.15 }}>{name}</button>
        </h3>
        <p className="clamp3" style={{ fontSize: 12.5, color: DIM, lineHeight: 1.8, margin: "10px 0 16px", flex: 1 }}>{pDesc(product, lang)}</p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, minHeight: 32 }}>
          {product.variants.map((vv, i) => (
            <button type="button" key={vv.label} onClick={() => setSel(i)} className={`pill ${i === sel ? "on" : ""}`} aria-pressed={i === sel}
              style={product.variants.length === 1 ? { cursor: "default" } : undefined}>{vv.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span className="display" style={{ fontSize: 30, color: GOLD }}>{fmt(v.price)}</span>
          <Btn small outline={!added} onClick={handleAdd}>
            {added ? <><Check size={13} />{t("common.added")}</> : <><Plus size={13} />{t("common.addToCart")}</>}
          </Btn>
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 11 }}>
          <button type="button" onClick={open} style={{ color: GOLD, fontWeight: 600, letterSpacing: "0.04em", display: "inline-flex", alignItems: "center", gap: 4 }}>
            {t("common.viewDetails")}<ArrowRight size={12} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ── PRODUCTS (catalog) ──────────────────────────────────────────
function ProductsPage({ onAdd }) {
  const { t, lang } = useI18n();
  const { route, go } = useRouter();
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState(CATEGORIES.includes(route.query.cat) ? route.query.cat : "All");
  const [sort, setSort] = useState("name");
  useReveal(products.length);
  useEffect(() => { const id = setTimeout(() => { const r = search.trim(); if (r.length >= 3) track("search", r, { results: products.filter((p) => `${p.name} ${p.name_es || ""}`.toLowerCase().includes(r.toLowerCase())).length }); }, 1500); return () => clearTimeout(id); }, [search, products]);

  const stack = STACKS.find((s) => s.id === route.query.stack) || null;
  const stackIds = stack ? new Set(stack.items.map((i) => i.id)) : null;
  const stackNames = stack ? new Set(stack.items.map((i) => i.name)) : null;

  let list = products.filter((p) =>
    (!stack || stackIds.has(p.id) || stackNames.has(p.name)) &&
    (cat === "All" || p.cat === cat) &&
    `${p.name} ${p.name_es || ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  list = [...list].sort((a, b) =>
    sort === "low" ? minPrice(a) - minPrice(b) : sort === "high" ? minPrice(b) - minPrice(a) : a.name.localeCompare(b.name));

  return (
    <div className="page">
      <div className="wrap">
        <SectionHead eyebrow={t("products.eyebrow")} title={t("products.title")} sub={t("products.sub")} />

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
            <Search size={15} strokeWidth={1.6} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: DIM3, pointerEvents: "none" }} />
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("products.search")} aria-label={t("products.search")}
              style={{ borderRadius: 999, paddingLeft: 42 }} />
          </div>
        </div>

        <div role="group" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 30 }}>
          {["All", ...CATEGORIES].map((c) => (
            <button type="button" key={c} onClick={() => { setCat(c); if (c !== "All") track("filter", c); }} className={`chip ${c === cat ? "on" : ""}`} aria-pressed={c === cat}>{catLabel(t, c)}</button>
          ))}
        </div>

        {stack && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 22, padding: "12px 18px", border: `1px solid ${BORDER}`, borderRadius: 6, background: GLASS }}>
            <span style={{ fontSize: 12.5, color: DIM }}>{t("products.stackFilter", { name: stack.name[lang] })}</span>
            <button type="button" className="link" style={{ fontSize: 12 }} onClick={() => go("products")}>{t("products.clearFilter")}</button>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 22 }} aria-live="polite">
            <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: DIM2 }}>
              {list.length === 1 ? t("products.countOne") : t("products.count", { n: list.length })}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: DIM2, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {t("products.sort")}
              <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: "auto", padding: "8px 12px", fontSize: 12, textTransform: "none", letterSpacing: 0 }}>
                <option value="name">{t("products.sortName")}</option>
                <option value="low">{t("products.sortLow")}</option>
                <option value="high">{t("products.sortHigh")}</option>
              </select>
            </label>
          </div>
        )}

        {loading && <div style={{ textAlign: "center", padding: 70, color: DIM2, fontSize: 13 }}>{t("products.loading")}</div>}
        {!loading && error && <div style={{ textAlign: "center", padding: "50px 20px", color: DIM, fontSize: 14, lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>{t("products.loadError")}</div>}
        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
            {list.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
          </div>
        )}
        {!loading && !error && list.length === 0 && <div style={{ textAlign: "center", padding: 70, color: DIM2, fontSize: 13 }}>{t("products.none")}</div>}
      </div>
    </div>
  );
}

// ── SHARE (real product URL; native share sheet if available, else copy) ──
function ShareButton({ product, name }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/${hashFor("product", product.id)}`;
    track("share", product.id);
    try {
      if (navigator.share) { await navigator.share({ title: `${name} | TruPep Wellness`, url }); return; }
    } catch (_) { return; }
    try { await navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 1800); } catch (_) {}
  };
  return (
    <Btn outline onClick={share} aria-label={t("detail.share")}>
      {done ? <><Check size={14} />{t("detail.linkCopied")}</> : <><Send size={14} />{t("detail.share")}</>}
    </Btn>
  );
}

// ── PRODUCT DETAIL ──────────────────────────────────────────────
function ProductDetailPage({ onAdd }) {
  const { t, lang } = useI18n();
  const { route, go } = useRouter();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === route.param);
  const [sel, setSel] = useState(0);
  const [added, setAdded] = useState(false);
  useEffect(() => { setSel(0); setAdded(false); }, [route.param]);
  const viewed = product ? product.id : null;
  useEffect(() => { if (viewed) track("item_view", viewed); }, [viewed]);

  if (loading) return <div className="page"><div className="wrap" style={{ textAlign: "center", padding: 80, color: DIM2 }}>{t("common.loading")}</div></div>;
  if (!product || !product.variants.length) {
    return (
      <div className="page"><div className="wrap-sm" style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ fontSize: 15, color: DIM, lineHeight: 1.9, marginBottom: 26 }}>{t("detail.notFound")}</p>
        <Btn onClick={() => go("products")}>{t("detail.browse")}</Btn>
      </div></div>
    );
  }
  const v = product.variants[Math.min(sel, product.variants.length - 1)];
  const name = pName(product, lang);
  const inStacks = STACKS.filter((s) => s.items.some((i) => i.id === product.id));
  const handleAdd = () => { onAdd(product, v); setAdded(true); setTimeout(() => setAdded(false), 1800); };
  return (
    <div className="page">
      <div className="wrap">
        <button type="button" onClick={() => go("products")} className="link" style={{ fontSize: 12, textDecoration: "none", marginBottom: 28, display: "inline-flex", alignItems: "center", gap: 6 }}>{t("detail.back")}</button>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(28px,5vw,64px)", alignItems: "start" }}>
          <div style={{ position: "sticky", top: 96 }}>
            <div className="card" style={{ padding: 14 }}><ProductMedia product={product} ratio="1 / 1" eager /></div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>{catLabel(t, product.cat)}</div>
            <h1 className="display" style={{ fontSize: "clamp(38px,5vw,60px)", marginBottom: 20 }}>{name}</h1>
            <p style={{ fontSize: 14.5, color: DIM, lineHeight: 1.95, marginBottom: 28 }}>{pDesc(product, lang)}</p>

            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 12 }}>{t("detail.sizes")}</div>
            <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
              {product.variants.map((vv, i) => (
                <button type="button" key={vv.label} onClick={() => setSel(i)} aria-pressed={i === sel}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", border: `1px solid ${i === sel ? "var(--gold)" : "var(--border)"}`, borderRadius: 5, background: i === sel ? gl(0.1) : GLASS, transition: "all .2s ease", textAlign: "left" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: i === sel ? GOLD : FG, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${i === sel ? "var(--gold)" : "var(--border)"}`, background: i === sel ? "var(--gold-fill)" : "transparent", display: "inline-block" }} />
                    {vv.label}
                  </span>
                  <span className="display" style={{ fontSize: 24, color: GOLD }}>{fmt(vv.price)}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 32 }}>
              <Btn onClick={handleAdd} style={{ minWidth: 200 }}>{added ? <><Check size={14} />{t("common.added")}</> : <><ShoppingBag size={14} />{t("common.addToCart")} · {fmt(v.price)}</>}</Btn>
              <ShareButton product={product} name={name} />
              {Number.isFinite(product.stock_quantity) && product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 0) && (
                <span className="badge" style={{ color: "var(--warn)", border: "1px solid var(--warn)" }}>{t("card.lowStock")}</span>
              )}
            </div>

            {inStacks.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 10 }}>{t("detail.inStacks")}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {inStacks.map((s) => <button type="button" key={s.id} className="chip" onClick={() => go("stacks")}>{s.name[lang]}</button>)}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "16px 0", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, marginBottom: 18 }}>
              <span style={{ fontSize: 13, color: DIM }}>{t("detail.askTitle")}</span>
              <Btn small outline onClick={() => go("contact", { query: { topic: topicForCategory(product.cat) } })}>{t("detail.askBtn")}</Btn>
            </div>
            <p style={{ fontSize: 11, color: DIM3, lineHeight: 1.85, display: "flex", gap: 8 }}><Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />{t("detail.researchNote")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STACKS ──────────────────────────────────────────────────────
function StacksPage({ onAddMany }) {
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { products } = useProducts();
  useReveal(products.length);
  const [active, setActive] = useState(null);
  const [notice, setNotice] = useState({});

  const findProduct = (item) => products.find((p) => p.id === item.id) || products.find((p) => p.name === item.name);

  const buyAll = (s) => {
    const entries = [];
    const skipped = [];
    for (const item of s.items) {
      const p = findProduct(item);
      const v = p && startingVariant(p);
      if (p && v) entries.push({ product: p, variant: v, qty: 1 }); else skipped.push(item.name);
    }
    if (entries.length) { onAddMany(entries); track("stack_buy_all", s.id); }
    setNotice((n) => ({ ...n, [s.id]: { ok: entries.length > 0, skipped } }));
  };

  return (
    <div className="page">
      <div className="wrap" style={{ maxWidth: 1160 }}>
        <SectionHead eyebrow={t("stacks.eyebrow")} title={t("stacks.title")} sub={t("stacks.sub")} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 24, marginBottom: 60, alignItems: "start" }}>
          {STACKS.map((s) => {
            const isOpen = active === s.id;
            const Icon = STACK_ICONS[s.id] || Layers;
            const matched = s.items.map((item) => ({ item, p: findProduct(item) }));
            const total = matched.reduce((sum, { p }) => { const v = p && startingVariant(p); return sum + (v ? v.price : 0); }, 0);
            const msg = notice[s.id];
            return (
              <div key={s.id} className={`card ${isOpen ? "" : "card-hover"}`} style={{ borderColor: isOpen ? "var(--gold)" : undefined, boxShadow: isOpen ? "var(--card-shadow-hover)" : undefined }}>
                <button type="button" onClick={() => setActive(isOpen ? null : s.id)} aria-expanded={isOpen} style={{ display: "block", width: "100%", textAlign: "left", padding: "28px 28px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <span style={{ width: 50, height: 50, borderRadius: "50%", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, background: gl(0.07) }}><Icon size={22} strokeWidth={1.4} /></span>
                    <span aria-label={isOpen ? t("stacks.collapse") : t("stacks.expand")} style={{ color: isOpen ? GOLD : DIM2, transition: "transform .4s ease, color .2s ease", transform: isOpen ? "rotate(45deg)" : "none", display: "flex" }}><Plus size={22} strokeWidth={1.3} /></span>
                  </div>
                  <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>{s.tagline[lang]}</div>
                  <div className="display" style={{ fontSize: 28, marginBottom: 12, fontWeight: 400 }}>{s.name[lang]}</div>
                  <p style={{ fontSize: 13, color: DIM, lineHeight: 1.85 }}>{s.desc[lang]}</p>
                </button>

                <div className={`acc ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
                  <div>
                    <div style={{ borderTop: `1px solid ${BORDER}`, padding: "22px 28px 28px" }}>
                      <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 16 }}>{t("stacks.compounds")}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px", marginBottom: 24 }}>
                        {matched.map(({ item, p }) => (
                          <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                            <span style={{ width: 5, height: 5, background: GOLD, transform: "rotate(45deg)", flexShrink: 0, marginTop: 7 }} />
                            <div>
                              <div style={{ fontSize: 12.5, lineHeight: 1.5, color: FG }}>{p ? pName(p, lang) : item.name}</div>
                              {p && <div style={{ fontSize: 10.5, color: GOLD, marginTop: 2, lineHeight: 1.5 }}>{p.variants.map((v) => `${v.label} — ${fmt(v.price).replace(/\.00$/, "")}`).join(" · ")}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gap: 10 }}>
                        <Btn block onClick={() => buyAll(s)} disabled={!total}>{total ? t("stacks.buyAll", { total: fmt(total) }) : t("common.loading")}</Btn>
                        <Btn block outline onClick={() => go("products", { query: { stack: s.id } })}>{t("stacks.shopThese")}</Btn>
                      </div>
                      <p style={{ fontSize: 10.5, color: DIM3, lineHeight: 1.7, marginTop: 12 }}>{t("stacks.buyAllNote")}</p>
                      {msg && msg.ok && <p role="status" style={{ fontSize: 12, color: OK, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><Check size={14} />{t("stacks.added")}</p>}
                      {msg && msg.skipped.length > 0 && <p role="status" style={{ fontSize: 11, color: "var(--warn)", marginTop: 6, lineHeight: 1.6 }}>{t("stacks.skipped", { names: msg.skipped.join(", ") })}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="reveal panel" style={{ textAlign: "center", padding: "52px 32px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%, var(--hero-glow), transparent 62%)", pointerEvents: "none" }} />
          <h2 className="display" style={{ fontSize: "clamp(26px,3.4vw,38px)", marginBottom: 12, position: "relative" }}>{t("stacks.customTitle")}</h2>
          <p style={{ fontSize: 13.5, color: DIM, marginBottom: 28, lineHeight: 1.9, maxWidth: 460, margin: "0 auto 28px", position: "relative" }}>{t("stacks.customText")}</p>
          <Btn onClick={() => go("contact", { query: { topic: "General Inquiry" } })} style={{ position: "relative" }}>{t("stacks.consult")}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── CALCULATOR ──────────────────────────────────────────────────
function SyringeViz({ units }) {
  const { t } = useI18n();
  const clamped = Math.min(Math.max(units, 0), 100);
  const fillPct = clamped / 100;
  const barrelTop = 96, barrelBot = 340, barrelH = barrelBot - barrelTop;
  const fillY = barrelTop + fillPct * barrelH;
  const cx = 70; // wide enough that tick labels never clip
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const stop = (o, c, op = 1) => <stop offset={o} style={{ stopColor: c, stopOpacity: op }} />;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
      <svg width="150" height="420" viewBox="0 0 150 420" role="img" aria-label={`${clamped.toFixed(1)} ${t("calc.unitsLabel")}`} style={{ overflow: "visible", maxWidth: "100%" }}>
        <defs>
          <linearGradient id="sv-ndl" x1="0" y1="0" x2="1" y2="0">{stop("0%", "#7a5c1e", 0.9)}{stop("22%", "#c9a84c")}{stop("42%", "#fff8d0")}{stop("58%", "#e8c84a")}{stop("100%", "#7a5c1e", 0.8)}</linearGradient>
          <linearGradient id="sv-hub" x1="0" y1="0" x2="1" y2="0">{stop("0%", "#c9a84c", 0.5)}{stop("40%", "#f0c84a", 0.9)}{stop("100%", "#967828", 0.5)}</linearGradient>
          <linearGradient id="sv-fld" x1="0" y1="0" x2="1" y2="0">{stop("0%", "#b48c1e", 0.8)}{stop("35%", "#f0c84a", 0.95)}{stop("55%", "#fff08c")}{stop("100%", "#b48c1e", 0.8)}</linearGradient>
          <linearGradient id="sv-plg" x1="0" y1="0" x2="1" y2="0">{stop("0%", "#c9a84c", 0.6)}{stop("50%", "#f0c84a", 0.85)}{stop("100%", "#a07d23", 0.6)}</linearGradient>
        </defs>
        <polygon points={`${cx - 0.3},48 ${cx + 0.3},48 ${cx + 1.2},76 ${cx - 1.2},76`} fill="url(#sv-ndl)" />
        <rect x={cx - 9} y="76" width="18" height="18" rx="3" fill="url(#sv-hub)" stroke="var(--gold)" strokeWidth="1.1" />
        <rect x={cx - 20} y={barrelTop} width="40" height={barrelH} rx="5" fill="rgba(var(--gold-rgb),.06)" stroke="var(--gold)" strokeWidth="1.5" />
        {fillPct > 0 && <rect x={cx - 18.5} y={barrelTop} width="37" height={fillY - barrelTop} fill="url(#sv-fld)" opacity="0.9" />}
        {ticks.map((u) => {
          const y = barrelTop + (u / 100) * barrelH;
          const major = u % 20 === 0;
          return (
            <g key={u}>
              <line x1={cx + 20} y1={y} x2={cx + (major ? 30 : 25)} y2={y} stroke="var(--gold)" strokeOpacity={major ? 0.9 : 0.55} strokeWidth={major ? 1.3 : 0.9} />
              <text x={cx + 34} y={y + 3.5} fontSize={major ? 9.5 : 8} style={{ fill: "var(--fg)", opacity: major ? 0.85 : 0.55 }} fontFamily="Montserrat,sans-serif">{u}</text>
            </g>
          );
        })}
        {fillPct > 0 && (
          <>
            <line x1={cx - 24} y1={fillY} x2={cx + 20} y2={fillY} stroke="var(--gold)" strokeWidth="2" strokeDasharray="4,2" />
            <polygon points={`${cx - 24},${fillY - 4} ${cx - 24},${fillY + 4} ${cx - 31},${fillY}`} fill="var(--gold)" />
          </>
        )}
        <rect x={cx - 19} y={fillY} width="38" height="14" rx="4" fill="url(#sv-plg)" stroke="var(--gold)" strokeWidth="1.2" />
        {fillY + 14 < barrelBot && <rect x={cx - 7} y={fillY + 14} width="14" height={Math.max(0, barrelBot - fillY - 14)} rx="2" fill="rgba(var(--gold-rgb),.18)" stroke="var(--gold)" strokeWidth="1" />}
        <rect x={cx - 26} y={barrelBot} width="52" height="14" rx="5" fill="rgba(var(--gold-rgb),.28)" stroke="var(--gold)" strokeWidth="1.5" />
        <rect x={cx - 16} y={barrelBot + 14} width="32" height="20" rx="3" fill="rgba(var(--gold-rgb),.18)" stroke="var(--gold)" strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="display" style={{ fontSize: 56, color: GOLD, lineHeight: 1 }}>{clamped > 0 ? clamped.toFixed(1) : "—"}</div>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: DIM, textTransform: "uppercase" }}>{t("calc.unitsLabel")}</div>
        {units > 100 && <div role="alert" style={{ fontSize: 11, color: ERR, marginTop: 6, maxWidth: 160, lineHeight: 1.5 }}>{t("calc.exceeds")}</div>}
      </div>
    </div>
  );
}

const DOSES = ["0.1", "0.25", "0.5", "1", "2.5", "5", "7.5", "10", "12.5", "15", "other"];
const STRENGTHS = ["5", "10", "15", "20", "30", "50", "100", "500", "1000", "other"];
const WATERS = ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "5.0", "other"];

function CalcChoice({ options, selected, onSelect, suffix, otherLabel, otherValue, onOther, placeholder, label }) {
  return (
    <>
      <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((v) => (
          <button type="button" key={v} onClick={() => onSelect(v)} aria-pressed={selected === v} className={`pill ${selected === v ? "on" : ""}`} style={{ padding: "9px 16px", fontSize: 13 }}>
            {v === "other" ? otherLabel : `${v}${suffix}`}
          </button>
        ))}
      </div>
      {selected === "other" && (
        <input className="input" type="number" inputMode="decimal" min="0" step="any" value={otherValue} onChange={(e) => onOther(e.target.value)} placeholder={placeholder} aria-label={`${label} (${otherLabel})`} style={{ marginTop: 10, width: 150 }} />
      )}
    </>
  );
}

function CalculatorPage() {
  const { t } = useI18n();
  const [doseBtn, setDoseBtn] = useState(null);
  const [doseOther, setDoseOther] = useState("");
  const [strBtn, setStrBtn] = useState(null);
  const [strOther, setStrOther] = useState("");
  const [watBtn, setWatBtn] = useState(null);
  const [watOther, setWatOther] = useState("");
  const [result, setResult] = useState(null);

  // Changing ANY input clears the previous result, so the syringe/units
  // shown can never disagree with the selections on screen.
  const wrap = (setter) => (v) => { setter(v); setResult(null); };

  const dose = doseBtn === "other" ? parseFloat(doseOther) : parseFloat(doseBtn);
  const str = strBtn === "other" ? parseFloat(strOther) : parseFloat(strBtn);
  const wat = watBtn === "other" ? parseFloat(watOther) : parseFloat(watBtn);
  const ready = [dose, str, wat].every((n) => Number.isFinite(n) && n > 0);

  const calculate = () => {
    if (!ready) return;
    track("calculator_used");
    const conc = str / wat;
    const vol = dose / conc;
    setResult({ conc: conc.toFixed(2), vol: vol.toFixed(3), units: parseFloat((vol * 100).toFixed(1)), doses: Math.floor(str / dose) });
  };

  const step = (num, title, sub, hint, children) => (
    <div style={{ marginBottom: 34, paddingBottom: 34, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <span className="step-dot">{num}</span>
        <h2 className="display" style={{ fontSize: 22 }}>{title}</h2>
      </div>
      <div style={{ fontSize: 12, color: DIM2, marginBottom: 16, marginLeft: 38 }}>{sub}</div>
      <div style={{ marginLeft: 38 }}>
        {children}
        {hint && <div style={{ marginTop: 14, fontSize: 11, color: DIM3, lineHeight: 1.8 }}>{hint}</div>}
      </div>
    </div>
  );
  const other = t("calc.other");

  return (
    <div className="page">
      <div className="wrap-sm" style={{ maxWidth: 720 }}>
        <SectionHead eyebrow={t("calc.eyebrow")} title={t("calc.title")} sub={t("calc.sub")} />
        <div className="panel" style={{ padding: "36px clamp(18px,4vw,30px)" }}>
          {step(1, t("calc.s1"), t("calc.s1sub"), null,
            <CalcChoice label={t("calc.s1")} options={DOSES} selected={doseBtn} onSelect={wrap(setDoseBtn)} suffix=" mg" otherLabel={other} otherValue={doseOther} onOther={wrap(setDoseOther)} placeholder={t("calc.phDose")} />)}
          {step(2, t("calc.s2"), t("calc.s2sub"), t("calc.s2hint"),
            <CalcChoice label={t("calc.s2")} options={STRENGTHS} selected={strBtn} onSelect={wrap(setStrBtn)} suffix=" mg" otherLabel={other} otherValue={strOther} onOther={wrap(setStrOther)} placeholder={t("calc.phStrength")} />)}
          {step(3, t("calc.s3"), t("calc.s3sub"), t("calc.s3hint"),
            <CalcChoice label={t("calc.s3")} options={WATERS} selected={watBtn} onSelect={wrap(setWatBtn)} suffix=" mL" otherLabel={other} otherValue={watOther} onOther={wrap(setWatOther)} placeholder={t("calc.phWater")} />)}

          <Btn block onClick={calculate} disabled={!ready}>{t("calc.calculate")}</Btn>

          {result && (
            <div aria-live="polite" style={{ animation: "fadeUp .4s ease", borderTop: `1px solid ${BORDER}`, paddingTop: 34, marginTop: 34 }}>
              <div className="eyebrow" style={{ textAlign: "center", marginBottom: 28 }}>{t("calc.results")}</div>
              <SyringeViz units={result.units} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                {[
                  [t("calc.units"), `${result.units} IU`, t("calc.unitsHint")],
                  [t("calc.volume"), `${result.vol} mL`, t("calc.volumeHint")],
                  [t("calc.doses"), `${result.doses}`, t("calc.dosesHint")],
                  [t("calc.conc"), `${result.conc} mg/mL`, t("calc.concHint")],
                ].map(([label, val, hint]) => (
                  <div key={label} style={{ padding: "18px 16px", border: `1px solid ${BORDER}`, borderRadius: 8, textAlign: "center", background: GLASS }}>
                    <div className="display" style={{ fontSize: 28, color: GOLD, marginBottom: 4 }}>{val}</div>
                    <div style={{ fontSize: 10.5, letterSpacing: "0.14em", color: FG, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 10.5, color: DIM3, lineHeight: 1.6 }}>{hint}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 16, padding: 14, border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 11, color: DIM3, lineHeight: 1.8, textAlign: "center" }}>{t("calc.disclaimer")}</div>
      </div>
    </div>
  );
}

// ── HOW TO ──────────────────────────────────────────────────────
function VideoCard({ video }) {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const info = t(`howto.videos.${video.id}`);
  const tag = typeof info === "object" ? info.tag : "";
  const desc = typeof info === "object" ? info.desc : "";
  return (
    <div className="card card-hover" style={{ overflow: "hidden" }}>
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#0a0a0a" }}>
        {!loaded && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase" }}>{t("howto.videoLoading")}</div>}
        <iframe src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`} loading="lazy" title={video.title}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen onLoad={() => setLoaded(true)} />
      </div>
      <div style={{ padding: "18px 22px 20px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <span className="eyebrow" style={{ fontSize: 9 }}>{tag}</span>
          <span className="badge" style={{ border: `1px solid ${BORDER}`, color: DIM2 }}>{t("howto.videosByOthers")}</span>
        </div>
        <div className="display" style={{ fontSize: 19, marginBottom: 8 }}>{video.title}</div>
        <div style={{ fontSize: 12, color: DIM, lineHeight: 1.8 }}>{desc}</div>
      </div>
    </div>
  );
}

function HowToPage() {
  const { t } = useI18n();
  const { go } = useRouter();
  useReveal();
  const sections = t("howto.sections");
  return (
    <div className="page">
      <div className="wrap" style={{ maxWidth: 1060 }}>
        <SectionHead eyebrow={t("howto.eyebrow")} title={t("howto.title")} />

        <div className="reveal" style={{ marginBottom: 58 }}>
          <div className="eyebrow" style={{ marginBottom: 10, textAlign: "center" }}>{t("howto.videosEyebrow")}</div>
          <h2 className="display" style={{ fontSize: 30, textAlign: "center", marginBottom: 12 }}>{t("howto.videosTitle")}</h2>
          <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.85, maxWidth: 620, margin: "0 auto 30px", textAlign: "center" }}>{t("howto.videosText")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22 }}>
            {VIDEOS.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        </div>

        <div className="eyebrow" style={{ textAlign: "center", marginBottom: 24 }}>{t("howto.written")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 22 }}>
          {Array.isArray(sections) && sections.map((s) => {
            const Icon = HOWTO_ICONS[s.icon] || Droplets;
            return (
              <div key={s.title} className="card reveal" style={{ padding: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                  <span style={{ width: 42, height: 42, borderRadius: "50%", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, background: gl(0.07) }}><Icon size={19} strokeWidth={1.4} /></span>
                  <h3 className="display" style={{ fontSize: 24, fontWeight: 400 }}>{s.title}</h3>
                </div>
                <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {s.steps.map((st, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: 13, color: DIM, lineHeight: 1.75 }}>
                      <span style={{ color: GOLD, fontWeight: 600, fontSize: 11, minWidth: 18, marginTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>

        <div className="reveal" style={{ textAlign: "center", marginTop: 50 }}>
          <p style={{ fontSize: 13.5, color: DIM, marginBottom: 16 }}>{t("howto.moreAnswers")}</p>
          <Btn outline onClick={() => go("faq")}>{t("howto.moreAnswersBtn")}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── FAQ ─────────────────────────────────────────────────────────
function FaqPage() {
  const { t } = useI18n();
  const { go } = useRouter();
  const [open, setOpen] = useState(0);
  const items = t("faq.items");
  return (
    <div className="page">
      <div className="wrap-sm" style={{ maxWidth: 780 }}>
        <SectionHead eyebrow={t("faq.eyebrow")} title={t("faq.title")} sub={t("faq.sub")} />
        <div style={{ display: "grid", gap: 10 }}>
          {Array.isArray(items) && items.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="card" style={{ borderColor: isOpen ? "var(--gold)" : undefined }}>
                <h2 style={{ margin: 0 }}>
                  <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`}
                    style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 22px", textAlign: "left", fontSize: 14.5, fontWeight: 600, color: isOpen ? GOLD : FG }}>
                    <span>{q}</span>
                    <ChevronDown size={18} style={{ flexShrink: 0, transition: "transform .35s ease", transform: isOpen ? "rotate(180deg)" : "none", color: GOLD }} />
                  </button>
                </h2>
                <div id={`faq-${i}`} className={`acc ${isOpen ? "open" : ""}`} role="region" aria-hidden={!isOpen}>
                  <div><p style={{ padding: "0 22px 20px", fontSize: 13.5, color: DIM, lineHeight: 1.9 }}><Rich text={a} /></p></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="panel" style={{ textAlign: "center", padding: "36px 24px", marginTop: 40 }}>
          <h2 className="display" style={{ fontSize: 28, marginBottom: 10 }}>{t("faq.stillTitle")}</h2>
          <p style={{ fontSize: 13.5, color: DIM, lineHeight: 1.85, marginBottom: 22 }}>{t("faq.stillText")}</p>
          <Btn onClick={() => go("contact", { query: { topic: "General Inquiry" } })}>{t("faq.stillBtn")}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── ABOUT ───────────────────────────────────────────────────────
function AboutPage() {
  const { t } = useI18n();
  const { go } = useRouter();
  useReveal();
  const pillars = t("about.pillars");
  return (
    <div className="page">
      <div className="wrap" style={{ maxWidth: 1000 }}>
        <div className="reveal" style={{ maxWidth: 760, margin: "0 auto 70px", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>{t("about.eyebrow")}</div>
          <h1 className="display" style={{ fontSize: "clamp(36px,6vw,68px)", marginBottom: 28 }}>{t("about.h1a")}<br /><span style={{ color: GOLD }}>{t("about.h1b")}</span></h1>
          <p style={{ fontSize: 15, color: DIM, lineHeight: 2, marginBottom: 20 }}>{t("about.p1")}</p>
          <p style={{ fontSize: 15, color: DIM, lineHeight: 2 }}>{t("about.p2")}</p>
        </div>
        <div className="eyebrow reveal" style={{ textAlign: "center", marginBottom: 24 }}>{t("about.pillarsEyebrow")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 20 }}>
          {Array.isArray(pillars) && pillars.map((p) => {
            const Icon = PILLAR_ICONS[p.icon] || Sparkles;
            return (
              <div key={p.title} className="card card-hover reveal" style={{ padding: 28 }}>
                <span style={{ width: 46, height: 46, borderRadius: "50%", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, background: gl(0.07), marginBottom: 18 }}><Icon size={20} strokeWidth={1.4} /></span>
                <h3 className="display" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: DIM, lineHeight: 1.85 }}>{p.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="reveal" style={{ textAlign: "center", marginTop: 54 }}>
          <Btn onClick={() => go("contact", { query: { topic: "General Inquiry" } })}>{t("home.ctaConsult")}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── CONTACT ─────────────────────────────────────────────────────
function ContactPage() {
  const { t } = useI18n();
  const { route } = useRouter();
  const topics = Object.keys(t("contact.topics") || {});
  const wanted = route.query.topic;
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    topic: topics.includes(wanted) ? wanted : "",
    message: route.query.product ? `Product: ${route.query.product}\n` : "",
  });
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Re-apply the preselected topic if the visitor lands here from a different CTA.
  useEffect(() => {
    setForm((f) => ({
      ...f,
      topic: topics.includes(route.query.topic) ? route.query.topic : f.topic,
      message: route.query.product && !f.message ? `Product: ${route.query.product}\n` : f.message,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.query.topic, route.query.product]);

  const submit = async (e) => {
    e.preventDefault();
    setState("sending");
    try {
      const fd = new FormData();
      fd.append("_subject", `TruPep Inquiry — ${form.topic || "General"} — ${form.name}`);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await fetch(FORMSPREE, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      setState(res.ok ? "sent" : "error");
    } catch (_) { setState("error"); }
  };

  const info = [
    [Mail, t("contact.email"), CONTACT_EMAIL, `mailto:${CONTACT_EMAIL}`],
    [Phone, t("contact.phone"), CONTACT_PHONE, `tel:${CONTACT_PHONE.replace(/\D/g, "")}`],
    [MapPin, t("contact.location"), t("contact.miami"), null],
  ];
  const tl = (k) => { const v = t(`contact.topics.${k}`); return v.startsWith("contact.") ? k : v; };

  return (
    <div className="page">
      <div className="wrap" style={{ maxWidth: 1040, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(30px,6vw,64px)", alignItems: "start" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>{t("contact.eyebrow")}</div>
          <h1 className="display" style={{ fontSize: "clamp(34px,5vw,56px)", marginBottom: 22 }}>{t("contact.title")}</h1>
          <p style={{ fontSize: 14.5, color: DIM, lineHeight: 1.95, marginBottom: 36 }}>{t("contact.text")}</p>
          {info.map(([Icon, k, v, href]) => (
            <div key={k} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
              <Icon size={18} strokeWidth={1.5} color="var(--gold)" style={{ marginTop: 3, flexShrink: 0 }} />
              <div>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 5 }}>{k}</div>
                {href ? <a href={href} className="link" style={{ fontSize: 15, textDecoration: "none", color: FG }}>{v}</a> : <div style={{ fontSize: 15 }}>{v}</div>}
              </div>
            </div>
          ))}
        </div>
        <div className="panel" style={{ padding: "34px clamp(20px,4vw,32px)" }}>
          {state === "sent" ? (
            <div role="status" style={{ textAlign: "center", padding: "40px 0" }}>
              <Check size={34} color="var(--gold)" strokeWidth={1.4} />
              <div className="display" style={{ fontSize: 30, color: GOLD, margin: "14px 0 12px" }}>{t("contact.sentTitle")}</div>
              <p style={{ fontSize: 13, color: DIM, lineHeight: 1.85 }}>{t("contact.sentText")}</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
              <input className="input" required placeholder={t("contact.name")} aria-label={t("contact.name")} autoComplete="name" value={form.name} onChange={set("name")} />
              <input className="input" required type="email" placeholder={t("contact.emailField")} aria-label={t("contact.emailField")} autoComplete="email" value={form.email} onChange={set("email")} />
              <input className="input" type="tel" placeholder={t("contact.phoneField")} aria-label={t("contact.phoneField")} autoComplete="tel" value={form.phone} onChange={set("phone")} />
              <select className="input" aria-label={t("contact.topicPh")} value={form.topic} onChange={set("topic")}>
                <option value="">{t("contact.topicPh")}</option>
                {topics.map((k) => <option key={k} value={k}>{tl(k)}</option>)}
              </select>
              <textarea className="input" rows={5} placeholder={t("contact.messagePh")} aria-label={t("contact.messagePh")} value={form.message} onChange={set("message")} style={{ resize: "vertical" }} />
              <Btn type="submit" block disabled={state === "sending"}>{state === "sending" ? t("contact.sending") : t("contact.send")}</Btn>
              {state === "error" && (
                <div role="alert" style={{ fontSize: 12, color: ERR, lineHeight: 1.7 }}>
                  {t("contact.error")} <a className="link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SHIPPING ────────────────────────────────────────────────────
function ShippingPage() {
  const { t } = useI18n();
  const { go } = useRouter();
  const block = (Icon, title, text, extra) => (
    <div className="card" style={{ padding: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Icon size={20} strokeWidth={1.4} color="var(--gold)" />
        <h3 className="display" style={{ fontSize: 22, fontWeight: 400 }}>{title}</h3>
      </div>
      {extra}
      <p style={{ fontSize: 13.5, color: DIM, lineHeight: 1.9 }}>{text}</p>
    </div>
  );
  const rate = (price, time) => (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
      <span className="display" style={{ fontSize: 24, color: GOLD }}>{price}</span>
      {time && <span style={{ fontSize: 12.5, color: DIM2, alignSelf: "center" }}>{time}</span>}
    </div>
  );
  return (
    <div className="page">
      <div className="wrap-sm" style={{ maxWidth: 800 }}>
        <SectionHead eyebrow={t("shipping.eyebrow")} title={t("shipping.title")} sub={t("shipping.intro")} />
        <div style={{ display: "grid", gap: 16 }}>
          {block(Truck, t("shipping.standardTitle"), null, rate(t("shipping.standardPrice"), t("shipping.standardTime")))}
          {block(Zap, t("shipping.overnightTitle"), t("shipping.overnightText"), rate(t("shipping.overnightPrice")))}
          {block(Clock, t("shipping.processingTitle"), t("shipping.processingText"))}
          {block(Lock, t("shipping.paymentTitle"), t("shipping.paymentText"))}
          {block(Search, t("shipping.statusTitle"), t("shipping.statusText"))}
          {block(MapPin, t("shipping.locationTitle"), t("shipping.locationText"))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}><Btn outline onClick={() => go("contact", { query: { topic: "General Inquiry" } })}>{t("shipping.contactBtn")}</Btn></div>
      </div>
    </div>
  );
}

// ── RETURNS (draft until Tristan supplies approved text) ────────
function ReturnsPage() {
  const { t } = useI18n();
  const { go } = useRouter();
  const sections = t("returns.sections");
  return (
    <div className="page">
      <div className="wrap-sm" style={{ maxWidth: 780 }}>
        <SectionHead eyebrow={t("returns.eyebrow")} title={t("returns.title")} />
        {!RETURNS_POLICY_APPROVED && (
          <div role="note" style={{ display: "flex", gap: 12, padding: "16px 20px", border: "1px solid var(--warn)", borderRadius: 6, marginBottom: 30, background: GLASS }}>
            <Info size={18} color="var(--warn)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--warn)", marginBottom: 4 }}>{t("returns.draftBadge")}</div>
              <div style={{ fontSize: 12.5, color: DIM, lineHeight: 1.8 }}>{t("returns.draftNote")}</div>
            </div>
          </div>
        )}
        {Array.isArray(sections) && sections.map(([h, p]) => (
          <div key={h} style={{ marginBottom: 28 }}>
            <h2 className="display" style={{ fontSize: 24, marginBottom: 8 }}>{h}</h2>
            <p style={{ fontSize: 14, color: DIM, lineHeight: 1.95 }}>{p}</p>
          </div>
        ))}
        <Btn outline onClick={() => go("contact", { query: { topic: "General Inquiry" } })}>{t("returns.contactBtn")}</Btn>
      </div>
    </div>
  );
}

// ── LEGAL ───────────────────────────────────────────────────────
function LegalPage({ kind }) {
  const { t } = useI18n();
  const sections = t(`legal.${kind}`);
  const title = t(`legal.${kind}Title`);
  return (
    <div className="page">
      <div className="wrap-sm" style={{ maxWidth: 780 }}>
        <div style={{ marginBottom: 44 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>{t("legal.eyebrow")}</div>
          <h1 className="display" style={{ fontSize: "clamp(34px,5vw,54px)", marginBottom: 8 }}>{title}</h1>
          <div style={{ fontSize: 11, color: DIM3, letterSpacing: "0.1em" }}>{t("legal.updated")}</div>
        </div>
        {Array.isArray(sections) && sections.map(([h, p]) => (
          <div key={h} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: GOLD, marginBottom: 8, letterSpacing: "0.02em" }}>{h}</h2>
            <p style={{ fontSize: 14, color: DIM, lineHeight: 1.95 }}>{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LAB RESULTS ─────────────────────────────────────────────────
function LabResultsPage() {
  const { t } = useI18n();
  const { go } = useRouter();
  return (
    <div className="page">
      <div className="wrap-sm" style={{ maxWidth: 840 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>{t("lab.eyebrow")}</div>
          <h1 className="display" style={{ fontSize: "clamp(34px,5vw,54px)", marginBottom: 14 }}>{t("lab.title")}</h1>
          <p style={{ fontSize: 14.5, color: DIM, lineHeight: 1.9, maxWidth: 580 }}>{t("lab.intro")}</p>
        </div>
        <div className="panel" style={{ padding: "24px 26px", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <FileText size={18} color="var(--gold)" strokeWidth={1.5} />
            <h2 className="display" style={{ fontSize: 22 }}>{t("lab.howTitle")}</h2>
          </div>
          <p style={{ fontSize: 13, color: DIM, lineHeight: 1.85, marginBottom: 16 }}>{t("lab.howText")}</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <Btn small onClick={() => go("contact")}>{t("lab.howBtn")}</Btn>
            <span style={{ fontSize: 12, color: DIM2 }}>{t("lab.howEmail", { email: CONTACT_EMAIL })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ACCOUNT ─────────────────────────────────────────────────────
function AccountAuthForm({ onAuthed, onGuest, compact }) {
  const { t } = useI18n();
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const switchMode = (m) => { setMode(m); setErr(""); setInfo(""); };

  async function submit(e) {
    e.preventDefault();
    setErr(""); setInfo(""); setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: `${window.location.origin}/#/account` });
        if (error) { setErr(error.message); } else { setInfo(t("auth.resetSent")); }
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
        if (error) { setErr(error.message); setBusy(false); return; }
        const userId = data.user?.id;
        if (userId) await supabase.from("customers").insert({ auth_user_id: userId, email: form.email, name: form.name, phone: form.phone });
        onAuthed && onAuthed();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) { setErr(error.message); setBusy(false); return; }
        onAuthed && onAuthed();
      }
    } catch (ex) { setErr(String(ex.message || ex)); }
    setBusy(false);
  }

  return (
    <div style={{ padding: compact ? 0 : "0 0 20px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, textAlign: "left" }}>
        {mode !== "forgot" && (
          <div role="tablist" style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
            {[["login", t("auth.login")], ["signup", t("auth.signup")]].map(([id, label]) => (
              <button type="button" role="tab" aria-selected={mode === id} key={id} onClick={() => switchMode(id)}
                style={{ padding: "10px 16px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: mode === id ? GOLD : DIM2, borderBottom: `2px solid ${mode === id ? "var(--gold)" : "transparent"}`, marginBottom: -1, transition: "color .2s ease" }}>{label}</button>
            ))}
          </div>
        )}
        <form onSubmit={submit} className="panel" style={{ padding: 26, display: "grid", gap: 12 }}>
          <div className="display" style={{ fontSize: 26, color: GOLD }}>{mode === "login" ? t("auth.welcomeBack") : mode === "signup" ? t("auth.createTitle") : t("auth.resetTitle")}</div>
          {mode === "forgot" && <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.8 }}>{t("auth.resetIntro")}</p>}
          {mode === "signup" && (
            <>
              <input className="input" required placeholder={t("auth.fullName")} aria-label={t("auth.fullName")} autoComplete="name" value={form.name} onChange={set("name")} />
              <input className="input" type="tel" placeholder={t("auth.phone")} aria-label={t("auth.phone")} autoComplete="tel" value={form.phone} onChange={set("phone")} />
            </>
          )}
          <input className="input" type="email" required placeholder={t("auth.email")} aria-label={t("auth.email")} autoComplete="email" value={form.email} onChange={set("email")} />
          {mode !== "forgot" && (
            <input className="input" type="password" required minLength={6} placeholder={t("auth.password")} aria-label={t("auth.password")} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={set("password")} />
          )}
          {err && <div role="alert" style={{ color: ERR, fontSize: 12 }}>{err}</div>}
          {info && <div role="status" style={{ color: OK, fontSize: 12.5, lineHeight: 1.7 }}>{info}</div>}
          <Btn type="submit" block disabled={busy}>{busy ? t("auth.wait") : mode === "login" ? t("auth.login") : mode === "signup" ? t("auth.signup") : t("auth.resetBtn")}</Btn>
          {mode === "login" && <button type="button" className="link" style={{ fontSize: 12, justifySelf: "center" }} onClick={() => switchMode("forgot")}>{t("auth.forgot")}</button>}
          {mode === "forgot" && <button type="button" className="link" style={{ fontSize: 12, justifySelf: "center" }} onClick={() => switchMode("login")}>{t("auth.backToLogin")}</button>}
          {onGuest ? (
            <Btn outline block onClick={onGuest}>{t("auth.guest")}</Btn>
          ) : mode !== "forgot" && (
            <div style={{ fontSize: 11.5, color: DIM2, textAlign: "center", lineHeight: 1.7 }}><Rich text={t("auth.guestHint")} /></div>
          )}
        </form>
      </div>
    </div>
  );
}

function RecoveryForm() {
  const { t } = useI18n();
  const { clearRecovery } = useAuth();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg(t("auth.passwordUpdated"));
    setTimeout(clearRecovery, 1400);
  };
  return (
    <form onSubmit={submit} className="panel" style={{ padding: 26, display: "grid", gap: 12, maxWidth: 400, margin: "0 auto" }}>
      <div className="display" style={{ fontSize: 26, color: GOLD }}>{t("auth.newPasswordTitle")}</div>
      <input className="input" type="password" required minLength={6} autoComplete="new-password" placeholder={t("auth.newPassword")} aria-label={t("auth.newPassword")} value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <div role="alert" style={{ color: ERR, fontSize: 12 }}>{err}</div>}
      {msg && <div role="status" style={{ color: OK, fontSize: 12.5 }}>{msg}</div>}
      <Btn type="submit" block disabled={busy}>{busy ? t("auth.wait") : t("auth.saveNewPassword")}</Btn>
    </form>
  );
}

function AccountPage() {
  const { t } = useI18n();
  const { go } = useRouter();
  const { session, customer, loading, recovery, refreshCustomer, signOut } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!customer) { setOrdersLoading(false); return; }
    setOrdersLoading(true);
    supabase.from("orders").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false })
      .then(({ data, error }) => { if (!error) setOrders(data || []); setOrdersLoading(false); });
  }, [customer]);

  const back = (
    <button type="button" onClick={() => go("home")} className="link" style={{ fontSize: 12, textDecoration: "none", marginBottom: 26, display: "inline-block" }}>{t("auth.browse")}</button>
  );

  if (loading) return <div className="page"><div className="wrap-sm" style={{ textAlign: "center", color: DIM2 }}>{t("common.loading")}</div></div>;
  if (recovery && session) return <div className="page"><div className="wrap-sm">{back}<RecoveryForm /></div></div>;
  if (!session) return <div className="page"><div className="wrap-sm" style={{ maxWidth: 440 }}>{back}<AccountAuthForm onAuthed={refreshCustomer} /></div></div>;

  const first = customer?.name ? customer.name.split(" ")[0] : "";
  const label = (group, v) => { const s = t(`account.${group}.${v}`); return s.startsWith("account.") ? v : s; };
  return (
    <div className="page">
      <div className="wrap-sm" style={{ maxWidth: 740 }}>
        {back}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="display" style={{ fontSize: 36, color: GOLD }}>{first ? t("account.welcomeNamed", { name: first }) : t("account.welcome")}</h1>
            <div style={{ fontSize: 12.5, color: DIM2, marginTop: 4 }}>{customer?.email || session.user?.email}</div>
          </div>
          <Btn small outline onClick={signOut}>{t("account.logout")}</Btn>
        </div>
        <div className="eyebrow" style={{ marginBottom: 16 }}>{t("account.orderHistory")}</div>
        {ordersLoading && <div style={{ color: DIM2, fontSize: 13 }}>{t("account.loadingOrders")}</div>}
        {!ordersLoading && orders.length === 0 && <div style={{ color: DIM2, fontSize: 13, lineHeight: 1.8 }}>{t("account.noOrders")}</div>}
        {!ordersLoading && orders.map((o) => (
          <div key={o.id} className="card" style={{ padding: "18px 22px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>{orderNumberOf(o.id)}</span>
              <span className="display" style={{ fontSize: 20, color: GOLD }}>{fmt(o.total)}</span>
            </div>
            <div style={{ fontSize: 11.5, color: DIM2, marginBottom: 8 }}>
              {new Date(o.created_at).toLocaleDateString(undefined)} · {t("account.payment")}: <span style={{ color: FG }}>{label("paymentStatus", o.payment_status)}</span> · {t("account.status")}: <span style={{ color: FG }}>{label("fulfillment", o.fulfillment_status)}</span>
            </div>
            {(o.items || []).map((it, i) => <div key={i} style={{ fontSize: 12.5, color: DIM }}>{it.name} ({it.variant_label}) × {it.qty}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ─────────────────────────────────────────────
// Not linked anywhere on the public site; reached only at #/ADMIN_ROUTE.
// Authentication and data access are unchanged: Supabase Auth login, with
// Row Level Security deciding what a signed-in user can read or change.
// ── ADMIN DASHBOARD (page id "admin") ────────────────────────────
// Gated by Supabase Auth. Create your one admin login in Supabase:
// Authentication > Users > Add user. No public sign-up on purpose.
const ADMIN_BORDER = BORDER;
const ADMIN_GLASS  = GLASS;
const CATS = CATEGORIES;

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 40);
}

function emptyForm() {
  return {
    id: "", name: "", category: CATS[0] || "", description: "",
    variants: [{ label: "", price: "" }],
    image_url: "", stock_quantity: 0, low_stock_threshold: 5,
    batch_number: "", coa_url: "", active: true,
  };
}

// Admin dashboard -- page id "admin". Gated by Supabase Auth.
// Create your one admin login in Supabase: Authentication > Users > Add user.
// There is no public sign-up screen on purpose.
function AdminPage() {
  const [session, setSession] = useState(undefined); // undefined = checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <Centered>Checking session…</Centered>;
  return session ? <Dashboard onLogout={() => supabase.auth.signOut()} /> : <Login />;
}

function Centered({ children }) {
  return (
    <div style={{ padding: "140px 24px", textAlign: "center", color: fg(0.6), fontFamily: SANS }}>
      {children}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
  }

  return (
    <div style={{ padding: "120px 24px", display: "flex", justifyContent: "center" }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 360, padding: 32, border: `1px solid ${ADMIN_BORDER}`, borderRadius: 8, background: ADMIN_GLASS }}>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: GOLD, marginBottom: 24, fontWeight: 300 }}>Admin Login</div>
        <input type="email" placeholder="Email" value={email} required onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} required onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        {err && <div style={{ color: "#e07a7a", fontSize: 12, marginBottom: 12 }}>{err}</div>}
        <button type="submit" disabled={busy} style={buttonStyle}>{busy ? "Signing in…" : "Sign In"}</button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 13px", fontSize: 13, marginBottom: 12,
  border: `1px solid ${ADMIN_BORDER}`, borderRadius: 4, background: fg(0.06),
  color: FG, fontFamily: SANS,
};
const buttonStyle = {
  padding: "12px 20px", fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
  fontWeight: 600, background: GOLD, color: INK, border: "none", borderRadius: 4, fontFamily: SANS, cursor: "pointer",
};
const ghostButton = { ...buttonStyle, background: "transparent", border: `1px solid ${GOLD}`, color: GOLD };

// ── DASHBOARD ───────────────────────────────────────────────────
const TABS = [["products", "Products"], ["orders", "Orders"], ["customers", "Customers"], ["analytics", "Analytics"]];

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("products");
  return (
    <div style={{ padding: "100px 24px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: SERIF, fontSize: 32, color: GOLD, fontWeight: 300 }}>Admin Dashboard</div>
          <button onClick={onLogout} style={ghostButton}>Log Out</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 28, borderBottom: `1px solid ${ADMIN_BORDER}` }}>
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "10px 18px", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
              fontWeight: 600, background: "none", border: "none", cursor: "pointer",
              color: tab === id ? GOLD : fg(0.5),
              borderBottom: tab === id ? `2px solid ${GOLD}` : "2px solid transparent",
              marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        {tab === "products"  && <ProductsTab />}
        {tab === "orders"    && <OrdersTab />}
        {tab === "customers" && <CustomersTab />}
        {tab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}

// ── ORDERS TAB ──────────────────────────────────────────────────
const PAYMENT_STATUSES = ["pending", "paid", "refunded"];
const FULFILLMENT_STATUSES = ["new", "processing", "shipped", "completed", "cancelled"];

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error) setOrders(data || []);
    setLoading(false);
  }

  async function updateStatus(id, field, value) {
    const { error } = await supabase.from("orders").update({ [field]: value }).eq("id", id);
    if (error) { alert("Update failed: " + error.message); return; }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  }

  if (loading) return <Centered>Loading orders…</Centered>;
  if (orders.length === 0) {
    return <div style={{ color: fg(0.55), fontSize: 13, fontFamily: SANS }}>No orders yet — they'll show up here as soon as someone checks out.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: SANS, fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${ADMIN_BORDER}`, textAlign: "left", color: GOLD, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
            <th style={th}>Order #</th>
            <th style={th}>Date</th>
            <th style={th}>Customer</th>
            <th style={th}>Total</th>
            <th style={th}>Payment</th>
            <th style={th}>Fulfillment</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <React.Fragment key={o.id}>
              <tr style={{ borderBottom: `1px solid ${fg(0.08)}` }}>
                <td style={td}><strong style={{ letterSpacing: 1 }}>{orderNumberOf(o.id)}</strong></td>
                <td style={td}>{new Date(o.created_at).toLocaleDateString()}</td>
                <td style={td}>
                  <div style={{ color: FG }}>{o.customer_name}</div>
                  <div style={{ fontSize: 11, color: fg(0.5) }}>{o.customer_email}</div>
                  {o.guest && <div style={{ fontSize: 10, color: fg(0.4) }}>Guest</div>}
                </td>
                <td style={td}>${Number(o.total).toFixed(2)}</td>
                <td style={td}>
                  <select value={o.payment_status} onChange={(e) => updateStatus(o.id, "payment_status", e.target.value)} style={selectStyle}>
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={td}>
                  <select value={o.fulfillment_status} onChange={(e) => updateStatus(o.id, "fulfillment_status", e.target.value)} style={selectStyle}>
                    {FULFILLMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={td}>
                  <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} style={{ ...ghostButton, padding: "6px 12px", fontSize: 10 }}>
                    {expanded === o.id ? "Hide" : "Details"}
                  </button>
                </td>
              </tr>
              {expanded === o.id && (
                <tr key={`${o.id}-detail`}>
                  <td colSpan={7} style={{ padding: "12px 12px 20px", background: fg(0.03) }}>
                    <div style={{ fontSize: 12, color: fg(0.8), lineHeight: 1.9 }}>
                      <div><strong style={{ color: GOLD }}>Items:</strong></div>
                      {(o.items || []).map((it, i) => (
                        <div key={i}>— {it.name} ({it.variant_label}) x{it.qty} — ${Number(it.price * it.qty).toFixed(2)}</div>
                      ))}
                      <div style={{ marginTop: 8 }}>
                        <strong style={{ color: GOLD }}>Ship to:</strong> {o.street}, {o.city}, {o.state} {o.zip}
                      </div>
                      {o.contact_pref && <div><strong style={{ color: GOLD }}>Preferred contact:</strong> {o.contact_pref} · {o.customer_phone}</div>}
                      {o.promo_code && <div><strong style={{ color: GOLD }}>Promo:</strong> {o.promo_code} (-{o.discount_pct}%)</div>}
                      {o.notes && <div><strong style={{ color: GOLD }}>Notes:</strong> {o.notes}</div>}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── CUSTOMERS TAB ───────────────────────────────────────────────
function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: custData, error: custErr }, { data: orderData, error: orderErr }] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("customer_id, total"),
    ]);
    if (!custErr) setCustomers(custData || []);
    if (!orderErr) {
      const stats = {};
      (orderData || []).forEach((o) => {
        if (!o.customer_id) return;
        if (!stats[o.customer_id]) stats[o.customer_id] = { count: 0, spent: 0 };
        stats[o.customer_id].count += 1;
        stats[o.customer_id].spent += Number(o.total) || 0;
      });
      setOrderStats(stats);
    }
    setLoading(false);
  }

  if (loading) return <Centered>Loading customers…</Centered>;
  if (customers.length === 0) {
    return <div style={{ color: fg(0.55), fontSize: 13, fontFamily: SANS }}>No customer accounts yet — this fills in once account sign-up is live.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: SANS, fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${ADMIN_BORDER}`, textAlign: "left", color: GOLD, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Phone</th>
            <th style={th}>Orders</th>
            <th style={th}>Total Spent</th>
            <th style={th}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
            const stats = orderStats[c.id] || { count: 0, spent: 0 };
            return (
              <tr key={c.id} style={{ borderBottom: `1px solid ${fg(0.08)}` }}>
                <td style={td}>{c.name || "—"}</td>
                <td style={td}>{c.email}</td>
                <td style={td}>{c.phone || "—"}</td>
                <td style={td}>{stats.count}</td>
                <td style={td}>${stats.spent.toFixed(2)}</td>
                <td style={td}>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const selectStyle = {
  padding: "5px 8px", fontSize: 11, border: `1px solid ${ADMIN_BORDER}`, borderRadius: 4,
  background: fg(0.06), color: FG, fontFamily: SANS,
};

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | product id
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCoa, setUploadingCoa] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true });
    if (!error) setProducts(data || []);
    setLoading(false);
  }

  function startNew() {
    setForm(emptyForm());
    setEditing("new");
  }

  function startEdit(p) {
    setForm({
      id: p.id, name: p.name, category: p.category, description: p.description || "",
      variants: p.variants && p.variants.length ? p.variants : [{ label: "", price: "" }],
      image_url: p.image_url || "", stock_quantity: p.stock_quantity, low_stock_threshold: p.low_stock_threshold,
      batch_number: p.batch_number || "", coa_url: p.coa_url || "", active: p.active,
    });
    setEditing(p.id);
  }

  function cancelEdit() { setEditing(null); setForm(emptyForm()); }

  function updateVariant(i, field, value) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [field]: value };
      return { ...f, variants };
    });
  }
  function addVariant() { setForm((f) => ({ ...f, variants: [...f.variants, { label: "", price: "" }] })); }
  function removeVariant(i) { setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) })); }

  async function uploadImage(file) {
    if (!file) return;
    setUploadingImage(true);
    const id = editing === "new" ? (form.id || slugify(form.name)) : editing;
    const path = `${id}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) { alert("Image upload failed: " + error.message); setUploadingImage(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploadingImage(false);
  }

  async function uploadCoa(file) {
    if (!file) return;
    setUploadingCoa(true);
    const id = editing === "new" ? (form.id || slugify(form.name)) : editing;
    const path = `${id}-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from("coa-documents").upload(path, file, { upsert: true });
    if (error) { alert("COA upload failed: " + error.message); setUploadingCoa(false); return; }
    const { data } = supabase.storage.from("coa-documents").getPublicUrl(path);
    setForm((f) => ({ ...f, coa_url: data.publicUrl }));
    setUploadingCoa(false);
  }

  async function save() {
    if (!form.name.trim()) { alert("Product name is required."); return; }
    const id = editing === "new" ? (form.id.trim() ? slugify(form.id) : slugify(form.name)) : editing;
    const cleanVariants = form.variants
      .filter((v) => v.label.trim() && v.price !== "")
      .map((v) => ({ label: v.label.trim(), price: Number(v.price) }));
    if (cleanVariants.length === 0) { alert("Add at least one price/variant."); return; }

    setSaving(true);
    const payload = {
      id, name: form.name.trim(), category: form.category, description: form.description,
      variants: cleanVariants, image_url: form.image_url || null,
      stock_quantity: Number(form.stock_quantity) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
      batch_number: form.batch_number || null, coa_url: form.coa_url || null,
      active: form.active,
      ...(form.coa_url ? { coa_uploaded_at: new Date().toISOString() } : {}),
    };
    const { error } = await supabase.from("products").upsert(payload);
    setSaving(false);
    if (error) { alert("Save failed: " + error.message); return; }
    cancelEdit();
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this product permanently? This can't be undone.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { alert("Delete failed: " + error.message); return; }
    load();
  }

  if (loading) return <Centered>Loading products…</Centered>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button onClick={startNew} style={buttonStyle}>+ Add Product</button>
      </div>

      {editing && (
          <ProductForm
            form={form} setForm={setForm} isNew={editing === "new"}
            onUpdateVariant={updateVariant} onAddVariant={addVariant} onRemoveVariant={removeVariant}
            onUploadImage={uploadImage} onUploadCoa={uploadCoa}
            uploadingImage={uploadingImage} uploadingCoa={uploadingCoa}
            onSave={save} onCancel={cancelEdit} saving={saving}
          />
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: SANS, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${ADMIN_BORDER}`, textAlign: "left", color: GOLD, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                <th style={th}></th>
                <th style={th}>Product</th>
                <th style={th}>Price</th>
                <th style={th}>Stock</th>
                <th style={th}>COA</th>
                <th style={th}>Status</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.stock_quantity <= p.low_stock_threshold;
                const prices = (p.variants || []).map((v) => v.price);
                const priceLabel = prices.length ? `$${Math.min(...prices)}${prices.length > 1 ? `–$${Math.max(...prices)}` : ""}` : "—";
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${fg(0.08)}` }}>
                    <td style={td}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, border: `1px solid ${ADMIN_BORDER}` }} />
                        : <div style={{ width: 40, height: 40, borderRadius: 4, border: `1px dashed ${ADMIN_BORDER}`, opacity: 0.4 }} />}
                    </td>
                    <td style={td}>
                      <div style={{ color: FG }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: fg(0.5) }}>{p.category}</div>
                      {low && <div style={{ color: "#e0a84a", fontSize: 11, marginTop: 2 }}>Low stock</div>}
                    </td>
                    <td style={td}>{priceLabel}</td>
                    <td style={td}>{p.stock_quantity}</td>
                    <td style={td}>{p.coa_url ? <a href={p.coa_url} target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>View</a> : <span style={{ color: fg(0.4) }}>None</span>}</td>
                    <td style={td}>{p.active ? <span style={{ color: "#7fd48a" }}>Active</span> : <span style={{ color: fg(0.4) }}>Hidden</span>}</td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEdit(p)} style={{ ...ghostButton, padding: "6px 12px", fontSize: 10 }}>Edit</button>
                        <button onClick={() => remove(p.id)} style={{ ...ghostButton, padding: "6px 12px", fontSize: 10, borderColor: "#e07a7a", color: "#e07a7a" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  );
}

function ProductForm({
  form, setForm, isNew, onUpdateVariant, onAddVariant, onRemoveVariant,
  onUploadImage, onUploadCoa, uploadingImage, uploadingCoa, onSave, onCancel, saving,
}) {
  return (
    <div style={{ border: `1px solid ${ADMIN_BORDER}`, borderRadius: 8, background: ADMIN_GLASS, padding: 24, marginBottom: 32 }}>
      <div style={{ fontFamily: SERIF, fontSize: 20, color: GOLD, marginBottom: 18, fontWeight: 300 }}>
        {isNew ? "New Product" : `Editing: ${form.name}`}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={inputStyle}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <label style={labelStyle}>Description</label>
      <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        rows={3} style={{ ...inputStyle, resize: "vertical" }} />

      <label style={labelStyle}>Pricing / Variants</label>
      {form.variants.map((v, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <input placeholder="Label, e.g. 10mg" value={v.label} onChange={(e) => onUpdateVariant(i, "label", e.target.value)} style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
          <input placeholder="Price" type="number" value={v.price} onChange={(e) => onUpdateVariant(i, "price", e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: 100 }} />
          {form.variants.length > 1 && (
            <button onClick={() => onRemoveVariant(i)} style={{ color: "#e07a7a", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
          )}
        </div>
      ))}
      <button onClick={onAddVariant} style={{ ...ghostButton, padding: "6px 14px", fontSize: 10, marginBottom: 16 }}>+ Add Variant</button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 4 }}>
        <div>
          <label style={labelStyle}>Stock Quantity</label>
          <input type="number" value={form.stock_quantity} onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Low Stock Alert At</label>
          <input type="number" value={form.low_stock_threshold} onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Batch / Lot #</label>
          <input value={form.batch_number} onChange={(e) => setForm((f) => ({ ...f, batch_number: e.target.value }))} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Product Photo</label>
          {form.image_url && <img src={form.image_url} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, marginBottom: 8, border: `1px solid ${ADMIN_BORDER}` }} />}
          <input type="file" accept="image/*" onChange={(e) => onUploadImage(e.target.files[0])} style={{ fontSize: 12, color: fg(0.7) }} />
          {uploadingImage && <div style={{ fontSize: 11, color: GOLD, marginTop: 4 }}>Uploading…</div>}
        </div>
        <div>
          <label style={labelStyle}>Certificate of Analysis (PDF)</label>
          {form.coa_url && <div style={{ marginBottom: 8 }}><a href={form.coa_url} target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontSize: 12 }}>View current COA</a></div>}
          <input type="file" accept="application/pdf" onChange={(e) => onUploadCoa(e.target.files[0])} style={{ fontSize: 12, color: fg(0.7) }} />
          {uploadingCoa && <div style={{ fontSize: 11, color: GOLD, marginTop: 4 }}>Uploading…</div>}
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: fg(0.85), marginBottom: 20, cursor: "pointer" }}>
        <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
        Visible on storefront
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onSave} disabled={saving} style={buttonStyle}>{saving ? "Saving…" : "Save Product"}</button>
        <button onClick={onCancel} style={ghostButton}>Cancel</button>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: fg(0.55), marginBottom: 6, marginTop: 10 };
const th = { padding: "10px 12px" };
const td = { padding: "10px 12px", verticalAlign: "top" };

// ── ANALYTICS TAB ───────────────────────────────────────────────
// Every number below is computed from this project's own `site_events` table.
// Nothing here is a benchmark or external data. Events contain no personal data.
const FUNNEL = [
  ["page_view", "Visited the site"],
  ["item_view", "Viewed a product"],
  ["add_to_cart", "Added to cart"],
  ["checkout_start", "Started checkout"],
  ["order_placed", "Placed an order"],
];

function pct(a, b) { return b ? `${Math.round((a / b) * 100)}%` : "—"; }

function BarChart({ data, height = 120, label }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / Math.max(1, data.length);
  return (
    <div role="img" aria-label={label}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: "100%", height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 4);
          return <rect key={i} x={i * w + w * 0.12} y={height - h} width={w * 0.76} height={h} fill="var(--gold-fill)" opacity={d.value ? 0.9 : 0.15}><title>{`${d.label}: ${d.value}`}</title></rect>;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: fg(0.5), marginTop: 4 }}>
        <span>{data[0] && data[0].label}</span><span>{data[data.length - 1] && data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div style={{ padding: "16px 18px", border: `1px solid ${ADMIN_BORDER}`, borderRadius: 8, background: ADMIN_GLASS }}>
      <div style={{ fontFamily: SERIF, fontSize: 32, color: GOLD, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 6 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: fg(0.5), marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ padding: 18, border: `1px solid ${ADMIN_BORDER}`, borderRadius: 8, background: ADMIN_GLASS }}>
      <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function RankList({ rows, empty = "No data yet." }) {
  if (!rows.length) return <div style={{ fontSize: 12, color: fg(0.5) }}>{empty}</div>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {rows.map((r) => (
        <div key={r.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, gap: 10 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span><span style={{ color: fg(0.7), flexShrink: 0 }}>{r.value}{r.note ? ` · ${r.note}` : ""}</span>
          </div>
          <div style={{ height: 4, background: fg(0.08), borderRadius: 2, marginTop: 3 }}><div style={{ height: 4, width: `${(r.value / max) * 100}%`, background: "var(--gold-fill)", borderRadius: 2 }} /></div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsTab() {
  const [days, setDays] = useState(7);
  const [state, setState] = useState({ status: "loading", events: [], products: [] });

  useEffect(() => {
    let live = true;
    (async () => {
      setState((s) => ({ ...s, status: "loading" }));
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const all = [];
      for (let from = 0; from < 50000; from += 1000) {
        const { data, error } = await supabase.from("site_events").select("created_at,event_type,item_slug,search_term,meta").gte("created_at", since).order("created_at", { ascending: true }).range(from, from + 999);
        if (error) { if (live) setState({ status: "unavailable", events: [], products: [] }); return; }
        all.push(...(data || []));
        if (!data || data.length < 1000) break;
      }
      const { data: prods } = await supabase.from("products").select("id,name,category");
      if (live) setState({ status: "ready", events: all, products: prods || [] });
    })().catch(() => live && setState({ status: "unavailable", events: [], products: [] }));
    return () => { live = false; };
  }, [days]);

  const a = useMemo(() => {
    const ev = state.events;
    const sess = (e) => (e.meta && e.meta.s) || null;
    const byType = (t) => ev.filter((e) => e.event_type === t);
    const sessionsOf = (list) => new Set(list.map(sess).filter(Boolean));
    const visitors = sessionsOf(byType("page_view"));
    const nameOf = Object.fromEntries(state.products.map((p) => [p.id, p.name]));
    const catOf = Object.fromEntries(state.products.map((p) => [p.id, p.category]));
    const countBy = (list, keyFn) => { const m = new Map(); list.forEach((e) => { const k = keyFn(e); if (k) m.set(k, (m.get(k) || 0) + 1); }); return [...m.entries()].map(([label, value]) => ({ label, value })).sort((x, y) => y.value - x.value); };

    const perDay = []; 
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000); const key = d.toLocaleDateString();
      perDay.push({ label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), key, sessions: new Set(), value: 0 });
    }
    byType("page_view").forEach((e) => { const k = new Date(e.created_at).toLocaleDateString(); const row = perDay.find((r) => r.key === k); if (row && sess(e)) row.sessions.add(sess(e)); });
    perDay.forEach((r) => { r.value = r.sessions.size; });
    const hours = Array.from({ length: 24 }, (_, h) => ({ label: `${h}:00`, value: 0 }));
    byType("page_view").forEach((e) => { const d = new Date(e.created_at); if (!isNaN(d)) hours[d.getHours()].value += 1; });
    const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => ({ label, value: 0 }));
    byType("page_view").forEach((e) => { const d = new Date(e.created_at); if (!isNaN(d)) dows[d.getDay()].value += 1; });

    const itemViews = countBy(byType("item_view"), (e) => e.item_slug);
    const itemCarts = Object.fromEntries(countBy(byType("add_to_cart"), (e) => e.item_slug).map((r) => [r.label, r.value]));
    const topItems = itemViews.slice(0, 8).map((r) => ({ label: nameOf[r.label] || r.label, slug: r.label, value: r.value, note: `${itemCarts[r.label] || 0} added to cart` }));
    const topCats = countBy(byType("item_view"), (e) => catOf[e.item_slug]).slice(0, 6);
    const searches = countBy(byType("search"), (e) => e.search_term);
    const noResult = countBy(byType("search").filter((e) => e.meta && e.meta.results === 0), (e) => e.search_term);
    const shares = countBy(byType("share"), (e) => e.item_slug).slice(0, 6).map((r) => ({ ...r, slug: r.label, label: nameOf[r.label] || r.label }));
    const funnel = FUNNEL.map(([t, label]) => ({ type: t, label, n: sessionsOf(byType(t)).size }));
    const theme = countBy(byType("theme_toggle"), (e) => e.item_slug);
    const lang = countBy(byType("lang_toggle"), (e) => e.item_slug);
    const langSplit = countBy(byType("page_view"), (e) => (e.meta && e.meta.l) || "en");
    const device = countBy(byType("page_view"), (e) => (e.meta && e.meta.w === "m" ? "Phone" : "Desktop"));

    // Growth tips: computed only from the numbers above; each shows its number.
    const tips = [];
    const enough = visitors.size >= 20;
    if (!enough) tips.push(`Not enough data yet for reliable suggestions (${visitors.size} visit${visitors.size === 1 ? "" : "s"} in this range; suggestions appear from 20).`);
    else {
      const top = topItems[0];
      if (top && top.value >= 5 && !(itemCarts[top.slug] > 0)) tips.push(`"${top.label}" is your most-viewed product (${top.value} views) but nobody added it to the cart — check its photo, description, and price.`);
      else if (top) { const rate = (itemCarts[top.slug] || 0) / top.value; if (top.value >= 5 && rate < 0.1) tips.push(`"${top.label}" has ${top.value} views but only ${itemCarts[top.slug] || 0} add-to-carts (${Math.round(rate * 100)}%) — check its photo, description, and price.`); }
      noResult.slice(0, 2).forEach((r) => { if (r.value >= 2) tips.push(`"${r.label}" was searched ${r.value} times with no results — a possible demand signal; consider whether it belongs in the catalog.`); });
      for (let i = 1; i < funnel.length; i++) {
        const prev = funnel[i - 1].n, cur = funnel[i].n;
        if (prev >= 10 && cur / prev < 0.25) { tips.push(`Only ${cur} of ${prev} visitors went from "${funnel[i - 1].label}" to "${funnel[i].label}" (${Math.round((cur / prev) * 100)}%) — check how clear that step is.`); break; }
      }
      if (shares[0] && shares[0].value >= 2) tips.push(`"${shares[0].label}" is your most-shared product (${shares[0].value} shares) — consider featuring it on the homepage.`);
      const busy = [...hours].sort((x, y) => y.value - x.value)[0];
      if (busy && busy.value > 0) tips.push(`Your busiest hour is ${busy.label} (${busy.value} page views in this range) — a good time for posts or announcements.`);
      const busyDay = [...dows].sort((x, y) => y.value - x.value)[0];
      if (busyDay && busyDay.value > 0) tips.push(`${busyDay.label} is your busiest day (${busyDay.value} page views).`);
      if (!tips.length) tips.push("Nothing stands out in this range — numbers look steady.");
    }
    return { visitors: visitors.size, views: byType("page_view").length, orders: byType("order_placed").length, carts: sessionsOf(byType("add_to_cart")).size, perDay, hours, dows, topItems, topCats, searches: searches.slice(0, 8), noResult: noResult.slice(0, 6), shares, funnel, theme, lang, langSplit, device, tips, total: ev.length };
  }, [state, days]);

  const exportCsv = () => {
    const rows = [["section", "label", "value"],
      ["summary", "visitors", a.visitors], ["summary", "page views", a.views], ["summary", "orders placed", a.orders], ["summary", "range (days)", days],
      ...a.funnel.map((f) => ["funnel (visitors)", f.label, f.n]),
      ...a.perDay.map((d) => ["visitors per day", d.label, d.value]),
      ...a.topItems.map((r) => ["top products (views)", r.label, r.value]),
      ...a.searches.map((r) => ["top searches", r.label, r.value]),
      ...a.noResult.map((r) => ["searches with no results", r.label, r.value]),
      ...a.shares.map((r) => ["shares", r.label, r.value]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const el = document.createElement("a"); el.href = url; el.download = `trupep-analytics-${days}d.csv`; el.click(); URL.revokeObjectURL(url);
  };

  if (state.status === "loading") return <Centered>Loading analytics…</Centered>;
  if (state.status === "unavailable") {
    return <div style={{ padding: 24, border: `1px solid ${ADMIN_BORDER}`, borderRadius: 8, background: ADMIN_GLASS, fontFamily: SANS, fontSize: 13, lineHeight: 1.8, color: fg(0.8) }}>
      <strong style={{ color: GOLD }}>Analytics not connected yet.</strong> The <code>site_events</code> table doesn't exist (or isn't readable by this login). The site works normally without it. Apply the SQL from the PR notes (<code>analytics-setup.sql</code>) in the Supabase SQL editor, then reload.
    </div>;
  }
  const grid = (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`, gap: 14, marginBottom: 14 });
  const f0 = a.funnel[0].n;
  return (
    <div style={{ fontFamily: SANS }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[7, 30].map((d) => <button key={d} onClick={() => setDays(d)} style={{ ...(days === d ? buttonStyle : ghostButton), padding: "8px 16px", fontSize: 10 }}>{d} days</button>)}
        </div>
        <button onClick={exportCsv} style={{ ...ghostButton, padding: "8px 16px", fontSize: 10 }}>Export CSV</button>
      </div>
      {a.total === 0 && <div style={{ padding: 14, marginBottom: 14, fontSize: 13, color: fg(0.7), border: `1px dashed ${ADMIN_BORDER}`, borderRadius: 8 }}>No events recorded in this range yet. Numbers appear as visitors use the site.</div>}

      <div style={grid(170)}>
        <StatCard label="Visitors" value={a.visitors} hint="Distinct anonymous visits" />
        <StatCard label="Page views" value={a.views} />
        <StatCard label="Carts started" value={a.carts} hint={`${pct(a.carts, a.visitors)} of visitors`} />
        <StatCard label="Orders placed" value={a.orders} hint={`${pct(a.funnel[4].n, f0)} of visitors`} />
      </div>

      <div style={grid(300)}>
        <Panel title="Visitors per day"><BarChart data={a.perDay} label="Visitors per day" /></Panel>
        <Panel title="Busiest hours (page views)"><BarChart data={a.hours} label="Page views by hour of day" /></Panel>
      </div>

      <div style={grid(300)}>
        <Panel title="Funnel (distinct visitors per step)">
          <div style={{ display: "grid", gap: 10 }}>
            {a.funnel.map((s, i) => (
              <div key={s.type}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>{s.label}</span><span>{s.n}{i > 0 ? ` · ${pct(s.n, a.funnel[i - 1].n)} of previous step` : ""}</span></div>
                <div style={{ height: 8, background: fg(0.08), borderRadius: 4, marginTop: 4 }}><div style={{ height: 8, width: `${f0 ? (s.n / f0) * 100 : 0}%`, background: "var(--gold-fill)", borderRadius: 4 }} /></div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: fg(0.5), marginTop: 12, lineHeight: 1.6 }}>Steps are counted per visit, so a visitor who skips straight to a later step still counts there.</div>
        </Panel>
        <Panel title="Growth tips (computed from the numbers here)">
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, fontSize: 13, lineHeight: 1.6 }}>{a.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </Panel>
      </div>

      <div style={grid(260)}>
        <Panel title="Most-viewed products"><RankList rows={a.topItems} /></Panel>
        <Panel title="Most-viewed categories"><RankList rows={a.topCats} /></Panel>
        <Panel title="Top searches"><RankList rows={a.searches} empty="No searches yet." /></Panel>
        <Panel title="Searches with no results"><RankList rows={a.noResult} empty="None — or not enough data." /></Panel>
        <Panel title="Most-shared products"><RankList rows={a.shares} empty="No shares yet." /></Panel>
      </div>

      <div style={grid(260)}>
        <Panel title="Busiest days (page views)"><BarChart data={a.dows} label="Page views by weekday" height={80} /></Panel>
        <Panel title="Language & device"><RankList rows={[...a.langSplit.map((r) => ({ ...r, label: r.label === "es" ? "Spanish pages" : "English pages" })), ...a.device]} empty="No data yet." /></Panel>
        <Panel title="Toggle use"><RankList rows={[...a.theme.map((r) => ({ ...r, label: `Theme → ${r.label}` })), ...a.lang.map((r) => ({ ...r, label: `Language → ${r.label}` }))]} empty="No toggles yet." /></Panel>
      </div>
    </div>
  );
}

// ── CART DRAWER + CHECKOUT ──────────────────────────────────────
function newOrderId() {
  try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (_) {}
  const h = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
  return `${h()}${h()}-${h()}-4${h().slice(1)}-a${h().slice(1)}-${h()}${h()}${h()}`;
}

function CopyBtn({ value }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1600); } catch (_) {}
  };
  return (
    <button type="button" onClick={copy} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px" }} aria-live="polite">
      {done ? <Check size={12} /> : <Copy size={12} />}{done ? t("cart.copied") : t("cart.copy")}
    </button>
  );
}

function PayMethods({ withCopy }) {
  const { t } = useI18n();
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {PAY_METHODS.map((m) => (
        <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 16px", border: `1px solid ${BORDER}`, borderRadius: 5, background: GLASS }}>
          <div>
            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 3 }}>{t(`cart.${m.id}`)}</div>
            <div style={{ fontSize: 13, wordBreak: "break-word" }}>{m.handle}</div>
          </div>
          {withCopy && <CopyBtn value={m.copy} />}
        </div>
      ))}
    </div>
  );
}

function CartDrawer({ open, onClose, cart, total, onRemove, onQty, onAdd, onClear }) {
  const { t } = useI18n();
  const { go } = useRouter();
  const { products } = useProducts();
  const { customer } = useAuth();
  const [step, setStep] = useState("cart"); // cart | checkout | confirmed
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState(null);
  const [shipping, setShipping] = useState("standard");
  const [form, setForm] = useState({ name: "", email: "", phone: "", street: "", city: "", state: "", zip: "", notes: "", contact_pref: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const closeRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!customer) return;
    setForm((f) => ({ ...f, name: f.name || customer.name || "", email: f.email || customer.email || "", phone: f.phone || customer.phone || "" }));
  }, [customer]);

  useEffect(() => {
    if (!open) return;
    closeRef.current && closeRef.current.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  useEffect(() => { scrollRef.current && scrollRef.current.scrollTo({ top: 0 }); }, [step]);

  // A finished order shouldn't reopen on the next visit: reset when the drawer closes.
  const close = () => {
    if (step === "confirmed") { setStep("cart"); setDone(null); setPromo(""); setDiscount(0); setPromoMsg(null); }
    onClose();
  };

  if (!open) return null;

  const bac = products.find((p) => p.id === "bacwater");
  const bacVariant = bac && bac.variants[0];
  const hasBac = cart.some((i) => i.id === "bacwater");

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (PROMO_CODES[code]) { setDiscount(PROMO_CODES[code]); setPromoMsg({ ok: true, text: t("cart.promoOk", { pct: PROMO_CODES[code] }) }); }
    else { setDiscount(0); setPromoMsg({ ok: false, text: t("cart.promoBad") }); }
  };

  const discounted = total * (1 - discount / 100);
  const shippingFee = shipping === "overnight" ? 0 : SHIPPING_STANDARD;
  const grandTotal = discounted + shippingFee;
  const overnight = shipping === "overnight";
  const amountText = overnight ? t("cart.plusCarrier", { amount: fmt(discounted) }) : fmt(grandTotal);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e && e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.street.trim()) { setError(t("cart.needFields")); return; }
    setSending(true);
    setError("");

    if (discount > 0) {
      const code = promo.trim().toUpperCase();
      const { data: alreadyUsed, error: checkErr } = await supabase.rpc("check_promo_used", { p_email: form.email.trim(), p_code: code });
      if (!checkErr && alreadyUsed) { setError(t("cart.promoUsed", { code })); setSending(false); return; }
    }

    const orderId = newOrderId();
    const orderNumber = orderNumberOf(orderId);
    const orderLines = cart.map((i) => `${i.name} (${i.variant.label}) x${i.qty} — ${fmt(i.variant.price * i.qty)}`).join("\n");

    let dbSaved = false;
    try {
      const { error: dbErr } = await supabase.from("orders").insert({
        id: orderId,
        customer_id: customer?.id || null,
        guest: !customer,
        customer_name: form.name, customer_email: form.email, customer_phone: form.phone,
        street: form.street, city: form.city, state: form.state, zip: form.zip,
        contact_pref: form.contact_pref || null,
        items: cart.map((i) => ({ product_id: i.id, name: i.name, variant_label: i.variant.label, price: i.variant.price, qty: i.qty })),
        subtotal: total, discount_pct: discount, shipping_cost: shippingFee, total: grandTotal,
        promo_code: discount ? promo.trim().toUpperCase() : null,
        notes: form.notes || null,
      });
      dbSaved = !dbErr;
    } catch (_) { /* non-blocking: the Formspree notification below is still sent */ }

    const payload = {
      ...form,
      _subject: `New TruPep Order ${orderNumber} — ${form.name}`,
      _replyto: form.email,
      order_number: orderNumber,
      order: orderLines,
      order_total: fmt(grandTotal),
      shipping_method: overnight ? "Overnight / Next Day (carrier quote will be provided)" : "Standard — $15.00",
      ...(discount ? { promo_discount: `${discount}%` } : {}),
      ...(dbSaved ? {} : { saved_to_database: "no — check Supabase" }),
    };

    let ok = false;
    try {
      const res = await fetch(FORMSPREE, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
      ok = res.ok;
    } catch (_) {}

    let usedMail = false;
    if (!ok) {
      usedMail = true;
      const body = encodeURIComponent(
        `NEW ORDER ${orderNumber}\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n` +
        `Address: ${form.street}, ${form.city}, ${form.state} ${form.zip}\n\nORDER:\n${orderLines}\n\nTotal: ${fmt(discounted)}${overnight ? " + carrier shipping" : ` + ${fmt(SHIPPING_STANDARD)} shipping`}` +
        (discount ? `\nDiscount: ${discount}%` : "") + (form.contact_pref ? `\nPreferred Contact: ${form.contact_pref}` : "") + (form.notes ? `\nNotes: ${form.notes}` : ""));
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`New TruPep Order ${orderNumber} — ${form.name}`)}&body=${body}`;
    }

    setDone({ number: orderNumber, amountText, grand: grandTotal, overnight, email: form.email, usedMail });
    track("order_placed", null, { items: cart.reduce((n, i) => n + i.qty, 0), db: dbSaved ? 1 : 0 });
    setStep("confirmed");
    onClear();
    setSending(false);
  };

  const titleKey = step === "cart" ? "cart" : step === "checkout" ? "checkout" : "payment";
  const row = (label, val, color) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: color || DIM, marginBottom: 6 }}><span>{label}</span><span>{val}</span></div>
  );

  const shippingChooser = (
    <div style={{ marginBottom: 14 }}>
      <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>{t("cart.shippingMethod")}</div>
      {[["standard", t("cart.stdTitle"), t("cart.stdSub")], ["overnight", t("cart.onTitle"), t("cart.onSub")]].map(([val, label, sub]) => {
        const on = shipping === val;
        return (
          <button type="button" key={val} onClick={() => setShipping(val)} role="radio" aria-checked={on}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 14px", marginBottom: 6, borderRadius: 5, border: `1px solid ${on ? "var(--gold)" : "var(--border)"}`, background: on ? gl(0.1) : GLASS, transition: "all .2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: on ? GOLD : FG }}>{label}</span>
              <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${on ? "var(--gold)" : "var(--border)"}`, background: on ? "var(--gold-fill)" : "transparent", flexShrink: 0 }} />
            </div>
            <div style={{ fontSize: 11, color: DIM2, marginTop: 3 }}>{sub}</div>
          </button>
        );
      })}
      {overnight && <div style={{ fontSize: 11.5, color: "var(--warn)", padding: "9px 12px", border: "1px solid var(--warn)", borderRadius: 5, lineHeight: 1.7 }}>{t("cart.onNote")}</div>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
      <div onClick={close} aria-hidden="true" style={{ flex: 1, background: "var(--overlay)", animation: "fadeIn .25s ease", backdropFilter: "blur(2px)" }} />
      <div role="dialog" aria-modal="true" aria-label={t(`cart.titles.${titleKey}`)}
        style={{ width: "min(450px,100vw)", background: "var(--bg2)", borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", animation: "slideRight .32s cubic-bezier(.2,.8,.2,1)", boxShadow: "-8px 0 40px rgba(0,0,0,.35)" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: GLASS }}>
          <span className="display" style={{ fontSize: 24, color: GOLD }}>{t(`cart.titles.${titleKey}`)}</span>
          <button ref={closeRef} type="button" onClick={close} className="icon-btn" aria-label={t("common.close")}><X size={18} /></button>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "22px 24px 28px" }}>
          {/* ── CART ── */}
          {step === "cart" && (cart.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 64 }}>
              <ShoppingBag size={42} strokeWidth={1.1} color="var(--gold)" style={{ opacity: 0.7 }} />
              <div className="display" style={{ fontSize: 26, margin: "18px 0 8px" }}>{t("cart.empty")}</div>
              <p style={{ fontSize: 13, color: DIM2, lineHeight: 1.8, marginBottom: 26 }}>{t("cart.emptyHint")}</p>
              <Btn onClick={() => { close(); go("products"); }}>{t("common.continueShopping")}</Btn>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.key} style={{ display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: DIM2 }}>{item.variant.label} · {fmt(item.variant.price)}</div>
                    <button type="button" onClick={() => onRemove(item.key)} style={{ fontSize: 11, color: DIM3, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "underline", textUnderlineOffset: 3 }}>
                      <Trash2 size={11} />{t("cart.remove")}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                    <div className="display" style={{ fontSize: 20, color: GOLD }}>{fmt(item.variant.price * item.qty)}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button type="button" aria-label="−" onClick={() => onQty(item.key, item.qty - 1)} className="icon-btn" style={{ width: 28, height: 28 }}><Minus size={13} /></button>
                      <span style={{ fontSize: 13, minWidth: 20, textAlign: "center" }} aria-live="polite">{item.qty}</span>
                      <button type="button" aria-label="+" onClick={() => onQty(item.key, item.qty + 1)} className="icon-btn" style={{ width: 28, height: 28 }}><Plus size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}

              {!hasBac && bacVariant && (
                <div style={{ border: `1px solid ${BORDER}`, borderLeft: "3px solid var(--gold)", padding: "14px 16px", marginBottom: 18, borderRadius: 4, background: gl(0.06) }}>
                  <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>{t("cart.upsellEyebrow")}</div>
                  <div style={{ fontSize: 12.5, marginBottom: 10, lineHeight: 1.7, color: DIM }}><Rich text={t("cart.upsellText")} color={FG} /></div>
                  <Btn small outline onClick={() => onAdd(bac, bacVariant)}>{t("cart.upsellBtn", { price: fmt(bacVariant.price).replace(/\.00$/, "") })}</Btn>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input className="input" value={promo} onChange={(e) => setPromo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyPromo()} placeholder={t("cart.promoPh")} aria-label={t("cart.promoPh")} style={{ flex: 1 }} />
                <Btn small outline onClick={applyPromo}>{t("cart.apply")}</Btn>
              </div>
              {promoMsg && <div role="status" style={{ fontSize: 12, color: promoMsg.ok ? OK : ERR, marginBottom: 14 }}>{promoMsg.text}</div>}

              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16, marginTop: 14 }}>
                {shippingChooser}
                {row(t("cart.subtotal"), fmt(total))}
                {discount > 0 && row(t("cart.discount", { pct: discount }), `−${fmt(total - discounted)}`, OK)}
                {row(t("cart.shippingLine"), overnight ? t("cart.tbd") : fmt(SHIPPING_STANDARD))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 15, fontWeight: 700, marginTop: 10, marginBottom: 6 }}>
                  <span>{t("cart.total")}</span>
                  <span className="display" style={{ color: GOLD, fontSize: 26 }}>{overnight ? t("cart.plusShipping", { amount: fmt(discounted) }) : fmt(grandTotal)}</span>
                </div>
                <button type="button" className="link" style={{ fontSize: 11.5, marginBottom: 18 }} onClick={() => { close(); go("shipping"); }}>{t("cart.shippingLink")}</button>
              </div>

              <div style={{ padding: "14px 16px", border: `1px solid ${BORDER}`, borderRadius: 5, background: GLASS, marginBottom: 18 }}>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 10 }}>{t("cart.howPayTitle")}</div>
                <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                  {["howPay1", "howPay2", "howPay3"].map((k, i) => (
                    <li key={k} style={{ display: "flex", gap: 10, fontSize: 12, color: DIM, lineHeight: 1.7 }}>
                      <span style={{ color: GOLD, fontWeight: 700 }}>{i + 1}</span><span>{t(`cart.${k}`)}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <Btn block onClick={() => { track("checkout_start", null, { items: cart.reduce((n, i) => n + i.qty, 0) }); setStep("checkout"); }}>{t("cart.proceed")}</Btn>
            </>
          ))}

          {/* ── CHECKOUT ── */}
          {step === "checkout" && (
            <form onSubmit={submit} style={{ animation: "fadeUp .3s ease" }} noValidate>
              <div className="eyebrow" style={{ marginBottom: 14 }}>{t("cart.summaryTitle")}</div>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 5, padding: "14px 16px", background: GLASS, marginBottom: 20 }}>
                {cart.map((i) => (
                  <div key={i.key} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ color: DIM }}>{i.name} ({i.variant.label}) × {i.qty}</span><span>{fmt(i.variant.price * i.qty)}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 10, paddingTop: 10 }}>
                  {row(t("cart.subtotal"), fmt(total))}
                  {discount > 0 && row(t("cart.discount", { pct: discount }), `−${fmt(total - discounted)}`, OK)}
                  {row(t("cart.shipMethodLabel"), <>{overnight ? t("cart.onTitle") : t("cart.stdTitle")} <button type="button" className="link" style={{ fontSize: 11 }} onClick={() => setStep("cart")}>{t("cart.change")}</button></>)}
                  {row(t("cart.shippingLine"), overnight ? t("cart.tbd") : fmt(SHIPPING_STANDARD))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700, marginTop: 6 }}>
                    <span>{t("cart.totalDue")}</span><span className="display" style={{ color: GOLD, fontSize: 24 }}>{amountText}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "14px 16px", border: `1px solid ${BORDER}`, borderRadius: 5, background: gl(0.06), marginBottom: 22 }}>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>{t("cart.howPayTitle")}</div>
                <ol style={{ listStyle: "none", margin: "0 0 14px", padding: 0, display: "grid", gap: 7 }}>
                  {["howPay1", "howPay2", "howPay3"].map((k, i) => (
                    <li key={k} style={{ display: "flex", gap: 10, fontSize: 12, color: DIM, lineHeight: 1.7 }}><span style={{ color: GOLD, fontWeight: 700 }}>{i + 1}</span><span>{t(`cart.${k}`)}</span></li>
                  ))}
                </ol>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>{t("cart.acceptedTitle")}</div>
                <PayMethods />
                <p style={{ fontSize: 11.5, color: DIM2, lineHeight: 1.7, marginTop: 12 }}>{t("cart.memoRule")}</p>
              </div>

              <div className="eyebrow" style={{ marginBottom: 14 }}>{t("cart.shippingInfo")}</div>
              <div style={{ fontSize: 12, color: DIM, marginBottom: 14, padding: "10px 14px", border: `1px solid ${BORDER}`, borderRadius: 4, background: GLASS, lineHeight: 1.7 }}>
                {customer ? <Rich text={t("cart.orderingAs", { email: customer.email })} />
                  : <>{t("cart.guestNote")} <button type="button" className="link" onClick={() => { close(); go("account"); }}>{t("cart.guestLink")}</button> {t("cart.guestTail")}</>}
              </div>
              <div style={{ display: "grid", gap: 9 }}>
                <input className="input" required placeholder={t("cart.fName")} aria-label={t("cart.fName")} autoComplete="name" value={form.name} onChange={set("name")} />
                <input className="input" required type="email" placeholder={t("cart.fEmail")} aria-label={t("cart.fEmail")} autoComplete="email" value={form.email} onChange={set("email")} />
                <input className="input" type="tel" placeholder={t("cart.fPhone")} aria-label={t("cart.fPhone")} autoComplete="tel" value={form.phone} onChange={set("phone")} />
                <input className="input" required placeholder={t("cart.fStreet")} aria-label={t("cart.fStreet")} autoComplete="street-address" value={form.street} onChange={set("street")} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 92px", gap: 8 }}>
                  <input className="input" placeholder={t("cart.fCity")} aria-label={t("cart.fCity")} autoComplete="address-level2" value={form.city} onChange={set("city")} />
                  <input className="input" placeholder={t("cart.fState")} aria-label={t("cart.fState")} autoComplete="address-level1" value={form.state} onChange={set("state")} />
                  <input className="input" placeholder={t("cart.fZip")} aria-label={t("cart.fZip")} autoComplete="postal-code" value={form.zip} onChange={set("zip")} />
                </div>
                <div>
                  <div className="eyebrow" style={{ fontSize: 9.5, margin: "6px 0 8px" }}>{t("cart.contactPref")}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[["Text", "prefText", MessageSquare], ["Email", "prefEmail", Mail], ["Call", "prefCall", Phone], ["WhatsApp", "prefWhatsapp", MessageCircle]].map(([val, key, Icon]) => {
                      const on = form.contact_pref === val;
                      return (
                        <button type="button" key={val} aria-pressed={on} onClick={() => setForm((f) => ({ ...f, contact_pref: val }))}
                          style={{ padding: "10px 8px", borderRadius: 5, fontSize: 12, fontWeight: 500, display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 7, border: `1px solid ${on ? "var(--gold)" : "var(--border)"}`, background: on ? gl(0.12) : GLASS, color: on ? GOLD : DIM, transition: "all .2s ease" }}>
                          <Icon size={13} />{t(`cart.${key}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea className="input" rows={3} placeholder={t("cart.notesPh")} aria-label={t("cart.notesPh")} value={form.notes} onChange={set("notes")} style={{ resize: "vertical" }} />
              </div>
              {error && <div role="alert" style={{ marginTop: 14, padding: "10px 14px", border: "1px solid var(--err)", borderRadius: 5, fontSize: 12, color: ERR, lineHeight: 1.7 }}>{error}</div>}
              <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                <Btn type="submit" block disabled={sending}>{sending ? t("cart.submitting") : t("cart.submit")}</Btn>
                <button type="button" onClick={() => setStep("cart")} style={{ fontSize: 12, color: DIM2, padding: 8 }}>{t("cart.backToCart")}</button>
              </div>
            </form>
          )}

          {/* ── CONFIRMATION ── */}
          {step === "confirmed" && done && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <span style={{ width: 54, height: 54, borderRadius: "50%", border: "1px solid var(--gold)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", background: gl(0.1) }}><Check size={26} strokeWidth={1.6} /></span>
                <h2 className="display" style={{ fontSize: 28, margin: "14px 0 4px" }}>{t("cart.confirmedTitle")}</h2>
              </div>
              <div style={{ textAlign: "center", padding: "16px", border: `1px solid ${BORDER}`, borderRadius: 6, background: GLASS, marginBottom: 14 }}>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>{t("cart.orderNumber")}</div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>{done.number}</div>
                <CopyBtn value={done.number} />
                <div style={{ fontSize: 11.5, color: DIM2, marginTop: 8 }}>{t("cart.keepNumber")}</div>
              </div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 4 }}>{t("cart.amountDue")}</div>
                <div className="display" style={{ fontSize: 34, color: GOLD }}>{done.amountText}</div>
              </div>

              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 10 }}>{t("cart.payTitle")}</div>
              <PayMethods withCopy />
              <p style={{ fontSize: 12, color: DIM, lineHeight: 1.8, marginTop: 12 }}>{t("cart.memoRule")}</p>

              <div style={{ margin: "22px 0", padding: "16px 18px", border: `1px solid ${BORDER}`, borderRadius: 6, background: gl(0.05) }}>
                <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 10 }}>{t("cart.nextTitle")}</div>
                <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9 }}>
                  {[t("cart.next1", { amount: done.amountText }), t("cart.next2"), done.overnight ? t("cart.next3On") : t("cart.next3Std"), t("cart.next4", { email: done.email })].map((s, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 12.5, color: DIM, lineHeight: 1.7 }}><span style={{ color: GOLD, fontWeight: 700 }}>{i + 1}</span><span><Rich text={s} color={FG} /></span></li>
                  ))}
                </ol>
              </div>
              {done.usedMail && <p role="status" style={{ fontSize: 12, color: "var(--warn)", lineHeight: 1.7, marginBottom: 16 }}>{t("cart.mailFallback", { email: CONTACT_EMAIL })}</p>}
              <div style={{ display: "grid", gap: 10 }}>
                <Btn block onClick={() => { close(); go("products"); }}>{t("cart.keepShopping")}</Btn>
                <Btn block outline onClick={close}>{t("cart.done")}</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── EMAIL POPUP (10% offer) ─────────────────────────────────────
const POPUP_KEY = "tp_popup_until";
const POPUP_QUIET_MS = 30 * 24 * 60 * 60 * 1000;
const popupSuppressed = () => Number(store.get(POPUP_KEY, "0")) > Date.now();
const suppressPopup = () => store.set(POPUP_KEY, String(Date.now() + POPUP_QUIET_MS));

function EmailPopup({ onClose }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const firstRef = useRef(null);

  const dismiss = useCallback(() => { suppressPopup(); onClose(); }, [onClose]);
  useEffect(() => {
    firstRef.current && firstRef.current.focus();
    const onKey = (e) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss]);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErr(t("popup.errEmail")); return; }
    if (phone.replace(/\D/g, "").length < 10) { setErr(t("popup.errPhone")); return; }
    setErr(""); setBusy(true);
    // Payload unchanged: this is the existing discount-signup automation contract.
    const payload = {
      email, phone,
      _subject: "Your TruPep Wellness 10% Discount Code",
      _replyto: email,
      message: `Thank you for joining TruPep Wellness! Your exclusive discount code is: WELCOME10 — use it at checkout for 10% off your first order. Shop now at trupepwellness.com\n\nPhone provided: ${phone}`,
    };
    try {
      await fetch(FORMSPREE, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
    } catch (_) {}
    suppressPopup();
    setBusy(false);
    setDone(true);
    setTimeout(onClose, 3600);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn .3s ease", backdropFilter: "blur(3px)" }} onClick={dismiss}>
      <div role="dialog" aria-modal="true" aria-label={t("popup.title")} onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", background: "var(--bg2)", border: "1px solid var(--gold)", boxShadow: "0 0 60px rgba(var(--gold-rgb),.18)", padding: "44px clamp(22px,5vw,38px) 34px", maxWidth: 440, width: "100%", borderRadius: 6, animation: "popIn .35s ease" }}>
        <button type="button" onClick={dismiss} className="icon-btn" aria-label={t("popup.close")} style={{ position: "absolute", top: 12, right: 12 }}><X size={16} /></button>
        {done ? (
          <div role="status" style={{ textAlign: "center", padding: "10px 0" }}>
            <div className="display" style={{ fontSize: 34, color: GOLD, marginBottom: 12 }}>{t("popup.doneTitle")}</div>
            <div style={{ fontSize: 13.5, color: DIM, lineHeight: 1.85 }}><Rich text={t("popup.doneText")} /></div>
            <div style={{ fontSize: 11, color: DIM2, marginTop: 8 }}>{t("popup.doneFine")}</div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="eyebrow" style={{ marginBottom: 12 }}>{t("popup.eyebrow")}</div>
            <div className="display" style={{ fontSize: 34, marginBottom: 10 }}>{t("popup.title")}</div>
            <p style={{ fontSize: 13, color: DIM, lineHeight: 1.85, marginBottom: 18 }}>{t("popup.text")}</p>
            <div style={{ fontSize: 11.5, color: DIM2, lineHeight: 1.7, marginBottom: 16, padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 4, display: "flex", gap: 8 }}><Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />{t("popup.fine")}</div>
            <div style={{ display: "grid", gap: 10 }}>
              <input ref={firstRef} className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("popup.email")} aria-label={t("popup.email")} />
              <input className="input" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("popup.phone")} aria-label={t("popup.phone")} />
            </div>
            {err && <div role="alert" style={{ fontSize: 12, color: ERR, marginTop: 10 }}>{err}</div>}
            <div style={{ display: "grid", gap: 6, marginTop: 16 }}>
              <Btn type="submit" block disabled={busy}>{t("popup.claim")}</Btn>
              <button type="button" onClick={dismiss} style={{ fontSize: 12, color: DIM2, padding: 10 }}>{t("popup.noThanks")}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── CHAT WIDGET ─────────────────────────────────────────────────
function ChatWidget({ hidden }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [messages, setMessages] = useState([]); // user + assistant turns after the greeting
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { const id = setTimeout(() => setNudge(true), 9000); return () => clearTimeout(id); }, []);
  useEffect(() => { scrollRef.current && scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, open, loading]);
  useEffect(() => { if (open) inputRef.current && inputRef.current.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next, lang }) });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || t("chat.errGeneric") }]);
    } catch (_) {
      setMessages((m) => [...m, { role: "assistant", content: t("chat.errConn") }]);
    } finally { setLoading(false); }
  }

  if (hidden) return null;
  const bubble = (m, i) => (
    <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "86%", padding: "10px 13px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
      background: m.role === "user" ? "var(--gold-fill)" : gl(0.1), color: m.role === "user" ? "var(--ink)" : FG, border: m.role === "user" ? "none" : `1px solid ${BORDER}` }}>{m.content}</div>
  );

  return (
    <>
      {open && (
        <div role="dialog" aria-label={t("chat.header")} style={{ position: "fixed", bottom: 92, right: 20, zIndex: 9999, width: 372, maxWidth: "calc(100vw - 28px)", height: 540, maxHeight: "calc(100vh - 120px)", background: "var(--bg2)", border: `1px solid ${BORDER}`, borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 16px 56px rgba(0,0,0,.4)", animation: "popIn .25s ease" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: GLASS }}>
            <span className="display" style={{ fontSize: 22, color: GOLD }}>{t("chat.header")}</span>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t("chat.close")}><X size={16} /></button>
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }} aria-live="polite">
            {bubble({ role: "assistant", content: t("chat.greeting") }, "g")}
            {messages.map(bubble)}
            {loading && bubble({ role: "assistant", content: t("chat.typing") }, "typing")}
          </div>
          <form onSubmit={send} style={{ display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${BORDER}` }}>
            <input ref={inputRef} className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("chat.placeholder")} aria-label={t("chat.placeholder")} maxLength={1000} style={{ flex: 1 }} />
            <Btn type="submit" small disabled={loading || !input.trim()} aria-label={t("chat.send")}><Send size={14} /></Btn>
          </form>
          <div style={{ fontSize: 10.5, color: DIM3, padding: "2px 16px 10px", textAlign: "center", lineHeight: 1.5 }}>{t("chat.disclaimer")}</div>
        </div>
      )}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", alignItems: "center", gap: 12 }}>
        {nudge && !open && (
          <button type="button" onClick={() => { track("chat_open"); setOpen(true); setNudge(false); }} className="hide-mobile"
            style={{ background: "var(--bg2)", border: `1px solid ${BORDER}`, color: FG, fontSize: 13, padding: "10px 16px", borderRadius: 12, whiteSpace: "nowrap", boxShadow: "0 6px 24px rgba(0,0,0,.25)", animation: "fadeUp .4s ease" }}>{t("chat.nudge")}</button>
        )}
        <button type="button" onClick={() => { if (!open) track("chat_open"); setOpen((o) => !o); setNudge(false); }} aria-label={open ? t("chat.close") : t("chat.open")} aria-expanded={open}
          style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold-fill)", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 24px rgba(var(--gold-rgb),.4)", transition: "transform .2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.07)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
          {open ? <X size={22} /> : <MessageCircle size={23} />}
        </button>
      </div>
    </>
  );
}

// ── PAGE META (title + description per page and language) ───────
function usePageMeta(route) {
  const { t, lang } = useI18n();
  const { products } = useProducts();
  useEffect(() => {
    let key = route.page;
    if (key === "admin") { document.title = "Admin | TruPep Wellness"; return; }
    let vars;
    if (key === "product") {
      const p = products.find((x) => x.id === route.param);
      vars = { name: p ? pName(p, lang) : "TruPep" };
    }
    if (!(key in DICT_PAGES)) key = "home";
    const m = t(`meta.${key}`, vars);
    if (Array.isArray(m)) {
      document.title = m[0];
      let tag = document.querySelector('meta[name="description"]');
      if (tag) tag.setAttribute("content", m[1]);
    }
  }, [route.page, route.param, lang, products, t]);
}
const DICT_PAGES = Object.fromEntries(["home","products","product","stacks","calculator","howto","faq","about","contact","shipping","returns","terms","privacy","disclaimer","labresults","account"].map((k) => [k, 1]));

// ── APP ─────────────────────────────────────────────────────────
function Shell() {
  const { route, entered, enter } = useRouter();
  const { products } = useProducts();
  const { recovery } = useAuth();
  const { t } = useI18n();
  const { cart, add, addMany, remove, setQty, clear, total, count } = useCart(products);
  const [cartOpen, setCartOpen] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const [popup, setPopup] = useState(false);
  const isAdmin = route.page === "admin";
  const showIntro = !entered && !isAdmin && !recovery;

  useEffect(() => { if (recovery) enter(); }, [recovery]); // eslint-disable-line react-hooks/exhaustive-deps
  usePageMeta(route);
  useEffect(() => { window.scrollTo(0, 0); }, [route.page, route.param]);
  useEffect(() => { if (!showIntro && route.page !== "admin") track("page_view", route.page); }, [route.page, showIntro]); // eslint-disable-line react-hooks/exhaustive-deps

  const onAdd = useCallback((p, v) => { add(p, v); track("add_to_cart", p.id); setBumpKey((k) => k + 1); }, [add]);
  const onAddMany = useCallback((e) => { addMany(e); e.forEach((x) => track("add_to_cart", x.product.id)); setBumpKey((k) => k + 1); }, [addMany]);

  // Offer popup: after 30s on the site, or when the cursor leaves the window
  // (desktop). Never while the cart is open, never on admin, and not again for
  // 30 days after it has been dismissed or claimed.
  useEffect(() => {
    if (showIntro || isAdmin || popupSuppressed()) return;
    let fired = false;
    const fire = () => { if (fired || popupSuppressed()) return; fired = true; setPopup(true); };
    const timer = setTimeout(fire, 30000);
    const onLeave = (e) => { if (e.clientY <= 0) fire(); };
    document.addEventListener("mouseleave", onLeave);
    return () => { clearTimeout(timer); document.removeEventListener("mouseleave", onLeave); };
  }, [showIntro, isAdmin]);

  if (showIntro) return <><IntroPage /></>;

  const p = route.page;
  let page = null;
  if (p === "home") page = <HomePage onAdd={onAdd} />;
  else if (p === "products") page = <ProductsPage onAdd={onAdd} />;
  else if (p === "product") page = <ProductDetailPage onAdd={onAdd} />;
  else if (p === "stacks") page = <StacksPage onAddMany={onAddMany} />;
  else if (p === "calculator") page = <CalculatorPage />;
  else if (p === "howto") page = <HowToPage />;
  else if (p === "faq") page = <FaqPage />;
  else if (p === "about") page = <AboutPage />;
  else if (p === "contact") page = <ContactPage />;
  else if (p === "shipping") page = <ShippingPage />;
  else if (p === "returns") page = <ReturnsPage />;
  else if (p === "terms" || p === "privacy" || p === "disclaimer") page = <LegalPage kind={p} />;
  else if (p === "labresults") page = <LabResultsPage />;
  else if (p === "account") page = <AccountPage />;
  else if (p === "admin") page = <AdminPage />;

  return (
    <>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); const m = document.getElementById("main"); m && m.focus(); }}>{t("common.skip")}</a>
      <Nav count={count} onCart={() => setCartOpen(true)} bumpKey={bumpKey} />
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>
        <div key={`${p}:${route.param || ""}`} className="page-enter">{page}</div>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} total={total} onRemove={remove} onQty={setQty} onAdd={onAdd} onClear={clear} />
      {popup && !cartOpen && !isAdmin && <EmailPopup onClose={() => setPopup(false)} />}
      <ChatWidget hidden={isAdmin || cartOpen} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <RouterProvider>
          <ProductsProvider>
            <AuthProvider>
              <style>{G}</style>
              <Shell />
            </AuthProvider>
          </ProductsProvider>
        </RouterProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
