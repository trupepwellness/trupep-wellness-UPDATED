import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { GOLD, GOLD_LIGHT, GOLD_DARK, BLACK, WHITE, GRAY, SURFACE, SURFACE2, globalStyles, TP_LOGO_SRC, TPLogo, PRODUCTS, CATEGORIES, useCart, Nav, Hero, AboutSection, ProductCard, ProductsPage, CartDrawer, AboutPage, ContactPage, HomePage, Footer, STACKS } from './data.jsx'

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
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontWeight: 300 }}>
                Join our exclusive wellness list and receive
              </p>
              <div style={{
                fontSize: 42, fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300, color: GOLD, margin: "12px 0",
                background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD_LIGHT})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>10% OFF</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>YOUR FIRST ORDER</p>
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
              background: "none", border: "none", color: "rgba(255,255,255,0.88)",
              fontSize: 11, cursor: "pointer", width: "100%", textAlign: "center",
              fontFamily: "'Montserrat', sans-serif", letterSpacing: 1,
            }}>No thanks, I'll pay full price</button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, color: GOLD, marginBottom: 20 }}>✦</div>
            <h3 className="serif" style={{ fontSize: 28, fontWeight: 300, marginBottom: 12 }}>You're In!</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 24 }}>
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
    <div style={{ paddingTop: 80, background: BLACK, minHeight: "100vh" }}>
      <div style={{
        padding: "80px 40px 60px", textAlign: "center",
        background: `linear-gradient(180deg, ${SURFACE} 0%, ${BLACK} 100%)`,
        borderBottom: `1px solid rgba(201,168,76,0.08)`,
      }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Curated Protocols</div>
        <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, letterSpacing: -1, marginBottom: 16 }}>
          Peptide <span style={{ color: GOLD }}>Stacks</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 0.5, fontWeight: 300, maxWidth: 600, margin: "0 auto" }}>
          Pre-built protocols curated by our wellness team. Each stack combines synergistic peptides for maximum results. Bundle pricing saves you up to 15%.
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 40px" }}>
        <div className="stacks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
          {STACKS.map(stack => (
            <div key={stack.id} className="card-hover" style={{
              background: SURFACE2, border: "1px solid rgba(201,168,76,0.08)",
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
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{item.name}</span>
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
                      border: "1px solid rgba(201,168,76,0.15)", color: "rgba(255,255,255,0.5)",
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
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 32px", fontWeight: 300 }}>
            Our wellness team can build a personalized peptide protocol tailored to your specific goals. Book a free consultation to get started.
          </p>
          <button className="btn-gold" onClick={() => setPage("consultation")}>Book Free Consultation</button>
        </div>
      </div>
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
    <div style={{ paddingTop: 80, background: BLACK, minHeight: "100vh" }}>
      <div style={{
        padding: "80px 40px 60px", textAlign: "center",
        background: `linear-gradient(180deg, ${SURFACE} 0%, ${BLACK} 100%)`,
      }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Personalized Guidance</div>
        <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, letterSpacing: -1, marginBottom: 16 }}>
          Free <span style={{ color: GOLD }}>Consultation</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 300, maxWidth: 500, margin: "0 auto" }}>
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
                  <div style={{ fontSize: 11, lineHeight: 1.7, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>{desc}</div>
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
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
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
    <div style={{ paddingTop: 80, background: BLACK, minHeight: "100vh" }}>
      <div style={{
        padding: "80px 40px 60px", textAlign: "center",
        background: `linear-gradient(180deg, ${SURFACE} 0%, ${BLACK} 100%)`,
      }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Client Results</div>
        <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 300, letterSpacing: -1, marginBottom: 16 }}>
          Real People. <span style={{ color: GOLD }}>Real Results.</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 300, maxWidth: 500, margin: "0 auto" }}>
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
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 32, fontWeight: 300 }}>
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
    <div style={{ paddingTop:80, background:BLACK, minHeight:"100vh" }}>
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
                style={{ ...inputStyle, color: "rgba(255,255,255,0.7)" }}>
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
    <div style={{ paddingTop:80, background:BLACK, minHeight:"100vh" }}>
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
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
            {[
              { title:"How To Reconstitute & Inject Peptides — Clinical Guide", url:"https://www.youtube.com/watch?v=tcEWjyQfDLc", desc:"Marek Health's clinical team walks through every step of reconstitution AND subcutaneous injection. Covers TB-500, GHK-Cu, Melanotan, Semaglutide and more. One of the most complete guides available." },
              { title:"Peptide Safety — Dos, Don'ts & Proper Protocols", url:"https://www.youtube.com/watch?v=ZPVcsGLLwVc", desc:"Dr. Tara Harding, DNP (Family Nurse Practitioner) covers peptide safety protocols, proper administration, sourcing, and what to watch out for. Educational purposes only." },
              { title:"Benefits & Risks of Peptide Therapeutics — Full Science Breakdown", url:"https://www.youtube.com/watch?v=zU5EYw06wtw", desc:"Andrew Huberman (Stanford) presents a 90-minute deep dive into peptide biology — tissue repair, fat loss, muscle, longevity, mood, libido, dosing, cycling, and risks. 1.1M+ views. The most complete educational resource available." },
            ].map(v=>(
              <a key={v.title} href={v.url} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
                <div style={{ background:SURFACE2, border:`1px solid rgba(201,168,76,0.12)`, padding:"24px", transition:"all 0.3s", cursor:"pointer" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.transform="translateY(-4px)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(201,168,76,0.12)"; e.currentTarget.style.transform="translateY(0)"; }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>▶</div>
                  <div style={{ fontSize:14, color:GOLD, fontFamily:"'Cormorant Garamond',serif", marginBottom:8 }}>{v.title}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.88)", lineHeight:1.6 }}>{v.desc}</div>
                  <div style={{ fontSize:9, color:GOLD, letterSpacing:2, marginTop:12, textTransform:"uppercase" }}>Watch on YouTube →</div>
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
                <p style={{ fontSize:13, lineHeight:1.9, color:"rgba(255,255,255,0.9)", fontWeight:300 }}>{s.desc}</p>
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
                <p style={{ fontSize:12, lineHeight:1.8, color:"rgba(255,255,255,0.9)", fontWeight:300 }}>{s.rule}</p>
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
                <p style={{ fontSize:13, lineHeight:1.7, color:"rgba(255,255,255,0.92)", fontWeight:300 }}>{s}</p>
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
              <div style={{ padding:"20px 24px", background:SURFACE, fontSize:13, color:"rgba(255,255,255,0.9)", lineHeight:1.9, fontWeight:300 }}>{a}</div>
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
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(5,5,5,0.97)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:480,width:"100%",background:"#1a1a1a",border:"2px solid #C9A84C",padding:"52px 40px",textAlign:"center",boxShadow:"0 0 60px rgba(201,168,76,0.3)"}}>
        <div style={{height:2,background:"linear-gradient(90deg,transparent,#C9A84C,transparent)",marginBottom:36,marginLeft:-40,marginRight:-40}}/>
        <div style={{fontSize:48,color:GOLD,marginBottom:16}}>✦</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:300,marginBottom:8,color:WHITE}}>Age Verification</h2>
        <div style={{fontSize:10,letterSpacing:3,color:GOLD,textTransform:"uppercase",marginBottom:24}}>TruPep Wellness</div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.8)",lineHeight:1.9,marginBottom:28,fontWeight:300}}>
          This website contains information about research peptide compounds for adults <strong style={{color:WHITE}}>18 years of age or older</strong>. By entering you confirm you are 18+ and agree all products are for <strong style={{color:WHITE}}>research and educational purposes only</strong>.
        </p>
        <button onClick={onConfirm} style={{width:"100%",padding:"16px",background:"linear-gradient(135deg,#A07830,#C9A84C,#E8C96A)",color:"#0A0A0A",fontSize:11,fontWeight:700,letterSpacing:3,border:"none",cursor:"pointer",fontFamily:"'Montserrat',sans-serif",marginBottom:16}}>
          I AM 18+ — ENTER SITE
        </button>
        <p style={{fontSize:9,color:"rgba(255,255,255,0.88)",letterSpacing:0.5,lineHeight:1.8}}>
          Products are not intended to diagnose, treat, cure, or prevent any disease. Not FDA evaluated. Consult a healthcare professional before use.
        </p>
      </div>
    </div>
  );
}

