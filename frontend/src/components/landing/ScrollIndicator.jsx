import React from "react";

export default function ScrollIndicator({ activeSection, onSelectSection }) {
  const sections = [
    { id: "hero", label: "Home" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
    { id: "support", label: "Support" },
  ];

  return (
    <nav className="apple-scroll-indicator" aria-label="Page Sections">
      {sections.map((section, idx) => {
        const isActive = activeSection === idx;
        return (
          <button
            key={section.id}
            type="button"
            className={`indicator-dot ${isActive ? "active" : ""}`}
            onClick={() => onSelectSection(idx)}
            aria-label={`Jump to ${section.label}`}
            title={section.label}
          >
            <span className="indicator-label">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
