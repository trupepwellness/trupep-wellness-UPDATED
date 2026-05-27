import LOGO from "./logoData.js";
import { LOGO2 } from "./logoData.js";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  PRODUCTS, STACKS, PROMO_CODES, TESTIMONIALS, CATEGORIES,
  GOLD, BLACK, WHITE, SERIF, SANS,
} from "./data.jsx";

// ── CONFIG ──────────────────────────────────────────────────────
const FORMSPREE  = "https://formspree.io/f/xvzyzgqa";
const DIM        = "rgba(255,255,255,0.88)";
const DIM2       = "rgba(255,255,255,0.68)";
const BORDER     = "rgba(201,168,76,0.55)";
const GLASS      = "rgba(255,255,255,0.07)";
const GLASS2     = "rgba(255,255,255,0.13)";
const GOLD_GLOW  = "rgba(240,200,74,0.40)";
const GOLD2      = "#f5d980";
const fmt        = n => `$${Number(n).toFixed(2)}`;

// ── GLOBAL CSS ──────────────────────────────────────────────────
const G = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:${BLACK};color:${WHITE};font-family:${SANS};-webkit-font-smoothing:antialiased;overflow-x:hidden}
  a{color:inherit;text-decoration:none}
  button{cursor:pointer;border:none;background:none;font-family:inherit}
  input,textarea,select{outline:none;font-family:inherit;color:${WHITE};background:rgba(255,255,255,.05)}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${GOLD};border-radius:2px}

  @keyframes shimmer{0%,100%{opacity:.7}50%{opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideRight{from{transform:translateX(105%)}to{transform:translateX(0)}}
  @keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes floatMirror{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes borderScroll{0%{background-position:0% 0%}100%{background-position:200% 0%}}
  @keyframes pulseGlow{0%,100%{box-shadow:0 0 18px ${GOLD_GLOW}}50%{box-shadow:0 0 40px rgba(201,168,76,0.7)}}
  @keyframes particle{0%{transform:translateY(0) translateX(0);opacity:0}15%{opacity:1}85%{opacity:.6}100%{transform:translateY(-120vh) translateX(var(--dx,20px));opacity:0}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
  @keyframes revealUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes glowPulse{0%,100%{opacity:.55}50%{opacity:1}}
  @keyframes orbitCW{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(360deg)}}
  @keyframes orbitCCW{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(-360deg)}}
  @keyframes logoRing{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(360deg)}}
  @keyframes travelCW{0%{top:0%;left:0%}25%{top:0%;left:100%}50%{top:100%;left:100%}75%{top:100%;left:0%}100%{top:0%;left:0%}}
  @keyframes travelCCW{0%{top:0%;left:100%}25%{top:0%;left:0%}50%{top:100%;left:0%}75%{top:100%;left:100%}100%{top:0%;left:100%}}

  .card-hover{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
  .card-hover:hover{transform:scale(1.02);box-shadow:0 8px 40px rgba(201,168,76,0.30);border-color:${GOLD}!important}
  .btn-hover{transition:all .2s ease}
  .btn-hover:hover{transform:scale(1.03);box-shadow:0 0 20px ${GOLD_GLOW}}
  .reveal{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}
  .reveal.visible{opacity:1;transform:translateY(0)}
  .logo-ring{animation:logoRing 9s linear infinite}

  @media(max-width:768px){
    .hide-mobile{display:none!important}
    .show-mobile{display:flex!important}
    .grid-mobile-1{grid-template-columns:1fr!important}
  }
  @media(min-width:769px){.show-mobile{display:none!important}}
`;

// ── HOOKS ───────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

function useCart() {
  const [cart, setCart] = useState([]);
  const add = useCallback((product, variant) => {
    const key = `${product.id}::${variant.label}`;
    setCart(c => {
      const ex = c.find(i => i.key === key);
      if (ex) return c.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { key, name: product.name, variant, qty: 1 }];
    });
  }, []);
  const remove = useCallback(key => setCart(c => c.filter(i => i.key !== key)), []);
  const setQty  = useCallback((key, qty) =>
    setCart(c => qty < 1 ? c.filter(i => i.key !== key) : c.map(i => i.key === key ? { ...i, qty } : i))
  , []);
  const total = cart.reduce((s, i) => s + i.variant.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return { cart, add, remove, setQty, total, count };
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ── SHARED COMPONENTS ───────────────────────────────────────────
function Btn({ children, onClick, style = {}, outline, small }) {
  const base = {
    padding: small ? "9px 20px" : "13px 32px",
    fontSize: small ? 9 : 10,
    letterSpacing: 2,
    fontWeight: 600,
    textTransform: "uppercase",
    fontFamily: SANS,
    borderRadius: 2,
    position: "relative",
    overflow: "hidden",
    background: outline
      ? "transparent"
      : `linear-gradient(135deg, #b8922e 0%, ${GOLD} 40%, ${GOLD2} 60%, ${GOLD} 80%, #b8922e 100%)`,
    backgroundSize: "200% 200%",
    color: outline ? GOLD : BLACK,
    border: `1px solid ${GOLD}`,
    animation: outline ? "none" : "gradientShift 3s ease infinite",
    ...style,
  };
  return (
    <button
      className="btn-hover"
      style={base}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.background = outline
          ? `linear-gradient(135deg, #b8922e, ${GOLD}, ${GOLD2})` : `linear-gradient(135deg, #a07820, ${GOLD})`;
        e.currentTarget.style.color = BLACK;
        e.currentTarget.style.backgroundSize = "200% 200%";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = outline ? "transparent"
          : `linear-gradient(135deg, #b8922e 0%, ${GOLD} 40%, ${GOLD2} 60%, ${GOLD} 80%, #b8922e 100%)`;
        e.currentTarget.style.color = outline ? GOLD : BLACK;
        e.currentTarget.style.backgroundSize = "200% 200%";
      }}
    >{children}</button>
  );
}

const inp = {
  width: "100%", padding: "11px 15px", fontSize: 12,
  border: `1px solid ${BORDER}`, borderRadius: 4, marginBottom: 10,
  background: GLASS2, transition: "border-color .2s",
};

function GoldSeparator() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, margin:"40px 0" }}>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, transparent, ${BORDER})` }} />
      <div style={{ width:6, height:6, borderRadius:"50%", background:GOLD, animation:"pulseGlow 2s ease-in-out infinite", boxShadow:`0 0 10px ${GOLD}` }} />
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${BORDER}, transparent)` }} />
    </div>
  );
}

function TrustBar() {
  const items = [
    { icon:"🔬", label:"Lab Tested" },
    { icon:"⭐", label:"Research Grade" },
    { icon:"🔒", label:"Secure Checkout" },
    { icon:"✦",  label:"Premium Quality" },
    { icon:"🚀", label:"Fast Shipping" },
    { icon:"💬", label:"Free Consultation" },
  ];
  return (
    <div style={{ borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:"20px 24px", background:`linear-gradient(90deg, rgba(201,168,76,.08), rgba(201,168,76,.15), rgba(201,168,76,.08))` }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"16px 40px" }}>
        {items.map(({ icon, label }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>{icon}</span>
            <span style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"rgba(255,255,255,0.95)", fontWeight:600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 26 }, (_, i) => i);
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      {particles.map(i => {
        const left  = `${4 + (i * 71 % 92)}%`;
        const delay = `${(i * 1.1) % 9}s`;
        const dur   = `${18 + (i * 1.3) % 16}s`;   // 18–34s — much slower
        const size  = 3 + (i % 4);                   // 3–6px — bigger
        const dx    = `${-40 + (i * 41 % 80)}px`;
        const bright = i % 3 === 0 ? GOLD : i % 3 === 1 ? GOLD2 : "#ffe47a";
        return (
          <div key={i} style={{
            position:"absolute", bottom:"-12px", left,
            width:size, height:size, borderRadius:"50%",
            background: bright,
            animation:`particle ${dur} ${delay} ease-in infinite`,
            "--dx": dx,
            boxShadow:`0 0 ${size * 4}px ${bright}, 0 0 ${size * 2}px #fff8`,
            opacity:0.95,
          }} />
        );
      })}
      {/* no ambient dots */}
    </div>
  );
}

