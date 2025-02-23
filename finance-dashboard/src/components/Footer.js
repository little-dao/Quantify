// src/components/Footer.js

import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Links section */}
        <div className="footer-links">
          <a href="/legal">Legal Notices & Disclosures</a>
          <a href="/privacy">Privacy & Security</a>
          <a href="/sitemap">Site Map</a>
          <a href="/accessibility">Accessibility Statement</a>
          <a href="/advisor-report">Advisor Report</a>
        </div>

        {/* Disclaimer text */}
        <p>
          Quantify Inc. and its affiliates are wholly owned subsidiaries of Quantify Group. 
          Quantify Inc. is a registered investment dealer, a member of the Canadian Investment 
          Regulatory Organization (CIRO), and a member of the Canadian Investor Protection Fund (CIPF). 
          The benefits of CIPF membership are limited to the activities undertaken by Quantify Inc. 
          Quantify Wealth Management (QWM) is not a member of CIRO or the CIPF. QWM provides portfolio 
          management services and is responsible for managing your account and investment portfolios 
          by providing trade instructions to Quantify Inc.
        </p>

        {/* Additional disclaimer */}
        <p>
          This website is provided for informational purposes only and should not be used or construed 
          as investment, tax, or financial advice. All investments involve risk, and you should consult 
          with a financial advisor before making any investment decisions.
        </p>

        {/* Copyright notice */}
        <p className="copyright">
          © 2025, Quantify Inc. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;