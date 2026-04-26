import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import logo from '/favicon.png';

const Footer = () => {
    return (
        <footer className="site-footer">

            {/* Gradient accent bar */}
            {/* <div className="footer-accent" /> */}

            <div className="footer-inner">

                {/* Main grid */}
                <div className="footer-grid">

                    {/* Brand Column */}
                    <div className="footer-brand">
                        <div className="footer-brand-text">
                            <div className="footer-logo-row">
                                <img src={logo} alt="SkillNear" className="footer-logo-icon" />
                                <h3 className="footer-logo">SkillNear</h3>
                            </div>
                            <p className="footer-tagline">Local Expertise. Trusted Results.</p>
                            <p className="footer-desc">
                                SkillNear connects you with vetted local professionals — from repairs to creative services — making reliable help easy to find, right in your neighborhood.
                            </p>
                            <a href="mailto:hello@skillnear.com" className="footer-contact-chip">
                                ✉ hello@skillnear.com
                            </a>
                        </div>
                    </div>

                    {/* For Customers */}
                    <div>
                        <h4 className="footer-col-title">For Customers</h4>
                        <div className="footer-col-links">
                            <Link to="/services">Browse Services</Link>
                            <Link to="/how-it-works">How it Works</Link>
                            <Link to="/contact">Support Center</Link>
                        </div>
                    </div>

                    {/* For Professionals */}
                    <div>
                        <h4 className="footer-col-title">For Professionals</h4>
                        <div className="footer-col-links">
                            <Link to="/register">Join the Network</Link>
                            <Link to="/provider-guidelines">Service Guidelines</Link>
                            <Link to="/success-stories">Partner Stories</Link>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="footer-col-title">Company</h4>
                        <div className="footer-col-links">
                            <Link to="/about">About Us</Link>
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                        </div>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        &copy; {new Date().getFullYear()} SkillNear Technologies. All rights reserved.
                    </p>
                    <div className="footer-status">
                        <span className="footer-status-dot" />
                        <span className="footer-status-text">All Systems Operational</span>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
