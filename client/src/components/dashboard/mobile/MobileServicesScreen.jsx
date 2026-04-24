import React from 'react';
import { Briefcase, MapPin, Plus as PlusIcon } from 'lucide-react';
import { PC, PL, Shell } from './MobileDashboardShared';
import '../../../styles/mobile-dashboard-styles/MobileServicesScreen.css';

export default function MobileServicesScreen(props) {
    const {
        gigStep, setGigStep, gigTitle, setGigTitle, gigCategory, setGigCategory,
        gigDesc, setGigDesc, gigServicesIncluded, setGigServicesIncluded, gigPrice, setGigPrice, gigPriceType, setGigPriceType,
        gigBusinessType, setGigBusinessType, gigCustomCategory, setGigCustomCategory,
        gigExperience, setGigExperience, gigJobsCompleted, setGigJobsCompleted,
        shopAge, setShopAge, usePlans, setUsePlans, gigPlans, setGigPlans,
        shopOpeningTime, setShopOpeningTime, shopClosingTime, setShopClosingTime,
        shopIsHomeDelivery, setShopIsHomeDelivery, shopIsHomeService, setShopIsHomeService,
        shopHomeServiceFee, setShopHomeServiceFee, gigLat, gigLng, setGigLat, setGigLng,
        shopGoogleMapsLink, setShopGoogleMapsLink, gigStateCode, setGigStateCode,
        gigState, setGigState, gigCity, setGigCity, gigAddress, setGigAddress,
        gigZipCode, setGigZipCode, gigCoveragePincodes, setGigCoveragePincodes,
        gigImages, setGigImages, handleGigImageUpload, handleCreateGig,
        creatingGig, uploadingGigImages, indianStates, MapPicker, editingGigId,
        setActiveTab, gigTargetGender, setGigTargetGender
    } = props;

    return (
        <Shell title={editingGigId ? 'Edit Gig' : 'Create Gig'} onBack={() => setActiveTab('overview')}>
            <main style={{ padding: '24px 16px 120px' }}>
                <div className="gig-step-indicator">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`gig-step-dot ${gigStep === s ? 'active' : (gigStep > s ? 'completed' : 'pending')}`}>
                            {gigStep > s ? '✓' : s}
                        </div>
                    ))}
                </div>

                {gigStep === 1 && (
                    <div className="animate-fade-in">
                        <div className="gig-type-toggle">
                            <button onClick={() => setGigBusinessType('service')} className={`gig-type-btn ${gigBusinessType === 'service' ? 'active' : 'inactive'}`}>
                                <Briefcase size={24} color={PC} style={{ marginBottom: 8 }} />
                                <div style={{ fontSize: 12, fontWeight: 800 }}>Service</div>
                            </button>
                            <button onClick={() => setGigBusinessType('shop')} className={`gig-type-btn ${gigBusinessType === 'shop' ? 'active' : 'inactive'}`}>
                                <MapPin size={24} color={PC} style={{ marginBottom: 8 }} />
                                <div style={{ fontSize: 12, fontWeight: 800 }}>Shop</div>
                            </button>
                        </div>

                        <label className="gig-input-label">{gigBusinessType === 'service' ? 'Gig Title' : 'Shop Name'}</label>
                        <input value={gigTitle} onChange={e => setGigTitle(e.target.value)} className="gig-input" placeholder={gigBusinessType === 'service' ? 'e.g. Master Plumber' : 'e.g. Sharma Grocery Store'} />

                        <label className="gig-input-label">Category</label>
                        <select value={gigCategory} onChange={e => setGigCategory(e.target.value)} className="gig-input">
                            <option value="">Select Category</option>
                            {['Plumbers', 'Electricians', 'Painters', 'Carpenters', 'Cleaning', 'AC Repair', 'Tutors', 'Salon', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {gigCategory === 'Other' && (
                            <input value={gigCustomCategory} onChange={e => setGigCustomCategory(e.target.value)} className="gig-input" placeholder="Your category" />
                        )}

                        {gigCategory === 'Salon' && (
                            <div className="animate-fade-in" style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: 16 }}>
                                <label className="gig-input-label" style={{ marginBottom: 10 }}>Service For</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['male', 'female', 'unisex'].map(gender => (
                                        <button key={gender} onClick={() => setGigTargetGender(gender)}
                                            style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: `2px solid ${gigTargetGender === gender ? PC : '#e2e8f0'}`, background: gigTargetGender === gender ? PL : '#fff', color: gigTargetGender === gender ? PC : '#64748b', fontWeight: 800, fontSize: 12, textTransform: 'capitalize' }}>
                                            {gender}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {gigBusinessType === 'service' ? (
                                <>
                                    <div>
                                        <label className="gig-input-label">Experience (Yrs)</label>
                                        <input type="number" value={gigExperience} onChange={e => setGigExperience(e.target.value)} className="gig-input" placeholder="5" />
                                    </div>
                                    <div>
                                        <label className="gig-input-label">Jobs Done</label>
                                        <input type="number" value={gigJobsCompleted} onChange={e => setGigJobsCompleted(e.target.value)} className="gig-input" placeholder="100" />
                                    </div>
                                </>
                            ) : (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="gig-input-label">Shop Age (Years)</label>
                                    <input type="number" value={shopAge} onChange={e => setShopAge(e.target.value)} className="gig-input" placeholder="10" />
                                </div>
                            )}
                        </div>

                        <label className="gig-input-label">Description</label>
                        <textarea value={gigDesc} onChange={e => setGigDesc(e.target.value)} rows={4} className="gig-input" style={{ resize: 'none' }} placeholder="Describe your service..." />

                        <label className="gig-input-label">Services Included</label>
                        <input value={gigServicesIncluded} onChange={e => setGigServicesIncluded(e.target.value)} className="gig-input" placeholder="e.g. Warranty, Parts, Cleaning" />
                    </div>
                )}

                {gigStep === 2 && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <label className="gig-input-label" style={{ margin: 0 }}>Use 3 Tier Plans?</label>
                            <input type="checkbox" checked={usePlans} onChange={e => setUsePlans(e.target.checked)} style={{ width: 20, height: 20 }} />
                        </div>

                        {!usePlans ? (
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label className="gig-input-label">Price (₹)</label>
                                    <input type="number" value={gigPrice} onChange={e => setGigPrice(e.target.value)} className="gig-input" placeholder="0.00" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="gig-input-label">Billing Type</label>
                                    <select value={gigPriceType} onChange={e => setGigPriceType(e.target.value)} className="gig-input">
                                        <option value="fixed">Fixed</option>
                                        <option value="hourly">Hourly</option>
                                        <option value="starting_at">Starting At</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {gigPlans.map((p, i) => (
                                    <div key={i} className="gig-plan-card">
                                        <div className="gig-plan-name">{p.name}</div>
                                        <input type="number" value={p.price} onChange={e => { const n = [...gigPlans]; n[i].price = e.target.value; setGigPlans(n); }} className="gig-input" placeholder="Price (₹)" />
                                        <textarea value={p.description} onChange={e => { const n = [...gigPlans]; n[i].description = e.target.value; setGigPlans(n); }} className="gig-input" style={{ marginBottom: 16 }} placeholder="What's included?" rows={2} />
                                        <input value={p.features} onChange={e => { const n = [...gigPlans]; n[i].features = e.target.value; setGigPlans(n); }} className="gig-input" placeholder="Features (comma separated)" />
                                        <select value={p.deliveryTime} onChange={e => { const n = [...gigPlans]; n[i].deliveryTime = e.target.value; setGigPlans(n); }} className="gig-input" style={{ marginBottom: 0 }}>
                                            <option>1 Day Delivery</option>
                                            <option>2 Days Delivery</option>
                                            <option>5 Days Delivery</option>
                                            <option>10 Days Delivery</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                            <label className="gig-input-label">{gigBusinessType === 'shop' ? 'Shop Details' : 'Operational Details'}</label>
                            {gigBusinessType === 'shop' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div>
                                        <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Open</label>
                                        <input type="time" value={shopOpeningTime} onChange={e => setShopOpeningTime(e.target.value)} className="gig-input" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Close</label>
                                        <input type="time" value={shopClosingTime} onChange={e => setShopClosingTime(e.target.value)} className="gig-input" />
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                                    <input type="checkbox" checked={shopIsHomeDelivery} onChange={e => setShopIsHomeDelivery(e.target.checked)} /> Home Delivery Service
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                                    <input type="checkbox" checked={shopIsHomeService} onChange={e => setShopIsHomeService(e.target.checked)} /> On-Site Home Visits
                                </label>
                                {shopIsHomeService && (
                                    <input type="number" value={shopHomeServiceFee} onChange={e => setShopHomeServiceFee(e.target.value)} className="gig-input" style={{ marginTop: 8 }} placeholder="Visit Fee (₹)" />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {gigStep === 3 && (
                    <div className="animate-fade-in">
                        <label className="gig-input-label">Gallery (Max 5)</label>
                        <div className="gig-image-uploader">
                            {gigImages.map((img, i) => (
                                <div key={i} className="gig-image-preview">
                                    <img src={img} alt="" />
                                    <button onClick={() => setGigImages(gigImages.filter((_, idx) => idx !== i))} className="gig-image-remove">×</button>
                                </div>
                            ))}
                            {gigImages.length < 5 && (
                                <label className="gig-image-placeholder">
                                    <PlusIcon size={24} color="#94a3b8" />
                                    <input type="file" multiple accept="image/*" onChange={handleGigImageUpload} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>

                        <label className="gig-input-label">Location & Map</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <select value={gigState} onChange={e => {
                                const s = indianStates?.find(st => st.name === e.target.value);
                                setGigState(e.target.value);
                                if (s) setGigStateCode(s.isoCode);
                            }} className="gig-input">
                                <option value="">Select State</option>
                                {indianStates?.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                            </select>
                            <input value={gigCity} onChange={e => setGigCity(e.target.value)} className="gig-input" placeholder="City/Town" />
                        </div>
                        <input value={gigZipCode} onChange={e => setGigZipCode(e.target.value)} className="gig-input" placeholder="Pin Code / Zip" />
                        <input value={gigAddress} onChange={e => setGigAddress(e.target.value)} className="gig-input" placeholder="Full Street Address" />

                        <div style={{ marginBottom: 16 }}>
                            <label className="gig-input-label">Pin Location on Map</label>
                            <div className="gig-map-container">
                                {MapPicker && <MapPicker lat={gigLat} lng={gigLng} onChange={(lat, lng) => { setGigLat(lat); setGigLng(lng); }} />}
                            </div>
                        </div>

                        <label className="gig-input-label">Coverage Pincodes (Comma separated)</label>
                        <input value={gigCoveragePincodes} onChange={e => setGigCoveragePincodes(e.target.value)} className="gig-input" placeholder="e.g. 110001, 110002" />

                        <label className="gig-input-label">Google Maps Link (Optional)</label>
                        <input value={shopGoogleMapsLink} onChange={e => setShopGoogleMapsLink(e.target.value)} className="gig-input" placeholder="https://goo.gl/maps/..." />
                    </div>
                )}

                <div className="gig-action-footer">
                    {gigStep > 1 && (
                        <button onClick={() => setGigStep(gigStep - 1)} className="gig-action-btn gig-action-btn-back">Back</button>
                    )}
                    {gigStep < 3 ? (
                        <button onClick={() => setGigStep(gigStep + 1)} className="gig-action-btn gig-action-btn-next">Next Step</button>
                    ) : (
                        <button onClick={handleCreateGig} disabled={creatingGig || uploadingGigImages} className="gig-action-btn gig-action-btn-submit">
                            {creatingGig ? 'Publishing...' : 'Complete & Publish'}
                        </button>
                    )}
                </div>
            </main>
        </Shell>
    );
}
