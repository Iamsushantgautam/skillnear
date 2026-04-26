import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import '../../styles/Hero.css';

const Hero = ({ globalSearch, setGlobalSearch, handleSearch, mainCategories }) => {
    return (
        <section className="hero-wrapper">
            <div className="container hero-container">
                {/* Hero Left - Search & Icons */}
                <div className="hero-left">
                    <h1 className="hero-title">Home services at your doorstep</h1>

                    <div className="hero-search-box-card no-scrollbar">
                        <p style={{ fontWeight: '600', marginBottom: '20px', fontSize: '1.25rem', color: '#334155' }}>
                            What are you looking for?
                        </p>
                        <form onSubmit={handleSearch} className="unified-search-container">
                            <div className="search-part">
                                <Search size={20} color="#94a3b8" />
                                <input
                                    type="text"
                                    placeholder="Search for 'Salon 226001'..."
                                    className="search-input"
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="search-btn">
                                Find
                            </button>
                        </form>

                        <div className="hero-cat-grid">
                            {mainCategories.map((cat, i) => {
                                const pincodeMatch = globalSearch.match(/\b\d{6}\b/);
                                const currentPincode = pincodeMatch ? pincodeMatch[0] : '';
                                return (
                                    <Link
                                        key={i}
                                        to={cat.link ? cat.link : `/services?category=${cat.name}${currentPincode ? `&pincode=${currentPincode}` : ''}`}
                                        className="hero-cat-item"
                                    >
                                        <div className="hero-cat-icon" style={{ backgroundColor: cat.bg }}>
                                            <img
                                                src={cat.icon}
                                                alt={cat.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span className="hero-cat-label">{cat.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Hero Right - Collage */}
                <div className="hero-right">
                    <div className="collage-grid">
                        <div className="collage-img" style={{ gridArea: 'a', backgroundImage: 'url("/images/categories/technical.png")' }}></div>
                        <div className="collage-img" style={{ gridArea: 'b', backgroundImage: 'url("/images/categories/salon.png")' }}></div>
                        <div className="collage-img" style={{ gridArea: 'c', backgroundImage: 'url("/images/categories/ac_repair.png")' }}></div>
                        <div className="collage-img" style={{ gridArea: 'd', backgroundImage: 'url("/images/categories/cleaning.png")' }}></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
