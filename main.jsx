import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import {
  PRODUCTS, STACKS, PROMO_CODES, TESTIMONIALS, CATEGORIES,
  GOLD, BLACK, WHITE, SERIF, SANS,
} from "./data.jsx";

// ── CONFIG ──────────────────────────────────────────────────────
const FORMSPREE = "https://formspree.io/f/xvzyzgqa";
const DIM    = "rgba(255,255,255,0.58)";
const BORDER = "rgba(201,168,76,0.2)";
const fmt    = n => `$${Number(n).toFixed(2)}`;

// ── GLOBAL CSS ──────────────────────────────────────────────────
const G = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:${BLACK};color:${WHITE};font-family:${SANS};-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  button{cursor:pointer;border:none;background:none;font-family:inherit}
  input,textarea,select{outline:none;font-family:inherit;color:${WHITE};background:rgba(255,255,255,.05)}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${GOLD}}
  @keyframes shimmer{0%,100%{opacity:.7}50%{opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideRight{from{transform:translateX(105%)}to{transform:translateX(0)}}
  @keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  @media(max-width:768px){.hide-mobile{display:none!important}.show-mobile{display:flex!important}}
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
  const remove  = useCallback(key => setCart(c => c.filter(i => i.key !== key)), []);
  const setQty  = useCallback((key, qty) =>
    setCart(c => qty < 1 ? c.filter(i => i.key !== key) : c.map(i => i.key === key ? { ...i, qty } : i))
  , []);
  const total   = cart.reduce((s, i) => s + i.variant.price * i.qty, 0);
  const count   = cart.reduce((s, i) => s + i.qty, 0);
  return { cart, add, remove, setQty, total, count };
}

// ── SHARED COMPONENTS ───────────────────────────────────────────
function Btn({ children, onClick, style = {}, outline }) {
  const base = {
    padding: "12px 28px", fontSize: 10, letterSpacing: 2, fontWeight: 600,
    textTransform: "uppercase", transition: "all .2s", fontFamily: SANS,
    background: outline ? "transparent" : GOLD,
    color:      outline ? GOLD : BLACK,
    border:     `1px solid ${GOLD}`,
    ...style,
  };
  return (
    <button style={base} onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = outline ? GOLD : "#b8922e"; e.currentTarget.style.color = BLACK; }}
      onMouseLeave={e => { e.currentTarget.style.background = outline ? "transparent" : GOLD; e.currentTarget.style.color = outline ? GOLD : BLACK; }}
    >{children}</button>
  );
}

const inp = {
  width: "100%", padding: "10px 13px", fontSize: 12,
  border: `1px solid ${BORDER}`, marginBottom: 8,
};

const sectionHead = (label, title) => (
  <div style={{ textAlign:"center", marginBottom:52 }}>
    <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:12 }}>{label}</div>
    <h1 style={{ fontFamily:SERIF, fontSize:"clamp(30px,5vw,54px)", fontWeight:300 }}>{title}</h1>
  </div>
);

// ── NAV ─────────────────────────────────────────────────────────
const LINKS = [
  ["Products","products"],["Stacks","stacks"],["Calculator","calculator"],
  ["How To Use","howto"],["About","about"],["Contact","contact"],
];

