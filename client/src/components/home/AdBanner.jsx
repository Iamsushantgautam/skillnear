import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/AdBanner.css';

const AdBanner = ({ image }) => {
    return (
        <section className="container ad-banner-section">
            <div className="ad-banner">
                <div className="ad-banner-left">
                    <span className="ad-banner-badge">All Services</span>
                    <h2 className="ad-banner-title">Expert Professionals at Your Door</h2>
                    <p className="ad-banner-text">From repairs to cleaning — trusted experts for every home need.</p>
                    <Link to="/services" className="ad-banner-cta">Explore All Services</Link>
                </div>
                <div className="ad-banner-right">
                    <img
                        src={image}
                        alt="All service professionals"
                        className="ad-banner-img"
                    />
                </div>
            </div>
        </section>
    );
};

export default AdBanner;
