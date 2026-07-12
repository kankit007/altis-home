import React, { useState, useEffect } from 'react';

const PropertyDetailModal = ({ property, onClose, onOpenGatedForm, onOpenVisitForm }) => {
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);
  const [detailFloorTab, setDetailFloorTab] = useState('');
  const [detailConnectivityOpen, setDetailConnectivityOpen] = useState({ transit: true, life: false });
  const [floorPlanZoom, setFloorPlanZoom] = useState(1);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const isVideoUrl = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|quicktime)($|\?)/i.test(url) || url.includes('/uploads/video-') || url.includes('video');
  };

  useEffect(() => {
    if (property) {
      setDetailPhotoIndex(0);
      setFloorPlanZoom(1);
      setActiveGalleryIndex(0);
      if (property.inventory_parameters?.bhk_configurations_available?.length > 0) {
        setDetailFloorTab(`${property.inventory_parameters.bhk_configurations_available[0]} BHK`);
      } else {
        setDetailFloorTab('Overview');
      }
    }
  }, [property]);

  if (!property) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content modal-large" onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>
        <button className="modal-close" onClick={onClose} style={{ background: 'rgba(0,0,0,0.6)', color: 'white', zIndex: 100 }}>✕</button>
        
        {/* Module 1: Dynamic Hero & Overview Block */}
        <div style={{ position: 'relative', height: '400px', width: '100%', overflow: 'hidden' }}>
          {isVideoUrl(property.media_assets_vault?.hero_slider_webp_urls?.[detailPhotoIndex]) ? (
            <video 
              src={property.media_assets_vault.hero_slider_webp_urls[detailPhotoIndex]} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              controls 
              autoPlay 
              muted 
              loop
            />
          ) : (
            <img 
              src={property.media_assets_vault?.hero_slider_webp_urls?.[detailPhotoIndex]} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt=""
            />
          )}
          
          {/* Photo toggle controllers */}
          {property.media_assets_vault?.hero_slider_webp_urls?.length > 1 && (
            <div style={{ position: 'absolute', bottom: '120px', right: '20px', display: 'flex', gap: '8px', zIndex: 20 }}>
              {property.media_assets_vault.hero_slider_webp_urls.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setDetailPhotoIndex(idx)}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: detailPhotoIndex === idx ? 'var(--primary)' : 'rgba(0,0,0,0.6)', 
                    border: 'none', 
                    color: detailPhotoIndex === idx ? '#000' : '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer' 
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Sticky overlay data metrics layer */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 15 }}>
            <div style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                {property.is_altis_original ? (
                  <span className="badge badge-gold">★ Altis Original Specialist Exclusive</span>
                ) : (
                  <span className="badge badge-blue">{property.developer_name}</span>
                )}
                <span className="badge badge-green" style={{ background: '#f0fdf4', color: '#166534' }}>{property.inventory_parameters?.possession_timeline_status}</span>
              </div>
              <h2 style={{ fontSize: '32px', margin: 0, color: '#0f172a' }}>{property.project_name}</h2>
              <p style={{ color: '#475569', fontSize: '14px', fontWeight: '500' }}>📍 {property.location_metadata?.micro_market_zone}, {property.location_metadata?.city_hub}</p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#475569', display: 'block', fontWeight: 'bold' }}>RERA Registration:</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{property.rera_registration_number}</span>
              <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '24px' }}>{property.pricing?.display_formatted_price}</div>
            </div>
          </div>
        </div>

        {/* Scrolling details content tabs modules */}
        <div style={{ padding: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            
            {/* Left Columns - Project Narrative & Interactive floor sheets */}
            <div>
              {/* Module 2: Highlights narrative */}
              <section style={{ marginBottom: '32px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '12px', color: 'var(--primary)' }}>Project Narrative</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>{property.description}</p>
                
                <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px' }}>Core Unique Selling Propositions (USPs):</h4>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {property.unique_selling_propositions?.map((usp, index) => (
                    <li key={index}><strong>{usp.split(':')[0]}:</strong> {usp.split(':')[1] || usp}</li>
                  ))}
                </ul>
              </section>

              {/* Module 3: Master Plan & Interactive floor configs */}
              <section style={{ marginBottom: '32px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '16px', color: 'var(--primary)' }}>Master Plan & Interactive Floor Sheets</h3>
                
                {/* Zoomable Image Viewer */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', position: 'relative', overflow: 'hidden', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  {property.media_assets_vault?.master_plan_url ? (
                    <div style={{ transform: `scale(${floorPlanZoom})`, transition: 'transform 0.2s', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={property.media_assets_vault.master_plan_url} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        alt="Interactive Master Plan Blueprint" 
                      />
                    </div>
                  ) : (
                    <div style={{ transform: `scale(${floorPlanZoom})`, transition: 'transform 0.2s', textAlign: 'center' }}>
                      <span style={{ fontSize: '48px' }}>🗺️</span>
                      <h5 style={{ margin: '8px 0 0 0', color: '#0f172a' }}>Interactive Master Engineering Blueprint</h5>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Altis Site Construction Layout Diagram (Upload blueprint via Admin Panel)</p>
                    </div>
                  )}
                  
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 2 }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(255,255,255,0.9)' }} onClick={() => setFloorPlanZoom(prev => Math.min(prev + 0.25, 2))}>Zoom In</button>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(255,255,255,0.9)' }} onClick={() => setFloorPlanZoom(prev => Math.max(prev - 0.25, 0.75))}>Zoom Out</button>
                  </div>
                </div>

                {/* Floor tabs configs */}
                <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '12px' }}>
                  {property.inventory_parameters?.bhk_configurations_available?.map(bhkNum => (
                    <button 
                      key={bhkNum} 
                      className="btn"
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        background: detailFloorTab === `${bhkNum} BHK` ? 'rgba(220, 38, 38, 0.05)' : 'none',
                        color: detailFloorTab === `${bhkNum} BHK` ? 'var(--primary)' : 'var(--text-secondary)',
                        border: 'none',
                        borderBottom: detailFloorTab === `${bhkNum} BHK` ? '2px solid var(--primary)' : 'none',
                        borderRadius: 0
                      }}
                      onClick={() => setDetailFloorTab(`${bhkNum} BHK`)}
                    >
                      {bhkNum} BHK Layout
                    </button>
                  ))}
                </div>

                {/* Floor Content Tab Pane */}
                <div className="glass-panel" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#0f172a' }}>Standard {detailFloorTab} configuration</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Carpet Area: {property.carpet_area || 'Contact for details'} | RERA Approved</p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => onOpenGatedForm(`${property.project_name} (${detailFloorTab})`)}>
                      Request Detailed Price Sheet
                    </button>
                  </div>
                </div>
              </section>

              {/* Module 4: 360-Degree Virtual Walkthrough Tour & Gallery */}
              <section style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary)' }}>Virtual Walks & Media Gallery</h3>
                  {property.media_assets_vault?.virtual_tour_iframe_source && (
                    <a 
                      href={property.media_assets_vault.virtual_tour_iframe_source} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
                    >
                      🌐 Launch 3D Space Tour (New Tab)
                    </a>
                  )}
                </div>
                
                {/* Large Media Preview Box */}
                <div style={{ width: '100%', height: '360px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  {property.media_assets_vault?.hero_slider_webp_urls?.length > 0 ? (
                    isVideoUrl(property.media_assets_vault.hero_slider_webp_urls[activeGalleryIndex]) ? (
                      <video 
                        key={activeGalleryIndex}
                        src={property.media_assets_vault.hero_slider_webp_urls[activeGalleryIndex]} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        controls 
                        autoPlay 
                        muted 
                        loop
                      />
                    ) : (
                      <img 
                        src={property.media_assets_vault.hero_slider_webp_urls[activeGalleryIndex]} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        alt="Enlarged gallery preview" 
                      />
                    )
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <span style={{ fontSize: '48px' }}>📷</span>
                      <h5 style={{ margin: '8px 0 0 0' }}>No Media Uploaded</h5>
                      <p style={{ margin: 0, fontSize: '12px' }}>This property has no images or videos uploaded.</p>
                    </div>
                  )}
                </div>

                {/* Uploaded Media Gallery */}
                {property.media_assets_vault?.hero_slider_webp_urls?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px' }}>Property Media Assets ({property.media_assets_vault.hero_slider_webp_urls.length})</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                      {property.media_assets_vault.hero_slider_webp_urls.map((url, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setActiveGalleryIndex(idx)}
                          style={{ 
                            height: '90px', 
                            borderRadius: '6px', 
                            overflow: 'hidden', 
                            border: `2px solid ${activeGalleryIndex === idx ? 'var(--primary)' : '#cbd5e1'}`, 
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isVideoUrl(url) ? (
                            <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
                              <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '20px', zIndex: 2, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>▶️</span>
                            </div>
                          ) : (
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '9px', textAlign: 'center', padding: '2px 0' }}>
                            {idx === 0 ? 'Cover' : `#${idx + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

            </div>

            {/* Right Columns - Lead triggers & Connect dynamics */}
            <div>
              
              {/* Site visit scheduler triggers */}
              <section className="glass-panel" style={{ padding: '20px', background: 'rgba(220, 38, 38, 0.03)', border: '1px solid rgba(220, 38, 38, 0.1)', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>Schedule Guided Site Tour</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Request physical visit logistics and get transport concierge from our firm.</p>
                
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={onOpenVisitForm}>
                  🗓️ Coordinate Physical Tour
                </button>
              </section>

              {/* Brochure gate download */}
              <section className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Project Documentations</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Download the complete premium brochure containing layout schematics and site details.</p>
                
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onOpenGatedForm(property.project_name)}>
                  📥 Download Project Brochure
                </button>
              </section>

              {/* Module 5: Location Dynamics & Connectivity Accordion */}
              <section style={{ marginBottom: '24px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '12px', color: '#0f172a' }}>Location Dynamics</h4>
                
                {/* Dynamic Google Map Embed */}
                {(() => {
                  const coords = property.location_metadata?.coordinates_point;
                  let mapSrc;
                  if (coords?.latitude && coords?.longitude) {
                    mapSrc = `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                  } else {
                    const queryParts = [
                      property.project_name,
                      property.location_metadata?.micro_market_zone,
                      property.location_metadata?.city_hub,
                      property.location_metadata?.state_region
                    ].filter(Boolean);
                    mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(queryParts.join(', '))}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
                  }
                  return (
                    <div style={{ height: '220px', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                      <iframe
                        title="Property Google Map Location"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={mapSrc}
                      />
                    </div>
                  );
                })()}

                <div className="accordion-item">
                  <button className="accordion-trigger" onClick={() => setDetailConnectivityOpen({ ...detailConnectivityOpen, transit: !detailConnectivityOpen.transit })}>
                    <span style={{ color: '#0f172a' }}>Transit & Logistics</span>
                    <span style={{ color: '#64748b' }}>{detailConnectivityOpen.transit ? '▲' : '▼'}</span>
                  </button>
                  {detailConnectivityOpen.transit && (
                    <div className="accordion-content">
                      {property.connectivity?.transit?.length > 0 ? (
                        property.connectivity.transit.map((item, i) => (
                          <div key={i}>• {item}</div>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No transit data available</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="accordion-item">
                  <button className="accordion-trigger" onClick={() => setDetailConnectivityOpen({ ...detailConnectivityOpen, life: !detailConnectivityOpen.life })}>
                    <span style={{ color: '#0f172a' }}>Critical Life Infrastructure</span>
                    <span style={{ color: '#64748b' }}>{detailConnectivityOpen.life ? '▲' : '▼'}</span>
                  </button>
                  {detailConnectivityOpen.life && (
                    <div className="accordion-content">
                      {property.connectivity?.life_infrastructure?.length > 0 ? (
                        property.connectivity.life_infrastructure.map((item, i) => (
                          <div key={i}>• {item}</div>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>No infrastructure data available</span>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Module 6: Pricing structures & construction payment plan schemes */}
              <section className="glass-panel" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Payment Plan Schedule</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>Construction-Linked payment scheme options (CLP):</p>
                
                {/* Payment chart scheme */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', background: '#ffffff' }}>
                    <span>Initial Booking:</span>
                    <strong>10%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', background: '#ffffff' }}>
                    <span>Excavation milestone:</span>
                    <strong>15%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', background: '#ffffff' }}>
                    <span>Plinth / Slabs foundation:</span>
                    <strong>25%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', background: '#ffffff' }}>
                    <span>Superstructure brickwork:</span>
                    <strong>30%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', background: '#ffffff' }}>
                    <span>Finishing & Handover:</span>
                    <strong>20%</strong>
                  </div>
                </div>
              </section>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PropertyDetailModal;
