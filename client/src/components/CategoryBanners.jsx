import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CategoryBanners = () => {
    const navigate = useNavigate();

    const banners = [
        { title: 'Home Repairs', subtitle: 'Starting at ₹249', bg: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', cat: 'Carpenters', show: true },
        { title: 'Women Salon', subtitle: 'Flat 30% OFF', bg: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', cat: 'Salon', show: true },
        { title: 'AC Servicing', subtitle: 'Instant 2hr Booking', bg: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)', cat: 'AC Repair', show: true },
        { title: 'Plumbing', subtitle: 'Expert Fixes ₹199', bg: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', cat: 'Plumbers', show: true },
        { title: 'Electrical', subtitle: 'Safety First · Fast', bg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', cat: 'Electricians', show: true },
        { title: 'Painters', subtitle: 'Free Consultation', bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', cat: 'Painters', show: true },
        { title: 'Cleaning', subtitle: 'Spotless Deep Clean', bg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', cat: 'Cleaning', show: true },
        { title: 'Local Shops', subtitle: 'Essentials Nearby', bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', link: '/shops', show: false },
        { title: 'Tutors', subtitle: 'Learn from Experts', bg: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', cat: 'Tutors', show: true },
    ];

    return (
        <section className="container" style={{ margin: '40px auto' }}>
            <div className="banners-grid">
                {banners.filter(b => b.show).map((item, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            if (item.link) navigate(item.link);
                            else navigate(`/services?category=${item.cat || item.title}`);
                        }}
                        style={{ ...styles.card, background: item.bg }}
                        className="banner-card"
                    >
                        <div className="card-content">
                            <h3 className="banner-title">{item.title}</h3>
                            <p className="banner-subtitle">{item.subtitle}</p>
                            <button className="desktop-btn" style={styles.button}>Check Now</button>
                        </div>
                        <div className="mobile-arrow">
                            <ChevronRight size={32} />
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .banners-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                    padding: 10px 0;
                }
                
                .banner-card {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                
                .banner-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .banner-title {
                    font-size: 1.6rem;
                    font-weight: 900;
                    margin-bottom: 8px;
                    letter-spacing: -0.02em;
                }

                .banner-subtitle {
                    font-size: 1rem;
                    opacity: 0.9;
                    font-weight: 500;
                }

                .mobile-arrow {
                    display: none;
                    transition: transform 0.3s ease;
                }

                .banner-card:hover .mobile-arrow {
                    transform: translateX(8px);
                }

                @media (max-width: 1024px) {
                    .banners-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .banners-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                    .banner-card {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                        padding: 20px 24px !important;
                        min-height: 120px !important;
                    }
                    .desktop-btn {
                        display: none !important;
                    }
                    .mobile-arrow {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .banner-title {
                        font-size: 1.4rem;
                        margin-bottom: 4px;
                    }
                    .banner-subtitle {
                        font-size: 0.9rem;
                    }
                }

                @media (max-width: 480px) {
                    .banners-grid {
                        gap: 12px;
                    }
                    .banner-card {
                        padding: 16px 20px !important;
                        min-height: 100px !important;
                    }
                    .banner-title {
                        font-size: 1.2rem;
                    }
                    .banner-subtitle {
                        font-size: 0.8rem;
                    }
                    .mobile-arrow svg {
                        width: 24px;
                        height: 24px;
                    }
                }
            `}</style>
        </section>
    );
};

const styles = {
    card: {
        borderRadius: '24px',
        padding: '32px 24px',
        color: '#fff',
        cursor: 'pointer',
        minHeight: '200px',
        position: 'relative',
        overflow: 'hidden',
    },
    button: {
        marginTop: '24px',
        width: 'fit-content',
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#fff',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '12px',
        fontSize: '0.9rem',
        fontWeight: '700',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
    }
};

export default CategoryBanners;