// ── FLOATING HERO LOGO ──────────────────────────────────────────
function FloatingHeroLogo() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:44 }}>

      {/* ── Primary floating logo ── */}
      <div style={{ position:"relative", animation:"float 3.5s ease-in-out infinite" }}>

        {/* Orbiting spark ring */}
        <div className="logo-ring" style={{
          position:"absolute", top:"50%", left:"50%",
          width:"112%", height:"112%",
          background:`conic-gradient(
            transparent 0deg,
            rgba(201,168,76,0.95) 2deg,
            rgba(255,252,200,1.0) 4deg,
            rgba(201,168,76,0.95) 6deg,
            transparent 9deg,
            transparent 360deg
          )`,
          borderRadius:"50%",
          maskImage:"radial-gradient(transparent 47%, black 49%, black 51%, transparent 53%)",
          WebkitMaskImage:"radial-gradient(transparent 47%, black 49%, black 51%, transparent 53%)",
          pointerEvents:"none", filter:"blur(0.6px)",
        }} />
        {/* Wide halo glow */}
        <div className="logo-ring" style={{
          position:"absolute", top:"50%", left:"50%",
          width:"130%", height:"130%",
          background:`conic-gradient(
            transparent 0deg,
            rgba(201,168,76,0.18) 0deg,
            rgba(201,168,76,0.52) 7deg,
            rgba(245,217,128,0.40) 12deg,
            rgba(201,168,76,0.18) 20deg,
            transparent 30deg,
            transparent 360deg
          )`,
          borderRadius:"50%",
          maskImage:"radial-gradient(transparent 30%, black 40%, black 60%, transparent 70%)",
          WebkitMaskImage:"radial-gradient(transparent 30%, black 40%, black 60%, transparent 70%)",
          pointerEvents:"none", filter:"blur(10px)",
        }} />

        {/* Pulsing outer ring border — REMOVED per user request */}

        {/* 3D light source — top-left key light */}
        <div style={{
          position:"absolute", top:"-18%", left:"-14%",
          width:"60%", height:"60%",
          background:"radial-gradient(circle, rgba(255,245,180,0.22) 0%, transparent 70%)",
          filter:"blur(18px)", pointerEvents:"none", zIndex:2,
        }} />

        {/* 3D shadow — bottom-right fill */}
        <div style={{
          position:"absolute", bottom:"-12%", right:"-10%",
          width:"55%", height:"55%",
          background:"radial-gradient(circle, rgba(0,0,0,0.55) 0%, transparent 70%)",
          filter:"blur(20px)", pointerEvents:"none", zIndex:2,
        }} />

        {/* Deep ambient gold glow behind */}
        <div style={{
          position:"absolute", inset:-50, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(201,168,76,0.28) 0%, rgba(201,168,76,0.08) 48%, transparent 68%)",
          filter:"blur(20px)", pointerEvents:"none",
        }} />

        {/* Logo image with layered 3D shadows */}
        <img
          src={LOGO2}
          alt="TruPep Wellness"
          style={{
            width:210, height:210, objectFit:"contain",
            position:"relative", display:"block", zIndex:3,
            filter:[
              "drop-shadow(0 0 36px rgba(240,200,74,0.75))",
              "drop-shadow(-4px -6px 12px rgba(255,245,160,0.35))",
              "drop-shadow(6px 10px 18px rgba(0,0,0,0.95))",
              "drop-shadow(0 2px 6px rgba(0,0,0,0.80))",
            ].join(" "),
          }}
        />
      </div>

      {/* ── Thin seam line between logo and reflection ── */}
      <div style={{
        width:150, height:1, marginTop:8,
        background:"linear-gradient(90deg, transparent, rgba(201,168,76,0.45), transparent)",
        flexShrink:0,
      }} />

      {/* ── Mirror reflection — forced below seam line ── */}
      <div style={{ lineHeight:0, flexShrink:0 }}>
        <div style={{
          transform:"scaleY(-1)",
          transformOrigin:"top center",
          display:"block",
        }}>
          <div style={{ animation:"floatMirror 3.5s ease-in-out infinite" }}>
            <img
              src={LOGO2}
              alt=""
              aria-hidden="true"
              style={{
                width:210, height:210, objectFit:"contain", display:"block",
                maskImage:"linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.22) 35%, rgba(0,0,0,0.06) 55%, transparent 70%)",
                WebkitMaskImage:"linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.22) 35%, rgba(0,0,0,0.06) 55%, transparent 70%)",
                filter:"blur(1.5px) drop-shadow(0 0 8px rgba(201,168,76,0.28))",
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

const sectionHead = (label, title, sub) => (
  <div className="reveal" style={{ textAlign:"center", marginBottom:52 }}>
    <div style={{ fontSize:10, letterSpacing:5, color:GOLD, textTransform:"uppercase", marginBottom:14, animation:"shimmer 3s ease-in-out infinite" }}>{label}</div>
    <h1 style={{ fontFamily:SERIF, fontSize:"clamp(30px,5vw,56px)", fontWeight:300, marginBottom: sub ? 14 : 0 }}>{title}</h1>
    {sub && <p style={{ fontSize:14, color:"rgba(255,255,255,0.88)", maxWidth:520, margin:"0 auto", lineHeight:1.9 }}>{sub}</p>}
  </div>
);

// ── GOLD BORDER FRAME ───────────────────────────────────────────
function GoldBorderFrame() {
  const [scrollPct, setScrollPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setScrollPct(el.scrollTop / (el.scrollHeight - el.clientHeight) || 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const vert = (side) => ({
    position:"fixed", top:0, bottom:0, [side]:0, width:3, zIndex:999, pointerEvents:"none",
    background:`linear-gradient(180deg, transparent 0%, ${GOLD} ${20 + scrollPct*40}%, ${GOLD2} ${40 + scrollPct*20}%, ${GOLD} ${60 + scrollPct*20}%, transparent 100%)`,
    opacity: 0.82 + scrollPct * 0.18,
    boxShadow:`0 0 12px rgba(201,168,76,0.6)`,
    transition:"background .1s",
  });
  const horiz = {
    position:"fixed", left:0, right:0, height:3, zIndex:999, pointerEvents:"none",
    background:`linear-gradient(90deg, transparent, ${GOLD}, ${GOLD2}, ${GOLD}, transparent)`,
    backgroundSize:"200% 100%",
    animation:"borderScroll 3s linear infinite",
    opacity:.90,
    boxShadow:`0 0 12px rgba(201,168,76,0.55)`,
  };
  return (
    <>
      <div style={{ ...horiz, top:0 }} />
      <div style={{ ...horiz, bottom:0 }} />
      <div style={vert("left")} />
      <div style={vert("right")} />
    </>
  );
}

// ── NAV ─────────────────────────────────────────────────────────
const LINKS = [
  ["Products","products"],["Stacks","stacks"],["Calculator","calculator"],
  ["How To Use","howto"],["About","about"],["Contact","contact"],
];

function Nav({ count, onCart, setPage, page }) {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobile = useWidth() < 769;
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const go = p => { setPage(p); setOpen(false); };
  const linkStyle = active => ({
    fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600,
    color: active ? GOLD : DIM2, background: "none", border: "none", cursor: "pointer",
    paddingBottom: 2, borderBottom: active ? `1px solid ${GOLD}` : "1px solid transparent",
    transition: "color .2s, border-color .2s",
  });
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? "rgba(8,8,8,.97)" : "rgba(10,10,10,.88)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${scrolled ? "rgba(201,168,76,0.25)" : "transparent"}`,
      transition: "all .3s",
    }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 28px", height:68, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Logo */}
        <div onClick={() => go("home")} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ position:"relative" }}>
            <div style={{
              position:"absolute", inset:-8, borderRadius:"50%",
              background:`radial-gradient(circle, rgba(201,168,76,0.35) 0%, transparent 70%)`,
              animation:"glowPulse 2.5s ease-in-out infinite",
              filter:"blur(5px)",
            }} />
            <img src={LOGO} alt="TruPep" style={{ width:42, height:42, objectFit:"contain", position:"relative", animation:"float 3.5s ease-in-out infinite" }} />
          </div>
          <div>
            <div style={{ fontFamily:SERIF, fontSize:19, fontWeight:300, color:GOLD, letterSpacing:3, lineHeight:1 }}>TruPep</div>
            <div style={{ fontSize:7, letterSpacing:4, color:DIM2, textTransform:"uppercase" }}>Wellness</div>
          </div>
        </div>

        {/* Desktop links */}
        {!mobile && (
          <div style={{ display:"flex", gap:30, alignItems:"center" }}>
            {LINKS.map(([l, id]) => (
              <button key={id} onClick={() => go(id)} style={linkStyle(page === id)}
                onMouseEnter={e => e.currentTarget.style.color = GOLD}
                onMouseLeave={e => e.currentTarget.style.color = page === id ? GOLD : DIM2}
              >{l}</button>
            ))}
          </div>
        )}

        {/* Cart + hamburger */}
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          <button onClick={onCart} style={{
            position:"relative", width:40, height:40, borderRadius:"50%",
            border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:17, transition:"all .2s", background:GLASS,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.boxShadow=`0 0 14px ${GOLD_GLOW}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.boxShadow="none"; }}
          >
            🛒
            {count > 0 && (
              <span style={{
                position:"absolute", top:-3, right:-3,
                background:`linear-gradient(135deg,${GOLD},${GOLD2})`,
                color:BLACK, fontSize:8, fontWeight:700, borderRadius:"50%",
                width:17, height:17, display:"flex", alignItems:"center", justifyContent:"center",
              }}>{count}</span>
            )}
          </button>
          {mobile && (
            <button onClick={() => setOpen(o => !o)} style={{ fontSize:20, color:WHITE, width:38, height:38, border:`1px solid ${BORDER}`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {open ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobile && open && (
        <div style={{ background:"rgba(18,18,18,1)", borderTop:`1px solid rgba(201,168,76,0.55)` }}>
          {LINKS.map(([l, id]) => (
            <button key={id} onClick={() => go(id)} style={{
              display:"block", width:"100%", padding:"18px 28px", textAlign:"left",
              fontSize:14, letterSpacing:3, textTransform:"uppercase", fontWeight:700,
              color: page === id ? GOLD : "#ffffff",
              background: page === id ? "rgba(201,168,76,0.1)" : "none",
              border:"none", borderBottom:`1px solid rgba(201,168,76,0.35)`,
              cursor:"pointer", transition:"color .2s, background .2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = GOLD; e.currentTarget.style.background = "rgba(201,168,76,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = page === id ? GOLD : "#ffffff"; e.currentTarget.style.background = page === id ? "rgba(201,168,76,0.1)" : "none"; }}
            >{l}</button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ── FOOTER ──────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ borderTop:`1px solid rgba(201,168,76,0.35)`, padding:"56px 24px 32px", marginTop:80, background:"rgba(10,10,10,0.98)" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:44, marginBottom:48 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <img src={LOGO} alt="TruPep" style={{ width:34, height:34, objectFit:"contain" }} />
              <div style={{ fontFamily:SERIF, fontSize:18, color:GOLD, letterSpacing:3 }}>TruPep Wellness</div>
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.92)", lineHeight:1.9 }}>Miami's premier advanced peptide wellness source. Research compounds for the serious professional.</div>
          </div>
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:16 }}>Navigate</div>
            {LINKS.map(([l, id]) => (
              <button key={id} onClick={() => setPage(id)} style={{ display:"block", padding:"6px 0", color:"rgba(255,255,255,0.92)", fontSize:12, background:"none", border:"none", cursor:"pointer", letterSpacing:1, transition:"color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = GOLD}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.92)"}
              >{l}</button>
            ))}
          </div>
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:16 }}>Legal</div>
            {[["Terms of Service","terms"],["Privacy Policy","privacy"],["Research Disclaimer","disclaimer"]].map(([l, id]) => (
              <button key={id} onClick={() => setPage(id)} style={{ display:"block", padding:"6px 0", color:"rgba(255,255,255,0.92)", fontSize:12, background:"none", border:"none", cursor:"pointer", letterSpacing:1, transition:"color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = GOLD}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.92)"}
              >{l}</button>
            ))}
          </div>
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:16 }}>Contact</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.92)", lineHeight:2.4 }}>
              <div>trupepwellness@gmail.com</div>
              <div>423-444-3668</div>
              <div>Miami, Florida</div>
            </div>
          </div>
        </div>
        <GoldSeparator />
        <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:14, paddingTop:8 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.78)", lineHeight:1.8, maxWidth:700 }}>
            All products are strictly for research and educational purposes only. Not intended for human consumption. These statements have not been evaluated by the FDA. Always consult a licensed healthcare professional before any wellness protocol. For adults 18+ only.
          </p>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.70)" }}>© {new Date().getFullYear()} TruPep Wellness</div>
        </div>
      </div>
    </footer>
  );
}

// ── EMAIL POPUP ─────────────────────────────────────────────────
function EmailPopup({ onClose }) {
  const [email, setEmail] = useState("");
  const [done,  setDone]  = useState(false);
  const submit = async () => {
    if (!email.includes("@")) return;
    const fd = new FormData();
    fd.append("email", email);
    fd.append("_subject", "New Signup — WELCOME10");
    try { await fetch(FORMSPREE, { method:"POST", body:fd }); } catch (_) {}
    setDone(true);
    setTimeout(onClose, 3200);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"linear-gradient(145deg,#111,#0d0d0d)",
        border:`1px solid ${GOLD}`,
        boxShadow:`0 0 50px ${GOLD_GLOW}, 0 0 120px rgba(201,168,76,0.08)`,
        padding:"48px 38px", maxWidth:430, width:"100%", borderRadius:4, animation:"popIn .3s ease",
      }}>
        {done ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:SERIF, fontSize:32, color:GOLD, marginBottom:12 }}>Welcome.</div>
            <div style={{ fontSize:12, color:DIM, lineHeight:1.8 }}>Your code <strong style={{ color:GOLD }}>WELCOME10</strong> is ready at checkout.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:12 }}>Exclusive Offer</div>
            <div style={{ fontFamily:SERIF, fontSize:32, fontWeight:300, marginBottom:10 }}>10% Off Your First Order</div>
            <div style={{ fontSize:12, color:DIM, lineHeight:1.85, marginBottom:26 }}>Join the TruPep community for early access to new compounds, protocols, and member pricing.</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address"
              style={{ ...inp, marginBottom:14 }}
              onFocus={e => e.target.style.borderColor = GOLD}
              onBlur={e => e.target.style.borderColor = BORDER}
            />
            <Btn onClick={submit} style={{ width:"100%" }}>Claim 10% Off</Btn>
            <button onClick={onClose} style={{ display:"block", margin:"16px auto 0", fontSize:10, color:"rgba(255,255,255,.25)", letterSpacing:1 }}>No thanks</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── CART DRAWER ─────────────────────────────────────────────────
function CartDrawer({ cart, total, onClose, onRemove, onQty, onAdd }) {
  const [step,     setStep]     = useState("cart");
  const [promo,    setPromo]    = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [form,     setForm]     = useState({ name:"", email:"", phone:"", street:"", city:"", state:"", zip:"", notes:"" });
  const [sending,  setSending]  = useState(false);
  const [submitError, setSubmitError] = useState("");

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (PROMO_CODES[code]) { setDiscount(PROMO_CODES[code]); setPromoMsg(`✓ ${PROMO_CODES[code]}% discount applied`); }
    else { setPromoMsg("Invalid code. Please try again."); setDiscount(0); }
  };
  const discounted = total * (1 - discount / 100);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.street) {
      alert("Please fill in your name, email, and address before submitting.");
      return;
    }
    setSending(true);
    setSubmitError("");
    try {
      const orderLines = cart.map(i =>
        `${i.name} (${i.variant.label}) x${i.qty} — ${fmt(i.variant.price * i.qty)}`
      ).join("\n");

      const payload = {
        ...form,
        _subject: `New TruPep Order — ${form.name}`,
        _replyto: form.email,
        order: orderLines,
        order_total: fmt(discounted),
        ...(discount ? { promo_discount: `${discount}%` } : {}),
      };

      const res = await fetch(FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try { data = await res.json(); } catch (_) {}

      if (res.ok) {
        setStep("payment");
      } else {
        const msg = data.errors?.map(e => e.message).join(", ")
          || data.error
          || `Error ${res.status} — please email trupepwellness@gmail.com directly.`;
        setSubmitError(msg);
        setSending(false);
      }
    } catch (err) {
      setSubmitError("Network error. Please email trupepwellness@gmail.com or try again.");
      setSending(false);
    }
  };

  const stepLabel = { cart:"Your Cart", checkout:"Checkout", payment:"Payment" }[step];
  const cartInp = { ...inp, marginBottom:9 };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex" }}>
      <div onClick={onClose} style={{ flex:1, background:"rgba(0,0,0,.65)" }} />
      <div style={{
        width:"min(430px,100vw)", background:"linear-gradient(180deg,#111,#0d0d0d)",
        borderLeft:`1px solid ${BORDER}`, display:"flex", flexDirection:"column",
        animation:"slideRight .3s ease", overflowY:"auto",
        boxShadow:`-8px 0 40px rgba(0,0,0,.6)`,
      }}>
        <div style={{ padding:"20px 26px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:GLASS }}>
          <span style={{ fontFamily:SERIF, fontSize:21, color:GOLD }}>{stepLabel}</span>
          <button onClick={onClose} style={{ color:DIM, fontSize:24, lineHeight:1, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        <div style={{ flex:1, padding:"24px 26px" }}>

          {/* ── CART ── */}
          {step === "cart" && (
            cart.length === 0
              ? <div style={{ textAlign:"center", paddingTop:70, color:DIM2, fontSize:12 }}>Your cart is empty.</div>
              : <>
                  {cart.map(item => (
                    <div key={item.key} style={{ display:"flex", gap:12, marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${BORDER}` }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{item.name}</div>
                        <div style={{ fontSize:10, color:DIM2 }}>{item.variant.label}</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                        <div style={{ fontSize:14, color:GOLD, fontFamily:SERIF }}>{fmt(item.variant.price * item.qty)}</div>
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          <button onClick={() => onQty(item.key, item.qty - 1)} style={{ width:26, height:26, border:`1px solid ${BORDER}`, color:DIM, fontSize:16, borderRadius:3 }}>−</button>
                          <span style={{ fontSize:12, minWidth:18, textAlign:"center" }}>{item.qty}</span>
                          <button onClick={() => onQty(item.key, item.qty + 1)} style={{ width:26, height:26, border:`1px solid ${BORDER}`, color:WHITE, fontSize:16, borderRadius:3 }}>+</button>
                          <button onClick={() => onRemove(item.key)} style={{ color:"rgba(255,80,80,.6)", fontSize:11, marginLeft:4 }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* BAC Water upsell */}
                  {!cart.some(i => i.name === "BAC Water") && (
                    <div style={{ background:`linear-gradient(135deg, rgba(201,168,76,.08), rgba(201,168,76,.04))`, border:`1px solid ${GOLD}`, borderLeft:`3px solid ${GOLD}`, padding:"14px 16px", marginBottom:18, borderRadius:3 }}>
                      <div style={{ fontSize:9, letterSpacing:2, color:GOLD, textTransform:"uppercase", marginBottom:5 }}>Required for Reconstitution</div>
                      <div style={{ fontSize:11, marginBottom:10, lineHeight:1.7, color:DIM }}>Don't forget <strong style={{ color:WHITE }}>BAC Water</strong> — needed to reconstitute every vial before use.</div>
                      <button onClick={() => onAdd(PRODUCTS.find(p => p.id === "bacwater"), PRODUCTS.find(p => p.id === "bacwater").variants[0])}
                        className="btn-hover"
                        style={{ padding:"7px 16px", border:`1px solid ${GOLD}`, color:GOLD, fontSize:9, letterSpacing:2, textTransform:"uppercase", background:"none", borderRadius:2 }}>
                        + Add BAC Water — $18
                      </button>
                    </div>
                  )}

                  {/* Promo */}
                  <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                    <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Promo code"
                      style={{ flex:1, padding:"10px 13px", fontSize:11, border:`1px solid ${BORDER}`, borderRadius:4, background:GLASS2 }}
                      onFocus={e => e.target.style.borderColor = GOLD}
                      onBlur={e => e.target.style.borderColor = BORDER}
                    />
                    <button onClick={applyPromo} style={{ padding:"10px 16px", border:`1px solid ${GOLD}`, color:GOLD, fontSize:9, letterSpacing:1, borderRadius:3 }}>Apply</button>
                  </div>
                  {promoMsg && <div style={{ fontSize:10, color: discount ? "#7dca7d" : "#ff6b6b", marginBottom:16 }}>{promoMsg}</div>}

                  <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:14, marginBottom:22 }}>
                    {discount > 0 && <>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:DIM2, marginBottom:4 }}><span>Subtotal</span><span>{fmt(total)}</span></div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#7dca7d", marginBottom:4 }}><span>Discount ({discount}%)</span><span>−{fmt(total - discounted)}</span></div>
                    </>}
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:600 }}><span>Total</span><span style={{ color:GOLD, fontFamily:SERIF }}>{fmt(discounted)}</span></div>
                  </div>
                  <Btn onClick={() => setStep("checkout")} style={{ width:"100%" }}>Proceed to Checkout</Btn>
                </>
          )}

          {/* ── CHECKOUT ── */}
          {step === "checkout" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:20 }}>Shipping Information</div>
              {[["name","Full Name"],["email","Email Address"],["phone","Phone Number"],["street","Street Address"]].map(([k, ph]) => (
                <input key={k} placeholder={ph} value={form[k]} onChange={set(k)} style={cartInp}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 70px 90px", gap:8, marginBottom:10 }}>
                {["city","state","zip"].map(k => (
                  <input key={k} placeholder={k[0].toUpperCase() + k.slice(1)} value={form[k]} onChange={set(k)}
                    style={{ padding:"10px 12px", fontSize:12, border:`1px solid ${BORDER}`, borderRadius:4, background:GLASS2 }}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                ))}
              </div>
              <textarea value={form.notes} onChange={set("notes")} placeholder="Notes (optional)" rows={3}
                style={{ ...cartInp, resize:"none" }} />
              <div style={{ background:`rgba(201,168,76,.07)`, border:`1px solid ${BORDER}`, padding:"11px 15px", marginBottom:22, fontSize:11, color:DIM, borderRadius:3 }}>
                Total due: <strong style={{ color:GOLD }}>{fmt(discounted)}</strong>
              </div>
              <Btn onClick={submit} style={{ width:"100%" }}>{sending ? "Sending..." : "Submit Order"}</Btn>
              {submitError && <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.3)", borderRadius:4, fontSize:11, color:"#ff8080", lineHeight:1.7 }}>{submitError}</div>}
              <button onClick={() => setStep("cart")} style={{ display:"block", width:"100%", marginTop:10, padding:11, border:`1px solid ${BORDER}`, color:DIM2, fontSize:10, letterSpacing:1, borderRadius:3 }}>← Back to Cart</button>
            </div>
          )}

          {/* ── PAYMENT ── */}
          {step === "payment" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:10 }}>Complete Payment</div>
              <div style={{ fontSize:12, color:DIM, lineHeight:1.85, marginBottom:26 }}>
                Send <strong style={{ color:GOLD }}>{fmt(discounted)}</strong> via any method below. Include your name in the memo.
              </div>
              {[["Zelle","(423) 444-3668 — Tristan Trujillo"],["Venmo","@TruPepWellness"],["PayPal","@ItsTrinchy"]].map(([method, handle]) => (
                <div key={method} style={{ padding:"15px 18px", border:`1px solid ${BORDER}`, marginBottom:10, borderRadius:3, background:GLASS }}>
                  <div style={{ fontSize:9, letterSpacing:2, color:GOLD, marginBottom:4 }}>{method}</div>
                  <div style={{ fontSize:13 }}>{handle}</div>
                </div>
              ))}
              <div style={{ marginTop:18, padding:14, background:`rgba(201,168,76,.06)`, border:`1px solid ${BORDER}`, fontSize:11, color:DIM, lineHeight:1.8, borderRadius:3 }}>
                Confirmation sent to <strong style={{ color:WHITE }}>{form.email}</strong>. Your order is processed within 1 business day of payment receipt.
              </div>
              <button onClick={onClose} style={{ display:"block", width:"100%", marginTop:18, padding:12, border:`1px solid ${BORDER}`, color:DIM2, fontSize:10, letterSpacing:1, borderRadius:3 }}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PRODUCT CARD ────────────────────────────────────────────────
