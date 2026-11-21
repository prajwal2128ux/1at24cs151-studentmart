
import React, { useEffect, useState } from "react";
import {
  Store,
  User,
  ShieldCheck,
  Bell,
  CreditCard,
  Save,
  RotateCcw,
  CheckCircle,
  Mail,
  ShoppingBag,
  Lock,
  Settings as SettingsIcon
} from "lucide-react";

import "./Settings.css";

const DEFAULT_SETTINGS = {
  storeName: "StudentMart",
  currency: "INR",
  paymentMethod: "Cash on Delivery",
  registration: true,
  storeStatus: true,
  lowStockAlerts: true,
  orderNotifications: true,
  customerNotifications: true,
  emailNotifications: true
};

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("studentmart_admin_settings");

      if (stored) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(stored)
        });
      }
    } catch (error) {
      console.error("Settings loading failed:", error);
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem(
        "studentmart_admin_settings",
        JSON.stringify(settings)
      );

      setSaved(true);
    } catch (error) {
      alert("Unable to save settings.");
    }
  };

  const resetSettings = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all settings?"
    );

    if (!confirmReset) return;

    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("studentmart_admin_settings");
    setSaved(false);
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`setting-switch ${checked ? "enabled" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    setting
  }) => (
    <div className="setting-item">
      <div className="setting-item-icon">
        <Icon size={19} />
      </div>

      <div className="setting-item-content">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <Toggle
        checked={settings[setting]}
        onChange={(value) => updateSetting(setting, value)}
      />
    </div>
  );

  return (
    <div className="settings-page">

      {/* Page heading */}
      <div className="settings-header">
        <div>
          <span className="settings-label">
            <SettingsIcon size={14} />
            ADMINISTRATION
          </span>

          <h1>Settings</h1>

          <p>
            Manage your store preferences and account settings.
          </p>
        </div>

        <button
          className="settings-save-btn"
          onClick={saveSettings}
        >
          {saved ? <CheckCircle size={17} /> : <Save size={17} />}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      {/* Store details */}
      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">
            <Store size={20} />
          </div>

          <div>
            <h2>Store Information</h2>
            <p>Basic information about your marketplace.</p>
          </div>
        </div>

        <div className="settings-fields">
          <label className="settings-field">
            <span>Store Name</span>

            <input
              type="text"
              value={settings.storeName}
              onChange={(e) =>
                updateSetting("storeName", e.target.value)
              }
              placeholder="Enter store name"
            />
          </label>

          <label className="settings-field">
            <span>Currency</span>

            <select
              value={settings.currency}
              onChange={(e) =>
                updateSetting("currency", e.target.value)
              }
            >
              <option value="INR">Indian Rupee (INR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </label>

          <label className="settings-field">
            <span>Payment Method</span>

            <select
              value={settings.paymentMethod}
              onChange={(e) =>
                updateSetting("paymentMethod", e.target.value)
              }
            >
              <option>Cash on Delivery</option>
              <option>Online Payment</option>
              <option>Cash on Delivery and Online Payment</option>
            </select>
          </label>
        </div>
      </section>

      {/* Store preferences */}
      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">
            <ShoppingBag size={20} />
          </div>

          <div>
            <h2>Store Preferences</h2>
            <p>Control how customers interact with your store.</p>
          </div>
        </div>

        <SettingItem
          icon={Store}
          title="Store Availability"
          description="Enable or pause the marketplace."
          setting="storeStatus"
        />

        <SettingItem
          icon={User}
          title="Customer Registration"
          description="Allow new customers to register."
          setting="registration"
        />

        <SettingItem
          icon={Bell}
          title="Low Stock Alerts"
          description="Enable alerts for products with low inventory."
          setting="lowStockAlerts"
        />
      </section>

      {/* Notifications */}
      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">
            <Bell size={20} />
          </div>

          <div>
            <h2>Notifications</h2>
            <p>Choose which notifications you prefer.</p>
          </div>
        </div>

        <SettingItem
          icon={ShoppingBag}
          title="Order Notifications"
          description="Notifications when customers place orders."
          setting="orderNotifications"
        />

        <SettingItem
          icon={User}
          title="Customer Notifications"
          description="Updates about customer activity."
          setting="customerNotifications"
        />

        <SettingItem
          icon={Mail}
          title="Email Notifications"
          description="Enable email notification preferences."
          setting="emailNotifications"
        />
      </section>

      {/* Security */}
      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2>Account & Security</h2>
            <p>Administrator account information.</p>
          </div>
        </div>

        <div className="security-item">
          <div className="setting-item-icon">
            <Lock size={19} />
          </div>

          <div className="setting-item-content">
            <strong>Administrator Account</strong>
            <p>Access to administration pages is protected.</p>
          </div>

          <span className="security-status">
            Protected
          </span>
        </div>

        <div className="security-item">
          <div className="setting-item-icon">
            <CreditCard size={19} />
          </div>

          <div className="setting-item-content">
            <strong>Payment Configuration</strong>
            <p>{settings.paymentMethod}</p>
          </div>
        </div>
      </section>

      {/* Bottom actions */}
      <div className="settings-footer">
        <div>
          <strong>Manage your preferences</strong>
          <p>Remember to save your changes.</p>
        </div>

        <div className="settings-footer-actions">
          <button
            className="settings-reset-btn"
            onClick={resetSettings}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            className="settings-save-btn"
            onClick={saveSettings}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {saved && (
        <div className="settings-success">
          <CheckCircle size={17} />
          Settings saved successfully.
        </div>
      )}

    </div>
  );
}
