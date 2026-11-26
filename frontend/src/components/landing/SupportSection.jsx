import React, { useState } from "react";
import { 
  ChevronDown, 
  Send, 
  HelpCircle, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  ArrowUp, 
  ShoppingBag, 
  Tag, 
  KeyRound, 
  Truck 
} from "lucide-react";

export default function SupportSection({ onScrollToTop }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      q: "How do I buy products on StudentMart?",
      icon: <ShoppingBag size={18} />,
      a: "Once you log into your student account, browse the Campus Catalog under 'Products'. Add items to your cart, proceed to checkout, and place your order. You pay upon receiving the item via Cash on Delivery during campus peer handover."
    },
    {
      q: "How can I sell or list my used items?",
      icon: <Tag size={18} />,
      a: "Students can request seller privileges or upload products via their student dashboard. Provide a clear title, description, category, and student-friendly price. Once published, buyers on campus can discover and order your item."
    },
    {
      q: "What should I do if I have login or registration issues?",
      icon: <KeyRound size={18} />,
      a: "Ensure you are using the correct email address and a password with at least 8 characters. If you see an error, check that your email is unique. You can also reach out through the support form below for account assistance."
    },
    {
      q: "How does order tracking and campus handover work?",
      icon: <Truck size={18} />,
      a: "Track all your active orders in real time under the 'My Orders' tab. Orders follow a transparent lifecycle: Placed → Packed → Out for Campus Delivery → Completed. Delivery handovers are scheduled in safe campus spots like the student center or library."
    },
    {
      q: "How can I contact customer care directly?",
      icon: <MessageSquare size={18} />,
      a: "You can submit an inquiry directly using the form on this page or send an email to prajwalnayak120@gmail.com. We usually respond within 24 business hours."
    }
  ];

  const handleToggleFaq = (index) => {
    setOpenFaq(prev => prev === index ? -1 : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
    }, 700);
  };

  return (
    <section id="support" className="apple-screen apple-support-screen">
      <div className="apple-screen-inner">
        {/* Header */}
        <div className="apple-section-header">
          <div className="apple-badge">
            <Sparkles size={14} />
            <span>SUPPORT & FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="apple-section-title">
            Help & Customer Care.
          </h2>
          <p className="apple-section-desc">
            Everything you need to know about navigating the marketplace, trading safely on campus, 
            and getting quick assistance.
          </p>
        </div>

        {/* 2-Column Layout: FAQ Accordion + Support Form */}
        <div className="apple-support-layout">
          {/* Left Column: FAQ Accordion */}
          <div className="apple-faq-col">
            <div className="col-header">
              <HelpCircle size={20} />
              <h3>Frequently Asked Questions</h3>
            </div>
            <div className="faq-accordion">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={`faq-item ${isOpen ? "open" : ""}`}>
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => handleToggleFaq(index)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-icon-title">
                        {faq.icon}
                        <span>{faq.q}</span>
                      </span>
                      <ChevronDown size={18} className={`chevron ${isOpen ? "rotated" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Support Form */}
          <div className="apple-form-col">
            <div className="col-header">
              <MessageSquare size={20} />
              <h3>Contact Customer Support</h3>
            </div>
            
            {submitted ? (
              <div className="support-success-card">
                <CheckCircle2 size={44} className="success-icon" />
                <h4>Inquiry Received!</h4>
                <p>
                  Thank you for contacting StudentMart Support. A confirmation has been logged, 
                  and our support desk will respond to your email shortly.
                </p>
                <button 
                  type="button" 
                  className="apple-action-btn"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="apple-support-form" onSubmit={handleSubmit}>
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="supp-name">Your Name</label>
                    <input 
                      id="supp-name"
                      name="name" 
                      type="text" 
                      placeholder="e.g. Alex Chen" 
                      required 
                      value={formState.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="supp-email">Campus Email</label>
                    <input 
                      id="supp-email"
                      name="email" 
                      type="email" 
                      placeholder="student@college.edu" 
                      required 
                      value={formState.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="supp-subject">Subject</label>
                  <input 
                    id="supp-subject"
                    name="subject" 
                    type="text" 
                    placeholder="How can we help you?" 
                    required 
                    value={formState.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supp-message">Message</label>
                  <textarea 
                    id="supp-message"
                    name="message" 
                    rows={4} 
                    placeholder="Describe your question or issue in detail..." 
                    required 
                    value={formState.message}
                    onChange={handleInputChange}
                  />
                </div>

                <button 
                  type="submit" 
                  className="apple-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Submit Inquiry"}
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Minimal Apple Footer */}
        <footer className="apple-landing-footer">
          <div className="apple-footer-content">
            <p>© {new Date().getFullYear()} StudentMart · Crafted for campus peer commerce.</p>
            <div className="footer-links">
              <span>Verified Student Network</span>
              <span>•</span>
              <span>Zero Commission</span>
              <span>•</span>
              <span>Cash on Delivery</span>
            </div>
            <button 
              type="button" 
              className="back-to-top-btn" 
              onClick={onScrollToTop}
              title="Return to top"
            >
              <ArrowUp size={14} /> Back to Top
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