function ProductCard({ product, onAdd, idx = 0 }) {
  const [sel,   setSel]   = useState(0);
  const [added, setAdded] = useState(false);
  const v = product.variants[sel];
  const handleAdd = () => {
    onAdd(product, v);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  const cw = idx % 2 === 0;
  const dot = {
    position:"absolute", width:6, height:6, borderRadius:"50%",
    background:`radial-gradient(circle, #ffffff 0%, ${GOLD2} 35%, ${GOLD} 60%, transparent 100%)`,
    boxShadow:`0 0 6px 2px rgba(240,200,74,0.90), 0 0 14px 5px rgba(240,200,74,0.50)`,
    transform:"translate(-50%,-50%)",
    animation:`${cw ? "travelCW 14s" : "travelCCW 19s"} linear infinite`,
    zIndex:10, pointerEvents:"none",
  };
  return (
    <div style={{ borderRadius:8 }}>
      <div className="card-hover"
        style={{
          border:`1px solid ${BORDER}`, borderRadius:6,
          padding:24, display:"flex", flexDirection:"column",
          background:`linear-gradient(145deg, ${GLASS2}, ${GLASS})`,
          backdropFilter:"blur(8px)", position:"relative", overflow:"hidden",
        }}
      >
        {/* Dot inside overflow:hidden — fully contained */}
        <div style={dot} />
        <div style={{ fontSize:10, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:8 }}>{product.cat}</div>
        <div style={{ fontFamily:SERIF, fontSize:22, marginBottom:10 }}>{product.name}</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.90)", lineHeight:1.85, flex:1, marginBottom:18 }}>{product.desc}</div>

        {product.variants.length > 1 && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
            {product.variants.map((vv, i) => (
              <button key={i} onClick={() => setSel(i)} style={{
                padding:"6px 15px", fontSize:11, letterSpacing:1, borderRadius:20,
                border:`1px solid ${i === sel ? GOLD : BORDER}`,
                color: i === sel ? GOLD : "rgba(255,255,255,0.85)",
                background: i === sel ? "rgba(201,168,76,0.12)" : "none",
                transition:"all .2s",
              }}>{vv.label}</button>
            ))}
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:SERIF, fontSize:24, color:GOLD }}>{fmt(v.price)}</span>
          <button onClick={handleAdd} className="btn-hover" style={{
            padding:"9px 20px", fontSize:10, letterSpacing:2, textTransform:"uppercase",
            borderRadius:3, transition:"all .2s",
            background: added ? `linear-gradient(135deg,${GOLD},${GOLD2})` : "transparent",
            border:`1px solid ${GOLD}`,
            color: added ? BLACK : GOLD,
          }}>{added ? "Added ✓" : "Add to Cart"}</button>
        </div>
      </div>
    </div>
  );
}

