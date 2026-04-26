import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import '../../styles/CategoryBanners.css';
import homeRepairImg from '../../assets/catg/homeRepair.png';
import womenSalonImg from '../../assets/catg/womenSolon.png';
import menSalonImg from '../../assets/catg/menSalon.png';
import acRepairImg from '../../assets/catg/acRepair.png';
import plumbingImg from '../../assets/catg/plumbing.png';
import paintersImg from '../../assets/catg/painters.png';
import cleaningImg from '../../assets/catg/cleaning.png';
import tutorsImg from '../../assets/catg/tutors.png';
import carpenterImg from '../../assets/catg/carpenter.png';

const CategoryBanners = () => {
    const navigate = useNavigate();

    const banners = [
        { title: 'Home Repairs', subtitle: 'Starting at ₹249', bg: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', cat: 'Carpenters', img: homeRepairImg, show: true },
        { title: 'Women Salon', subtitle: 'Flat 30% OFF', bg: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', cat: 'Salon', img: womenSalonImg, show: true },
        { title: "Men's Salon", subtitle: 'Expert Grooming', bg: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)', cat: 'Salon', img: menSalonImg, show: true },
        { title: 'AC Servicing', subtitle: 'Instant 2hr Booking', bg: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)', cat: 'AC Repair', img: acRepairImg, show: true },
        { title: 'Plumbing', subtitle: 'Expert Fixes ₹199', bg: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', cat: 'Plumbers', img: plumbingImg, show: true },
        { title: 'Carpenters', subtitle: 'Safety First · Fast', bg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', cat: 'Carpenters', img: carpenterImg, show: true },
        { title: 'Painters', subtitle: 'Free Consultation', bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', cat: 'Painters', img: paintersImg, show: true },
        { title: 'Cleaning', subtitle: 'Spotless Deep Clean', bg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', cat: 'Cleaning', img: cleaningImg, show: true },
        { title: 'Local Shops', subtitle: 'Essentials Nearby', bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', link: '/shops', show: false },
        { title: 'Tutors', subtitle: 'Learn from Experts', bg: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', cat: 'Tutors', img: tutorsImg, show: true },
    ];

    return (
        <section className="container" style={{ margin: '10px auto' }}>
            <div className="banners-grid">
                {banners.filter(b => b.show).map((item, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            if (item.link) navigate(item.link);
                            else if (item.title === 'Home Repairs') navigate('/services');
                            else navigate(`/services?category=${item.cat || item.title}`);
                        }}
                        style={{ background: item.bg }}
                        className="banner-card"
                    >
                        <div className="card-content">
                            <h3 className="banner-title">{item.title}</h3>
                            <p className="banner-subtitle">{item.subtitle}</p>
                            <button className="desktop-btn">Check Now</button>
                        </div>
                        {item.img && (
                            <img src={item.img} alt={item.title} className="banner-img" />
                        )}
                        <div className="mobile-arrow">
                            <ChevronRight size={32} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategoryBanners;
