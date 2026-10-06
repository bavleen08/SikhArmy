import React from "react";
import { FaInstagram, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      style={{
        background: "#09090b",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        padding: "30px 20px",
        marginTop: "auto",
        position: "relative",
        bottom: 0,
        width: "100%"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "25px"
        }}
      >

        {/* BRAND */}
        <div>
          <h3
            style={{
              color: "#f97316",
              marginBottom: "6px"
            }}
          >
            SikhArmy
          </h3>

          <p
            style={{
              color: "#a1a1aa",
              fontSize: "0.9rem",
              margin: 0
            }}
          >
            Premium Quality Sikh Shastars.
          </p>
        </div>


        {/* CONTACT */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >

          {/* GMAIL */}
          <a
            href="mailto:sikharmy69@gmail.com"
            title="Email SikhArmy"
            style={{
              color: "#f97316",
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#a1a1aa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#f97316";
            }}
          >
            <FaEnvelope
              style={{
                fontSize: "1.15rem",
                flexShrink: 0
              }}
            />

            <span>sikharmy69@gmail.com</span>
          </a>


          {/* INSTAGRAM */}
          <a
            href="https://instagram.com/sikh.army69"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            style={{
              color: "#f97316",
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#a1a1aa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#f97316";
            }}
          >
            <FaInstagram
              style={{
                fontSize: "1.2rem",
                flexShrink: 0
              }}
            />

            <span>@sikh.army69</span>
          </a>

          <div>
            <p style={{color: "#a1a1aa"}}>Contact us for any queries:</p>
            <p style={{color: "#a1a1aa"}}> +91 7717323249, +91 8264344978</p>
          </div>

        </div>


        {/* COPYRIGHT */}
        <div
          style={{
            color: "#71717a",
            fontSize: "0.85rem"
          }}
        >
          © {new Date().getFullYear()} SikhArmy. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