// ── HOME PAGE ───────────────────────────────────────────────────
function HomePage({ setPage, onAdd }) {
  useReveal();
  const featured = PRODUCTS.filter(p => ["retatrutide","bpc157","nad","tb500"].includes(p.id));
  return (
    <>
      {/* Hero */}
      <div style={{ padding:"148px 24px 90px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <FloatingParticles />
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 60%, rgba(201,168,76,0.07) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <FloatingHeroLogo />
          <div style={{ fontSize:9, letterSpacing:6, color:GOLD, textTransform:"uppercase", marginBottom:24, animation:"shimmer 3s ease-in-out infinite" }}>Miami's Premier Peptide Wellness</div>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(42px,7.5vw,96px)", fontWeight:300, lineHeight:1.04, marginBottom:24, animation:"revealUp .8s ease forwards" }}>
            Advanced Research<br /><span style={{ color:GOLD, textShadow:`0 0 40px ${GOLD_GLOW}` }}>Peptide Compounds</span>
          </h1>
          <p style={{ fontSize:14, color:DIM, maxWidth:520, margin:"0 auto 40px", lineHeight:1.9, animation:"revealUp .8s .15s ease both" }}>
            25 premium research compounds. 7 curated protocol stacks. Uncompromising quality for serious wellness research.
          </p>
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", animation:"revealUp .8s .3s ease both" }}>
            <Btn onClick={() => setPage("products")}>Shop All Compounds</Btn>
            <Btn onClick={() => setPage("stacks")} outline>View Protocol Stacks</Btn>
          </div>
        </div>
      </div>

      <TrustBar />

      {/* Stats */}
      <div className="reveal" style={{ padding:"52px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:24, textAlign:"center" }}>
          {[["25+","Compounds",0],["7","Protocol Stacks",1],["Miami","Based",2],["Free","Consultation",3]].map(([n, l, i]) => (
            <div key={l} style={{ borderRadius:8 }}>
              <div style={{
                padding:"24px 16px", border:`1px solid ${BORDER}`, borderRadius:8,
                background:GLASS, textAlign:"center", position:"relative", overflow:"hidden",
              }}>
                <div style={{
                  position:"absolute", width:6, height:6, borderRadius:"50%",
                  background:`radial-gradient(circle, #ffffff 0%, ${GOLD2} 35%, ${GOLD} 60%, transparent 100%)`,
                  boxShadow:`0 0 6px 2px rgba(240,200,74,0.90), 0 0 14px 5px rgba(240,200,74,0.50)`,
                  transform:"translate(-50%,-50%)",
                  animation:`${i % 2 === 0 ? "travelCW 14s" : "travelCCW 19s"} linear infinite`,
                  zIndex:2, pointerEvents:"none",
                }} />
                <div style={{ fontFamily:SERIF, fontSize:32, color:GOLD, marginBottom:8, position:"relative", zIndex:3 }}>{n}</div>
                <div style={{ fontSize:11, letterSpacing:2, color:"rgba(255,255,255,0.82)", textTransform:"uppercase", position:"relative", zIndex:3 }}>{l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GoldSeparator />

      {/* Featured products */}
      <div style={{ padding:"20px 24px 80px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div className="reveal" style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:10, letterSpacing:5, color:GOLD, textTransform:"uppercase", marginBottom:12 }}>Featured</div>
            <h2 style={{ fontFamily:SERIF, fontSize:"clamp(26px,4vw,44px)", fontWeight:300 }}>Top Research Compounds</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:24 }}>
            {featured.map((p, i) => <ProductCard key={p.id} product={p} onAdd={onAdd} idx={i} />)}
          </div>
          <div className="reveal" style={{ textAlign:"center", marginTop:44 }}>
            <Btn onClick={() => setPage("products")} outline>View All 25 Compounds</Btn>
          </div>
        </div>
      </div>

      <GoldSeparator />

      {/* Testimonials */}
      <div style={{ padding:"60px 24px 80px", background:"rgba(8,8,8,.7)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          {sectionHead("Results","Client Experiences")}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:22 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="reveal" style={{ borderRadius:8 }}>
                <div className="card-hover"
                  style={{ padding:28, border:`1px solid ${BORDER}`, borderRadius:6, background:GLASS2, position:"relative", overflow:"hidden" }}>
                  <div style={{
                    position:"absolute", width:6, height:6, borderRadius:"50%",
                    background:`radial-gradient(circle, #ffffff 0%, ${GOLD2} 35%, ${GOLD} 60%, transparent 100%)`,
                    boxShadow:`0 0 6px 2px rgba(240,200,74,0.90), 0 0 14px 5px rgba(240,200,74,0.50)`,
                    transform:"translate(-50%,-50%)",
                    animation:`${i % 2 === 0 ? "travelCW 14s" : "travelCCW 19s"} linear infinite`,
                    zIndex:2, pointerEvents:"none",
                  }} />
                  <div style={{ color:GOLD, marginBottom:11, fontSize:16, letterSpacing:2, position:"relative", zIndex:3 }}>{"★".repeat(t.stars)}</div>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.90)", lineHeight:1.9, marginBottom:16, position:"relative", zIndex:3 }}>"{t.text}"</p>
                  <div style={{ fontSize:11, letterSpacing:2, color:"rgba(255,255,255,0.70)", position:"relative", zIndex:3 }}>— {t.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="reveal" style={{ padding:"80px 24px", textAlign:"center", borderTop:`1px solid ${BORDER}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.06), transparent 60%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:580, margin:"0 auto", position:"relative" }}>
          <h2 style={{ fontFamily:SERIF, fontSize:"clamp(26px,4vw,46px)", fontWeight:300, marginBottom:16 }}>
            Ready to Begin Your <span style={{ color:GOLD }}>Research Protocol?</span>
          </h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.88)", lineHeight:1.9, marginBottom:36 }}>Use our peptide calculator to determine your exact dosing, or reach out for a free consultation.</p>
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn onClick={() => setPage("calculator")}>Peptide Calculator</Btn>
            <Btn onClick={() => setPage("contact")} outline>Free Consultation</Btn>
          </div>
        </div>
      </div>
    </>
  );
}

// ── PRODUCTS PAGE ───────────────────────────────────────────────
function ProductsPage({ onAdd }) {
  useReveal();
  const [search, setSearch] = useState("");
  const [cat,    setCat]    = useState("All");
  const filtered = PRODUCTS.filter(p =>
    (cat === "All" || p.cat === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        {sectionHead("Catalog","All Research Compounds","Premium lyophilized peptides. Research grade. Competitively priced.")}

        {/* Search */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:22 }}>
          <div style={{ position:"relative", width:"100%", maxWidth:360 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search compounds..."
              style={{ ...inp, marginBottom:0, borderRadius:24, paddingLeft:18 }}
              onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 16px ${GOLD_GLOW}`; }}
              onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginBottom:48 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} className="btn-hover" style={{
              padding:"7px 18px", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", borderRadius:24,
              border:`1px solid ${c === cat ? GOLD : BORDER}`,
              color: c === cat ? GOLD : DIM2,
              background: c === cat ? "rgba(201,168,76,0.1)" : GLASS,
              transition:"all .2s",
            }}>{c}</button>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:24 }}>
          {filtered.map((p, i) => <ProductCard key={p.id} product={p} onAdd={onAdd} idx={i} />)}
        </div>
        {filtered.length === 0 && <div style={{ textAlign:"center", padding:70, color:DIM2, fontSize:12 }}>No compounds found.</div>}
      </div>
    </div>
  );
}

// ── STACKS PAGE ─────────────────────────────────────────────────
function StacksPage({ setPage }) {
  useReveal();
  const [active, setActive] = useState(null);
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:1160, margin:"0 auto" }}>
        {sectionHead("Research Protocols","Curated Peptide Stacks","Each stack targets a specific research outcome. Tap any card to expand compounds and pricing.")}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:24, marginBottom:60 }}>
          {STACKS.map((s, si) => {
            const isOpen = active === s.id;
            return (
              <div key={s.id} style={{ borderRadius:10 }}>
              <div className={isOpen ? "" : "card-hover"}
                style={{
                  border:`1px solid ${isOpen ? GOLD : BORDER}`, borderRadius:8,
                  background:`linear-gradient(145deg, ${GLASS2}, ${GLASS})`,
                  backdropFilter:"blur(8px)",
                  transition:"all .25s",
                  boxShadow: isOpen ? `0 0 32px ${GOLD_GLOW}` : "none",
                  cursor:"pointer",
                  animation: isOpen ? "pulseGlow 2.5s ease-in-out infinite" : "none",
                  position:"relative", overflow:"hidden",
                }}
                onClick={() => setActive(isOpen ? null : s.id)}
              >
                {/* Dot inside overflow:hidden — fully contained */}
                <div style={{
                  position:"absolute", width:6, height:6, borderRadius:"50%",
                  background:`radial-gradient(circle, #ffffff 0%, ${GOLD2} 35%, ${GOLD} 60%, transparent 100%)`,
                  boxShadow:`0 0 6px 2px rgba(240,200,74,0.90), 0 0 14px 5px rgba(240,200,74,0.50)`,
                  transform:"translate(-50%,-50%)",
                  animation:`${si % 2 === 0 ? "travelCW 14s" : "travelCCW 19s"} linear infinite`,
                  zIndex:2, pointerEvents:"none",
                }} />
                <div style={{ padding:"28px 28px 24px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <span style={{ fontSize:36, lineHeight:1 }}>{s.icon}</span>
                    <div style={{ fontSize:22, color: isOpen ? GOLD : "rgba(255,255,255,0.75)", transition:"color .2s", fontWeight:300 }}>{isOpen ? "−" : "+"}</div>
                  </div>
                  <div style={{ fontSize:10, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginTop:16, marginBottom:6 }}>{s.tagline}</div>
                  <div style={{ fontFamily:SERIF, fontSize:24, marginBottom:10 }}>{s.name}</div>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.88)", lineHeight:1.85 }}>{s.desc}</p>
                </div>

                <div style={{ overflow:"hidden", maxHeight: isOpen ? "700px" : "0", transition:"max-height .4s ease" }}>
                  <div style={{ borderTop:`1px solid ${BORDER}`, padding:"20px 28px 28px" }}>
                    <div style={{ fontSize:10, letterSpacing:2, color:GOLD, textTransform:"uppercase", marginBottom:16 }}>Stack Compounds</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 18px", marginBottom:22 }}>
                      {s.peptides.map(name => {
                        const p = PRODUCTS.find(pr => pr.name === name || name.startsWith(pr.name.split(" ")[0]));
                        return (
                          <div key={name} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                            <span style={{ color:GOLD, fontSize:8, flexShrink:0, marginTop:4 }}>◆</span>
                            <div>
                              <div style={{ fontSize:12, lineHeight:1.5, color:"rgba(255,255,255,0.92)" }}>{name}</div>
                              {p && <div style={{ fontSize:10, color:GOLD, marginTop:2 }}>{p.variants.map(v => `${v.label} — $${v.price}`).join(" · ")}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={e => { e.stopPropagation(); setPage("products"); }} className="btn-hover"
                      style={{
                        width:"100%", padding:"12px 0",
                        background:`linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.06))`,
                        border:`1px solid ${GOLD}`,
                        color:GOLD, fontSize:11, letterSpacing:2, textTransform:"uppercase", borderRadius:4,
                        transition:"all .2s",
                      }}>Shop These Compounds →</button>
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>

        <div className="reveal" style={{ textAlign:"center", padding:"48px 36px", border:`1px solid ${BORDER}`, borderRadius:8, background:GLASS, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.07), transparent 60%)", pointerEvents:"none" }} />
          <div style={{ fontFamily:SERIF, fontSize:"clamp(22px,3vw,34px)", marginBottom:12, position:"relative" }}>Need a Custom Protocol?</div>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.88)", marginBottom:30, lineHeight:1.85, maxWidth:440, margin:"0 auto 30px" }}>
            Tell us your research goals and we'll build a personalized stack recommendation at no cost.
          </p>
          <Btn onClick={() => setPage("contact")}>Free Consultation</Btn>
        </div>
      </div>
    </div>
  );
}

// ── CALCULATOR PAGE ─────────────────────────────────────────────
function SyringeViz({ units }) {
  const maxUnits = 100;
  const clampedUnits = Math.min(units, maxUnits);
  const fillPct = clampedUnits / maxUnits;

  const barrelTop = 96;
  const barrelBot = 340;
  const barrelH   = barrelBot - barrelTop;
  // fillBottomY == exact pixel of the unit tick — no adjustments
  const fillBottomY = barrelTop + fillPct * barrelH;
  const cx = 50;

  // Every 10 units labelled
  const tickUnits = [0,10,20,30,40,50,60,70,80,90,100];

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:24, marginBottom:32 }}>
      <svg width="120" height="420" viewBox="0 0 120 420" style={{ overflow:"visible" }}>
        <defs>
          <linearGradient id="ndl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#7a5c1e" stopOpacity="0.9"/>
            <stop offset="22%"  stopColor="#c9a84c" stopOpacity="1"/>
            <stop offset="42%"  stopColor="#fff8d0" stopOpacity="1"/>
            <stop offset="58%"  stopColor="#e8c84a" stopOpacity="1"/>
            <stop offset="100%" stopColor="#7a5c1e" stopOpacity="0.8"/>
          </linearGradient>
          <linearGradient id="hub" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(201,168,76,0.5)"/>
            <stop offset="40%"  stopColor="rgba(240,200,74,0.9)"/>
            <stop offset="100%" stopColor="rgba(150,120,40,0.5)"/>
          </linearGradient>
          <linearGradient id="brl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(201,168,76,0.55)"/>
            <stop offset="15%"  stopColor="rgba(255,240,160,0.15)"/>
            <stop offset="50%"  stopColor="rgba(201,168,76,0.04)"/>
            <stop offset="85%"  stopColor="rgba(255,240,160,0.12)"/>
            <stop offset="100%" stopColor="rgba(201,168,76,0.50)"/>
          </linearGradient>
          <linearGradient id="fld" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(180,140,30,0.80)"/>
            <stop offset="35%"  stopColor="rgba(240,200,74,0.95)"/>
            <stop offset="55%"  stopColor="rgba(255,240,140,1.0)"/>
            <stop offset="100%" stopColor="rgba(180,140,30,0.80)"/>
          </linearGradient>
          <linearGradient id="plg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(201,168,76,0.55)"/>
            <stop offset="50%"  stopColor="rgba(240,200,74,0.80)"/>
            <stop offset="100%" stopColor="rgba(160,125,35,0.55)"/>
          </linearGradient>
        </defs>

        {/* ── 32g NEEDLE — 5/16" short, hair-thin ── */}
        <line x1={cx} y1="48" x2={cx} y2="52" stroke="#fffce0" strokeWidth="0.5" opacity="0.95"/>
        <polygon points={`${cx-0.3},48 ${cx+0.3},48 ${cx+1.2},76 ${cx-1.2},76`} fill="url(#ndl)"/>
        <line x1={cx-0.2} y1="50" x2={cx+0.2} y2="74" stroke="rgba(255,255,255,0.60)" strokeWidth="0.4"/>

        {/* ── NEEDLE HUB ── */}
        <rect x={cx-9} y="76" width="18" height="18" rx="3" fill="url(#hub)" stroke="#C9A84C" strokeWidth="1.1"/>
        <line x1={cx-9} y1="81" x2={cx+9} y2="81" stroke="rgba(255,220,80,0.4)" strokeWidth="0.7"/>
        <line x1={cx-9} y1="88" x2={cx+9} y2="88" stroke="rgba(255,220,80,0.3)" strokeWidth="0.6"/>

        {/* ── BARREL ── */}
        <rect x={cx-20} y={barrelTop} width="40" height={barrelH} rx="5" fill="url(#brl)" stroke="#C9A84C" strokeWidth="1.5"/>
        <line x1={cx-18} y1={barrelTop+6} x2={cx-18} y2={barrelBot-6} stroke="rgba(255,245,180,0.18)" strokeWidth="2"/>
        <line x1={cx+18} y1={barrelTop+6} x2={cx+18} y2={barrelBot-6} stroke="rgba(255,245,180,0.10)" strokeWidth="1.5"/>

        {/* ── FLUID — stops EXACTLY at fillBottomY, same as tick ── */}
        {fillPct > 0 && (
          <rect x={cx-18.5} y={barrelTop} width="37" height={fillBottomY - barrelTop} fill="url(#fld)" opacity="0.90"/>
        )}

        {/* ── TICK MARKS every 10 units — all labelled ── */}
        {tickUnits.map(u => {
          const y = barrelTop + (u / 100) * barrelH;
          const isMajor = u % 20 === 0;
          return (
            <g key={u}>
              <line
                x1={cx+20} y1={y}
                x2={cx + (isMajor ? 30 : 25)} y2={y}
                stroke={`rgba(201,168,76,${isMajor ? 0.85 : 0.55})`}
                strokeWidth={isMajor ? 1.3 : 0.9}
              />
              <text
                x={cx+34} y={y+3.5}
                fontSize={isMajor ? "9.5" : "8"}
                fill={`rgba(255,255,255,${isMajor ? 0.80 : 0.50})`}
                fontFamily="Montserrat,sans-serif"
              >{u}</text>
            </g>
          );
        })}

        {/* ── DRAW MARKER — sits exactly on fillBottomY ── */}
        {fillPct > 0 && (
          <>
            <line x1={cx-24} y1={fillBottomY} x2={cx+20} y2={fillBottomY}
              stroke="#F0C84A" strokeWidth="2" strokeDasharray="4,2"/>
            <polygon
              points={`${cx-24},${fillBottomY-4} ${cx-24},${fillBottomY+4} ${cx-31},${fillBottomY}`}
              fill="#F0C84A"/>
          </>
        )}

        {/* ── PLUNGER STOPPER — top face at fillBottomY ── */}
        <rect x={cx-19} y={fillBottomY} width="38" height="14" rx="4" fill="url(#plg)" stroke="#C9A84C" strokeWidth="1.2"/>
        <line x1={cx-19} y1={fillBottomY+5} x2={cx+19} y2={fillBottomY+5} stroke="rgba(255,220,80,0.4)" strokeWidth="0.8"/>

        {/* ── PLUNGER ROD ── */}
        {fillBottomY + 14 < barrelBot && (
          <rect x={cx-7} y={fillBottomY+14} width="14"
            height={Math.max(0, barrelBot - fillBottomY - 14)}
            rx="2" fill="rgba(201,168,76,0.18)" stroke="#C9A84C" strokeWidth="1"/>
        )}

        {/* ── THUMB GRIP ── */}
        <rect x={cx-26} y={barrelBot} width="52" height="14" rx="5" fill="rgba(201,168,76,0.28)" stroke="#C9A84C" strokeWidth="1.5"/>
        <rect x={cx-16} y={barrelBot+14} width="32" height="20" rx="3" fill="rgba(201,168,76,0.18)" stroke="#C9A84C" strokeWidth="1"/>
        {[4,10,16].map(d => (
          <line key={d} x1={cx-16} y1={barrelBot+14+d} x2={cx+16} y2={barrelBot+14+d} stroke="rgba(201,168,76,0.35)" strokeWidth="0.8"/>
        ))}
      </svg>

      {/* Units callout */}
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <div style={{ fontFamily:SERIF, fontSize:56, color:GOLD, lineHeight:1 }}>
          {clampedUnits > 0 ? clampedUnits.toFixed(1) : "—"}
        </div>
        <div style={{ fontSize:11, letterSpacing:2, color:"rgba(255,255,255,0.65)", textTransform:"uppercase" }}>units (IU)</div>
        {units > 100 && (
          <div style={{ fontSize:10, color:"rgba(255,100,100,0.85)", marginTop:6, maxWidth:140, lineHeight:1.5 }}>
            Exceeds 100 IU — use a larger syringe or dilute more
          </div>
        )}
      </div>
    </div>
  );
}

function CalculatorPage() {
  useReveal();

  // Step 1: Dose of peptide per injection
  const DOSES = ["0.1","0.25","0.5","1","2.5","5","7.5","10","12.5","15","other"];
  const [doseBtn,  setDoseBtn]  = useState(null);
  const [doseOther,setDoseOther]= useState("");

  // Step 2: Vial strength (mg)
  const STRENGTHS = ["5","10","15","20","30","50","100","500","1000","other"];
  const [strBtn,   setStrBtn]   = useState(null);
  const [strOther, setStrOther] = useState("");

  // Step 3: BAC water added (mL)
  const WATERS = ["0.5","1.0","1.5","2.0","2.5","3.0","5.0","other"];
  const [watBtn,   setWatBtn]   = useState(null);
  const [watOther, setWatOther] = useState("");

  const [result, setResult] = useState(null);

  const dose_mg  = doseBtn  === "other" ? parseFloat(doseOther)  : parseFloat(doseBtn);
  const str_mg   = strBtn   === "other" ? parseFloat(strOther)   : parseFloat(strBtn);
  const wat_mL   = watBtn   === "other" ? parseFloat(watOther)   : parseFloat(watBtn);

  const ready = !isNaN(dose_mg) && !isNaN(str_mg) && !isNaN(wat_mL) && dose_mg > 0 && str_mg > 0 && wat_mL > 0;

  const calculate = () => {
    if (!ready) return;
    const conc_mgPerML = str_mg / wat_mL;               // mg/mL
    const vol_mL       = dose_mg / conc_mgPerML;         // mL per dose
    const units        = vol_mL * 100;                   // IU on U-100 insulin syringe
    const dosesPerVial = str_mg / dose_mg;
    setResult({ conc: conc_mgPerML.toFixed(2), vol: vol_mL.toFixed(3), units: parseFloat(units.toFixed(1)), doses: Math.floor(dosesPerVial) });
  };

  const BtnGrid = ({ options, selected, onSelect, suffix="" }) => (
    <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
      {options.map(v => {
        const isSel = selected === v;
        return (
          <button key={v} onClick={() => onSelect(v)} style={{
            padding:"9px 16px", borderRadius:8, fontSize:13, fontWeight:500,
            border:`1px solid ${isSel ? GOLD : "rgba(201,168,76,0.35)"}`,
            background: isSel ? `rgba(240,200,74,0.15)` : "rgba(255,255,255,0.04)",
            color: isSel ? GOLD : "rgba(255,255,255,0.85)",
            cursor:"pointer", transition:"all .18s", letterSpacing:.5,
          }}>{v === "other" ? "Other" : `${v}${suffix}`}</button>
        );
      })}
    </div>
  );

  const Section = ({ num, title, sub, children }) => (
    <div style={{ marginBottom:36, paddingBottom:36, borderBottom:`1px solid rgba(201,168,76,0.18)` }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:6 }}>
        <div style={{ width:26, height:26, borderRadius:"50%", border:`1px solid ${GOLD}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:GOLD, flexShrink:0 }}>{num}</div>
        <div style={{ fontFamily:SERIF, fontSize:20, letterSpacing:.5 }}>{title}</div>
      </div>
      {sub && <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginBottom:16, marginLeft:38 }}>{sub}</div>}
      <div style={{ marginLeft:38 }}>{children}</div>
    </div>
  );

  const OtherInput = ({ value, onChange, placeholder }) => (
    <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ ...inp, marginTop:10, marginBottom:0, width:140, display:"block" }}
      onFocus={e => e.target.style.borderColor = GOLD}
      onBlur={e => e.target.style.borderColor = BORDER} />
  );

  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        {sectionHead("Tool","Peptide Calculator","Enter your dose, vial strength, and BAC water — get exact syringe units instantly.")}

        <div style={{ border:`1px solid ${BORDER}`, borderRadius:10, padding:"36px 28px", background:GLASS2, backdropFilter:"blur(8px)" }}>

          <Section num="1" title="Dose of Peptide" sub="How much peptide per injection (mg)">
            <BtnGrid options={DOSES} selected={doseBtn} onSelect={setDoseBtn} suffix=" mg" />
            {doseBtn === "other" && <OtherInput value={doseOther} onChange={setDoseOther} placeholder="e.g. 0.3" />}
          </Section>

          <Section num="2" title="Vial Strength" sub="Total mg in your vial (peptide strength)">
            <BtnGrid options={STRENGTHS} selected={strBtn} onSelect={setStrBtn} suffix=" mg" />
            {strBtn === "other" && <OtherInput value={strOther} onChange={setStrOther} placeholder="e.g. 25" />}
            <div style={{ marginTop:14, fontSize:11, color:"rgba(255,255,255,0.45)", lineHeight:1.8 }}>
              Common: BPC-157: 10mg · NAD+: 500–1000mg · GLP-1s: 10–30mg
            </div>
          </Section>

          <Section num="3" title="Bacteriostatic Water Added" sub="mL of BAC water used to reconstitute">
            <BtnGrid options={WATERS} selected={watBtn} onSelect={setWatBtn} suffix=" mL" />
            {watBtn === "other" && <OtherInput value={watOther} onChange={setWatOther} placeholder="e.g. 2.5" />}
            <div style={{ marginTop:14, fontSize:11, color:"rgba(255,255,255,0.45)", lineHeight:1.8 }}>
              Common: GLP-1s: 2–3mL · Peptides: 2–3mL · NAD+: 5mL
            </div>
          </Section>

          <button onClick={calculate} disabled={!ready} className="btn-hover" style={{
            width:"100%", padding:"16px 0", marginBottom: result ? 36 : 0,
            background: ready ? `linear-gradient(135deg, ${GOLD}, ${GOLD2})` : "rgba(255,255,255,0.06)",
            border: ready ? "none" : `1px solid rgba(201,168,76,0.3)`,
            color: ready ? BLACK : "rgba(255,255,255,0.35)",
            fontSize:11, letterSpacing:3, textTransform:"uppercase", fontWeight:700,
            borderRadius:6, cursor: ready ? "pointer" : "not-allowed", transition:"all .2s",
          }}>Calculate</button>

          {result && (
            <div style={{ animation:"fadeUp .4s ease", borderTop:`1px solid ${BORDER}`, paddingTop:36 }}>
              <div style={{ fontSize:10, letterSpacing:4, color:GOLD, textTransform:"uppercase", textAlign:"center", marginBottom:30 }}>Results</div>

              {/* Syringe */}
              <SyringeViz units={result.units} />

              {/* Result cards */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  ["Syringe Units", `${result.units} IU`, "Draw to this mark on a U-100 insulin syringe"],
                  ["Volume Per Dose", `${result.vol} mL`, "Exact liquid volume per injection"],
                  ["Doses Per Vial", `${result.doses}`, "Number of injections in this vial"],
                  ["Concentration", `${result.conc} mg/mL`, "Peptide concentration after reconstitution"],
                ].map(([label, val, hint]) => (
                  <div key={label} style={{ padding:"18px 16px", border:`1px solid ${BORDER}`, borderRadius:8, textAlign:"center", background:GLASS }}>
                    <div style={{ fontFamily:SERIF, fontSize:26, color:GOLD, marginBottom:4 }}>{val}</div>
                    <div style={{ fontSize:10, letterSpacing:1.5, color:"rgba(255,255,255,0.85)", textTransform:"uppercase", marginBottom:6 }}>{label}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.42)", lineHeight:1.6 }}>{hint}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop:16, padding:14, border:`1px solid rgba(201,168,76,.12)`, borderRadius:4, fontSize:10, color:"rgba(255,255,255,.40)", lineHeight:1.8, textAlign:"center" }}>
          For research estimation only. Not medical advice. Always consult a licensed professional.
        </div>
      </div>
    </div>
  );
}

// ── VIDEOS ──────────────────────────────────────────────────────
const VIDEOS = [
  { id:"n8vk8DfwRHg", title:"How To Properly Reconstitute Peptides", tag:"Reconstitution", desc:"Dr. Michael Nielsen MD walks through every step — correct BAC water technique, contamination prevention, and proper vial preparation." },
  { id:"tcEWjyQfDLc", title:"Reconstitution & Injection — Full Demo", tag:"Reconstitution + Injection", desc:"Healthcare team demonstrates the complete process from mixing peptide vials through to a proper subcutaneous injection." },
  { id:"jrLV99dJi14", title:"Peptide Safe Injection Techniques", tag:"Injection & Safety", desc:"Step-by-step injection covering site selection, needle angle, sterile technique, and post-injection protocol." },
  { id:"zU5EYw06wtw", title:"Benefits & Risks of Peptide Therapeutics", tag:"Peptides Explained", desc:"Comprehensive breakdown of peptide categories — tissue repair, longevity, performance, and cognition — with an honest look at safety." },
];

function VideoCard({ video }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="card-hover" style={{ border:`1px solid ${BORDER}`, borderRadius:8, overflow:"hidden", background:GLASS2 }}>
      <div style={{ position:"relative", aspectRatio:"16/9", background:"#0a0a0a" }}>
        {!loaded && <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase" }}>Loading…</div></div>}
        <iframe src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
          style={{ width:"100%", height:"100%", border:"none", display:"block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen onLoad={() => setLoaded(true)} title={video.title} />
      </div>
      <div style={{ padding:"18px 22px" }}>
        <div style={{ fontSize:8, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:7 }}>{video.tag}</div>
        <div style={{ fontFamily:SERIF, fontSize:17, marginBottom:8 }}>{video.title}</div>
        <div style={{ fontSize:11, color:DIM, lineHeight:1.75 }}>{video.desc}</div>
      </div>
    </div>
  );
}

// ── HOW TO PAGE ─────────────────────────────────────────────────
function HowToPage() {
  useReveal();
  const sections = [
    { title:"Reconstitution", icon:"💧", steps:[
      "Ensure hands and workspace are clean before handling any compounds.",
      "Remove the flip-off cap and wipe the vial stopper with an alcohol swab.",
      "Draw the required volume of BAC water into a syringe.",
      "Angle the needle against the glass — allow water to drip slowly down the side of the vial.",
      "Do not inject directly onto the powder. Never shake — swirl gently until dissolved.",
      "Allow 5–10 minutes for the powder to fully dissolve. Solution should appear completely clear.",
    ]},
    { title:"Storage", icon:"🧊", steps:[
      "Lyophilized powder: Store in a cool, dark place. Refrigeration recommended.",
      "Reconstituted peptides: Refrigerate at 2–8°C (36–46°F) at all times.",
      "Keep all compounds away from direct light, heat, and moisture.",
      "Do not freeze reconstituted peptides — freezing degrades the compound.",
      "Most reconstituted peptides are stable for 4–6 weeks refrigerated with BAC water.",
      "Always label vials with the reconstitution date.",
    ]},
    { title:"Safety Protocols", icon:"🛡️", steps:[
      "Always use sterile syringes and needles. Never reuse.",
      "Rotate injection sites to prevent localized irritation.",
      "Begin with the lowest effective research dose to assess compound response.",
      "Never share vials, syringes, or needles.",
      "Dispose of all sharps in an approved sharps container.",
      "These compounds are for research purposes only — not for human therapeutic use.",
    ]},
    { title:"FAQ", icon:"❓", steps:[
      "What is BAC water? Bacteriostatic water contains 0.9% benzyl alcohol, preventing bacterial contamination in reconstituted peptides.",
      "How do I confirm proper dissolution? The solution should be fully clear with no visible particulates.",
      "Can peptides be combined? Only under appropriate research conditions. Consult relevant research literature.",
      "How long does shipping take? Typically 3–5 business days after payment confirmation.",
      "Do you offer consultations? Yes — contact us via the Contact page for a complimentary protocol consultation.",
    ]},
  ];
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:920, margin:"0 auto" }}>
        {sectionHead("Guide","How To Use & Store")}

        {/* Videos */}
        <div className="reveal" style={{ marginBottom:60 }}>
          <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:10 }}>Video Library</div>
          <div style={{ fontFamily:SERIF, fontSize:28, fontWeight:300, marginBottom:10 }}>Watch Before You Begin</div>
          <p style={{ fontSize:12, color:DIM, lineHeight:1.85, marginBottom:32, maxWidth:600 }}>
            Watch all four before handling any compound. These cover reconstitution, injection, safety protocols, and a full peptide overview.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))", gap:24 }}>
            {VIDEOS.map(v => <VideoCard key={v.id} video={v} />)}
          </div>
        </div>

        <GoldSeparator />

        <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:32 }}>Written Reference</div>
        {sections.map(s => (
          <div key={s.title} className="reveal" style={{ marginBottom:24, border:`1px solid ${BORDER}`, borderRadius:8, padding:"28px 32px", background:GLASS2, backdropFilter:"blur(6px)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:20 }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <h2 style={{ fontFamily:SERIF, fontSize:22, fontWeight:300, color:GOLD }}>{s.title}</h2>
            </div>
            {s.steps.map((step, i) => (
              <div key={i} style={{ display:"flex", gap:16, marginBottom:11, alignItems:"flex-start" }}>
                <span style={{ color:GOLD, fontSize:10, fontWeight:700, minWidth:20, paddingTop:2 }}>{String(i + 1).padStart(2,"0")}</span>
                <span style={{ fontSize:12, color:DIM, lineHeight:1.8 }}>{step}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ABOUT PAGE ──────────────────────────────────────────────────
function AboutPage() {
  useReveal();
  const pillars = [
    { icon:"🔄", title:"Recovery",    desc:"Accelerate tissue repair and reduce downtime with targeted peptide compounds." },
    { icon:"⚡", title:"Performance", desc:"Optimize growth hormone, endurance, and physical output for serious athletes." },
    { icon:"⏳", title:"Longevity",   desc:"Telomere support, NAD+ pathways, and mitochondrial health for healthy aging." },
    { icon:"✨", title:"Aesthetics",  desc:"Skin regeneration, pigmentation support, and body composition enhancement." },
    { icon:"⚖️", title:"Metabolism",  desc:"Advanced GLP-1 receptor agonists and metabolic peptides for body recomposition." },
    { icon:"🧠", title:"Cognitive",   desc:"Nootropic peptides for mental clarity, mood, and stress resilience." },
  ];
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div className="reveal" style={{ maxWidth:680, marginBottom:80 }}>
          <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:16 }}>Our Mission</div>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(30px,5vw,56px)", fontWeight:300, lineHeight:1.1, marginBottom:24 }}>
            Precision Research.<br /><span style={{ color:GOLD }}>Uncompromising Quality.</span>
          </h1>
          <p style={{ fontSize:13, color:DIM, lineHeight:1.95, marginBottom:18 }}>
            TruPep Wellness was founded in Miami with one goal: to provide serious researchers with access to the highest-quality peptide compounds available. Every product in our catalog is rigorously sourced and clearly labeled for research and educational purposes only.
          </p>
          <p style={{ fontSize:13, color:DIM, lineHeight:1.95 }}>
            We believe in total transparency — in our compounds, our compliance language, and our communication. Our team is available for complimentary consultations to help researchers identify the right compounds for their specific protocols.
          </p>
        </div>
        <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:36 }}>Research Pillars</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:22 }}>
          {pillars.map(p => (
            <div key={p.title} className="card-hover reveal" style={{ padding:"28px 24px", border:`1px solid ${BORDER}`, borderRadius:8, background:GLASS2 }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{p.icon}</div>
              <div style={{ fontFamily:SERIF, fontSize:21, color:GOLD, marginBottom:8 }}>{p.title}</div>
              <div style={{ fontSize:11, color:DIM, lineHeight:1.8 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CONTACT PAGE ────────────────────────────────────────────────
function ContactPage() {
  useReveal();
  const [form,    setForm]    = useState({ name:"", email:"", phone:"", topic:"", message:"" });
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("_subject", `TruPep Inquiry — ${form.topic || "General"} — ${form.name}`);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await fetch(FORMSPREE, { method:"POST", body:fd });
      setSent(true);
    } catch (_) { setSending(false); }
  };
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:1020, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:60, alignItems:"start" }}>
        <div className="reveal">
          <div style={{ fontSize:10, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:16 }}>Get In Touch</div>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(28px,4vw,50px)", fontWeight:300, marginBottom:24 }}>Free Consultation</h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.88)", lineHeight:1.95, marginBottom:38 }}>Questions about compounds, your research protocol, or general inquiries — we're here to help.</p>
          {[["Email","trupepwellness@gmail.com"],["Phone","423-444-3668"],["Location","Miami, Florida"]].map(([k, v]) => (
            <div key={k} style={{ marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${BORDER}` }}>
              <div style={{ fontSize:10, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:5 }}>{k}</div>
              <div style={{ fontSize:14 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ border:`1px solid ${BORDER}`, padding:"36px 32px", borderRadius:8, background:GLASS2, backdropFilter:"blur(8px)" }}>
          {sent ? (
            <div style={{ textAlign:"center", padding:"44px 0" }}>
              <div style={{ fontFamily:SERIF, fontSize:30, color:GOLD, marginBottom:12 }}>Message Received</div>
              <div style={{ fontSize:12, color:DIM, lineHeight:1.85 }}>We'll be in touch within 24 hours. Thank you for reaching out to TruPep Wellness.</div>
            </div>
          ) : (
            <>
              {[["name","Full Name"],["email","Email Address"],["phone","Phone Number"]].map(([k, ph]) => (
                <input key={k} placeholder={ph} value={form[k]} onChange={set(k)} style={inp}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              ))}
              <select value={form.topic} onChange={set("topic")} style={{ ...inp, cursor:"pointer" }}>
                <option value="">Topic / Interest</option>
                {["Weight Management","Recovery & Healing","Anti-Aging & Longevity","Performance","Aesthetics","Cognitive Support","General Inquiry"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <textarea value={form.message} onChange={set("message")} placeholder="Tell us about your research goals..." rows={5}
                style={{ ...inp, resize:"none" }}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
              <Btn onClick={submit} style={{ width:"100%", marginTop:4 }}>{sending ? "Sending..." : "Send Message"}</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LEGAL PAGES ─────────────────────────────────────────────────
function LegalPage({ title, sections }) {
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:820, margin:"0 auto" }}>
        <div style={{ marginBottom:52 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:12 }}>TruPep Wellness · Legal</div>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(28px,5vw,50px)", fontWeight:300, marginBottom:8 }}>{title}</h1>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>Last updated: May 2025</div>
        </div>
        {sections.map(([heading, body]) => (
          <div key={heading} style={{ marginBottom:28, paddingBottom:28, borderBottom:`1px solid ${BORDER}` }}>
            <h2 style={{ fontFamily:SERIF, fontSize:20, color:GOLD, fontWeight:300, marginBottom:11 }}>{heading}</h2>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.88)", lineHeight:1.95 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const TERMS = [
  ["1. Research & Educational Use Only","ALL products sold by TruPep Wellness are strictly for in vitro research and educational purposes only. These products are NOT intended for human consumption, injection, topical application, or any form of therapeutic use."],
  ["2. Age Requirement","You must be at least 18 years of age to access this website or purchase any products. By entering the site, you represent and warrant that you are 18 years of age or older."],
  ["3. No Medical Advice","Nothing on this website constitutes medical advice, medical diagnosis, or a treatment recommendation. Always consult a licensed, board-certified healthcare professional before beginning any wellness or research protocol."],
  ["4. FDA Disclaimer","These products have not been evaluated by the United States Food and Drug Administration. These products are not approved to diagnose, treat, cure, or prevent any disease or health issue."],
  ["5. Assumption of Risk","By purchasing any product from TruPep Wellness, you knowingly assume all risks associated with the possession, handling, storage, and use of research compounds."],
  ["6. Governing Law","These terms are governed by the laws of the State of Florida. Disputes shall be resolved in the courts of Miami-Dade County, Florida."],
];
const PRIVACY = [
  ["1. Information Collected","We collect information you provide when placing orders or submitting inquiries — including name, email, phone, and shipping address."],
  ["2. How We Use Your Information","Your information is used solely to process orders, respond to inquiries, and improve our services. We do not sell or share your personal information with third parties for marketing purposes."],
  ["3. Data Security","All form submissions are processed through Formspree with SSL encryption. We take reasonable measures to protect your personal information."],
  ["4. Cookies","We use essential cookies to remember site preferences. You may disable cookies in your browser settings."],
  ["5. Contact","For privacy questions contact us at trupepwellness@gmail.com or 423-444-3668."],
];
const DISCLAIMER = [
  ["Research & Educational Purposes Only","All peptide compounds offered by TruPep Wellness are intended strictly for research and educational purposes only. These products are not approved by the U.S. Food and Drug Administration for human consumption or therapeutic use."],
  ["FDA Statement","These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease."],
  ["No Physician Relationship","Your use of this website does not create a physician-patient or practitioner-patient relationship. TruPep Wellness personnel are not licensed medical providers."],
  ["Assumption of Risk","By purchasing, you accept all responsibility for proper handling, storage, and use of research compounds in accordance with applicable laws in your jurisdiction."],
];

// ── APP ─────────────────────────────────────────────────────────
function App() {
  const [page,     setPage]     = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [popup,    setPopup]    = useState(false);
  const { cart, add, remove, setQty, total, count } = useCart();

  useEffect(() => { window.scrollTo(0, 0); }, [page]);
  useEffect(() => { const t = setTimeout(() => setPopup(true), 4500); return () => clearTimeout(t); }, []);

  const setPageAndScroll = p => { setPage(p); };

  return (
    <>
      <style>{G}</style>
      <GoldBorderFrame />
      <Nav count={count} onCart={() => setCartOpen(true)} setPage={setPageAndScroll} page={page} />
      <main>
        {page === "home"       && <HomePage       setPage={setPageAndScroll} onAdd={add} />}
        {page === "products"   && <ProductsPage   onAdd={add} />}
        {page === "stacks"     && <StacksPage     setPage={setPageAndScroll} />}
        {page === "calculator" && <CalculatorPage />}
        {page === "howto"      && <HowToPage />}
        {page === "about"      && <AboutPage />}
        {page === "contact"    && <ContactPage />}
        {page === "terms"      && <LegalPage title="Terms of Service"    sections={TERMS} />}
        {page === "privacy"    && <LegalPage title="Privacy Policy"      sections={PRIVACY} />}
        {page === "disclaimer" && <LegalPage title="Research Disclaimer" sections={DISCLAIMER} />}
      </main>
      <Footer setPage={setPageAndScroll} />
      {cartOpen && <CartDrawer cart={cart} total={total} onClose={() => setCartOpen(false)} onRemove={remove} onQty={setQty} onAdd={add} />}
      {popup    && <EmailPopup onClose={() => setPopup(false)} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
