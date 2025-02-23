// src/pages/ContactUs.js

import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contact-us-container">
      <h1>Contact Us</h1>
      <p>
        We are here to help! Feel free to reach out to us via the following 
        contact information:
      </p>

      {/* Contact details and map container */}
      <div className="contact-info-container">
        {/* Contact details */}
        <div className="contact-details">
          <p><strong>Address:</strong> Wilfrid Laurier University, Waterloo, ON, Canada</p>
          <p><strong>Email:</strong> moneyisgood@Quantify.com</p>
          <p><strong>Phone:</strong> 222-333-444</p>
        </div>

        {/* Google Maps Embed */}
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2901.475166639279!2d-80.5194625241249!3d43.47237007112662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882bf4c5b0eacf65%3A0x7a2802e2316dd5b7!2sWilfrid%20Laurier%20University!5e0!3m2!1sen!2sca!4v1690000000000!5m2!1sen!2sca"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Wilfrid Laurier University Map"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;