function Nav({ count, onCart, setPage, page }) {
  const [open,    setOpen]    = useState(false);
  const [scrolled,setScrolled]= useState(false);
  const mobile = useWidth() < 769;
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const go = p => { setPage(p); setOpen(false); };
  const linkStyle = active => ({
    fontSize:10, letterSpacing:2, textTransform:"uppercase", fontWeight:500,
    color: active ? GOLD : DIM, background:"none", border:"none", cursor:"pointer",
  });
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? "rgba(10,10,10,.97)" : "rgba(10,10,10,.85)",
      backdropFilter:"blur(12px)",
      borderBottom:`1px solid ${scrolled ? BORDER : "transparent"}`,
      transition:"all .3s",
    }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Logo */}
        <div onClick={() => go("home")} style={{ cursor:"pointer" }}>
          <div style={{ fontFamily:SERIF, fontSize:22, fontWeight:300, color:GOLD, letterSpacing:3, animation:"shimmer 3s ease-in-out infinite", lineHeight:1 }}>TruPep</div>
          <div style={{ fontSize:7, letterSpacing:4, color:DIM, textTransform:"uppercase" }}>Wellness</div>
        </div>
        {/* Desktop links */}
        {!mobile && (
          <div style={{ display:"flex", gap:32, alignItems:"center" }}>
            {LINKS.map(([l, id]) => <button key={id} onClick={() => go(id)} style={linkStyle(page===id)}>{l}</button>)}
          </div>
        )}
        {/* Cart + hamburger */}
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <button onClick={onCart} style={{ position:"relative", fontSize:18, color:WHITE }}>
            🛒
            {count > 0 && (
              <span style={{ position:"absolute", top:-6, right:-8, background:GOLD, color:BLACK, fontSize:9, fontWeight:700, borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center" }}>{count}</span>
            )}
          </button>
          {mobile && <button onClick={() => setOpen(o => !o)} style={{ fontSize:20, color:WHITE }}>☰</button>}
        </div>
      </div>
      {/* Mobile menu */}
      {mobile && open && (
        <div style={{ background:"#111", borderTop:`1px solid ${BORDER}` }}>
          {LINKS.map(([l, id]) => (
            <button key={id} onClick={() => go(id)} style={{ display:"block", width:"100%", padding:"13px 24px", textAlign:"left", ...linkStyle(page===id) }}>{l}</button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ── FOOTER ──────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ borderTop:`1px solid ${BORDER}`, padding:"52px 24px 32px", marginTop:80 }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:40, marginBottom:44 }}>
          <div>
            <div style={{ fontFamily:SERIF, fontSize:20, color:GOLD, letterSpacing:3, marginBottom:10 }}>TruPep Wellness</div>
            <div style={{ fontSize:11, color:DIM, lineHeight:1.8 }}>Miami's premier advanced peptide wellness source. Research compounds for the serious professional.</div>
          </div>
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:14 }}>Navigate</div>
            {LINKS.map(([l, id]) => <button key={id} onClick={() => setPage(id)} style={{ display:"block", padding:"4px 0", color:DIM, fontSize:11, background:"none", border:"none", cursor:"pointer", letterSpacing:1 }}>{l}</button>)}
          </div>
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:14 }}>Legal</div>
            {[["Terms of Service","terms"],["Privacy Policy","privacy"],["Research Disclaimer","disclaimer"]].map(([l,id]) => (
              <button key={id} onClick={() => setPage(id)} style={{ display:"block", padding:"4px 0", color:DIM, fontSize:11, background:"none", border:"none", cursor:"pointer", letterSpacing:1 }}>{l}</button>
            ))}
          </div>
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:14 }}>Contact</div>
            <div style={{ fontSize:11, color:DIM, lineHeight:2.2 }}>
              <div>trupepwellness@gmail.com</div>
              <div>423-444-3668</div>
              <div>Miami, Florida</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:24, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,.22)", lineHeight:1.7, maxWidth:680 }}>
            All products are strictly for research and educational purposes only. Not intended for human consumption. These statements have not been evaluated by the FDA. Always consult a licensed healthcare professional before any wellness protocol. For adults 18+ only.
          </p>
          <div style={{ fontSize:10, color:"rgba(255,255,255,.18)" }}>© {new Date().getFullYear()} TruPep Wellness</div>
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
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#111", border:`1px solid ${BORDER}`, padding:"44px 36px", maxWidth:420, width:"100%", animation:"popIn .3s ease" }}>
        {done ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:SERIF, fontSize:30, color:GOLD, marginBottom:10 }}>Welcome.</div>
            <div style={{ fontSize:12, color:DIM }}>Your code <strong style={{ color:GOLD }}>WELCOME10</strong> is ready at checkout.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:10 }}>Exclusive Offer</div>
            <div style={{ fontFamily:SERIF, fontSize:30, fontWeight:300, marginBottom:8 }}>10% Off Your First Order</div>
            <div style={{ fontSize:12, color:DIM, lineHeight:1.8, marginBottom:24 }}>Join the TruPep community for early access to new compounds, protocols, and member pricing.</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" style={{ ...inp, marginBottom:12 }} />
            <Btn onClick={submit} style={{ width:"100%" }}>Claim 10% Off</Btn>
            <button onClick={onClose} style={{ display:"block", margin:"14px auto 0", fontSize:10, color:"rgba(255,255,255,.28)", letterSpacing:1 }}>No thanks</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── CART DRAWER ─────────────────────────────────────────────────