// ─── COOKIE BANNER ────────────────────────────────────────────────────────────
function CookieBanner({ onAccept }) {
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:8000,background:"rgba(10,10,10,0.97)",borderTop:"1px solid rgba(201,168,76,0.2)",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
      <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",lineHeight:1.6,flex:1,minWidth:240}}>
        🍪 We use cookies to improve your experience. By continuing you accept our Privacy Policy. All products are for research purposes only.
      </p>
      <div style={{display:"flex",gap:10,flexShrink:0}}>
        <button onClick={onAccept} style={{padding:"8px 20px",background:"linear-gradient(135deg,#A07830,#C9A84C)",color:"#0A0A0A",fontSize:9,fontWeight:700,letterSpacing:2,border:"none",cursor:"pointer",fontFamily:"'Montserrat',sans-serif"}}>Accept</button>
        <button onClick={onAccept} style={{padding:"8px 16px",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"#888",fontSize:9,letterSpacing:1,cursor:"pointer",fontFamily:"'Montserrat',sans-serif"}}>Decline</button>
      </div>
    </div>
  );
}

// ─── LEGAL PAGES ──────────────────────────────────────────────────────────────
function PrivacyPage() {
  return (
    <div style={{paddingTop:80,background:BLACK,minHeight:"100vh"}}>
      <div style={{padding:"60px 40px 40px",background:`linear-gradient(180deg,${SURFACE} 0%,${BLACK} 100%)`}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{fontSize:9,letterSpacing:3,color:GOLD,textTransform:"uppercase",marginBottom:10}}>TruPep Wellness · Legal</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4vw,48px)",fontWeight:300,marginBottom:12}}>Privacy Policy</h1>
          <p style={{fontSize:10,color:GRAY}}>Last updated: May 2025 &nbsp;·&nbsp; <span style={{color:"rgba(255,120,120,0.8)"}}>Consult a licensed attorney to finalize for your jurisdiction.</span></p>
        </div>
      </div>
      <div style={{maxWidth:820,margin:"0 auto",padding:"48px 40px",fontSize:13,lineHeight:1.9,color:"rgba(255,255,255,0.94)",fontWeight:300}}>
        {[
          ["1. Information We Collect","We collect personal information you voluntarily provide when placing orders, submitting contact forms, booking consultations, or subscribing to communications. This includes full name, email address, phone number, shipping address, and any notes submitted with your order. We also collect standard browser and device data (IP address, browser type, pages visited) through web analytics tools."],
          ["2. How We Use Your Information","Your information is used solely to: (a) process and fulfill your order; (b) respond to inquiries and provide customer support; (c) send order confirmations and shipping notifications; (d) improve our website and services; and (e) comply with legal obligations. We do not sell, rent, trade, or otherwise share your personal information with third parties for their marketing purposes."],
          ["3. Third-Party Service Providers","We use the following third-party services that may process your data on our behalf: Formspree (form submission and email routing); Vercel (website hosting and performance). These providers are bound by their own privacy policies and are contractually prohibited from using your data for any purpose other than providing their services to us."],
          ["4. Data Security","All form data is transmitted via SSL/TLS encryption. We implement reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no internet transmission or electronic storage method is 100% secure. You use our website and submit personal information at your own risk."],
          ["5. Data Retention","We retain your personal information only as long as necessary to fulfill the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements. Order records are retained for a minimum of 3 years for tax and compliance purposes."],
          ["6. Your Rights","Depending on your jurisdiction, you may have the right to: access the personal information we hold about you; request correction of inaccurate data; request deletion of your data; withdraw consent at any time; and file a complaint with your local data protection authority. To exercise any of these rights, contact us at trupepwellness@gmail.com."],
          ["7. Cookies","We use essential cookies to remember your age verification and site preferences. Optional analytics cookies may be used to understand how visitors interact with our website. You may disable cookies in your browser settings; however, some features may not function properly."],
          ["8. Children's Privacy","Our website is intended for adults 18 years of age or older. We do not knowingly collect personal information from anyone under 18. If you believe we have inadvertently collected information from a minor, contact us immediately and we will delete it promptly."],
          ["9. California Residents (CCPA)","If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your personal information, and the right to opt out of the sale of personal information. We do not sell personal information. To submit a CCPA request, contact us at trupepwellness@gmail.com."],
          ["10. Changes to This Policy","We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with an updated effective date. Continued use of our website after changes constitutes acceptance of the updated policy."],
          ["11. Contact","Privacy questions or requests: trupepwellness@gmail.com · 423-444-3668 · Miami, Florida"],
        ].map(([t,d])=>(
          <div key={t} style={{marginBottom:28}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400,color:GOLD,marginBottom:8}}>{t}</h2>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TermsPage() {
  return (
    <div style={{paddingTop:80,background:BLACK,minHeight:"100vh"}}>
      <div style={{padding:"60px 40px 40px",background:`linear-gradient(180deg,${SURFACE} 0%,${BLACK} 100%)`}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{fontSize:9,letterSpacing:3,color:GOLD,textTransform:"uppercase",marginBottom:10}}>TruPep Wellness · Legal</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4vw,48px)",fontWeight:300,marginBottom:12}}>Terms of Service</h1>
          <p style={{fontSize:10,color:GRAY}}>Last updated: May 2025 &nbsp;·&nbsp; <span style={{color:"rgba(255,120,120,0.8)"}}>Have a licensed attorney review before publishing.</span></p>
        </div>
      </div>
      <div style={{maxWidth:820,margin:"0 auto",padding:"48px 40px",fontSize:13,lineHeight:1.9,color:"rgba(255,255,255,0.94)",fontWeight:300}}>
        <div style={{background:"rgba(255,60,60,0.06)",border:"1px solid rgba(255,80,80,0.25)",borderLeft:"4px solid rgba(255,80,80,0.6)",padding:"16px 20px",marginBottom:32}}>
          <p style={{fontSize:13,color:"rgba(255,200,200,0.9)",fontWeight:400,lineHeight:1.8}}><strong>IMPORTANT NOTICE:</strong> By accessing this website and purchasing any product, you acknowledge that you have read, understood, and agreed to these Terms of Service in their entirety. If you do not agree, do not use this website or purchase any products.</p>
        </div>
        {[
          ["1. Research & Educational Use Only — STRICT RESTRICTION","ALL products sold by TruPep Wellness are STRICTLY for in vitro research and educational purposes only. These products are NOT intended for human consumption, injection, topical application, or any form of therapeutic use. By purchasing any product, you explicitly warrant that you will use it solely for lawful research purposes and that you possess the appropriate knowledge, facilities, and legal authorization to handle research compounds in your jurisdiction."],
          ["2. Age Requirement — 18+ Only","You must be at least 18 years of age to access this website or purchase any products. By entering the site, you represent and warrant that you are 18 years of age or older. TruPep Wellness reserves the right to cancel any order if age cannot be verified. Any misrepresentation of age is a material breach of these Terms."],
          ["3. No Medical Advice — No Physician-Patient Relationship","Nothing on this website — including but not limited to product descriptions, educational articles, stack recommendations, protocol guides, the peptide calculator, testimonials, or any communication from TruPep Wellness personnel — constitutes medical advice, medical diagnosis, or a treatment recommendation. No physician-patient, practitioner-patient, or any similar relationship is created by your use of this website or purchase of any product. Always consult a licensed, board-certified healthcare professional before beginning any wellness or research protocol."],
          ["4. FDA Disclaimer","These products have not been evaluated by the United States Food and Drug Administration (FDA). These products are not approved to diagnose, treat, cure, or prevent any disease, medical condition, or health issue. TruPep Wellness makes no claims regarding the therapeutic efficacy of any product."],
          ["5. Assumption of Risk & Release","By purchasing any product from TruPep Wellness, you knowingly and voluntarily assume all risks associated with the possession, handling, storage, and use of research compounds. You hereby release, discharge, and hold harmless TruPep Wellness, its owners, employees, affiliates, and agents from any and all claims, damages, losses, liabilities, costs, and expenses arising from your use of any product, whether based on negligence, strict liability, breach of warranty, or any other legal theory."],
          ["6. Limitation of Liability","TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TRUPEP WELLNESS AND ITS OWNERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, PERSONAL INJURY, PROPERTY DAMAGE, OR ANY OTHER DAMAGES, ARISING FROM OR RELATED TO YOUR USE OF OUR PRODUCTS OR WEBSITE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES."],
          ["7. Indemnification","You agree to indemnify, defend, and hold harmless TruPep Wellness, its owners, employees, affiliates, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising from: (a) your use of any product; (b) your violation of these Terms; (c) your violation of any applicable law or regulation; or (d) any misrepresentation you make in connection with your purchase."],
          ["8. Legal Compliance — Your Responsibility","It is your sole responsibility to research and comply with all applicable local, state, federal, and international laws and regulations governing the purchase, possession, import, export, and use of research compounds in your jurisdiction. TruPep Wellness makes no representation that any product is legal in any particular jurisdiction. Purchasing any product from TruPep Wellness constitutes your warranty that such purchase and possession is lawful in your jurisdiction."],
          ["9. No Guarantees or Warranties","ALL PRODUCTS ARE SOLD 'AS IS' WITHOUT ANY WARRANTY, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. TruPep Wellness does not guarantee product purity beyond the representations of our suppliers, and strongly recommends third-party testing for any research application requiring verified specifications."],
          ["10. Governing Law & Dispute Resolution","These Terms of Service shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions. Any dispute arising from or relating to these Terms or your use of our products or website shall be resolved exclusively in the state or federal courts located in Miami-Dade County, Florida. You consent to the personal jurisdiction of such courts and waive any objection to venue."],
          ["11. Severability","If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable."],
          ["12. Entire Agreement","These Terms of Service, together with our Privacy Policy, Research Use Disclaimer, and Refund & Shipping Policy, constitute the entire agreement between you and TruPep Wellness regarding your use of our website and products, and supersede all prior agreements, representations, and understandings."],
          ["13. Changes to Terms","TruPep Wellness reserves the right to modify these Terms at any time. Changes take effect immediately upon posting. Continued use of the website constitutes acceptance. We recommend reviewing these Terms periodically."],
        ].map(([t,d])=>(
          <div key={t} style={{marginBottom:28}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400,color:GOLD,marginBottom:8}}>{t}</h2>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisclaimerPage() {
  return (
    <div style={{paddingTop:80,background:BLACK,minHeight:"100vh"}}>
      <div style={{padding:"60px 40px 40px",background:`linear-gradient(180deg,${SURFACE} 0%,${BLACK} 100%)`}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{fontSize:9,letterSpacing:3,color:GOLD,textTransform:"uppercase",marginBottom:10}}>TruPep Wellness · Legal</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4vw,48px)",fontWeight:300,marginBottom:12}}>Research Use Disclaimer</h1>
          <p style={{fontSize:10,color:GRAY}}>Last updated: May 2025</p>
        </div>
      </div>
      <div style={{maxWidth:820,margin:"0 auto",padding:"48px 40px",fontSize:13,lineHeight:1.9,color:"rgba(255,255,255,0.94)",fontWeight:300}}>
        <div style={{background:"rgba(201,168,76,0.06)",border:`1px solid rgba(201,168,76,0.3)`,borderLeft:`4px solid ${GOLD}`,padding:"20px 24px",marginBottom:32}}>
          <p style={{fontSize:14,color:WHITE,fontWeight:400,lineHeight:1.8}}><strong>MANDATORY DISCLAIMER:</strong> All products offered by TruPep Wellness are intended STRICTLY for in vitro research and educational purposes only. These products are NOT for human consumption, injection, or therapeutic application of any kind. They are NOT approved by the U.S. Food and Drug Administration.</p>
        </div>
        {[
          ["FDA & Regulatory Statement","These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease or medical condition. The regulatory status of these compounds varies by country and jurisdiction. It is your responsibility to determine the legality of purchasing and possessing these compounds in your location."],
          ["Not Medical Advice","All information contained on this website — including product descriptions, educational content, protocol guides, stack recommendations, the peptide calculator, video resources, blog articles, and any direct communications — is provided for informational and educational purposes only. It does not constitute medical advice, medical diagnosis, or any form of treatment recommendation. TruPep Wellness personnel are not licensed medical providers and cannot provide medical advice under any circumstances."],
          ["Research Use Only","These peptide compounds are sold exclusively for legitimate scientific research in appropriate laboratory settings. They are not dietary supplements, drugs, or medical devices. Purchase, possession, and use of these compounds must comply with all applicable federal, state, and local laws. You are solely responsible for ensuring compliance with all regulations in your jurisdiction."],
          ["Individual Results Vary — No Guarantees","Any results referenced on this website — including client testimonials, journey stories, before-and-after submissions, and protocol outcomes — represent individual experiences voluntarily shared by customers. These results are not guaranteed, typical, or representative of what any individual may experience. Results will vary significantly based on many individual factors including but not limited to: health status, age, genetics, lifestyle, diet, sleep, concurrent medications or supplements, protocol adherence, and many other variables. No outcomes are promised or guaranteed."],
          ["Third-Party Video Content","Videos linked on this website are provided for educational reference only and are hosted on third-party platforms (YouTube). TruPep Wellness does not endorse, warrant, or accept responsibility for the content of third-party videos. These videos do not constitute medical advice. The views expressed in linked videos are those of the respective creators and do not necessarily represent the views of TruPep Wellness."],
          ["Testimonials Disclaimer","Testimonials and client stories on this website are genuine accounts shared voluntarily by customers. Individual results are not typical and no outcomes are guaranteed. Testimonials may reflect unique experiences that do not represent what the average customer should expect. All testimonials are shared with explicit customer consent."],
          ["Professional Guidance Required","We strongly recommend that any person interested in research peptides work with a licensed, board-certified healthcare provider or research professional. TruPep Wellness is not responsible for any adverse outcomes resulting from improper handling, storage, reconstitution, or use of any research compound."],
          ["Limitation on Claims","TruPep Wellness strictly prohibits making disease treatment or cure claims. All product descriptions use compliant language such as 'commonly researched for,' 'may support,' and 'educational purposes only.' If any content on this site appears to make a direct disease claim, please contact us immediately so we can correct it."],
        ].map(([t,d])=>(
          <div key={t} style={{marginBottom:28}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400,color:GOLD,marginBottom:8}}>{t}</h2>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RefundPage() {
  return (
    <div style={{paddingTop:80,background:BLACK,minHeight:"100vh"}}>
      <div style={{padding:"60px 40px 40px",background:`linear-gradient(180deg,${SURFACE} 0%,${BLACK} 100%)`}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{fontSize:9,letterSpacing:3,color:GOLD,textTransform:"uppercase",marginBottom:10}}>TruPep Wellness · Legal</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4vw,48px)",fontWeight:300,marginBottom:12}}>Refund & Shipping Policy</h1>
          <p style={{fontSize:10,color:GRAY}}>Last updated: May 2025</p>
        </div>
      </div>
      <div style={{maxWidth:820,margin:"0 auto",padding:"48px 40px",fontSize:13,lineHeight:1.9,color:"rgba(255,255,255,0.94)",fontWeight:300}}>
        {[
          ["Payment & Order Confirmation","TruPep Wellness accepts payment via Zelle (423-444-3668), Venmo (@TruPepWellness), and PayPal (@ItsTrinchy). Orders are processed and fulfilled only after payment is confirmed received. Please include your full name in the payment memo. Order confirmation is sent to the email address you provide. Keep your order confirmation for your records."],
          ["Order Processing Time","Orders are typically processed within 1–3 business days following confirmed payment receipt. Processing times may be longer during high-volume periods, holidays, or due to supply constraints. You will be notified by email or phone if there is an unexpected delay with your order."],
          ["Shipping","All orders are shipped with discreet, professional packaging with no identifying branding on the exterior. We ship via USPS or UPS depending on destination. Tracking information is provided where available. Estimated delivery times vary by destination and carrier. TruPep Wellness is not responsible for delays caused by carriers, weather, customs, or circumstances beyond our reasonable control."],
          ["Refund & Return Policy — Final Sale","Due to the research-grade nature of our products, strict quality control requirements, and the inability to verify proper storage conditions once a product leaves our facility, ALL SALES ARE FINAL. We do not accept returns or exchanges on any products. No refunds will be issued for orders that have been shipped except as described in the 'Damaged or Incorrect Orders' section below."],
          ["Damaged, Defective, or Incorrect Orders","If your order arrives damaged, defective, or incorrect, you must contact us within 48 hours of confirmed delivery with: (a) your order details; (b) clear photographs of the damaged or incorrect item(s) and packaging; and (c) a description of the issue. Reach us at trupepwellness@gmail.com or 423-444-3668. We will review your claim and, at our sole discretion, issue a replacement or store credit. We do not issue cash refunds for damaged items."],
          ["Lost or Stolen Packages","TruPep Wellness is not responsible for packages confirmed as delivered by the carrier but reported as not received. If your tracking shows delivered but you have not received your package, you must: (a) check with neighbors and in all delivery locations; (b) contact the carrier directly to open an investigation; and (c) notify us within 7 days. We will assist in the carrier investigation where possible but cannot guarantee replacement of confirmed-delivered packages."],
          ["Undeliverable or Returned Packages","If a package is returned to us due to an incorrect address provided by the customer, refusal of delivery, or failure to collect from a pickup facility, the customer is responsible for re-shipping costs. We will contact you to arrange re-shipment. If re-shipment cannot be arranged within 14 days, the order may be subject to a restocking fee."],
          ["Order Cancellation","Orders may be cancelled without penalty before they have been processed for shipment. Once an order has been processed and shipped, it cannot be cancelled. To request a cancellation, contact us immediately at trupepwellness@gmail.com or 423-444-3668."],
          ["Contact for Order Issues","Email: trupepwellness@gmail.com · Phone/Text: 423-444-3668 · Response time: within 24 hours Monday–Friday. For urgent issues, please call or text directly."],
        ].map(([t,d])=>(
          <div key={t} style={{marginBottom:28}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400,color:GOLD,marginBottom:8}}>{t}</h2>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── FAQ PAGE ─────────────────────────────────────────────────────────────────
function FAQPage() {
  const [open, setOpen] = useState(null);

  const faqs = [
    { cat:"Ordering", q:"How do I place an order?", a:"Add items to your bag, go through checkout, and submit your order form with your shipping details. You'll then see our payment screen — send payment via Zelle (423-444-3668), Venmo (@TruPepWellness), or PayPal (@ItsTrinchy). Include your full name in the payment memo. We process your order once payment is confirmed." },
    { cat:"Ordering", q:"How long does it take to process my order?", a:"Orders are typically processed within 1–3 business days after payment is confirmed. You'll be notified by email or text once your order ships. For urgent orders, call or text us directly at 423-444-3668." },
    { cat:"Ordering", q:"What payment methods do you accept?", a:"We accept Zelle (423-444-3668), Venmo (@TruPepWellness), and PayPal (@ItsTrinchy). Always include your full name in the payment memo so we can match it to your order." },
    { cat:"Ordering", q:"Can I modify or cancel my order?", a:"Orders can be modified or cancelled before they've been processed for shipment. Contact us immediately at trupepwellness@gmail.com or 423-444-3668 if you need to make changes. Once shipped, orders cannot be cancelled." },
    { cat:"Products", q:"Do I need BAC Water to use peptides?", a:"Yes — almost all lyophilized (freeze-dried) peptide vials require Bacteriostatic Water (BAC Water) for reconstitution before use. The only exception is Lipo C with B12 which comes pre-mixed as a liquid. We carry 30ml BAC Water for $20 — we recommend adding it to every order." },
    { cat:"Products", q:"What syringe do I need?", a:"Standard 1ml insulin syringes (100 units) are the most common choice for peptide research. They are inexpensive and widely available at pharmacies. Use our Peptide Calculator on the site to determine exactly how many units to draw for your specific dose." },
    { cat:"Products", q:"How do I store my peptides?", a:"Unmixed (lyophilized) peptides should be stored in a cool, dry place — refrigeration is ideal but not always required. Once reconstituted with BAC Water, always refrigerate and use within 28–30 days. Lipo C with B12 is the exception — store at room temperature, do NOT refrigerate. Never freeze any peptide." },
    { cat:"Products", q:"What is the difference between GLOW and KLOW?", a:"GLOW is our 70mg aesthetic blend — contains GHK-Cu, BPC-157, and TB-500. It's designed for skin radiance, collagen support, and cellular renewal. KLOW is our 80mg metabolic recovery blend — contains GHK-Cu, BPC-157, TB-500, and KPV. KLOW adds KPV for deeper inflammation and gut support. Both are exclusive TruPep formulations." },
    { cat:"Products", q:"Are your products tested for purity?", a:"All compounds in our catalog are sourced from verified suppliers that meet research-grade standards. We are committed to quality-first sourcing on every order. Products are for research and educational purposes only." },
    { cat:"Shipping", q:"How is my order packaged?", a:"All orders ship in discreet, professional packaging with no identifying branding on the exterior. Your privacy is a priority. We ship via USPS or UPS depending on destination." },
    { cat:"Shipping", q:"Do you ship everywhere in the US?", a:"Yes — we ship to all 50 states. It is your responsibility to ensure that purchasing and possessing research peptides is legal in your state. Contact us if you have any questions about your specific location." },
    { cat:"Shipping", q:"What if my order arrives damaged or incorrect?", a:"Contact us within 48 hours of delivery at trupepwellness@gmail.com or 423-444-3668 with photos of the issue. We'll review your claim and work to resolve it promptly. See our Refund & Shipping Policy for full details." },
    { cat:"Legal", q:"Are these products safe for human use?", a:"All TruPep Wellness products are sold strictly for research and educational purposes only. They are not intended for human consumption, injection, or therapeutic use. They have not been evaluated by the FDA. Always consult a licensed healthcare professional before beginning any wellness protocol." },
    { cat:"Legal", q:"Are these products legal to buy?", a:"Research peptides occupy a gray area in many jurisdictions. It is your sole responsibility to research and comply with all applicable local, state, federal, and international laws governing the purchase and possession of research compounds in your area. TruPep Wellness cannot provide legal advice." },
    { cat:"Support", q:"How do I reach TruPep Wellness?", a:"Email: trupepwellness@gmail.com · Phone/Text: 423-444-3668 · Location: Miami, Florida. We typically respond within 24 hours. For urgent matters, call or text directly." },
    { cat:"Support", q:"Do you offer free consultations?", a:"Yes! Our team offers free consultations to help you understand our product catalog and find the right protocol for your research goals. Book via the Consultation page or call/text 423-444-3668 directly." },
  ];

  const categories = ["All", "Ordering", "Products", "Shipping", "Legal", "Support"];
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? faqs : faqs.filter(f => f.cat === cat);

  return (
    <div style={{paddingTop:80,background:BLACK,minHeight:"100vh"}}>
      <div style={{padding:"70px 40px 48px",textAlign:"center",background:`linear-gradient(180deg,${SURFACE} 0%,${BLACK} 100%)`,borderBottom:"1px solid rgba(201,168,76,0.08)"}}>
        <div style={{fontSize:10,letterSpacing:5,color:GOLD,marginBottom:12}}>Got Questions?</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(32px,5vw,60px)",fontWeight:300,letterSpacing:-1,marginBottom:10}}>
          Frequently Asked <span style={{color:GOLD}}>Questions</span>
        </h1>
        <p style={{color:"rgba(255,255,255,0.94)",fontSize:13,fontWeight:300}}>Everything you need to know before placing your first order.</p>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"48px 32px"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:40,justifyContent:"center"}}>
          {categories.map(c=>(
            <button key={c} onClick={()=>{setCat(c);setOpen(null);}} style={{padding:"7px 18px",fontSize:9,letterSpacing:2,textTransform:"uppercase",border:`1px solid ${c===cat?GOLD:"rgba(255,255,255,0.15)"}`,background:c===cat?"rgba(201,168,76,0.1)":"transparent",color:c===cat?GOLD:"rgba(255,255,255,0.75)",cursor:"pointer",fontFamily:"'Montserrat',sans-serif",transition:"all 0.2s"}}>
              {c}
            </button>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {filtered.map((faq,i)=>(
            <div key={i} style={{background:SURFACE2,border:`1px solid ${open===i?"rgba(201,168,76,0.35)":"rgba(255,255,255,0.06)"}`,transition:"all 0.3s",overflow:"hidden"}}>
              <button onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",padding:"20px 24px",background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,textAlign:"left"}}>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <span style={{fontSize:8,letterSpacing:2,color:GOLD,textTransform:"uppercase",whiteSpace:"nowrap",border:"1px solid rgba(201,168,76,0.2)",padding:"2px 7px",flexShrink:0}}>{faq.cat}</span>
                  <span style={{fontSize:14,color:WHITE,fontFamily:"'Cormorant Garamond',serif",fontWeight:400,lineHeight:1.3}}>{faq.q}</span>
                </div>
                <span style={{color:GOLD,fontSize:20,flexShrink:0,transition:"transform 0.3s",transform:open===i?"rotate(45deg)":"rotate(0)"}}>{open===i?"×":"+"}</span>
              </button>
              {open===i&&(
                <div style={{padding:"0 24px 22px 24px",borderTop:"1px solid rgba(201,168,76,0.08)"}}>
                  <p style={{fontSize:13,lineHeight:1.9,color:"rgba(255,255,255,0.9)",fontWeight:300,paddingTop:16}}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{marginTop:48,padding:"32px",textAlign:"center",border:"1px solid rgba(201,168,76,0.15)",background:"rgba(201,168,76,0.02)"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,marginBottom:8}}>Still have questions?</div>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.8)",lineHeight:1.8,marginBottom:20}}>Our team is available by phone, text, or email. We typically respond within 24 hours.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="tel:4234443668" style={{padding:"11px 24px",background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,color:BLACK,fontSize:10,fontWeight:700,letterSpacing:2,textDecoration:"none",fontFamily:"'Montserrat',sans-serif"}}>📞 423-444-3668</a>
            <a href="mailto:trupepwellness@gmail.com" style={{padding:"11px 24px",background:"transparent",color:GOLD,fontSize:10,fontWeight:600,letterSpacing:2,border:`1px solid ${GOLD}`,textDecoration:"none",fontFamily:"'Montserrat',sans-serif"}}>✉ Email Us</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HOW TO ORDER ─────────────────────────────────────────────────────────────
function HowToOrderSection() {
  const steps = [
    { num:"01", icon:"🛍", title:"Browse & Add to Bag", desc:"Browse our full catalog of 25+ research peptides and curated stacks. Select your size, add items to your bag, and apply a promo code if you have one." },
    { num:"02", icon:"📋", title:"Submit Your Order", desc:"Fill in your name, email, phone, and shipping address. Check the required agreements and hit Submit Order. You'll instantly see the payment screen." },
    { num:"03", icon:"💳", title:"Send Payment", desc:"Send your order total via Zelle (423-444-3668), Venmo (@TruPepWellness), or PayPal (@ItsTrinchy). Always include your full name in the memo." },
    { num:"04", icon:"📦", title:"We Ship to You", desc:"Once payment is confirmed we process and ship your order within 1–3 business days in discreet packaging. You'll receive tracking where available." },
  ];

  return (
    <section style={{padding:"90px 40px",background:SURFACE,borderTop:"1px solid rgba(201,168,76,0.08)"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <div style={{fontSize:10,letterSpacing:5,color:GOLD,display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:14}}>
            <span style={{width:40,height:1,background:GOLD,display:"inline-block"}}/>How It Works
          </div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4vw,52px)",fontWeight:300,letterSpacing:-0.5}}>
            Ordering is <span style={{color:GOLD}}>Simple</span>
          </h2>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.94)",maxWidth:480,margin:"14px auto 0",fontWeight:300,lineHeight:1.8}}>
            No account required. No complicated checkout. Just 4 easy steps.
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:2,marginBottom:48}}>
          {steps.map((s,i)=>(
            <div key={s.num} style={{background:BLACK,padding:"36px 28px",position:"relative",borderTop:`2px solid ${GOLD}`,transition:"all 0.3s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,0.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:300,color:"rgba(201,168,76,0.15)",lineHeight:1,marginBottom:4}}>{s.num}</div>
              <div style={{fontSize:28,marginBottom:14}}>{s.icon}</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400,color:WHITE,marginBottom:10}}>{s.title}</h3>
              <p style={{fontSize:12,lineHeight:1.8,color:"rgba(255,255,255,0.94)",fontWeight:300}}>{s.desc}</p>
              {i < steps.length-1 && (
                <div style={{position:"absolute",right:-16,top:"50%",transform:"translateY(-50%)",color:GOLD,fontSize:18,zIndex:1,display:"block"}} className="hide-mobile">›</div>
              )}
            </div>
          ))}
        </div>

        <div style={{background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.2)",padding:"24px 32px",display:"flex",gap:24,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:10,letterSpacing:3,color:GOLD,textTransform:"uppercase",marginBottom:6}}>Payment Methods</div>
            <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
              {[["💜","Zelle","423-444-3668"],["💙","Venmo","@TruPepWellness"],["💙","PayPal","@ItsTrinchy"]].map(([icon,name,val])=>(
                <div key={name} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{icon}</span>
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:GOLD,textTransform:"uppercase"}}>{name}</div>
                    <div style={{fontSize:12,color:WHITE,marginTop:1}}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.92)",fontStyle:"italic",maxWidth:260,lineHeight:1.7}}>
            Always include your <strong style={{color:WHITE}}>full name</strong> in the payment memo so we can match it to your order.
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [cookieAccepted, setCookieAccepted] = useState(!!localStorage.getItem("tp_cookie_accepted"));
  const { cart, addToCart, removeFromCart, updateQty, total, count } = useCart();

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  useEffect(() => {
    if (!ageConfirmed) return;
    const seen = localStorage.getItem("tp_popup_seen");
    if (!seen) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem("tp_popup_seen", "true");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [ageConfirmed]);

  const confirmAge = () => { localStorage.setItem("tp_age_confirmed","true"); setAgeConfirmed(true); };
  const acceptCookies = () => { localStorage.setItem("tp_cookie_accepted","true"); setCookieAccepted(true); };
  const nav = (p) => { setPage(p); window.scrollTo(0,0); };

  return (
    <>
      <style>{globalStyles}</style>
      {!ageConfirmed && <AgeGate onConfirm={confirmAge} />}
      <GoldBorder />
      <Nav cartCount={count} onCartOpen={() => setCartOpen(true)} currentPage={page} setPage={nav} />

      {page === "home"         && <HomePage setPage={nav} onAdd={addToCart} />}
      {page === "products"     && <ProductsPage onAdd={addToCart} />}
      {page === "stacks"       && <StacksPage onAdd={addToCart} setPage={nav} />}
      {page === "calculator"   && <CalculatorPage />}
      {page === "howto"        && <HowToUsePage setPage={nav} />}
      {page === "quiz"         && <QuizPage setPage={nav} />}
      {page === "gallery"      && <GalleryPage />}
      {page === "blog"         && <BlogPage />}
      {page === "faq"          && <FAQPage />}
      {page === "reviews"      && <ReviewsPage />}
      {page === "tracking"     && <OrderTrackingPage />}
      {page === "about"        && <AboutPage />}
      {page === "testimonials" && <TestimonialsPage setPage={nav} />}
      {page === "consultation" && <ConsultationPage />}
      {page === "contact"      && <ContactPage />}
      {page === "print-insert" && <PrintInsertPage />}
      {page === "privacy"      && <PrivacyPage />}
      {page === "terms"        && <TermsPage />}
      {page === "disclaimer"   && <DisclaimerPage />}
      {page === "refund"       && <RefundPage />}

      <Footer setPage={nav} />

      {cartOpen && (
        <CartDrawer cart={cart} total={total} onClose={() => setCartOpen(false)}
          onRemove={removeFromCart} onUpdateQty={updateQty} onAdd={addToCart} />
      )}
      {showPopup && <EmailPopup onClose={() => setShowPopup(false)} />}
      {!cookieAccepted && ageConfirmed && <CookieBanner onAccept={acceptCookies} />}
    </>
  );
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
