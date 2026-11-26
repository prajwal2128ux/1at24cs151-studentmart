import React, { useState } from "react";
import { 
  Mail, 
  User, 
  Building2, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  ArrowDown, 
  Sparkles,
  PhoneCall
} from "lucide-react";

export default function ContactSection({ onNextSection }) {
  const [copied, setCopied] = useState(false);
  const email = "prajwalnayak120@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contact" className="apple-screen apple-contact-screen">
      <div className="apple-screen-inner">
        {/* Header */}
        <div className="apple-section-header">
          <div className="apple-badge">
            <Sparkles size={14} />
            <span>PROJECT TEAM & REACH</span>
          </div>
          <h2 className="apple-section-title">
            Connect with our team.
          </h2>
          <p className="apple-section-desc">
            StudentMart is maintained and supported by our engineering team. 
            Whether you have questions, campus integration inquiries, or feedback, we are here to help.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="apple-contact-grid">
          {/* Developer Card */}
          <div className="apple-contact-card primary-card">
            <div className="contact-card-icon">
              <User size={26} />
            </div>
            <div className="contact-card-content">
              <span className="contact-role">LEAD DEVELOPER & ARCHITECT</span>
              <h3 className="contact-name">Prajwal Kumar</h3>
              <p className="contact-meta">USN: <strong>1AT24CS151</strong></p>
              <p className="contact-desc">
                Full-stack developer responsible for StudentMart architecture, 
                secure authentication workflows, and interactive campus marketplace engineering.
              </p>
            </div>
          </div>

          {/* Email Card */}
          <div className="apple-contact-card">
            <div className="contact-card-icon">
              <Mail size={26} />
            </div>
            <div className="contact-card-content">
              <span className="contact-role">DIRECT INQUIRIES</span>
              <h3 className="contact-name">Official Email</h3>
              <a href={`mailto:${email}`} className="contact-email-link">
                {email}
              </a>
              <p className="contact-desc">
                Reach out directly for technical support, partnership queries, or student account verifications.
              </p>
              <button 
                type="button" 
                className="apple-action-btn"
                onClick={handleCopyEmail}
              >
                {copied ? <><Check size={15} /> Copied to clipboard</> : <><Copy size={15} /> Copy email address</>}
              </button>
            </div>
          </div>

          {/* College / Campus Card */}
          <div className="apple-contact-card">
            <div className="contact-card-icon">
              <Building2 size={26} />
            </div>
            <div className="contact-card-content">
              <span className="contact-role">ACADEMIC AFFILIATION</span>
              <h3 className="contact-name">Campus Engineering Hub</h3>
              <p className="contact-meta">
                <MapPin size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                Dept. of Computer Science & Engineering
              </p>
              <p className="contact-desc">
                Developed as a premier academic initiative to foster technological innovation and sustainable commerce within campus boundaries.
              </p>
            </div>
          </div>

          {/* Security & Verification Card */}
          <div className="apple-contact-card">
            <div className="contact-card-icon">
              <ShieldCheck size={26} />
            </div>
            <div className="contact-card-content">
              <span className="contact-role">INFRASTRUCTURE</span>
              <h3 className="contact-name">Verified Campus Network</h3>
              <p className="contact-meta">Version 2.4.0 (Live Production)</p>
              <p className="contact-desc">
                Encrypted sessions, role-isolated admin controls, and cash-on-delivery verified peer handovers.
              </p>
            </div>
          </div>
        </div>

        {/* Next screen hint */}
        <div className="apple-scroll-next" onClick={onNextSection} role="button" tabIndex={0}>
          <span>Frequently Asked Questions & Support</span>
          <ArrowDown size={15} />
        </div>
      </div>
    </section>
  );
}
