import React from 'react';
import { 
    Briefcase, 
    Wallet, 
    MapPin, 
    Check, 
    Award, 
    Plus, 
    X, 
    ChevronRight, 
    Loader, 
    Video, 
    BadgeCheck, 
    RotateCw 
} from 'lucide-react';
import { City } from 'country-state-city';
import '../../../styles/desktop-dashboard-styles/DesktopAddGigTab.css';

const DesktopAddGigTab = ({
    editingGigId,
    gigStep,
    setGigStep,
    gigBusinessType,
    setGigBusinessType,
    gigTitle,
    setGigTitle,
    gigCategory,
    setGigCategory,
    gigTargetGender,
    setGigTargetGender,
    gigCustomCategory,
    setGigCustomCategory,
    gigExperience,
    setGigExperience,
    gigJobsCompleted,
    setGigJobsCompleted,
    shopAge,
    setShopAge,
    gigDesc,
    setGigDesc,
    gigServicesIncluded,
    setGigServicesIncluded,
    usePlans,
    setUsePlans,
    gigPrice,
    setGigPrice,
    gigPriceType,
    setGigPriceType,
    gigPlans,
    setGigPlans,
    shopOpeningTime,
    setShopOpeningTime,
    shopClosingTime,
    setShopClosingTime,
    shopIsHomeDelivery,
    setShopIsHomeDelivery,
    shopIsHomeService,
    setShopIsHomeService,
    shopHomeServiceFee,
    setShopHomeServiceFee,
    gigLat,
    setGigLat,
    gigLng,
    setGigLng,
    shopGoogleMapsLink,
    setShopGoogleMapsLink,
    gigStateCode,
    setGigStateCode,
    setGigState,
    gigCity,
    setGigCity,
    gigAddress,
    setGigAddress,
    gigZipCode,
    setGigZipCode,
    gigCoveragePincodes,
    setGigCoveragePincodes,
    gigImages,
    setGigImages,
    handleGigImageUpload,
    handleCreateGig,
    creatingGig,
    uploadingGigImages,
    indianStates,
    MapPicker,
    setActiveTab
}) => {
    return (
        <div className="gig-form-container animate-fade-in">
            {/* Header Section */}
            <div className="gig-header">
                <nav className="gig-nav-hint">
                    Business / {editingGigId ? 'Update Listing' : 'New Listing'}
                </nav>
                <h2 className="gig-title-main">
                    {editingGigId ? 'Refine Your Service' : 'Share Your Talent'}
                </h2>
                <p className="gig-subtitle">Create a high-impact listing to attract more customers.</p>
            </div>

            <div className="gig-grid">
                {/* Vertical Stepper Sidebar */}
                <aside className="gig-sidebar">
                    <div className="stepper-list">
                        {[
                            { step: 1, title: 'Identity', desc: 'Basics & Description', icon: <Briefcase size={20} /> },
                            { step: 2, title: 'Structure', desc: 'Pricing & Packages', icon: <Wallet size={20} /> },
                            { step: 3, title: 'Visibility', desc: 'Location & Media', icon: <MapPin size={20} /> }
                        ].map(s => (
                            <div 
                                key={s.step} 
                                onClick={() => gigStep > s.step && setGigStep(s.step)}
                                className={`step-item ${gigStep === s.step ? 'active' : gigStep > s.step ? 'completed' : 'pending'}`}
                            >
                                <div className={`step-icon ${gigStep === s.step ? 'active' : gigStep > s.step ? 'completed' : 'pending'}`}>
                                    {gigStep > s.step ? <Check size={20} /> : s.icon}
                                </div>
                                <div className="step-info">
                                    <div className={`step-title ${gigStep === s.step ? 'active' : 'inactive'}`}>{s.title}</div>
                                    <div className="step-desc">{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pro-tip-box">
                        <div className="pro-tip-header">
                            <Award size={18} color="var(--primary)" />
                            <span>Pro Tip</span>
                        </div>
                        <p className="pro-tip-text">
                            Add high-quality photos of your previous work to increase booking rates by up to 40%.
                        </p>
                    </div>
                </aside>

                {/* Main Form Area */}
                <div className="form-main-area">
                    <div className="form-card">
                        {gigStep === 1 && (
                            <div className="animate-fade-in">
                                <div style={{ marginBottom: '32px' }}>
                                    <label className="listing-type-label">Listing Type</label>
                                    <div className="listing-type-grid">
                                        <div
                                            onClick={() => setGigBusinessType('service')}
                                            className={`type-option ${gigBusinessType === 'service' ? 'selected' : ''}`}>
                                            <div className="type-icon-box">
                                                <Briefcase size={28} />
                                            </div>
                                            <div className="type-name">Service Provider</div>
                                            <p className="type-desc">Individual professional or home services</p>
                                        </div>
                                        <div
                                            onClick={() => setGigBusinessType('shop')}
                                            className={`type-option ${gigBusinessType === 'shop' ? 'selected' : ''}`}>
                                            <div className="type-icon-box">
                                                <MapPin size={28} />
                                            </div>
                                            <div className="type-name">Physical Shop</div>
                                            <p className="type-desc">Local store or vendor outlet space</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="input-row">
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>
                                            {gigBusinessType === 'service' ? 'Gig Title' : 'Shop Name'}
                                        </label>
                                        <input 
                                            type="text" 
                                            className="gig-input-field" 
                                            placeholder={gigBusinessType === 'service' ? "e.g. I will fix your technical plumbing issues" : "e.g. Sharma Grocery Store"} 
                                            value={gigTitle} 
                                            onChange={e => setGigTitle(e.target.value)} 
                                        />
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Service Category</label>
                                        <select 
                                            className="gig-input-field" 
                                            value={gigCategory} 
                                            onChange={e => setGigCategory(e.target.value)}
                                            style={{ appearance: 'none' }}
                                        >
                                            <option value="" disabled>-- Select Category --</option>
                                            <option value="Salon">Salon</option>
                                            <option value="Carpenters">Carpenters</option>
                                            <option value="Plumbers">Plumbers</option>
                                            <option value="Electricians">Electricians</option>
                                            <option value="Cleaning">Cleaning</option>
                                            <option value="AC Repair">AC Repair</option>
                                            <option value="Painters">Painters</option>
                                            <option value="Tutors">Tutors</option>
                                            <option value="Groceries">Groceries</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Other">Other (Add Custom)</option>
                                        </select>
                                    </div>
                                </div>

                                {gigCategory === 'Salon' && (
                                    <div className="salon-gender-box animate-fade-in shadow-sm">
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '16px' }}>Target Audience</label>
                                        <div className="gender-grid">
                                            {['male', 'female', 'unisex'].map(gender => (
                                                <div
                                                    key={gender}
                                                    onClick={() => setGigTargetGender(gender)}
                                                    className={`gender-option ${gigTargetGender === gender ? 'selected' : ''}`}
                                                >
                                                    {gender}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {gigCategory === 'Other' && (
                                    <div style={{ marginBottom: '24px' }} className="animate-fade-in">
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Custom Category Name</label>
                                        <input 
                                            type="text" 
                                            className="gig-input-field" 
                                            placeholder="e.g. Pet Grooming" 
                                            value={gigCustomCategory} 
                                            onChange={e => setGigCustomCategory(e.target.value)} 
                                        />
                                    </div>
                                )}

                                <div className="input-row">
                                    {gigBusinessType === 'service' ? (
                                        <>
                                            <div style={{ marginBottom: '24px' }}>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Years of Experience</label>
                                                <input 
                                                    type="number" 
                                                    className="gig-input-field" 
                                                    placeholder="e.g. 5" 
                                                    value={gigExperience} 
                                                    onChange={e => setGigExperience(e.target.value)} 
                                                />
                                            </div>
                                            <div style={{ marginBottom: '24px' }}>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Total Jobs Completed</label>
                                                <input 
                                                    type="number" 
                                                    className="gig-input-field" 
                                                    placeholder="e.g. 150" 
                                                    value={gigJobsCompleted} 
                                                    onChange={e => setGigJobsCompleted(e.target.value)} 
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ marginBottom: '24px', gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Establishment Age (Years)</label>
                                            <input 
                                                type="number" 
                                                className="gig-input-field" 
                                                placeholder="e.g. 10" 
                                                value={shopAge} 
                                                onChange={e => setShopAge(e.target.value)} 
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Detailed Description</label>
                                    <textarea 
                                        className="gig-textarea-field" 
                                        rows="6" 
                                        placeholder="Tell your customers what makes your service unique..." 
                                        value={gigDesc} 
                                        onChange={e => setGigDesc(e.target.value)}
                                    ></textarea>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Key Features / Inclusions</label>
                                    <input 
                                        type="text" 
                                        className="gig-input-field" 
                                        placeholder="e.g. Parts replacement, Professional cleanup, 6-month warranty" 
                                        value={gigServicesIncluded} 
                                        onChange={e => setGigServicesIncluded(e.target.value)} 
                                    />
                                    <p style={{ marginTop: '8px', color: '#64748b', fontSize: '0.75rem' }}>Enter items separated by commas to display them as bullet points.</p>
                                </div>
                            </div>
                        )}

                        {gigStep === 2 && (
                            <div className="animate-fade-in">
                                <div className="pricing-header">
                                    <div>
                                        <h4 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#191b23' }}>Pricing Strategy</h4>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Choose how you want to bill your clients.</p>
                                    </div>
                                    <div className="pricing-toggle">
                                        <span style={{ color: '#1e293b', fontWeight: '800', fontSize: '0.75rem' }}>3-Tier Pricing</span>
                                        <input 
                                            type="checkbox" 
                                            checked={usePlans} 
                                            onChange={e => setUsePlans(e.target.checked)} 
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                                        />
                                    </div>
                                </div>

                                {!usePlans ? (
                                    <div className="single-price-box">
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Standard Price (₹)</label>
                                            <div className="price-input-wrapper">
                                                <span className="price-symbol">₹</span>
                                                <input 
                                                    type="number" 
                                                    className="gig-input-field" 
                                                    style={{ paddingLeft: '40px', backgroundColor: '#fff' }} 
                                                    placeholder="0.00" 
                                                    value={gigPrice} 
                                                    onChange={e => setGigPrice(e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Billing Model</label>
                                            <select 
                                                className="gig-input-field" 
                                                style={{ backgroundColor: '#fff' }} 
                                                value={gigPriceType} 
                                                onChange={e => setGigPriceType(e.target.value)}
                                            >
                                                <option value="fixed">Fixed Price</option>
                                                <option value="hourly">Hourly Rate</option>
                                                <option value="starting_at">Starting At</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="plans-grid">
                                        {gigPlans.map((plan, idx) => (
                                            <div key={idx} className={`plan-card ${idx === 1 ? 'highlight' : ''}`}>
                                                <div className="plan-label">
                                                    {idx === 0 ? 'Basic' : idx === 1 ? 'Standard' : 'Premium'}
                                                </div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div className="price-input-wrapper">
                                                        <span className="price-symbol" style={{ fontSize: '0.9rem', left: '16px' }}>₹</span>
                                                        <input 
                                                            type="number" 
                                                            className="gig-input-field" 
                                                            style={{ height: '48px', borderRadius: '12px', paddingLeft: '32px' }} 
                                                            placeholder="Price" 
                                                            value={plan.price} 
                                                            onChange={e => {
                                                                const np = [...gigPlans]; np[idx].price = e.target.value; setGigPlans(np);
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <textarea 
                                                        className="gig-textarea-field" 
                                                        style={{ borderRadius: '14px', fontSize: '0.85rem' }} 
                                                        rows="3" 
                                                        placeholder="Plan description..." 
                                                        value={plan.description} 
                                                        onChange={e => {
                                                            const np = [...gigPlans]; np[idx].description = e.target.value; setGigPlans(np);
                                                        }} 
                                                    />
                                                </div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <input 
                                                        type="text" 
                                                        className="gig-input-field" 
                                                        style={{ height: '48px', borderRadius: '12px', fontSize: '0.85rem' }} 
                                                        placeholder="Features (comma sep)" 
                                                        value={plan.features} 
                                                        onChange={e => {
                                                            const np = [...gigPlans]; np[idx].features = e.target.value; setGigPlans(np);
                                                        }} 
                                                    />
                                                </div>
                                                <div style={{ marginBottom: 0 }}>
                                                    <select 
                                                        className="gig-input-field" 
                                                        style={{ height: '48px', borderRadius: '12px', fontSize: '0.85rem' }} 
                                                        value={plan.deliveryTime} 
                                                        onChange={e => {
                                                            const np = [...gigPlans]; np[idx].deliveryTime = e.target.value; setGigPlans(np);
                                                        }}
                                                    >
                                                        <option>1 Day Delivery</option>
                                                        <option>2 Days Delivery</option>
                                                        <option>5 Days Delivery</option>
                                                        <option>10 Days Delivery</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="ops-details-box">
                                    <div className="ops-header">
                                        <BadgeCheck size={24} color="#0369a1" />
                                        <h4>Operational Details</h4>
                                    </div>

                                    {gigBusinessType === 'shop' && (
                                        <div className="input-row" style={{ marginBottom: '24px', gap: '24px' }}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', color: '#0369a1', marginBottom: '8px' }}>Opening Hours</label>
                                                <input 
                                                    type="time" 
                                                    className="gig-input-field" 
                                                    style={{ border: '1px solid #bae6fd', backgroundColor: '#fff' }} 
                                                    value={shopOpeningTime} 
                                                    onChange={e => setShopOpeningTime(e.target.value)} 
                                                />
                                            </div>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', color: '#0369a1', marginBottom: '8px' }}>Closing Hours</label>
                                                <input 
                                                    type="time" 
                                                    className="gig-input-field" 
                                                    style={{ border: '1px solid #bae6fd', backgroundColor: '#fff' }} 
                                                    value={shopClosingTime} 
                                                    onChange={e => setShopClosingTime(e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <label className="checkbox-label">
                                            <input 
                                                type="checkbox" 
                                                checked={shopIsHomeDelivery} 
                                                onChange={e => setShopIsHomeDelivery(e.target.checked)} 
                                                style={{ width: '20px', height: '20px', accentColor: '#0369a1' }} 
                                            />
                                            <span>Enable Home Delivery Service</span>
                                        </label>
                                        <label className="checkbox-label">
                                            <input 
                                                type="checkbox" 
                                                checked={shopIsHomeService} 
                                                onChange={e => setShopIsHomeService(e.target.checked)} 
                                                style={{ width: '20px', height: '20px', accentColor: '#0369a1' }} 
                                            />
                                            <span>Enable On-Site Home Visits</span>
                                        </label>
                                        {shopIsHomeService && (
                                            <div className="animate-fade-in" style={{ padding: '0 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Minimum Visiting Fee:</span>
                                                    <div className="price-input-wrapper">
                                                        <span className="price-symbol">₹</span>
                                                        <input 
                                                            type="number" 
                                                            className="gig-input-field" 
                                                            style={{ paddingLeft: '32px', width: '120px', height: '48px', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #bae6fd' }} 
                                                            placeholder="0" 
                                                            value={shopHomeServiceFee} 
                                                            onChange={e => setShopHomeServiceFee(e.target.value)} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {gigStep === 3 && (
                            <div className="animate-fade-in">
                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#191b23' }}>Visuals & Reach</h4>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>Help customers find and trust your business.</p>
                                </div>

                                {gigBusinessType === 'shop' && (
                                    <>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Drop a Pin on Your Location</label>
                                            <div className="map-picker-container">
                                                <MapPicker 
                                                    lat={gigLat} 
                                                    lng={gigLng} 
                                                    onChange={({ lat, lng }) => { setGigLat(lat); setGigLng(lng); }} 
                                                />
                                            </div>
                                        </div>

                                        <div className="google-maps-box">
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>Google Maps Integration</label>
                                            <input
                                                type="url"
                                                className="gig-input-field"
                                                style={{ backgroundColor: '#fff' }}
                                                placeholder="Paste shop link (e.g. https://maps.app.goo.gl/...)"
                                                value={shopGoogleMapsLink}
                                                onChange={e => setShopGoogleMapsLink(e.target.value)}
                                            />
                                            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <RotateCw size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                                                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                                                    Syncing your Google Maps link helps us verify your business and show it to local customers more effectively.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="input-row" style={{ marginBottom: '24px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>State</label>
                                        <select
                                            className="gig-input-field"
                                            value={gigStateCode}
                                            onChange={e => {
                                                const stateCode = e.target.value;
                                                const stateObj = indianStates.find(s => s.isoCode === stateCode);
                                                setGigStateCode(stateCode);
                                                setGigState(stateObj ? stateObj.name : '');
                                                setGigCity('');
                                            }}
                                        >
                                            <option value="">Select State</option>
                                            {indianStates.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>City</label>
                                        <select 
                                            className="gig-input-field" 
                                            value={gigCity} 
                                            onChange={e => setGigCity(e.target.value)} 
                                            disabled={!gigStateCode}
                                        >
                                            <option value="">Select City</option>
                                            {gigStateCode && City.getCitiesOfState('IN', gigStateCode).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="input-row" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '24px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Street Address</label>
                                        <input 
                                            type="text" 
                                            className="gig-input-field" 
                                            placeholder="e.g. 123 Main St, Near Central Park" 
                                            value={gigAddress} 
                                            onChange={e => setGigAddress(e.target.value)} 
                                        />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Pincode</label>
                                        <input 
                                            type="text" 
                                            className="gig-input-field" 
                                            placeholder="e.g. 226001" 
                                            value={gigZipCode} 
                                            onChange={e => setGigZipCode(e.target.value)} 
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '8px' }}>Service Radius (Pincodes)</label>
                                    <input 
                                        type="text" 
                                        className="gig-input-field" 
                                        placeholder="e.g. 110001, 110002" 
                                        value={gigCoveragePincodes} 
                                        onChange={e => setGigCoveragePincodes(e.target.value)} 
                                    />
                                    <p style={{ marginTop: '8px', color: '#64748b', fontSize: '0.75rem' }}>Comma separated pincodes where you provide service.</p>
                                </div>

                                <div style={{ marginTop: '32px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', marginBottom: '16px' }}>Gig Portfolio (Max 5)</label>
                                    <div className="portfolio-grid">
                                        {gigImages.map((url, i) => (
                                            <div key={i} className="portfolio-item">
                                                <img
                                                    src={url}
                                                    alt={`gig-${i}`}
                                                    className="portfolio-img"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/120x100?text=Service'; }}
                                                />
                                                <button 
                                                    onClick={() => setGigImages(prev => prev.filter((_, idx) => idx !== i))} 
                                                    className="btn-remove-img"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {gigImages.length < 5 && (
                                            <label className="upload-placeholder">
                                                <Plus size={28} />
                                                <span style={{ fontSize: '0.7rem', fontWeight: '800', marginTop: '4px' }}>Upload</span>
                                                <input type="file" multiple accept="image/*" onChange={handleGigImageUpload} style={{ display: 'none' }} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-footer">
                            <button
                                onClick={() => setGigStep(prev => Math.max(1, prev - 1))}
                                className="btn-back"
                                disabled={gigStep === 1}
                                style={{ visibility: gigStep === 1 ? 'hidden' : 'visible' }}
                            >Back</button>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                {gigStep < 3 ? (
                                    <button 
                                        onClick={() => setGigStep(prev => prev + 1)} 
                                        className="btn-primary" 
                                        style={{ padding: '14px 40px', borderRadius: '16px', fontWeight: '800', boxShadow: '0 8px 20px rgba(0, 61, 155, 0.2)' }}
                                    >
                                        Continue <ChevronRight size={18} style={{ marginLeft: '4px' }} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleCreateGig} 
                                        disabled={creatingGig || uploadingGigImages} 
                                        className="btn-primary" 
                                        style={{ padding: '14px 48px', borderRadius: '16px', fontWeight: '800', backgroundColor: '#059669', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.2)' }}
                                    >
                                        {creatingGig ? <Loader size={20} className="animate-spin" /> : (editingGigId ? 'Update Listing' : 'Publish Listing')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="help-promo-box">
                        <div className="help-promo-icon">
                            <Video size={20} color="var(--primary)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#191b23' }}>Need help with your listing?</h5>
                            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Watch our quick 2-minute guide on creating a winning gig profile.</p>
                        </div>
                        <button 
                            onClick={() => setActiveTab('help')} 
                            style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                        >Contact Support</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopAddGigTab;
