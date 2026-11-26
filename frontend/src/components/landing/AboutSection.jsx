import React from "react";
import { 
  ShoppingBag, 
  ShieldCheck, 
  Boxes, 
  Sparkles, 
  Repeat, 
  Users, 
  CheckCircle2, 
  GraduationCap, 
  ArrowDown 
} from "lucide-react";

export default function AboutSection({ onNextSection }) {
  const features = [
    {
      icon: <Repeat size={24} />,
      title: "Campus Peer-to-Peer Trading",
      desc: "Buy and sell directly with fellow students in your campus community without middlemen, delivery delays, or high platform cuts.",
      tag: "Direct Handover"
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Verified Student Ecosystem",
      desc: "Closed and safe university marketplace ensuring all buyers and sellers are authenticated student community members.",
      tag: "Zero Spam"
    },
    {
      icon: <ShoppingBag size={24} />,
      title: "Essential Student Catalog",
      desc: "Textbooks, engineering instruments, lab coats, electronics, room essentials, and stationery at student-friendly pricing.",
      tag: "Curated Categories"
    },
    {
      icon: <Boxes size={24} />,
      title: "Real-time Order Tracking",
      desc: "Clear visual timelines for orders from placement to packing and scheduled campus peer pickup with Cash on Delivery.",
      tag: "Live Status"
    }
  ];

  return (
    <section id="about" className="apple-screen apple-about-screen">
      <div className="apple-screen-inner">
        {/* Header */}
        <div className="apple-section-header">
          <div className="apple-badge">
            <Sparkles size={14} />
            <span>ABOUT STUDENTMART</span>
          </div>
          <h2 className="apple-section-title">
            Commerce built for campus life.
          </h2>
          <p className="apple-section-desc">
            StudentMart was created to eliminate expensive middleman markups, reduce campus waste, 
            and create a trusted circular economy where students buy and sell textbooks, 
            electronics, and daily academic essentials directly.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="apple-features-grid">
          {features.map((item, idx) => (
            <div key={idx} className="apple-feature-card">
              <div className="card-top">
                <div className="card-icon-wrap">{item.icon}</div>
                <span className="card-tag">{item.tag}</span>
              </div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Project Mission Banner */}
        <div className="apple-mission-banner">
          <div className="mission-icon">
            <GraduationCap size={28} />
          </div>
          <div className="mission-content">
            <h4>Our Core Mission</h4>
            <p>
              Empowering students with an affordable, sustainable, and reliable university marketplace. 
              Keep value within the campus while fostering sustainable resource reuse.
            </p>
          </div>
          <div className="mission-badges">
            <span className="mission-pill"><CheckCircle2 size={14} /> Zero Commission</span>
            <span className="mission-pill"><CheckCircle2 size={14} /> Peer Cash on Delivery</span>
            <span className="mission-pill"><CheckCircle2 size={14} /> Verified Student IDs</span>
          </div>
        </div>

        {/* Next screen hint */}
        <div className="apple-scroll-next" onClick={onNextSection} role="button" tabIndex={0}>
          <span>Contact & Team Information</span>
          <ArrowDown size={15} />
        </div>
      </div>
    </section>
  );
}
