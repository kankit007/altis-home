import React, { useState, useRef } from 'react';
import { EditIcon, TrashIcon } from './Icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const AdminPanel = ({
  adminLoggedIn,
  setAdminLoggedIn,
  adminPasscode,
  setAdminPasscode,
  adminLeads,
  adminProperties,
  handleLeadStatusChange,
  handleCSVExport,
  handleAdminLogin,
  handleOpenCRUDCreate,
  handleOpenCRUDEdit,
  handleCRUDDelete,
  crudModalOpen,
  setCrudModalOpen,
  crudForm,
  setCrudForm,
  handleCRUDSubmit
}) => {
  if (!adminLoggedIn) {
    return (
      <div className="glass-panel" style={{ maxWidth: '400px', margin: '60px auto', padding: '32px' }}>
        <h3 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '20px' }}>Secure Admin Access</h3>
        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <label className="form-label">Passcode</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Enter administrator passcode" 
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)} 
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Default testing passcode: <strong>admin123</strong></span>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Unlock Board</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ color: 'var(--primary)' }}>Admin Operations Control Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Log leads directly, track client schedules, and update properties database.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setAdminLoggedIn(false)}>Lock Admin Console</button>
        </div>
      </div>

      {/* 1. CRUD Properties Manager */}
      <section className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--primary)' }}>Project Profiles Inventory CRUD</h3>
          <button className="btn btn-primary" onClick={handleOpenCRUDCreate}>+ Add New Listing Profile</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.05)', borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '12px' }}>Project Name</th>
                <th style={{ padding: '12px' }}>Developer</th>
                <th style={{ padding: '12px' }}>Start Price</th>
                <th style={{ padding: '12px' }}>Tier Badge</th>
                <th style={{ padding: '12px' }}>Possession Timeline</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminProperties.map(prop => (
                <tr key={prop.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{prop.project_name}</td>
                  <td style={{ padding: '12px' }}>{prop.developer_name}</td>
                  <td style={{ padding: '12px', color: 'var(--primary)' }}>{prop.pricing?.display_formatted_price}</td>
                  <td style={{ padding: '12px' }}>
                    {prop.is_altis_original ? (
                      <span className="badge badge-gold" style={{ fontSize: '9px' }}>Altis Original</span>
                    ) : (
                      <span className="badge badge-blue" style={{ fontSize: '9px' }}>Third Party</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>{prop.inventory_parameters?.possession_timeline_status}</td>
                  <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleOpenCRUDEdit(prop)}>
                      <EditIcon /> Edit
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', color: '#ff4444' }} onClick={() => handleCRUDDelete(prop.id)}>
                      <TrashIcon /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Lead Master Central Table Grid */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--primary)' }}>Lead Central Logs Table</h3>
          <button className="btn btn-primary" onClick={handleCSVExport}>📥 Export Logs to CSV / Excel</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: 'white', borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '12px' }}>System Timestamp</th>
                <th style={{ padding: '12px' }}>Lead Identity Name</th>
                <th style={{ padding: '12px' }}>Contact Phone</th>
                <th style={{ padding: '12px' }}>Target Email</th>
                <th style={{ padding: '12px' }}>Attribution Origin Form</th>
                <th style={{ padding: '12px' }}>Booking Data Details</th>
                <th style={{ padding: '12px' }}>Status Tracking</th>
              </tr>
            </thead>
            <tbody>
              {adminLeads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{lead.timestamp}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{lead.name}</td>
                  <td style={{ padding: '12px' }}>{lead.phone}</td>
                  <td style={{ padding: '12px' }}>{lead.email}</td>
                  <td style={{ padding: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{lead.source}</td>
                  <td style={{ padding: '12px', fontSize: '12px' }}>
                    {lead.details?.preferred_date ? (
                      <div>
                        📅 {lead.details.preferred_date} ({lead.details.time_slot}) <br />
                        🚕 Trans: {lead.details.transport_assistance ? 'YES' : 'NO'}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select 
                      className="form-select" 
                      style={{ padding: '4px 8px', fontSize: '12px', background: '#ffffff', width: 'auto' }}
                      value={lead.status}
                      onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CRUD Form overlay popup */}
      {crudModalOpen && (
        <div className="modal-overlay" onClick={() => setCrudModalOpen(false)}>
          <div className="glass-panel modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCrudModalOpen(false)}>✕</button>
            
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>
              {crudForm.id ? 'Edit Project Profile' : 'Add New Project Profile'}
            </h3>

            <form onSubmit={handleCRUDSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={crudForm.project_name}
                    onChange={(e) => setCrudForm({ ...crudForm, project_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Developer/Builder Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={crudForm.developer_name}
                    onChange={(e) => setCrudForm({ ...crudForm, developer_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">RERA Registration ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={crudForm.rera_registration_number || ''}
                    onChange={(e) => setCrudForm({ ...crudForm, rera_registration_number: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Starting Price Display (e.g. ₹85 Lakhs Onwards)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={crudForm.pricing?.display_formatted_price || ''}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      pricing: { ...crudForm.pricing, display_formatted_price: e.target.value } 
                    })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Starting Price Amount (Numeric, e.g. 8500000)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={crudForm.pricing?.starting_price_amount || 0}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      pricing: { ...crudForm.pricing, starting_price_amount: Number(e.target.value) } 
                    })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Micro-Market Area Zone</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={crudForm.location_metadata?.micro_market_zone || ''}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      location_metadata: { ...crudForm.location_metadata, micro_market_zone: e.target.value } 
                    })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Property Category</label>
                  <select 
                    className="form-select" 
                    value={crudForm.inventory_parameters?.property_category || 'Residential'}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      inventory_parameters: { ...crudForm.inventory_parameters, property_category: e.target.value } 
                    })}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Possession Status</label>
                  <select 
                    className="form-select" 
                    value={crudForm.inventory_parameters?.possession_timeline_status || 'Under Construction'}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      inventory_parameters: { ...crudForm.inventory_parameters, possession_timeline_status: e.target.value } 
                    })}
                  >
                    <option value="Ready-to-Move">Ready-to-Move</option>
                    <option value="Within 1 Year">Within 1 Year</option>
                    <option value="Within 3 Years">Within 3 Years</option>
                    <option value="Under Construction">Under Construction</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Carpet Area (e.g. 1,800 Sq. Ft.)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 1,850 Sq. Ft."
                    value={crudForm.carpet_area || ''}
                    onChange={(e) => setCrudForm({ ...crudForm, carpet_area: e.target.value })}
                  />
                </div>

              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', margin: '16px 0', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={crudForm.is_altis_original || false} 
                    onChange={(e) => setCrudForm({ ...crudForm, is_altis_original: e.target.checked })} 
                  />
                  <span>Altis Originals Pinned Tier</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={crudForm.is_featured || false} 
                    onChange={(e) => setCrudForm({ ...crudForm, is_featured: e.target.checked })} 
                  />
                  <span>Featured Highlight</span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  rows="4" 
                  value={crudForm.description || ''}
                  onChange={(e) => setCrudForm({ ...crudForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Transit & Logistics (One entry per line)</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3" 
                    placeholder="Jamshedpur Railway Station: 8 mins (3.5 km)&#10;Sonari Airport: 15 mins (6.2 km)"
                    value={crudForm.connectivity?.transit?.join('\n') || ''}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      connectivity: { 
                        ...crudForm.connectivity, 
                        transit: e.target.value.split('\n').filter(line => line.trim() !== '') 
                      } 
                    })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Critical Life Infrastructure (One entry per line)</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3" 
                    placeholder="XLRI Campus: 10 mins (4.1 km)&#10;Tata Main Hospital: 12 mins (5.0 km)"
                    value={crudForm.connectivity?.life_infrastructure?.join('\n') || ''}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      connectivity: { 
                        ...crudForm.connectivity, 
                        life_infrastructure: e.target.value.split('\n').filter(line => line.trim() !== '') 
                      } 
                    })}
                  />
                </div>
              </div>

              {/* ── Unique Selling Propositions (USPs) & Virtual Tour Walkthrough URL ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Core Unique Selling Propositions (USPs) (One entry per line)</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3" 
                    placeholder="Premium location: 5 mins from key hubs&#10;Solar panels: Integrated arrays"
                    value={crudForm.unique_selling_propositions?.join('\n') || ''}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      unique_selling_propositions: e.target.value.split('\n').filter(line => line.trim() !== '') 
                    })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">3D Virtual Walkthrough URL (Matterport / 360 Tour Source)</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3" 
                    placeholder="https://my.matterport.com/show/?m=JGPmBB65wh8"
                    value={crudForm.media_assets_vault?.virtual_tour_iframe_source || ''}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      media_assets_vault: { 
                        ...crudForm.media_assets_vault, 
                        virtual_tour_iframe_source: e.target.value 
                      } 
                    })}
                  />
                </div>
              </div>

              {/* ── Master Plan Layout ── */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                <label className="form-label">Master Plan Image / Layout Blueprint URL</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://example.com/master-plan.jpg"
                    value={crudForm.media_assets_vault?.master_plan_url || ''}
                    onChange={(e) => setCrudForm({ 
                      ...crudForm, 
                      media_assets_vault: { 
                        ...crudForm.media_assets_vault, 
                        master_plan_url: e.target.value 
                      } 
                    })}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="master-plan-file-input"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Blueprint image file size exceeds the limit. Images must be under 5 MB.');
                        e.target.value = '';
                        return;
                      }
                      const formData = new FormData();
                      formData.append('images', file);
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/uploads`, {
                          method: 'POST',
                          body: formData
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.urls?.length > 0) {
                            setCrudForm({
                              ...crudForm,
                              media_assets_vault: {
                                ...crudForm.media_assets_vault,
                                master_plan_url: data.urls[0]
                              }
                            });
                          }
                        }
                      } catch (err) {
                        console.error('Error uploading master plan:', err);
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => document.getElementById('master-plan-file-input').click()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    📤 Upload Blueprint
                  </button>
                </div>
                {crudForm.media_assets_vault?.master_plan_url && (
                  <div style={{ position: 'relative', width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', marginTop: '8px' }}>
                    <img src={crudForm.media_assets_vault.master_plan_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Master Plan Preview" />
                    <button
                      type="button"
                      onClick={() => setCrudForm({
                        ...crudForm,
                        media_assets_vault: {
                          ...crudForm.media_assets_vault,
                          master_plan_url: ''
                        }
                      })}
                      style={{
                        position: 'absolute', top: '4px', right: '4px',
                        background: 'rgba(220, 38, 38, 0.9)', color: 'white',
                        border: 'none', borderRadius: '50%', width: '22px', height: '22px',
                        fontSize: '12px', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                        zIndex: 5
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* ── Image Upload Section ── */}
              <ImageUploadSection crudForm={crudForm} setCrudForm={setCrudForm} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCrudModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Project Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;


/* ─── Extracted Image/Video Upload Sub-component ─── */
function ImageUploadSection({ crudForm, setCrudForm }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const existingUrls = crudForm.media_assets_vault?.hero_slider_webp_urls || [];

  const isVideoUrl = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|quicktime)($|\?)/i.test(url) || url.includes('/uploads/video-') || url.includes('video');
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError('');

    // Check size limit: Image (5 MB) vs Video (20 MB)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const limit = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > limit) {
        setUploadError(`File "${file.name}" exceeds the size limit. Images must be under 5 MB, and videos must be under 20 MB.`);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/uploads`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      const newUrls = [...existingUrls, ...data.urls];
      setCrudForm({
        ...crudForm,
        media_assets_vault: {
          ...crudForm.media_assets_vault,
          hero_slider_webp_urls: newUrls
        }
      });
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    const updated = existingUrls.filter((_, i) => i !== index);
    setCrudForm({
      ...crudForm,
      media_assets_vault: {
        ...crudForm.media_assets_vault,
        hero_slider_webp_urls: updated
      }
    });
  };

  const handleThumbnailDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleThumbnailDragOver = (e) => {
    e.preventDefault();
  };

  const handleThumbnailDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const urls = [...existingUrls];
    const [movedUrl] = urls.splice(sourceIndex, 1);
    urls.splice(targetIndex, 0, movedUrl);

    setCrudForm({
      ...crudForm,
      media_assets_vault: {
        ...crudForm.media_assets_vault,
        hero_slider_webp_urls: urls
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px', marginTop: '16px' }}>
      <label className="form-label">Property Media (Drag to reorder - first image/video is the Cover)</label>

      {/* Existing image/video thumbnails */}
      {existingUrls.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {existingUrls.map((url, idx) => (
            <div 
              key={idx} 
              draggable="true"
              onDragStart={(e) => handleThumbnailDragStart(e, idx)}
              onDragOver={handleThumbnailDragOver}
              onDrop={(e) => handleThumbnailDrop(e, idx)}
              style={{ 
                position: 'relative', 
                width: '120px', 
                height: '90px', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                border: '1px solid #cbd5e1',
                cursor: 'move',
                userSelect: 'none'
              }}
              title="Drag to change order"
            >
              {isVideoUrl(url) ? (
                <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} muted playsInline />
              ) : (
                <img src={url} alt={`Property ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                style={{
                  position: 'absolute', top: '4px', right: '4px',
                  background: 'rgba(220, 38, 38, 0.9)', color: 'white',
                  border: 'none', borderRadius: '50%', width: '22px', height: '22px',
                  fontSize: '12px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                  zIndex: 5
                }}
                title="Remove media"
              >
                ✕
              </button>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.6)', color: 'white',
                fontSize: '10px', textAlign: 'center', padding: '2px 0',
                pointerEvents: 'none'
              }}>
                {idx === 0 ? 'Cover' : `#${idx + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: uploading ? '#fef2f2' : '#f8fafc',
          transition: 'all 0.2s'
        }}
      >
        {uploading ? (
          <div>
            <span style={{ fontSize: '24px' }}>⏳</span>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Uploading media...</p>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: '24px' }}>📷</span>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Click to browse</strong> or drag and drop images/videos here
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
              Images (max 5 MB), Videos (max 20 MB) — Up to 10 items
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg,video/quicktime"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {uploadError && (
        <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '8px' }}>⚠️ {uploadError}</p>
      )}

      {/* Manual URL input fallback */}
      <div className="form-group" style={{ marginTop: '12px' }}>
        <label className="form-label" style={{ fontSize: '10px' }}>Or paste an external image/video URL</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            className="form-input"
            placeholder="https://example.com/photo.jpg or video.mp4"
            id="manual-url-input"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
            onClick={() => {
              const input = document.getElementById('manual-url-input');
              const url = input?.value?.trim();
              if (url) {
                const newUrls = [...existingUrls, url];
                setCrudForm({
                  ...crudForm,
                  media_assets_vault: {
                    ...crudForm.media_assets_vault,
                    hero_slider_webp_urls: newUrls
                  }
                });
                input.value = '';
              }
            }}
          >
            + Add URL
          </button>
        </div>
      </div>
    </div>
  );
}
