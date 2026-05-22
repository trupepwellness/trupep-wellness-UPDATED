import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { GOLD, GOLD_LIGHT, GOLD_DARK, BLACK, WHITE, GRAY, SURFACE, SURFACE2, globalStyles, TP_LOGO_SRC, TPLogo, PRODUCTS, CATEGORIES, useCart, Nav, Hero, AboutSection, ProductCard, ProductsPage, CartDrawer, AboutPage, ContactPage, HomePage, Footer, STACKS, MOL_NET, DNA_HELIX, MOL_DRIP, MOL_SWIRL, MOL_FLOAT, MOL_BANNER1, DNA_BANNER } from './data.jsx'

// ─── EMAIL POPUP ──────────────────────────────────────────────────────────────
function EmailPopup({ onClose }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setSubmitting(true);
    try {
      await fetch("https://formspree.io/f/xvzyzgqa", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: "New Email List Signup — TruPep Wellness",
          subscriber_email: email,
          source: "Email popup — 10% discount offer",
        }),
      });
      setSubmitted(true);
    } catch (e) {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 3000,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.4s ease",
    }}>
      <div style={{
        background: SURFACE, border: `1px solid rgba(201,168,76,0.3)`,
        maxWidth: 460, width: "100%", padding: "48px 40px",
        position: "relative", animation: "fadeInUp 0.5s ease",
        boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.1)",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", color: GRAY,
          fontSize: 22, cursor: "pointer", lineHeight: 1,
        }}>×</button>

        {/* Gold top bar */}
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, marginBottom: 32, marginLeft: -40, marginRight: -40 }} />

        {!submitted ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 36, color: GOLD, marginBottom: 16 }}>✦</div>
              <h2 className="serif" style={{ fontSize: 32, fontWeight: 300, marginBottom: 12, letterSpacing: -0.5 }}>
                Welcome to TruPep Wellness
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.8, fontWeight: 300 }}>
                Join our exclusive wellness list and receive
              </p>
              <div style={{
                fontSize: 42, fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300, color: GOLD, margin: "12px 0",
                background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD_LIGHT})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>10% OFF</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.88)", letterSpacing: 1 }}>YOUR FIRST ORDER</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{
                  width: "100%", padding: "14px 18px",
                  background: BLACK, border: `1px solid rgba(201,168,76,0.25)`,
                  color: WHITE, fontSize: 13, outline: "none",
                  fontFamily: "'Montserrat', sans-serif",
                  marginBottom: 12,
                }}
              />
              <button className="btn-gold" style={{ width: "100%", textAlign: "center", opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Joining..." : "Claim My 10% Discount"}
              </button>
            </div>
            <button onClick={onClose} style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.25)",
              fontSize: 11, cursor: "pointer", width: "100%", textAlign: "center",
              fontFamily: "'Montserrat', sans-serif", letterSpacing: 1,
            }}>No thanks, I'll pay full price</button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, color: GOLD, marginBottom: 20 }}>✦</div>
            <h3 className="serif" style={{ fontSize: 28, fontWeight: 300, marginBottom: 12 }}>You're In!</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.8, marginBottom: 24 }}>
              Welcome to the TruPep Wellness family. Use code <span style={{ color: GOLD, fontWeight: 600 }}>WELCOME10</span> at checkout for your 10% discount.
            </p>
            <button className="btn-gold" onClick={onClose} style={{ margin: "0 auto" }}>Start Shopping</button>
          </div>
        )}

        {/* Bottom bar */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)`, marginTop: 32, marginLeft: -40, marginRight: -40 }} />
      </div>
    </div>
  );
}

// ─── STACKS PAGE ──────────────────────────────────────────────────────────────
function StacksPage({ onAdd, setPage }) {
  return (
    <div style={{ paddingTop: 80, background: BLACK, minHeight: "100vh", position:"relative", overflow:"hidden" }}>
      <img src={MOL_NET} alt="" aria-hidden="true" className="section-bg" style={{ opacity:0.18, animationDuration:"22s" }} />
      <img src={DNA_HELIX} alt="" aria-hidden="true" className="section-bg-alt" style={{ opacity:0.12, animationDuration:"30s", animationDelay:"8s" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 90% 60% at 50% 30%, rgba(10,10,10,0.6) 0%, transparent 100%)" }} />
      <div style={{ position:"relative", zIndex:1 }}>
      <div style={{
        padding: "80px 40px 60px", textAlign: "center",
        background: `linear-gradient(180deg, ${SURFACE} 0%, ${BLACK} 100%)`,
        borderBottom: `1px solid rgba(201,168,76,0.08)`,
      }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Curated Protocols</div>
        <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, letterSpacing: -1, marginBottom: 16 }}>
          Peptide <span style={{ color: GOLD }}>Stacks</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 13, letterSpacing: 0.5, fontWeight: 300, maxWidth: 600, margin: "0 auto" }}>
          Pre-built protocols curated by our wellness team. Each stack combines synergistic peptides for maximum results. Bundle pricing saves you up to 15%.
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 40px" }}>
        <div className="stacks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
          {STACKS.map(stack => (
            <div key={stack.id} className="card-hover gold-anim-card" style={{
              background: "rgba(17,14,6,0.85)", border: "1px solid rgba(201,168,76,0.08)",
              display: "flex", flexDirection: "column",
            }}>
              {/* Header */}
              <div style={{ padding: "32px 32px 20px", borderBottom: `1px solid rgba(201,168,76,0.08)` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ fontSize: 32, color: GOLD, opacity: 0.8 }}>{stack.icon}</div>
                  <div style={{
                    background: "rgba(201,168,76,0.1)", border: `1px solid rgba(201,168,76,0.2)`,
                    padding: "4px 12px", fontSize: 9, letterSpacing: 2, color: GOLD, textTransform: "uppercase",
                  }}>Save ${stack.total - stack.stackPrice}</div>
                </div>
                <h3 className="serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 6 }}>{stack.name}</h3>
                <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 12 }}>{stack.tagline}</div>
                <p style={{ fontSize: 12, lineHeight: 1.75, color: "rgba(255,255,255,0.88)", fontWeight: 300 }}>{stack.desc}</p>
              </div>

              {/* Items */}
              <div style={{ padding: "20px 32px" }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: GRAY, textTransform: "uppercase", marginBottom: 12 }}>Includes</div>
                {stack.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD }} />
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.92)" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: GRAY }}>${item.price}</span>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div style={{ padding: "0 32px 20px" }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: GRAY, textTransform: "uppercase", marginBottom: 12 }}>Key Benefits</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {stack.benefits.map((b, i) => (
                    <span key={i} style={{
                      fontSize: 9, letterSpacing: 1, padding: "4px 10px",
                      border: "1px solid rgba(201,168,76,0.15)", color: "rgba(255,255,255,0.88)",
                      textTransform: "uppercase",
                    }}>{b}</span>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }} />

              {/* Pricing & CTA */}
              <div style={{ padding: "20px 32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: GRAY, textTransform: "uppercase", marginBottom: 4 }}>Stack Price</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <span className="serif" style={{ fontSize: 32, color: GOLD }}>${stack.stackPrice}</span>
                      <span style={{ fontSize: 12, color: GRAY, textDecoration: "line-through" }}>${stack.total}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 10, color: "rgba(201,168,76,0.7)", letterSpacing: 1 }}>
                    {Math.round((1 - stack.stackPrice/stack.total)*100)}% OFF
                  </div>
                </div>
                <button className="btn-gold" style={{ width: "100%", textAlign: "center" }}
                  onClick={() => {
                    stack.items.forEach(item => {
                      onAdd({ id: stack.id + item.name, name: stack.name, variants: [{ label: item.name, price: item.price }] }, { label: item.name, price: item.price });
                    });
                  }}>
                  Add Stack to Bag
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom stack CTA */}
        <div style={{
          marginTop: 60, padding: "60px 40px", textAlign: "center",
          border: `1px solid rgba(201,168,76,0.15)`,
          background: "rgba(201,168,76,0.02)",
        }}>
          <div style={{ fontSize: 32, color: GOLD, marginBottom: 16 }}>◇</div>
          <h3 className="serif" style={{ fontSize: 36, fontWeight: 300, marginBottom: 12 }}>Need a Custom Protocol?</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 32px", fontWeight: 300 }}>
            Our wellness team can build a personalized peptide protocol tailored to your specific goals. Book a free consultation to get started.
          </p>
          <button className="btn-gold" onClick={() => setPage("consultation")}>Book Free Consultation</button>
        </div>
      </div>
      </div>{/* close position:relative wrapper */}
    </div>
  );
}

// ─── CONSULTATION PAGE ────────────────────────────────────────────────────────
function ConsultationPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", goals: "", experience: "", notes: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.goals) return;
    setSubmitting(true);
    try {
      await fetch("https://formspree.io/f/xvzyzgqa", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `Consultation Request from ${form.name}`,
          type: "FREE CONSULTATION REQUEST",
          name: form.name,
          email: form.email,
          phone: form.phone,
          wellness_goals: form.goals,
          peptide_experience: form.experience,
          additional_notes: form.notes,
        }),
      });
      setSent(true);
    } catch (e) { setSent(true); }
    setSubmitting(false);
  };

  return (
    <div style={{ paddingTop:80, background:BLACK, minHeight:"100vh", position:"relative", overflow:"hidden" }}>
      <img src={DNA_BANNER} alt="" aria-hidden="true" className="section-bg" style={{ animationDuration:"22s" }} />
      <img src={MOL_SWIRL} alt="" aria-hidden="true" className="section-bg-alt" style={{ animationDuration:"30s", animationDelay:"4s" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 80% 60% at 50% 40%, rgba(10,10,10,0.55) 0%, transparent 100%)" }} />
      <div style={{ position:"relative", zIndex:1 }}>
      <div style={{
        padding: "80px 40px 60px", textAlign: "center",
        background: `linear-gradient(180deg, ${SURFACE} 0%, ${BLACK} 100%)`,
      }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Personalized Guidance</div>
        <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, letterSpacing: -1, marginBottom: 16 }}>
          Free <span style={{ color: GOLD }}>Consultation</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 13, fontWeight: 300, maxWidth: 500, margin: "0 auto" }}>
          Let our wellness team build a personalized peptide protocol designed specifically for your goals. Completely free. No obligation.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
          {/* Info */}
          <div style={{ flex: "0 0 240px" }}>
            <div className="section-label">What to Expect</div>
            {[
              ["✦", "Personal Assessment", "We review your health goals, lifestyle, and experience level"],
              ["◈", "Custom Protocol", "We recommend the ideal peptide stack for your specific needs"],
              ["◇", "Ongoing Support", "We're available by phone and email throughout your wellness journey"],
              ["○", "Zero Pressure", "No obligation — just expert guidance to help you make informed decisions"],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ marginBottom: 32, display: "flex", gap: 16 }}>
                <div style={{ color: GOLD, fontSize: 16, marginTop: 2 }}>{icon}</div>
                <div>
                  <div className="serif" style={{ fontSize: 16, fontWeight: 400, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.88)", fontWeight: 300 }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: 20, border: `1px solid rgba(201,168,76,0.15)`, background: "rgba(201,168,76,0.02)", marginTop: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD, marginBottom: 8 }}>CALL OR TEXT DIRECTLY</div>
              <a href="tel:4234443668" style={{ fontSize: 18, color: WHITE, fontFamily: "'Cormorant Garamond', serif", textDecoration: "none" }}>423-444-3668</a>
            </div>
          </div>

          {/* Form */}
          <div style={{ flex: 1, minWidth: 280 }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 56, color: GOLD, marginBottom: 24 }}>✦</div>
                <h3 className="serif" style={{ fontSize: 32, fontWeight: 300, marginBottom: 16 }}>Request Received!</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.8 }}>
                  Thank you {form.name}! Our team will reach out to you at <span style={{ color: GOLD }}>{form.email}</span> or <span style={{ color: GOLD }}>{form.phone}</span> within 24 hours to schedule your free consultation.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { k: "name", l: "Full Name", t: "text", p: "Your full name" },
                  { k: "email", l: "Email Address", t: "email", p: "your@email.com" },
                  { k: "phone", l: "Phone Number", t: "tel", p: "555-123-4567" },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize: 9, letterSpacing: 3, color: GOLD, textTransform: "uppercase", display: "block", marginBottom: 8 }}>{f.l}</label>
                    <input type={f.t} placeholder={f.p} value={form[f.k]}
                      onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                      style={{ width: "100%", padding: "14px 18px", background: SURFACE, border: `1px solid rgba(201,168,76,0.15)`, color: WHITE, fontSize: 13, outline: "none", fontFamily: "'Montserrat', sans-serif" }}
                      onFocus={e => e.target.style.borderColor = GOLD}
                      onBlur={e => e.target.style.borderColor = "rgba(201,168,76,0.15)"}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 9, letterSpacing: 3, color: GOLD, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Your Wellness Goals</label>
                  <textarea placeholder="e.g. Weight loss, muscle recovery, anti-aging, energy, sleep improvement..." rows={3}
                    value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })}
                    style={{ width: "100%", padding: "14px 18px", background: SURFACE, border: `1px solid rgba(201,168,76,0.15)`, color: WHITE, fontSize: 13, resize: "vertical", outline: "none", fontFamily: "'Montserrat', sans-serif" }}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = "rgba(201,168,76,0.15)"}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 9, letterSpacing: 3, color: GOLD, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Peptide Experience Level</label>
                  <select value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                    style={{ width: "100%", padding: "14px 18px", background: SURFACE, border: `1px solid rgba(201,168,76,0.15)`, color: form.experience ? WHITE : GRAY, fontSize: 13, outline: "none", fontFamily: "'Montserrat', sans-serif" }}>
                    <option value="">Select your experience level</option>
                    <option value="beginner">Beginner — New to peptides</option>
                    <option value="intermediate">Intermediate — Some experience</option>
                    <option value="advanced">Advanced — Experienced user</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 9, letterSpacing: 3, color: GOLD, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Additional Notes (Optional)</label>
                  <textarea placeholder="Any health conditions, medications, or other information we should know..." rows={3}
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    style={{ width: "100%", padding: "14px 18px", background: SURFACE, border: `1px solid rgba(201,168,76,0.15)`, color: WHITE, fontSize: 13, resize: "vertical", outline: "none", fontFamily: "'Montserrat', sans-serif" }}
                  />
                </div>
                <button className="btn-gold" onClick={handleSubmit} disabled={submitting} style={{ alignSelf: "flex-start", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Submitting..." : "Request Free Consultation"}
                </button>
                <p style={{ fontSize: 10, color: GRAY, letterSpacing: 0.5, lineHeight: 1.7 }}>
                  By submitting you agree to be contacted by TruPep Wellness. We never share your information with third parties.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TESTIMONIALS PAGE ────────────────────────────────────────────────────────
function TestimonialsPage({ setPage }) {
  const testimonials = [
    { name: "J.M.", location: "Miami, FL", category: "Weight Loss", rating: 5, text: "TruPep completely transformed my body composition. After 3 months on the Weight Loss Stack I lost 28 lbs. The quality of the products is unmatched and the team was incredibly helpful throughout my entire protocol.", protocol: "Weight Loss Stack" },
    { name: "A.R.", location: "Miami Beach, FL", category: "Recovery", rating: 5, text: "As a professional athlete I was skeptical at first. BPC-157 and TB-500 from TruPep helped me recover from a torn labrum significantly faster than expected. My surgeon was amazed at my recovery timeline.", protocol: "Recovery Stack" },
    { name: "D.T.", location: "Brickell, FL", category: "Anti-Aging", rating: 5, text: "I've been on the Anti-Aging stack for 4 months. My skin looks 10 years younger, my energy levels are through the roof and my labs show remarkable improvements. TruPep is the gold standard.", protocol: "Anti-Aging Stack" },
    { name: "S.L.", location: "Coral Gables, FL", category: "Aesthetics", rating: 5, text: "The GLOW stack is absolutely incredible. My skin has never looked better and I've received so many compliments. The GHK-Cu alone was worth every penny. TruPep has a customer for life.", protocol: "Glow & Aesthetics Stack" },
    { name: "M.K.", location: "Aventura, FL", category: "Performance", rating: 5, text: "Tristan and his team are incredibly knowledgeable. They put me on a custom performance protocol and my strength and body composition have improved dramatically. The consultation was incredibly helpful.", protocol: "Performance Stack" },
    { name: "C.V.", location: "South Beach, FL", category: "Cognitive", rating: 5, text: "I started the cognitive stack for work performance and the difference is night and day. My focus, memory and stress tolerance have all improved significantly. Premium products, premium results.", protocol: "Cognitive & Mood Stack" },
    { name: "R.P.", location: "Wynwood, FL", category: "Weight Loss", rating: 5, text: "Tirzepatide from TruPep changed everything for me. Down 40 lbs in 5 months. The ordering process was smooth, communication was excellent and the product quality speaks for itself.", protocol: "Custom Protocol" },
    { name: "T.H.", location: "Key Biscayne, FL", category: "Recovery", rating: 5, text: "After knee surgery I turned to TruPep on a recommendation. The Recovery Stack accelerated my healing significantly. I was back on the tennis court 6 weeks ahead of schedule. Absolutely remarkable.", protocol: "Recovery Stack" },
    { name: "L.F.", location: "Pinecrest, FL", category: "Longevity", rating: 5, text: "I'm 58 years old and feel better than I did at 40. NAD+ and Epithalon from TruPep have been game changers for my energy, sleep and overall vitality. The free consultation was incredibly valuable.", protocol: "Anti-Aging Stack" },
  ];

  return (
    <div style={{ paddingTop:80, background:BLACK, minHeight:"100vh", position:"relative", overflow:"hidden" }}>
      <img src={MOL_NET} alt="" aria-hidden="true" className="section-bg" style={{ animationDuration:"22s" }} />
      <img src={MOL_DRIP} alt="" aria-hidden="true" className="section-bg-alt" style={{ animationDuration:"30s", animationDelay:"4s" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 80% 60% at 50% 40%, rgba(10,10,10,0.55) 0%, transparent 100%)" }} />
      <div style={{ position:"relative", zIndex:1 }}>
      <div style={{
        padding: "80px 40px 60px", textAlign: "center",
        background: `linear-gradient(180deg, ${SURFACE} 0%, ${BLACK} 100%)`,
      }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Client Results</div>
        <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, letterSpacing: -1, marginBottom: 16 }}>
          Real People. <span style={{ color: GOLD }}>Real Results.</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 13, fontWeight: 300, maxWidth: 500, margin: "0 auto" }}>
          Hear from our clients across Miami who have transformed their wellness with TruPep protocols.
        </p>
        {/* Stars */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 24 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ color: GOLD, fontSize: 20 }}>★</span>)}
        </div>
        <div style={{ fontSize: 11, color: GRAY, letterSpacing: 2, marginTop: 8 }}>5.0 AVERAGE RATING · {testimonials.length} REVIEWS</div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 40px" }}>
        <div className="stacks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: SURFACE2, padding: "36px 32px",
              borderTop: `2px solid ${GOLD}`,
              display: "flex", flexDirection: "column",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: GOLD, fontSize: 12 }}>★</span>)}
              </div>
              {/* Quote */}
              <div style={{ fontSize: 28, color: GOLD, opacity: 0.3, lineHeight: 1, marginBottom: 8, fontFamily: "serif" }}>"</div>
              <p className="serif" style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.92)", fontStyle: "italic", marginBottom: 24, flex: 1 }}>
                {t.text}
              </p>
              {/* Protocol tag */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, color: GOLD, border: `1px solid rgba(201,168,76,0.2)`, padding: "4px 10px", textTransform: "uppercase" }}>
                  {t.protocol}
                </span>
              </div>
              {/* Author */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: 2, color: GOLD, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: GRAY, letterSpacing: 1, marginTop: 2 }}>{t.location}</div>
                </div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>{t.category}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 60, padding: "60px 40px", textAlign: "center",
          background: `linear-gradient(135deg, rgba(201,168,76,0.06), transparent, rgba(201,168,76,0.04))`,
          border: `1px solid rgba(201,168,76,0.12)`,
        }}>
          <h3 className="serif" style={{ fontSize: 40, fontWeight: 300, marginBottom: 12 }}>
            Ready to Write Your <span style={{ color: GOLD }}>Success Story?</span>
          </h3>
          <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 13, marginBottom: 32, fontWeight: 300 }}>
            Join hundreds of Miami clients who have transformed their health with TruPep Wellness.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-gold" onClick={() => setPage("consultation")}>Book Free Consultation</button>
            <button className="btn-outline" onClick={() => setPage("products")}>Shop Products</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GOLD BORDER COMPONENT ───────────────────────────────────────────────────
function GoldBorder() {
  const [scrollY, setScrollY] = useState(0);
  const [opacity, setOpacity] = useState(0.4);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          setScrollY(y);
          // Pulse brighter as you scroll, settle back
          const pulse = Math.min(0.85, 0.35 + (y % 300) / 300 * 0.5);
          setOpacity(pulse);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const borderColor = `rgba(201,168,76,${opacity})`;
  const glowColor  = `rgba(201,168,76,${opacity * 0.5})`;
  const thickness  = 2;

  // Shimmer gradient that shifts with scroll
  const gradientPos = (scrollY * 0.3) % 360;
  const shimmerGrad = `linear-gradient(${gradientPos}deg,
    rgba(160,120,48,0.6),
    rgba(232,201,106,1),
    rgba(201,168,76,0.9),
    rgba(255,235,150,1),
    rgba(201,168,76,0.7),
    rgba(160,120,48,0.6)
  )`;

  const edgeStyle = (pos) => {
    const base = {
      position: "fixed", zIndex: 9999, pointerEvents: "none",
      background: shimmerGrad,
      boxShadow: `0 0 18px 2px ${glowColor}, 0 0 6px 1px ${borderColor}`,
      transition: "box-shadow 0.3s ease",
    };
    if (pos === "top")    return { ...base, top: 0, left: 0, right: 0, height: thickness };
    if (pos === "bottom") return { ...base, bottom: 0, left: 0, right: 0, height: thickness };
    if (pos === "left")   return { ...base, top: 0, left: 0, bottom: 0, width: thickness };
    if (pos === "right")  return { ...base, top: 0, right: 0, bottom: 0, width: thickness };
  };

  // Corner gems
  const cornerSize = 10;
  const cornerStyle = (top, left, right, bottom) => ({
    position: "fixed", zIndex: 10000, pointerEvents: "none",
    width: cornerSize, height: cornerSize,
    borderRadius: "50%",
    background: `radial-gradient(circle, #fff8e0, ${GOLD_LIGHT}, ${GOLD})`,
    boxShadow: `0 0 12px 4px ${glowColor}, 0 0 4px 1px ${GOLD}`,
    animation: "goldCornerPulse 3s ease-in-out infinite",
    top, left, right, bottom,
  });

  return (
    <>
      <div style={edgeStyle("top")} />
      <div style={edgeStyle("bottom")} />
      <div style={edgeStyle("left")} />
      <div style={edgeStyle("right")} />
      <div style={cornerStyle(0, 0, undefined, undefined)} />
      <div style={cornerStyle(0, undefined, 0, undefined)} />
      <div style={cornerStyle(undefined, 0, undefined, 0)} />
      <div style={cornerStyle(undefined, undefined, 0, 0)} />
    </>
  );
}