function CartDrawer({ cart, total, onClose, onRemove, onQty, onAdd }) {
  const [step,    setStep]    = useState("cart");
  const [promo,   setPromo]   = useState("");
  const [discount,setDiscount]= useState(0);
  const [promoMsg,setPromoMsg]= useState("");
  const [form,    setForm]    = useState({ name:"", email:"", phone:"", street:"", city:"", state:"", zip:"", notes:"" });
  const [sending, setSending] = useState(false);

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setDiscount(PROMO_CODES[code]);
      setPromoMsg(`✓ ${PROMO_CODES[code]}% discount applied`);
    } else {
      setPromoMsg("Invalid code. Please try again.");
      setDiscount(0);
    }
  };

  const discounted = total * (1 - discount / 100);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("_subject", `New TruPep Order — ${form.name}`);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("order", cart.map(i => `${i.name} (${i.variant.label}) x${i.qty} — ${fmt(i.variant.price * i.qty)}`).join("\n"));
      if (discount) fd.append("promo_discount", `${discount}%`);
      fd.append("order_total", fmt(discounted));
      await fetch(FORMSPREE, { method:"POST", body:fd });
      setStep("payment");
    } catch (_) { setSending(false); }
  };

  const cartInp = { ...inp, marginBottom:8 };
  const stepLabel = { cart:"Your Cart", checkout:"Checkout", payment:"Payment" }[step];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex" }}>
      <div onClick={onClose} style={{ flex:1, background:"rgba(0,0,0,.6)" }} />
      <div style={{ width:"min(420px,100vw)", background:"#111", borderLeft:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", animation:"slideRight .3s ease", overflowY:"auto" }}>
        {/* Header */}
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:SERIF, fontSize:20, color:GOLD }}>{stepLabel}</span>
          <button onClick={onClose} style={{ color:DIM, fontSize:22, lineHeight:1 }}>×</button>
        </div>

        <div style={{ flex:1, padding:24 }}>

          {/* ── CART ── */}
          {step === "cart" && (
            cart.length === 0
              ? <div style={{ textAlign:"center", paddingTop:60, color:DIM, fontSize:12 }}>Your cart is empty.</div>
              : <>
                  {cart.map(item => (
                    <div key={item.key} style={{ display:"flex", gap:12, marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${BORDER}` }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{item.name}</div>
                        <div style={{ fontSize:10, color:DIM }}>{item.variant.label}</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                        <div style={{ fontSize:13, color:GOLD }}>{fmt(item.variant.price * item.qty)}</div>
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          <button onClick={() => onQty(item.key, item.qty - 1)} style={{ width:24, height:24, border:`1px solid ${BORDER}`, color:DIM, fontSize:16 }}>−</button>
                          <span style={{ fontSize:12, minWidth:16, textAlign:"center" }}>{item.qty}</span>
                          <button onClick={() => onQty(item.key, item.qty + 1)} style={{ width:24, height:24, border:`1px solid ${BORDER}`, color:WHITE, fontSize:16 }}>+</button>
                          <button onClick={() => onRemove(item.key)} style={{ color:"rgba(255,80,80,.6)", fontSize:11, marginLeft:4 }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* BAC Water upsell */}
                  {!cart.some(i => i.name === "BAC Water") && (
                    <div style={{ background:"rgba(201,168,76,.07)", border:`1px solid ${BORDER}`, borderLeft:`3px solid ${GOLD}`, padding:"14px 16px", marginBottom:16 }}>
                      <div style={{ fontSize:9, letterSpacing:2, color:GOLD, textTransform:"uppercase", marginBottom:4 }}>Required for Reconstitution</div>
                      <div style={{ fontSize:12, marginBottom:10, lineHeight:1.6 }}>Don't forget <strong>BAC Water</strong> — needed to reconstitute every vial before use.</div>
                      <button onClick={() => onAdd(PRODUCTS.find(p => p.id==="bacwater"), PRODUCTS.find(p => p.id==="bacwater").variants[0])} style={{
                        padding:"7px 16px", border:`1px solid ${GOLD}`, color:GOLD,
                        fontSize:9, letterSpacing:2, textTransform:"uppercase", background:"none",
                      }}>+ Add BAC Water — $20</button>
                    </div>
                  )}

                  {/* Promo */}
                  <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                    <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Promo code"
                      style={{ flex:1, padding:"9px 12px", fontSize:11, border:`1px solid ${BORDER}` }} />
                    <button onClick={applyPromo} style={{ padding:"9px 14px", border:`1px solid ${GOLD}`, color:GOLD, fontSize:10, letterSpacing:1 }}>Apply</button>
                  </div>
                  {promoMsg && <div style={{ fontSize:10, color: discount ? "#7dca7d":"#ff6b6b", marginBottom:14 }}>{promoMsg}</div>}

                  {/* Totals */}
                  <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:14, marginBottom:20 }}>
                    {discount > 0 && <>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:DIM, marginBottom:4 }}><span>Subtotal</span><span>{fmt(total)}</span></div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#7dca7d", marginBottom:4 }}><span>Discount ({discount}%)</span><span>−{fmt(total - discounted)}</span></div>
                    </>}
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:600 }}><span>Total</span><span style={{ color:GOLD }}>{fmt(discounted)}</span></div>
                  </div>
                  <Btn onClick={() => setStep("checkout")} style={{ width:"100%" }}>Proceed to Checkout</Btn>
                </>
          )}

          {/* ── CHECKOUT ── */}
          {step === "checkout" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:18 }}>Shipping Information</div>
              {[["name","Full Name"],["email","Email Address"],["phone","Phone Number"],["street","Street Address"]].map(([k,ph]) => (
                <input key={k} placeholder={ph} value={form[k]} onChange={set(k)} style={cartInp} />
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 72px 88px", gap:8, marginBottom:8 }}>
                {["city","state","zip"].map(k => (
                  <input key={k} placeholder={k[0].toUpperCase()+k.slice(1)} value={form[k]} onChange={set(k)} style={{ padding:"10px 12px", fontSize:12, border:`1px solid ${BORDER}` }} />
                ))}
              </div>
              <textarea value={form.notes} onChange={set("notes")} placeholder="Notes (optional)" rows={3}
                style={{ width:"100%", padding:"10px 12px", fontSize:12, border:`1px solid ${BORDER}`, resize:"none", marginBottom:16 }} />
              <div style={{ background:"rgba(201,168,76,.07)", border:`1px solid ${BORDER}`, padding:"10px 14px", marginBottom:20, fontSize:11, color:DIM }}>
                Total due: <strong style={{ color:GOLD }}>{fmt(discounted)}</strong>
              </div>
              <Btn onClick={submit} style={{ width:"100%" }}>{sending ? "Sending..." : "Submit Order"}</Btn>
              <button onClick={() => setStep("cart")} style={{ display:"block", width:"100%", marginTop:10, padding:10, border:`1px solid ${BORDER}`, color:DIM, fontSize:10, letterSpacing:1 }}>← Back to Cart</button>
            </div>
          )}

          {/* ── PAYMENT ── */}
          {step === "payment" && (
            <div style={{ animation:"fadeUp .3s ease" }}>
              <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:8 }}>Complete Payment</div>
              <div style={{ fontSize:12, color:DIM, lineHeight:1.8, marginBottom:24 }}>
                Send <strong style={{ color:GOLD }}>{fmt(discounted)}</strong> to any of the following. Include your name in the memo.
              </div>
              {[["Zelle","trupepwellness@gmail.com"],["Venmo","@TruPepWellness"],["PayPal","trupepwellness@gmail.com"]].map(([method, handle]) => (
                <div key={method} style={{ padding:"14px 18px", border:`1px solid ${BORDER}`, marginBottom:10 }}>
                  <div style={{ fontSize:9, letterSpacing:2, color:GOLD, marginBottom:4 }}>{method}</div>
                  <div style={{ fontSize:13 }}>{handle}</div>
                </div>
              ))}
              <div style={{ marginTop:18, padding:14, background:"rgba(201,168,76,.06)", border:`1px solid ${BORDER}`, fontSize:11, color:DIM, lineHeight:1.7 }}>
                Confirmation sent to <strong style={{ color:WHITE }}>{form.email}</strong>. We'll process your order within 1 business day of payment receipt.
              </div>
              <button onClick={onClose} style={{ display:"block", width:"100%", marginTop:18, padding:11, border:`1px solid ${BORDER}`, color:DIM, fontSize:10, letterSpacing:1 }}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PRODUCT CARD ────────────────────────────────────────────────
function ProductCard({ product, onAdd }) {
  const [sel,   setSel]   = useState(0);
  const [added, setAdded] = useState(false);
  const v = product.variants[sel];
  const handleAdd = () => {
    onAdd(product, v);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  return (
    <div style={{ border:`1px solid ${BORDER}`, padding:24, display:"flex", flexDirection:"column", transition:"border-color .2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
      onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
    >
      <div style={{ fontSize:8, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:7 }}>{product.cat}</div>
      <div style={{ fontFamily:SERIF, fontSize:18, marginBottom:8 }}>{product.name}</div>
      <div style={{ fontSize:11, color:DIM, lineHeight:1.7, flex:1, marginBottom:16 }}>{product.desc}</div>
      {product.variants.length > 1 && (
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          {product.variants.map((vv, i) => (
            <button key={i} onClick={() => setSel(i)} style={{
              padding:"5px 12px", fontSize:10, letterSpacing:1,
              border:`1px solid ${i===sel ? GOLD : BORDER}`, color: i===sel ? GOLD : DIM, background:"none",
            }}>{vv.label}</button>
          ))}
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:SERIF, fontSize:22, color:GOLD }}>{fmt(v.price)}</span>
        <button onClick={handleAdd} style={{
          padding:"8px 16px", fontSize:9, letterSpacing:2, textTransform:"uppercase", transition:"all .2s",
          background: added ? GOLD : "transparent", border:`1px solid ${GOLD}`, color: added ? BLACK : GOLD,
        }}>{added ? "Added ✓" : "Add to Cart"}</button>
      </div>
    </div>
  );
}

// ── HOME PAGE ───────────────────────────────────────────────────
function HomePage({ setPage, onAdd }) {
  const featured = PRODUCTS.filter(p => ["retatrutide","bpc157","nad","tb500"].includes(p.id));
  return (
    <>
      {/* Hero */}
      <div style={{ padding:"130px 24px 80px", textAlign:"center" }}>
        <div style={{ fontSize:9, letterSpacing:5, color:GOLD, textTransform:"uppercase", marginBottom:22, animation:"shimmer 3s ease-in-out infinite" }}>Miami's Premier Peptide Wellness</div>
        <h1 style={{ fontFamily:SERIF, fontSize:"clamp(40px,7vw,88px)", fontWeight:300, lineHeight:1.05, marginBottom:22 }}>
          Advanced Research<br /><span style={{ color:GOLD }}>Peptide Compounds</span>
        </h1>
        <p style={{ fontSize:14, color:DIM, maxWidth:500, margin:"0 auto 36px", lineHeight:1.85 }}>
          25 premium research compounds. 7 curated protocol stacks. Uncompromising quality for serious wellness research.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <Btn onClick={() => setPage("products")}>Shop All Products</Btn>
          <Btn onClick={() => setPage("stacks")} outline>View Stacks</Btn>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:"22px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:24, textAlign:"center" }}>
          {[["25+","Compounds"],["7","Protocol Stacks"],["Miami","Based"],["Free","Consultation"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily:SERIF, fontSize:26, color:GOLD }}>{n}</div>
              <div style={{ fontSize:9, letterSpacing:2, color:DIM, textTransform:"uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured products */}
      <div style={{ padding:"80px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:10 }}>Featured</div>
            <h2 style={{ fontFamily:SERIF, fontSize:"clamp(26px,4vw,40px)", fontWeight:300 }}>Top Research Compounds</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:24 }}>
            {featured.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
          </div>
          <div style={{ textAlign:"center", marginTop:40 }}>
            <Btn onClick={() => setPage("products")} outline>View All 25 Compounds</Btn>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ borderTop:`1px solid ${BORDER}`, padding:"80px 24px", background:"#0d0d0d" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:10 }}>Results</div>
            <h2 style={{ fontFamily:SERIF, fontSize:"clamp(26px,4vw,40px)", fontWeight:300 }}>Client Experiences</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ padding:28, border:`1px solid ${BORDER}` }}>
                <div style={{ color:GOLD, marginBottom:10, fontSize:14 }}>{"★".repeat(t.stars)}</div>
                <p style={{ fontSize:12, color:DIM, lineHeight:1.85, marginBottom:14 }}>"{t.text}"</p>
                <div style={{ fontSize:10, letterSpacing:2 }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:"80px 24px", textAlign:"center", borderTop:`1px solid ${BORDER}` }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <h2 style={{ fontFamily:SERIF, fontSize:"clamp(26px,4vw,44px)", fontWeight:300, marginBottom:14 }}>
            Ready to Begin Your <span style={{ color:GOLD }}>Research Protocol?</span>
          </h2>
          <p style={{ fontSize:13, color:DIM, lineHeight:1.85, marginBottom:32 }}>Use our peptide calculator to determine your exact dosing, or reach out for a free consultation.</p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
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
  const [search, setSearch] = useState("");
  const [cat,    setCat]    = useState("All");
  const filtered = PRODUCTS.filter(p =>
    (cat === "All" || p.cat === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ padding:"100px 24px 60px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        {sectionHead("Catalog","All Research Compounds")}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search compounds..."
            style={{ padding:"10px 18px", fontSize:12, border:`1px solid ${BORDER}`, width:"100%", maxWidth:340 }} />
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginBottom:44 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding:"6px 14px", fontSize:9, letterSpacing:1.5, textTransform:"uppercase",
              border:`1px solid ${c===cat ? GOLD : BORDER}`, color: c===cat ? GOLD : DIM, background:"none",
            }}>{c}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:24 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
        </div>
        {filtered.length === 0 && <div style={{ textAlign:"center", padding:60, color:DIM, fontSize:12 }}>No compounds found.</div>}
      </div>
    </div>
  );
}

// ── STACKS PAGE ─────────────────────────────────────────────────
function StacksPage({ setPage }) {
  return (
    <div style={{ padding:"100px 24px 60px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:12 }}>Protocols</div>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(30px,5vw,54px)", fontWeight:300, marginBottom:14 }}>Research Stacks</h1>
          <p style={{ fontSize:13, color:DIM, maxWidth:500, margin:"0 auto", lineHeight:1.85 }}>
            Curated compound combinations targeting specific research outcomes. All compounds available individually in the catalog.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:26 }}>
          {STACKS.map(s => (
            <div key={s.id} style={{ border:`1px solid ${BORDER}`, padding:32, transition:"border-color .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
            >
              <div style={{ fontSize:30, marginBottom:14 }}>{s.icon}</div>
              <div style={{ fontSize:8, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:5 }}>{s.tagline}</div>
              <div style={{ fontFamily:SERIF, fontSize:22, marginBottom:10 }}>{s.name}</div>
              <p style={{ fontSize:11, color:DIM, lineHeight:1.75, marginBottom:20 }}>{s.desc}</p>
              <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:16, marginBottom:20 }}>
                <div style={{ fontSize:8, letterSpacing:2, color:GOLD, textTransform:"uppercase", marginBottom:10 }}>Compounds</div>
                {s.peptides.map(name => (
                  <div key={name} style={{ fontSize:11, color:DIM, marginBottom:6, display:"flex", gap:8 }}>
                    <span style={{ color:GOLD, fontSize:7 }}>◆</span>{name}
                  </div>
                ))}
              </div>
              <button onClick={() => setPage("products")} style={{
                width:"100%", padding:"9px 0", border:`1px solid ${BORDER}`, color:DIM,
                fontSize:9, letterSpacing:2, textTransform:"uppercase", transition:"all .2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.color=GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.color=DIM; }}
              >Shop These Compounds →</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:60, padding:40, border:`1px solid ${BORDER}` }}>
          <div style={{ fontFamily:SERIF, fontSize:26, marginBottom:10 }}>Need a Custom Protocol?</div>
          <p style={{ fontSize:12, color:DIM, marginBottom:24, lineHeight:1.8 }}>Schedule a free consultation and we'll build a personalized stack for your goals.</p>
          <Btn onClick={() => setPage("contact")}>Free Consultation</Btn>
        </div>
      </div>
    </div>
  );
}

// ── CALCULATOR PAGE ─────────────────────────────────────────────
function CalculatorPage() {
  const [weight, setWeight] = useState("");
  const [unit,   setUnit]   = useState("lbs");
  const [dose,   setDose]   = useState("");
  const [conc,   setConc]   = useState("10");
  const [freq,   setFreq]   = useState("7");
  const [vialMg, setVialMg] = useState("5");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const wKg      = unit === "lbs" ? parseFloat(weight) * 0.453592 : parseFloat(weight);
    const mgPerDose = (parseFloat(dose) * wKg) / 1000;
    const mlPerDose = mgPerDose / parseFloat(conc);
    const iuPerDose = mlPerDose * 100;
    const mgPerWeek = mgPerDose * parseFloat(freq);
    const vialDays  = Math.round(parseFloat(vialMg) / (mgPerWeek / 7));
    setResult({ mlPerDose: mlPerDose.toFixed(3), iuPerDose: iuPerDose.toFixed(1), mgPerWeek: mgPerWeek.toFixed(3), vialDays });
  };

  const F = { width:"100%", padding:"10px 12px", fontSize:12, border:`1px solid ${BORDER}` };
  const L = { fontSize:9, letterSpacing:2, color:GOLD, textTransform:"uppercase", display:"block", marginBottom:6 };
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:12 }}>Tool</div>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(28px,5vw,48px)", fontWeight:300, marginBottom:10 }}>Peptide Calculator</h1>
          <p style={{ fontSize:12, color:DIM, lineHeight:1.7 }}>For research estimation only. Consult a healthcare professional for clinical protocols.</p>
        </div>
        <div style={{ border:`1px solid ${BORDER}`, padding:"36px 32px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <div><label style={L}>Body Weight</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 180" style={F} /></div>
            <div><label style={L}>Unit</label>
              <select value={unit} onChange={e => setUnit(e.target.value)} style={{ ...F, cursor:"pointer" }}>
                <option value="lbs">lbs</option><option value="kg">kg</option>
              </select>
            </div>
            <div><label style={L}>Dose (mcg / kg)</label><input type="number" value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 300" style={F} /></div>
            <div><label style={L}>Concentration (mg/mL)</label><input type="number" value={conc} onChange={e => setConc(e.target.value)} placeholder="e.g. 10" style={F} /></div>
            <div><label style={L}>Doses Per Week</label>
              <select value={freq} onChange={e => setFreq(e.target.value)} style={{ ...F, cursor:"pointer" }}>
                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}x / week</option>)}
              </select>
            </div>
            <div><label style={L}>Vial Size (mg)</label>
              <select value={vialMg} onChange={e => setVialMg(e.target.value)} style={{ ...F, cursor:"pointer" }}>
                {["2","5","10","50","500"].map(v => <option key={v} value={v}>{v} mg</option>)}
              </select>
            </div>
          </div>
          <Btn onClick={calculate} style={{ width:"100%" }}>Calculate</Btn>

          {result && (
            <div style={{ marginTop:28, paddingTop:28, borderTop:`1px solid ${BORDER}`, animation:"fadeUp .3s ease" }}>
              <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:18 }}>Results</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[["mL Per Dose",`${result.mlPerDose} mL`],["Insulin Units",`${result.iuPerDose} IU`],["mg Per Week",`${result.mgPerWeek} mg`],["Vial Duration",`~${result.vialDays} days`]].map(([l, v]) => (
                  <div key={l} style={{ padding:18, border:`1px solid ${BORDER}`, textAlign:"center" }}>
                    <div style={{ fontFamily:SERIF, fontSize:22, color:GOLD, marginBottom:4 }}>{v}</div>
                    <div style={{ fontSize:9, letterSpacing:2, color:DIM, textTransform:"uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop:16, padding:14, border:`1px solid rgba(201,168,76,.1)`, fontSize:10, color:"rgba(255,255,255,.28)", lineHeight:1.7 }}>
          For research estimation only. Not medical advice. Always consult a licensed professional before beginning any protocol.
        </div>
      </div>
    </div>
  );
}

// ── HOW TO USE PAGE ─────────────────────────────────────────────
const VIDEOS = [
  {
    id: "n8vk8DfwRHg",
    title: "How To Properly Reconstitute Peptides",
    desc: "Dr. Michael Nielsen MD walks through every step of reconstitution — the correct way to add BAC water, avoid contamination, and prepare your vial for use.",
    tag: "Reconstitution",
  },
  {
    id: "tcEWjyQfDLc",
    title: "Reconstitution & Injection — Full Demo",
    desc: "A healthcare team demonstrates the complete process from mixing your peptide vial with BAC water through to a proper subcutaneous injection.",
    tag: "Reconstitution + Injection",
  },
  {
    id: "jrLV99dJi14",
    title: "Peptide Safe Injection Techniques",
    desc: "Step-by-step injection walkthrough covering site selection, needle angle, sterile technique, and post-injection protocol for safe self-administration.",
    tag: "Injection & Safety",
  },
  {
    id: "zU5EYw06wtw",
    title: "Benefits & Risks of Peptide Therapeutics",
    desc: "A comprehensive breakdown of peptide categories — tissue repair, longevity, performance, and cognition — with an honest look at research status and safety.",
    tag: "Peptides Explained",
  },
];

function VideoCard({ video }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ border:`1px solid ${BORDER}`, overflow:"hidden", transition:"border-color .2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
      onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
    >
      <div style={{ position:"relative", aspectRatio:"16/9", background:"#0d0d0d" }}>
        {!loaded && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
            <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase" }}>Loading</div>
          </div>
        )}
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
          style={{ width:"100%", height:"100%", border:"none", display:"block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          title={video.title}
        />
      </div>
      <div style={{ padding:"18px 20px" }}>
        <div style={{ fontSize:8, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:6 }}>{video.tag}</div>
        <div style={{ fontFamily:SERIF, fontSize:17, marginBottom:8 }}>{video.title}</div>
        <div style={{ fontSize:11, color:DIM, lineHeight:1.7 }}>{video.desc}</div>
      </div>
    </div>
  );
}

function HowToPage() {
  const sections = [
    { title:"Reconstitution", icon:"💧", steps:[
      "Ensure hands and workspace are clean before handling any compounds.",
      "Remove the flip-off cap and wipe the vial stopper with an alcohol swab.",
      "Draw the required volume of BAC water into a syringe.",
      "Angle the needle against the glass — allow the water to drip slowly down the side of the vial.",
      "Do not inject directly onto the powder. Never shake — swirl gently until dissolved.",
      "Allow 5–10 minutes for the powder to fully dissolve. The solution should appear clear.",
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
      "What is BAC water? Bacteriostatic water contains 0.9% benzyl alcohol, which prevents bacterial contamination in reconstituted peptides.",
      "How do I confirm proper dissolution? The solution should be fully clear with no visible particulates.",
      "Can peptides be combined? Only under appropriate research conditions. Consult the relevant research literature.",
      "How long does shipping take? Typically 3–5 business days after payment confirmation.",
      "Do you offer consultations? Yes — contact us via the Contact page for a complimentary protocol consultation.",
    ]},
  ];
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        {sectionHead("Guide","How To Use & Store")}

        {/* Video Library */}
        <div style={{ marginBottom:60 }}>
          <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:10 }}>Video Library</div>
          <div style={{ fontFamily:SERIF, fontSize:26, fontWeight:300, marginBottom:8 }}>Watch Before You Begin</div>
          <p style={{ fontSize:12, color:DIM, lineHeight:1.8, marginBottom:32, maxWidth:620 }}>
            These videos walk through reconstitution, injection technique, safety protocols, and an overview of how peptides work. Watch all four before handling any compound.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))", gap:24 }}>
            {VIDEOS.map(v => <VideoCard key={v.id} video={v} />)}
          </div>
        </div>

        {/* Written guides */}
        <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:32 }}>Written Reference</div>
        {sections.map(s => (
          <div key={s.title} style={{ marginBottom:28, border:`1px solid ${BORDER}`, padding:"28px 32px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <h2 style={{ fontFamily:SERIF, fontSize:22, fontWeight:300, color:GOLD }}>{s.title}</h2>
            </div>
            {s.steps.map((step, i) => (
              <div key={i} style={{ display:"flex", gap:16, marginBottom:11, alignItems:"flex-start" }}>
                <span style={{ color:GOLD, fontSize:10, fontWeight:600, minWidth:18, paddingTop:2 }}>{String(i+1).padStart(2,"0")}</span>
                <span style={{ fontSize:12, color:DIM, lineHeight:1.75 }}>{step}</span>
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
  const pillars = [
    { icon:"🔄", title:"Recovery",   desc:"Accelerate tissue repair and reduce downtime with targeted peptide compounds." },
    { icon:"⚡", title:"Performance",desc:"Optimize growth hormone, endurance, and physical output for serious athletes." },
    { icon:"⏳", title:"Longevity",  desc:"Telomere support, NAD+ pathways, and mitochondrial health for healthy aging." },
    { icon:"✨", title:"Aesthetics", desc:"Skin regeneration, pigmentation support, and body composition enhancement." },
    { icon:"⚖️", title:"Metabolism", desc:"Advanced GLP-1 receptor agonists and metabolic peptides for body recomposition." },
    { icon:"🧠", title:"Cognitive",  desc:"Nootropic peptides for mental clarity, memory, and stress resilience." },
  ];
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ maxWidth:660, marginBottom:80 }}>
          <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:14 }}>Our Mission</div>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(30px,5vw,54px)", fontWeight:300, lineHeight:1.1, marginBottom:22 }}>
            Precision Research.<br /><span style={{ color:GOLD }}>Uncompromising Quality.</span>
          </h1>
          <p style={{ fontSize:13, color:DIM, lineHeight:1.9, marginBottom:18 }}>
            TruPep Wellness was founded in Miami with one goal: to provide serious researchers with access to the highest-quality peptide compounds available. Every product in our catalog is rigorously sourced and clearly labeled for research and educational purposes only.
          </p>
          <p style={{ fontSize:13, color:DIM, lineHeight:1.9 }}>
            We believe in total transparency — in our compounds, our compliance language, and our communication. Our team is available for complimentary consultations to help researchers identify the right compounds for their specific protocols.
          </p>
        </div>
        <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:36 }}>Research Pillars</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:22 }}>
          {pillars.map(p => (
            <div key={p.title} style={{ padding:"26px 22px", border:`1px solid ${BORDER}` }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{p.icon}</div>
              <div style={{ fontFamily:SERIF, fontSize:20, color:GOLD, marginBottom:7 }}>{p.title}</div>
              <div style={{ fontSize:11, color:DIM, lineHeight:1.75 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CONTACT PAGE ────────────────────────────────────────────────
function ContactPage() {
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
  const I = { ...inp, marginBottom:10 };
  return (
    <div style={{ padding:"100px 24px 80px" }}>
      <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:60, alignItems:"start" }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:14 }}>Get In Touch</div>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(28px,4vw,48px)", fontWeight:300, marginBottom:22 }}>Free Consultation</h1>
          <p style={{ fontSize:13, color:DIM, lineHeight:1.9, marginBottom:36 }}>Questions about compounds, your research protocol, or general inquiries — we're here to help.</p>
          {[["Email","trupepwellness@gmail.com"],["Phone","423-444-3668"],["Location","Miami, Florida"]].map(([k,v]) => (
            <div key={k} style={{ marginBottom:18, paddingBottom:18, borderBottom:`1px solid ${BORDER}` }}>
              <div style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:4 }}>{k}</div>
              <div style={{ fontSize:13 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ border:`1px solid ${BORDER}`, padding:"34px 30px" }}>
          {sent ? (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              <div style={{ fontFamily:SERIF, fontSize:28, color:GOLD, marginBottom:10 }}>Message Received</div>
              <div style={{ fontSize:12, color:DIM, lineHeight:1.8 }}>We'll be in touch within 24 hours. Thank you for reaching out to TruPep Wellness.</div>
            </div>
          ) : (
            <>
              {[["name","Full Name"],["email","Email Address"],["phone","Phone Number"]].map(([k,ph]) => (
                <input key={k} placeholder={ph} value={form[k]} onChange={set(k)} style={I} />
              ))}
              <select value={form.topic} onChange={set("topic")} style={{ ...I, cursor:"pointer" }}>
                <option value="">Topic / Interest</option>
                {["Weight Management","Recovery & Healing","Anti-Aging & Longevity","Performance","Aesthetics","Cognitive Support","General Inquiry"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <textarea value={form.message} onChange={set("message")} placeholder="Tell us about your research goals..." rows={5}
                style={{ ...I, resize:"none" }} />
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
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:9, letterSpacing:4, color:GOLD, textTransform:"uppercase", marginBottom:10 }}>TruPep Wellness · Legal</div>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(28px,5vw,48px)", fontWeight:300 }}>{title}</h1>
          <div style={{ fontSize:10, color:"rgba(255,255,255,.28)", marginTop:8 }}>Last updated: May 2025</div>
        </div>
        {sections.map(([heading, body]) => (
          <div key={heading} style={{ marginBottom:28, paddingBottom:28, borderBottom:`1px solid ${BORDER}` }}>
            <h2 style={{ fontFamily:SERIF, fontSize:19, color:GOLD, fontWeight:300, marginBottom:10 }}>{heading}</h2>
            <p style={{ fontSize:12, color:DIM, lineHeight:1.9 }}>{body}</p>
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
  useEffect(() => { const t = setTimeout(() => setPopup(true), 4000); return () => clearTimeout(t); }, []);

  return (
    <>
      <style>{G}</style>
      <Nav count={count} onCart={() => setCartOpen(true)} setPage={setPage} page={page} />
      <main>
        {page === "home"       && <HomePage       setPage={setPage} onAdd={add} />}
        {page === "products"   && <ProductsPage   onAdd={add} />}
        {page === "stacks"     && <StacksPage     setPage={setPage} />}
        {page === "calculator" && <CalculatorPage />}
        {page === "howto"      && <HowToPage />}
        {page === "about"      && <AboutPage />}
        {page === "contact"    && <ContactPage />}
        {page === "terms"      && <LegalPage title="Terms of Service"      sections={TERMS} />}
        {page === "privacy"    && <LegalPage title="Privacy Policy"        sections={PRIVACY} />}
        {page === "disclaimer" && <LegalPage title="Research Disclaimer"   sections={DISCLAIMER} />}
      </main>
      <Footer setPage={setPage} />
      {cartOpen && <CartDrawer cart={cart} total={total} onClose={() => setCartOpen(false)} onRemove={remove} onQty={setQty} onAdd={add} />}
      {popup    && <EmailPopup onClose={() => setPopup(false)} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