// ─── PEPTIDE CALCULATOR ───────────────────────────────────────────────────────
function CalculatorPage() {
  const [vialMg, setVialMg]     = useState("");
  const [bacMl, setBacMl]       = useState("");
  const [doseMcg, setDoseMcg]   = useState("");
  const [syringeType, setSyringeType] = useState("100");
  const [result, setResult]     = useState(null);

  const TRUPEP_PRODUCTS = PRODUCTS.filter(p => p.category !== "Supplies" && p.category !== "Metabolism" || p.name.includes("MOTS")).map(p => ({
    name: p.name, mg: parseFloat(p.variants[0].label)
  })).filter(p => !isNaN(p.mg));

  const calculate = () => {
    const vial = parseFloat(vialMg);
    const bac  = parseFloat(bacMl);
    const dose = parseFloat(doseMcg);
    const syringeUnits = parseInt(syringeType);
    if (!vial || !bac || !dose || vial <= 0 || bac <= 0 || dose <= 0) {
      setResult({ error: "Please fill in all fields with valid numbers." });
      return;
    }
    const concMcgPerMl = (vial * 1000) / bac;         // mcg per ml
    const volumeNeededMl = dose / concMcgPerMl;        // ml needed
    const unitsOnSyringe = volumeNeededMl * syringeUnits; // units to draw
    const daysSupply = Math.floor((vial * 1000 / dose));
    setResult({
      concMcgPerMl: concMcgPerMl.toFixed(2),
      volumeNeededMl: volumeNeededMl.toFixed(3),
      unitsOnSyringe: unitsOnSyringe.toFixed(1),
      daysSupply,
      syringeUnits,
    });
  };

  const inputStyle = { width:"100%", padding:"14px 18px", background:SURFACE, border:`1px solid rgba(201,168,76,0.25)`, color:WHITE, fontSize:15, fontFamily:"'Montserrat',sans-serif", outline:"none", transition:"border 0.2s", borderRadius:0 };

  return (
    <div style={{ paddingTop:80, background:BLACK, minHeight:"100vh", position:"relative", overflow:"hidden" }}>
      <img src={MOL_SWIRL} alt="" aria-hidden="true" className="section-bg" style={{ animationDuration:"22s" }} />
      <img src={MOL_FLOAT} alt="" aria-hidden="true" className="section-bg-alt" style={{ animationDuration:"30s", animationDelay:"4s" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 80% 60% at 50% 40%, rgba(10,10,10,0.55) 0%, transparent 100%)" }} />
      <div style={{ position:"relative", zIndex:1 }}>
      <div style={{ padding:"80px 40px 60px", textAlign:"center", background:`linear-gradient(180deg,${SURFACE} 0%,${BLACK} 100%)` }}>
        <div className="section-label" style={{ justifyContent:"center" }}>TruPep Tool</div>
        <h1 className="serif" style={{ fontSize:"clamp(36px,5vw,64px)", fontWeight:300, letterSpacing:-1, marginBottom:16 }}>
          Peptide <span style={{ color:GOLD }}>Calculator</span>
        </h1>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:300, maxWidth:600, margin:"0 auto" }}>
          Calculate exactly how many units to draw on your insulin syringe based on your vial size, BAC water volume, and desired dose.
        </p>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"60px 40px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:48 }}>

          {/* ── INPUT PANEL ── */}
          <div>
            <div className="section-label">Enter Your Values</div>

            {/* Quick select from TruPep products */}
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", display:"block", marginBottom:8 }}>
                Quick Select — TruPep Product
              </label>
              <select onChange={e => { const v = e.target.value; if(v) setVialMg(v); }}
                style={{ ...inputStyle, color: "rgba(255,255,255,0.92)" }}>
                <option value="">— Select a peptide to auto-fill vial size —</option>
                {TRUPEP_PRODUCTS.slice(0,20).map(p => (
                  <option key={p.name} value={p.mg}>{p.name} — {p.mg}mg</option>
                ))}
              </select>
            </div>

            {/* Vial size */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", display:"block", marginBottom:8 }}>
                Peptide Vial Size (mg) <span style={{ color:"#ff6060" }}>*</span>
              </label>
              <input type="number" placeholder="e.g. 10" value={vialMg}
                onChange={e=>setVialMg(e.target.value)}
                onFocus={e=>e.target.style.borderColor=GOLD}
                onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.25)"}
                style={inputStyle} />
              <div style={{ fontSize:10, color:GRAY, marginTop:4 }}>The total mg in your peptide vial</div>
            </div>

            {/* BAC Water */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", display:"block", marginBottom:8 }}>
                BAC Water to Add (ml) <span style={{ color:"#ff6060" }}>*</span>
              </label>
              <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                {["1","2","3"].map(v=>(
                  <button key={v} onClick={()=>setBacMl(v)} style={{
                    padding:"6px 16px", fontSize:11, letterSpacing:1,
                    border:`1px solid ${bacMl===v ? GOLD : "rgba(255,255,255,0.15)"}`,
                    background: bacMl===v ? "rgba(201,168,76,0.15)" : "transparent",
                    color: bacMl===v ? GOLD : "rgba(255,255,255,0.5)", cursor:"pointer",
                    fontFamily:"'Montserrat',sans-serif",
                  }}>{v} ml</button>
                ))}
              </div>
              <input type="number" placeholder="or type custom amount" value={bacMl}
                onChange={e=>setBacMl(e.target.value)}
                onFocus={e=>e.target.style.borderColor=GOLD}
                onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.25)"}
                style={inputStyle} />
              <div style={{ fontSize:10, color:GRAY, marginTop:4 }}>TruPep recommends 1–2ml per vial</div>
            </div>

            {/* Dose */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", display:"block", marginBottom:8 }}>
                Desired Dose (mcg) <span style={{ color:"#ff6060" }}>*</span>
              </label>
              <input type="number" placeholder="e.g. 250" value={doseMcg}
                onChange={e=>setDoseMcg(e.target.value)}
                onFocus={e=>e.target.style.borderColor=GOLD}
                onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.25)"}
                style={inputStyle} />
              <div style={{ fontSize:10, color:GRAY, marginTop:4 }}>1mg = 1000mcg. Consult your wellness protocol.</div>
            </div>

            {/* Syringe type */}
            <div style={{ marginBottom:28 }}>
              <label style={{ fontSize:9, letterSpacing:3, color:GOLD, textTransform:"uppercase", display:"block", marginBottom:8 }}>
                Insulin Syringe Type
              </label>
              <div style={{ display:"flex", gap:8 }}>
                {[["100","100 Unit (1ml)"],["50","50 Unit (0.5ml)"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setSyringeType(v)} style={{
                    flex:1, padding:"10px", fontSize:10, letterSpacing:1,
                    border:`1px solid ${syringeType===v ? GOLD : "rgba(255,255,255,0.15)"}`,
                    background: syringeType===v ? "rgba(201,168,76,0.15)" : "transparent",
                    color: syringeType===v ? GOLD : "rgba(255,255,255,0.5)", cursor:"pointer",
                    fontFamily:"'Montserrat',sans-serif", lineHeight:1.5,
                  }}>{l}</button>
                ))}
              </div>
            </div>

            <button className="btn-gold" style={{ width:"100%", padding:"16px", fontSize:12 }} onClick={calculate}>
              Calculate My Dose
            </button>
          </div>

          {/* ── RESULTS PANEL ── */}
          <div>
            <div className="section-label">Your Results</div>

            {!result && (
              <div style={{ padding:"60px 32px", textAlign:"center", border:`1px solid rgba(201,168,76,0.1)`, background:"rgba(201,168,76,0.02)" }}>
                <div style={{ fontSize:48, color:"rgba(201,168,76,0.2)", marginBottom:16 }}>◈</div>
                <div style={{ fontSize:12, color:GRAY, letterSpacing:1 }}>Fill in your values and tap Calculate</div>
              </div>
            )}

            {result?.error && (
              <div style={{ padding:24, border:"1px solid rgba(255,80,80,0.3)", color:"#ff8080", fontSize:13 }}>{result.error}</div>
            )}

            {result && !result.error && (
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>

                {/* Main result — units to draw */}
                <div style={{ background:`linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.06))`, border:`1px solid rgba(201,168,76,0.3)`, padding:"32px", textAlign:"center" }}>
                  <div style={{ fontSize:10, letterSpacing:3, color:GOLD, textTransform:"uppercase", marginBottom:8 }}>Draw This Many Units</div>
                  <div className="serif" style={{ fontSize:72, fontWeight:300, color:GOLD, lineHeight:1 }}>{result.unitsOnSyringe}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:8 }}>units on a {result.syringeUnits}-unit insulin syringe</div>
                </div>

                {/* Breakdown */}
                {[
                  ["Concentration", `${result.concMcgPerMl} mcg/ml`, "After adding BAC water to vial"],
                  ["Volume to Inject", `${result.volumeNeededMl} ml`, "Amount of liquid to draw"],
                  ["Estimated Supply", `${result.daysSupply} doses`, "Per vial at this dose"],
                ].map(([label, value, note])=>(
                  <div key={label} style={{ background:SURFACE2, padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:10, letterSpacing:2, color:GRAY, textTransform:"uppercase" }}>{label}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{note}</div>
                    </div>
                    <div className="serif" style={{ fontSize:22, color:WHITE }}>{value}</div>
                  </div>
                ))}

                {/* Warning */}
                <div style={{ padding:"16px 20px", background:"rgba(201,168,76,0.04)", border:`1px solid rgba(201,168,76,0.15)`, marginTop:8 }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", lineHeight:1.8, letterSpacing:0.3 }}>
                    ⚠ <strong style={{ color:"rgba(255,255,255,0.6)" }}>Research Disclaimer:</strong> This calculator is for informational purposes only. Always consult a qualified healthcare professional before beginning any peptide protocol. Doses vary by individual and peptide compound.
                  </div>
                </div>

                {/* CTA to book consultation */}
                <button className="btn-outline" style={{ width:"100%", marginTop:8 }} onClick={()=>window.scrollTo(0,0)}>
                  Questions? Book a Free Consultation
                </button>
              </div>
            )}

            {/* How it works */}
            <div style={{ marginTop:32, padding:"24px", border:`1px solid rgba(201,168,76,0.1)` }}>
              <div style={{ fontSize:10, letterSpacing:3, color:GOLD, marginBottom:16 }}>HOW THE MATH WORKS</div>
              {[
                ["Step 1", "Concentration = (Vial mg × 1000) ÷ BAC Water ml"],
                ["Step 2", "Volume = Desired Dose mcg ÷ Concentration"],
                ["Step 3", "Units = Volume ml × Syringe Units"],
              ].map(([step, formula])=>(
                <div key={step} style={{ display:"flex", gap:12, marginBottom:12 }}>
                  <div style={{ fontSize:9, letterSpacing:2, color:GOLD, minWidth:48 }}>{step}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"monospace" }}>{formula}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HOW TO USE PAGE ──────────────────────────────────────────────────────────
function HowToUsePage({ setPage }) {
  const steps = [
    {
      num:"01", icon:"🧼", title:"Wash Your Hands",
      desc:"Thoroughly wash your hands with soap and warm water for at least 20 seconds before handling any peptide vials, syringes, or injection sites. This is the single most important step for preventing infection.",
    },
    {
      num:"02", icon:"🧪", title:"Gather Your Supplies",
      desc:"You will need: your peptide vial, BAC Water (30ml), a 1ml insulin syringe (100 units), alcohol swabs, and a clean surface. Never reuse syringes — use a fresh one for every injection.",
    },
    {
      num:"03", icon:"💧", title:"Reconstitute Your Vial",
      desc:"Wipe the top of both your peptide vial and BAC Water vial with an alcohol swab. Draw your desired amount of BAC Water into the syringe. Insert the needle into the peptide vial and slowly push the BAC Water down the side of the vial — never directly onto the powder. Swirl gently. Never shake.",
    },
    {
      num:"04", icon:"🧮", title:"Calculate Your Dose",
      desc:"Use the TruPep Peptide Calculator above to determine exactly how many units to draw. The standard formula: draw BAC Water amount ÷ peptide mg × desired dose. Our calculator does this math for you automatically.",
    },
    {
      num:"05", icon:"💉", title:"Draw Your Dose",
      desc:"Wipe the reconstituted vial top with an alcohol swab. Insert the syringe and draw your calculated unit amount. Remove air bubbles by gently tapping the syringe and pressing the plunger slightly.",
    },
    {
      num:"06", icon:"📍", title:"Inject Subcutaneously",
      desc:"Most peptides are injected subcutaneously (under the skin) — not intramuscularly. Common sites include the abdomen (2 inches from navel), outer thigh, or lower back. Pinch the skin, insert at 45° angle, inject slowly, and release. Rotate injection sites daily.",
    },
    {
      num:"07", icon:"🗑️", title:"Safe Disposal",
      desc:"Never recap used needles. Dispose of syringes immediately in a sharps container. Never throw loose needles in the trash. Most pharmacies offer free sharps disposal programs.",
    },
  ];

  const storage = [
    { icon:"🧊", title:"Unreconstituted Vials", rule:"Store in a cool, dry place away from direct light. Refrigeration is recommended but not always required. Never freeze." },
    { icon:"❄️", title:"Reconstituted Vials", rule:"Always refrigerate after adding BAC Water. Use within 28–30 days. Keep upright and away from light. Never freeze reconstituted peptides." },
    { icon:"🌡️", title:"Lipo C with B12", rule:"This liquid blend does NOT require refrigeration. Store at room temperature away from direct sunlight and heat sources." },
    { icon:"🚫", title:"What to Avoid", rule:"Never expose peptides to direct sunlight, heat sources, or extreme temperature changes. Never use a vial that looks cloudy, discolored, or has particles floating in it." },
  ];

  const safety = [
    "Always use a brand new syringe for every injection — never share or reuse needles",
    "Swab injection sites and vial tops with alcohol before every use",
    "Rotate injection sites to prevent tissue damage and lipodystrophy",
    "Never inject into an area that is red, swollen, bruised, or infected",
    "Start with the lowest effective dose and adjust gradually",
    "Keep a log of your injections — date, time, dose, and injection site",
    "Store all peptides out of reach of children",
    "Consult a healthcare professional before starting any new peptide protocol",
    "If you experience unusual swelling, redness, or an allergic reaction, stop use and seek medical attention immediately",
    "Never mix peptides in the same syringe unless specifically instructed by your wellness provider",
  ];

  return (
    <div style={{ paddingTop:80, background:BLACK, minHeight:"100vh", position:"relative", overflow:"hidden" }}>
      <img src={MOL_FLOAT} alt="" aria-hidden="true" className="section-bg" style={{ animationDuration:"22s" }} />
      <img src={DNA_HELIX} alt="" aria-hidden="true" className="section-bg-alt" style={{ animationDuration:"30s", animationDelay:"4s" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 80% 60% at 50% 40%, rgba(10,10,10,0.55) 0%, transparent 100%)" }} />
      <div style={{ position:"relative", zIndex:1 }}>
      <div style={{ padding:"80px 40px 60px", textAlign:"center", background:`linear-gradient(180deg,${SURFACE} 0%,${BLACK} 100%)` }}>
        <div className="section-label" style={{ justifyContent:"center" }}>Getting Started</div>
        <h1 className="serif" style={{ fontSize:"clamp(36px,5vw,64px)", fontWeight:300, letterSpacing:-1, marginBottom:16 }}>
          How To <span style={{ color:GOLD }}>Use Your Peptides</span>
        </h1>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:300, maxWidth:600, margin:"0 auto" }}>
          A complete guide to safe reconstitution, proper dosing, storage best practices, and injection technique — everything you need to use your TruPep order with confidence.
        </p>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"60px 40px" }}>

        {/* Video Section */}
        <div style={{ marginBottom:80 }}>
          <div className="section-label">Video Guide</div>
          <h2 className="serif" style={{ fontSize:36, fontWeight:300, marginBottom:32 }}>Watch Before You Start</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:24 }}>
            {[
              { id:"L65S1xmKY44", title:"How To Correctly Prepare & Inject Your Peptides", desc:"Dr. Jones walks you through exact gear, reconstitution technique, and injection method step by step." },
              { id:"BxvwvpbFvDQ", title:"10 Peptides in 5 Minutes — Healing, Testosterone & Fat Loss", desc:"A fast, clear overview of the best peptides for recovery, hormones, and body composition." },
              { id:"uf4FSQljPHw", title:"Everything You Need To Know Before Starting Peptides", desc:"Dr. Jones covers risks, rewards, and the foundational steps every beginner needs before starting." },
            ].map(v=>(
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration:"none", display:"block" }}
              >
                <div style={{ background:SURFACE2, border:`1px solid rgba(201,168,76,0.15)`, overflow:"hidden", transition:"all 0.3s", cursor:"pointer" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.3)`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(201,168,76,0.15)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                >
                  {/* Thumbnail */}
                  <div style={{ position:"relative", paddingBottom:"56.25%", background:"#000", overflow:"hidden" }}>
                    <img
                      src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                      alt={v.title}
                      style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.85 }}
                    />
                    {/* Play button overlay */}
                    <div style={{
                      position:"absolute", inset:0,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background:"rgba(0,0,0,0.25)",
                    }}>
                      <div style={{
                        width:60, height:60, borderRadius:"50%",
                        background:"rgba(201,168,76,0.92)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow:`0 0 0 8px rgba(201,168,76,0.2)`,
                      }}>
                        <div style={{ width:0, height:0, borderTop:"11px solid transparent", borderBottom:"11px solid transparent", borderLeft:`18px solid #0A0A0A`, marginLeft:4 }} />
                      </div>
                    </div>
                    {/* YouTube badge */}
                    <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(0,0,0,0.75)", padding:"3px 8px", fontSize:9, color:"rgba(255,255,255,0.7)", letterSpacing:1 }}>
                      YOUTUBE
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{ padding:"16px 20px", borderTop:`1px solid rgba(201,168,76,0.1)` }}>
                    <div style={{ fontSize:13, color:GOLD, fontFamily:"'Cormorant Garamond',serif", fontWeight:400, marginBottom:6, lineHeight:1.4 }}>{v.title}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.6, marginBottom:10 }}>{v.desc}</div>
                    <div style={{ fontSize:9, color:GOLD, letterSpacing:2, textTransform:"uppercase" }}>Watch on YouTube ↗</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Step by step */}
        <div style={{ marginBottom:80 }}>
          <div className="section-label">Step-by-Step Protocol</div>
          <h2 className="serif" style={{ fontSize:36, fontWeight:300, marginBottom:40 }}>
            Reconstitution & <span style={{ color:GOLD }}>Injection Guide</span>
          </h2>
          {steps.map((s,i)=>(
            <div key={s.num} style={{ display:"flex", gap:24, padding:"28px 0", borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
              <div style={{ flexShrink:0, textAlign:"center" }}>
                <div className="serif" style={{ fontSize:32, color:"rgba(201,168,76,0.3)", lineHeight:1 }}>{s.num}</div>
                <div style={{ fontSize:24, marginTop:4 }}>{s.icon}</div>
              </div>
              <div>
                <h3 className="serif" style={{ fontSize:22, fontWeight:400, color:WHITE, marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:13, lineHeight:1.9, color:"rgba(255,255,255,0.65)", fontWeight:300 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Storage */}
        <div style={{ marginBottom:80 }}>
          <div className="section-label">Storage Guidelines</div>
          <h2 className="serif" style={{ fontSize:36, fontWeight:300, marginBottom:32 }}>
            Proper <span style={{ color:GOLD }}>Storage</span>
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:2 }}>
            {storage.map(s=>(
              <div key={s.title} style={{ background:SURFACE2, padding:"28px 24px", borderTop:`2px solid rgba(201,168,76,0.3)` }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                <h3 style={{ fontSize:13, letterSpacing:2, fontWeight:600, color:GOLD, textTransform:"uppercase", marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:12, lineHeight:1.8, color:"rgba(255,255,255,0.65)", fontWeight:300 }}>{s.rule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Checklist */}
        <div style={{ marginBottom:80 }}>
          <div className="section-label">Safety Protocol</div>
          <h2 className="serif" style={{ fontSize:36, fontWeight:300, marginBottom:32 }}>
            Safety <span style={{ color:GOLD }}>Checklist</span>
          </h2>
          <div style={{ background:SURFACE, border:`1px solid rgba(201,168,76,0.12)`, padding:"32px" }}>
            {safety.map((s,i)=>(
              <div key={i} style={{ display:"flex", gap:16, padding:"14px 0", borderBottom: i<safety.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ color:GOLD, fontSize:14, marginTop:1, flexShrink:0 }}>✦</div>
                <p style={{ fontSize:13, lineHeight:1.7, color:"rgba(255,255,255,0.72)", fontWeight:300 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom:80 }}>
          <div className="section-label">Common Questions</div>
          <h2 className="serif" style={{ fontSize:36, fontWeight:300, marginBottom:32 }}>FAQ</h2>
          {[
            ["How much BAC water should I use?","TruPep recommends 1–2ml per vial for most peptides. Use our Peptide Calculator to determine the exact draw amount based on your dose. Less BAC water = more concentrated solution = fewer units to draw."],
            ["How long does a reconstituted vial last?","Once mixed with BAC Water, peptides should be refrigerated and used within 28–30 days. Write the reconstitution date on your vial with a marker."],
            ["What size syringe should I use?","A standard 29–31 gauge, 0.5–1ml insulin syringe (100 units) is recommended for subcutaneous peptide injections. These are available at most pharmacies without a prescription."],
            ["Where should I inject?","The most common subcutaneous sites are the abdomen (pinch belly fat, 2 inches from navel), outer thigh, or lower back. Rotate sites every injection to prevent irritation."],
            ["What if I see cloudiness or particles in my vial?","Do not use a vial that appears cloudy, discolored, or has floating particles. Discard it and contact us at trupepwellness@gmail.com or 423-444-3668."],
            ["Do I need to refrigerate before reconstituting?","Lyophilized (freeze-dried) peptide vials can be stored in a cool, dry place before mixing. After adding BAC Water they must be refrigerated. Exception: Lipo C with B12 is a liquid and should NOT be refrigerated."],
          ].map(([q,a],i)=>(
            <details key={i} style={{ marginBottom:2 }}>
              <summary style={{ padding:"20px 24px", background:SURFACE2, cursor:"pointer", fontSize:14, color:WHITE, fontFamily:"'Cormorant Garamond',serif", fontWeight:400, listStyle:"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {q} <span style={{ color:GOLD, fontSize:18 }}>+</span>
              </summary>
              <div style={{ padding:"20px 24px", background:SURFACE, fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.9, fontWeight:300 }}>{a}</div>
            </details>
          ))}
        </div>

        {/* Calculator CTA */}
        <div style={{ padding:"48px", textAlign:"center", border:`1px solid rgba(201,168,76,0.15)`, background:"rgba(201,168,76,0.02)" }}>
          <div style={{ fontSize:32, color:GOLD, marginBottom:16 }}>◈</div>
          <h3 className="serif" style={{ fontSize:32, fontWeight:300, marginBottom:12 }}>Ready to Calculate Your Dose?</h3>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:28, fontWeight:300 }}>Use the TruPep Peptide Calculator to get your exact injection units in seconds.</p>
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-gold" onClick={()=>setPage("calculator")}>Open Calculator</button>
            <button className="btn-outline" onClick={()=>setPage("consultation")}>Book Consultation</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRINTABLE ORDER INSERT ───────────────────────────────────────────────────
function PrintInsertPage() {
  const qrUrl = "https://trupepwellness.com/how-to-use";
  useEffect(() => {
    // Auto-trigger print dialog after a short delay
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div id="print-insert" style={{ background:WHITE, color:"#111", fontFamily:"'Montserrat',sans-serif", padding:0, margin:0 }}>
      <style>{`
        @media print {
          body { margin:0; padding:0; background:white; }
          #print-insert { width:8.5in; min-height:11in; padding:0.5in; }
          .no-print { display:none !important; }
        }
        #print-insert { max-width:800px; margin:0 auto; padding:40px; }
        .insert-gold { color:#A07830; }
        .insert-section { margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #e0d5c0; }
        .insert-h1 { font-family:'Cormorant Garamond',serif; font-size:36px; font-weight:300; color:#111; margin:0 }
        .insert-h2 { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:400; color:#A07830; margin:0 0 12px }
        .step { display:flex; gap:14px; margin-bottom:10px; align-items:flex-start; }
        .step-num { background:#A07830; color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; flex-shrink:0; margin-top:1px; }
        .step-text { font-size:12px; line-height:1.7; color:#333; }
        .safety-item { display:flex; gap:8px; margin-bottom:6px; font-size:11px; color:#444; line-height:1.6; }
        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
        .qr-box { border:2px solid #A07830; padding:16px; text-align:center; }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, paddingBottom:20, borderBottom:"2px solid #A07830" }}>
        <div>
          <div className="insert-h1">TRU-PEP</div>
          <div style={{ fontSize:10, letterSpacing:3, color:"#888", textTransform:"uppercase", marginTop:2 }}>Advanced Peptide Wellness</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:11, color:"#888" }}>trupepwellness.com</div>
          <div style={{ fontSize:11, color:"#888" }}>423-444-3668</div>
          <div style={{ fontSize:11, color:"#888" }}>trupepwellness@gmail.com</div>
        </div>
      </div>

      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#A07830", letterSpacing:2, textTransform:"uppercase" }}>
          Welcome to Your TruPep Order — Please Read Before Use
        </div>
      </div>

      <div className="two-col">
        <div>
          {/* Reconstitution Steps */}
          <div className="insert-section">
            <div className="insert-h2">Reconstitution Steps</div>
            {[
              "Wash hands thoroughly with soap and water",
              "Gather: peptide vial, BAC Water, insulin syringe, alcohol swabs",
              "Wipe tops of both vials with alcohol swab",
              "Draw calculated BAC Water into syringe",
              "Insert needle into peptide vial, push BAC Water slowly down the SIDE of the vial",
              "Swirl gently — NEVER shake",
              "Draw your calculated dose and inject subcutaneously",
              "Dispose of needle immediately in sharps container",
            ].map((s,i)=>(
              <div className="step" key={i}>
                <div className="step-num">{i+1}</div>
                <div className="step-text">{s}</div>
              </div>
            ))}
          </div>

          {/* Storage */}
          <div className="insert-section">
            <div className="insert-h2">Storage Guidelines</div>
            {[
              ["🧊 Before Mixing","Cool, dry place — refrigeration recommended. Never freeze."],
              ["❄️ After Mixing","Refrigerate immediately. Use within 28–30 days."],
              ["💧 Lipo C w/ B12","Room temperature ONLY. Do NOT refrigerate."],
              ["🚫 Avoid","Direct sunlight, heat, freezing, or cloudy/discolored vials"],
            ].map(([t,d])=>(
              <div key={t} style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#A07830" }}>{t}</div>
                <div style={{ fontSize:11, color:"#555", lineHeight:1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Safety */}
          <div className="insert-section">
            <div className="insert-h2">Safety Checklist</div>
            {[
              "Use a NEW syringe for every single injection",
              "Never share needles or syringes with anyone",
              "Swab injection site with alcohol before injecting",
              "Rotate injection sites daily (abdomen, thigh, lower back)",
              "Never inject into red, swollen, or bruised areas",
              "Keep all peptides out of reach of children",
              "Stop use and call a doctor if unusual reactions occur",
              "Do not use cloudy, discolored, or expired vials",
            ].map((s,i)=>(
              <div className="safety-item" key={i}>
                <span style={{ color:"#A07830", fontWeight:700, flexShrink:0 }}>✓</span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          {/* Dose reminder */}
          <div className="insert-section">
            <div className="insert-h2">Quick Dose Formula</div>
            <div style={{ background:"#f8f5ee", padding:"12px 16px", fontSize:11, color:"#333", lineHeight:2, fontFamily:"monospace" }}>
              Conc = (Vial mg × 1000) ÷ BAC Water ml<br/>
              Volume = Dose mcg ÷ Concentration<br/>
              Units = Volume × Syringe Units (100)
            </div>
            <div style={{ fontSize:10, color:"#888", marginTop:8 }}>Or use our online calculator — scan QR code below</div>
          </div>

          {/* QR */}
          <div className="qr-box">
            <div style={{ fontSize:11, fontWeight:600, color:"#A07830", letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Scan for Full Video Guide</div>
            <div style={{ fontSize:40, marginBottom:8 }}>📱</div>
            <div style={{ fontSize:12, color:"#333", marginBottom:4 }}>trupepwellness.com</div>
            <div style={{ fontSize:10, color:"#888" }}>How-To Guides · Peptide Calculator · FAQs</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid #e0d5c0", fontSize:9, color:"#aaa", lineHeight:1.8 }}>
        <strong style={{ color:"#888" }}>DISCLAIMER:</strong> All TruPep Wellness products are for research and wellness purposes only. These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease. Consult a qualified healthcare professional before use. For questions: trupepwellness@gmail.com · 423-444-3668 · Miami, Florida
      </div>

      <div className="no-print" style={{ textAlign:"center", marginTop:32 }}>
        <button className="btn-gold" onClick={()=>window.print()} style={{ marginRight:16 }}>🖨️ Print Insert</button>
        <button className="btn-outline" onClick={()=>window.history.back()}>← Go Back</button>
      </div>
    </div>
  );
}

// ─── AGE GATE ─────────────────────────────────────────────────────────────────
function AgeGate({ onConfirm }) {
  const [declined, setDeclined] = useState(false);

  if (declined) return (
    <div style={{
      position: "fixed", inset: 0, background: BLACK, zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 40, textAlign: "center",
    }}>
      <div style={{ fontSize: 36, color: GOLD, marginBottom: 24 }}>✦</div>
      <h2 className="serif" style={{ fontSize: 32, fontWeight: 300, color: WHITE, marginBottom: 16 }}>
        We're Sorry
      </h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 400 }}>
        You must be 18 years of age or older to access TruPep Wellness. Please come back when you meet the age requirement.
      </p>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: BLACK, zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 40, textAlign: "center",
    }}>
      {/* Animated gold top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, transparent, ${GOLD}, transparent)` }} />
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, transparent, ${GOLD}, transparent)` }} />

      <div style={{ maxWidth: 480, width: "100%", animation: "fadeInUp 0.6s ease" }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <TPLogo size={56} light />
        </div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)`, marginBottom: 40 }} />

        <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD, textTransform: "uppercase", marginBottom: 20 }}>
          Age Verification Required
        </div>

        <h1 className="serif" style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 300, color: WHITE, marginBottom: 16, letterSpacing: -0.5 }}>
          Are You 18 or Older?
        </h1>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.9, marginBottom: 40, fontWeight: 300 }}>
          TruPep Wellness products are intended for adults 18 years of age and older. This site contains information about research peptides and wellness protocols. Please confirm your age to continue.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <button className="btn-gold" onClick={onConfirm} style={{ width: "100%", maxWidth: 360, fontSize: 11, letterSpacing: 3 }}>
            Yes, I Am 18 or Older — Enter Site
          </button>
          <button onClick={() => setDeclined(true)} style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "13px 36px",
            fontSize: 11, letterSpacing: 2, fontFamily: "'Montserrat', sans-serif",
            width: "100%", maxWidth: 360,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
          >
            No, I Am Under 18 — Exit
          </button>
        </div>

        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 32, lineHeight: 1.7, letterSpacing: 0.3 }}>
          By entering this site you confirm you are 18+ and agree to our terms. These products are for research and wellness purposes only.
        </p>
      </div>
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [ageConfirmed, setAgeConfirmed] = useState(
    () => !!localStorage.getItem("tp_age_confirmed")
  );
  const [page, setPage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { cart, addToCart, removeFromCart, updateQty, total, count } = useCart();

  const handleAgeConfirm = () => {
    localStorage.setItem("tp_age_confirmed", "true");
    setAgeConfirmed(true);
  };

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  // Show email popup 4 seconds after age is confirmed (first visit only)
  useEffect(() => {
    if (!ageConfirmed) return;
    const seen = localStorage.getItem("tp_popup_seen");
    if (!seen) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem("tp_popup_seen", "true");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [ageConfirmed]);

  if (!ageConfirmed) return (
    <>
      <style>{globalStyles}</style>
      <AgeGate onConfirm={handleAgeConfirm} />
    </>
  );

  return (
    <>
      <style>{globalStyles}</style>
      <GoldBorder />
      <Nav cartCount={count} onCartOpen={() => setCartOpen(true)} currentPage={page} setPage={setPage} />

      {page === "home" && <HomePage setPage={setPage} onAdd={addToCart} />}
      {page === "products" && <ProductsPage onAdd={addToCart} />}
      {page === "stacks" && <StacksPage onAdd={addToCart} setPage={setPage} />}
      {page === "calculator" && <CalculatorPage />}
      {page === "howto" && <HowToUsePage setPage={setPage} />}
      {page === "about" && <AboutPage />}
      {page === "testimonials" && <TestimonialsPage setPage={setPage} />}
      {page === "consultation" && <ConsultationPage />}
      {page === "contact" && <ContactPage />}
      {page === "print-insert" && <PrintInsertPage />}

      <Footer setPage={setPage} />

      {cartOpen && (
        <CartDrawer
          cart={cart}
          total={total}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQty={updateQty}
          onAdd={addToCart}
        />
      )}

      {showPopup && <EmailPopup onClose={() => setShowPopup(false)} />}
    </>
  );
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
