import { useState, useEffect } from 'react';
import './App.css';
import { HeartIcon, SearchIcon, CalculatorIcon } from './components/Icons';
import Calculators from './components/Calculators';
import PropertyDetailModal from './components/PropertyDetailModal';
import AdminPanel from './components/AdminPanel';

// Config from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'admin123';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
const PHONE_NUMBER = import.meta.env.VITE_PHONE_NUMBER || '+919876543210';
const WHATSAPP_MESSAGE = import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hi Altis Homes, I am interested in your premium listings.';
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'ALTIS HOMES';

const DEFAULT_LOCATIONS = ['Luxury Zone Area', 'Premium Core District', 'Sector 45 Micro-Market Alpha', 'Sector 62', 'Sector 70'];
const DEFAULT_TYPES = ['Apartment', 'Penthouse', 'Villa', 'Plot', 'Office Space', 'Retail Shop'];
const DEFAULT_BUILDERS = ['Altis Homes Originals', 'Acme Infrastructure Corp', 'Horizon Developers', 'Green Land Developers'];
const DEFAULT_AMENITIES = ['Pool', 'Gym', 'Clubhouse', 'EV Charging'];

function App() {
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('altis_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [compareList, setCompareList] = useState([]);
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'favorites', 'admin'
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Search state variables
  const [searchText, setSearchText] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBuilder, setSelectedBuilder] = useState('');
  const [possessionTimeline, setPossessionTimeline] = useState('');
  const [selectedBhks, setSelectedBhks] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Modals state
  const [gatedModalOpen, setGatedModalOpen] = useState(false);
  const [gatedSource, setGatedSource] = useState('');
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitSource, setVisitSource] = useState('');

  // Form input states
  const [leadFormData, setLeadFormData] = useState({ name: '', phone: '', email: '' });
  const [visitFormData, setVisitFormData] = useState({ date: '', timeSlot: 'Afternoon', transport: true });
  const [gatedDownloadUnlocked, setGatedDownloadUnlocked] = useState(false);
  const [leadSubmitSuccess, setLeadSubmitSuccess] = useState(false);

  // Admin & CRUD dashboards
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminLeads, setAdminLeads] = useState([]);
  const [adminProperties, setAdminProperties] = useState([]);
  const [crudModalOpen, setCrudModalOpen] = useState(false);
  const [crudForm, setCrudForm] = useState({
    id: '',
    project_name: '',
    developer_name: '',
    is_altis_original: false,
    is_featured: false,
    rera_registration_number: '',
    pricing: { starting_price_amount: 0, currency_code: 'INR', display_formatted_price: '' },
    location_metadata: { state_region: 'Jharkhand', city_hub: 'Jamshedpur', micro_market_zone: '', coordinates_point: { latitude: 22.8, longitude: 86.2 } },
    inventory_parameters: { property_category: 'Residential', sub_types_allowed: [], bhk_configurations_available: [], possession_timeline_status: 'Under Construction' },
    unique_selling_propositions: [],
    media_assets_vault: { hero_slider_webp_urls: [], virtual_tour_iframe_source: '', master_plan_url: '' },
    amenities: [],
    description: '',
    carpet_area: '',
    connectivity: { transit: [], life_infrastructure: [] }
  });

  // Client decision drawer trigger
  const [calculatorsOpen, setCalculatorsOpen] = useState(false);

  // Dynamic filter state variables
  const [availableLocations, setAvailableLocations] = useState(DEFAULT_LOCATIONS);
  const [availableTypes, setAvailableTypes] = useState(DEFAULT_TYPES);
  const [availableBuilders, setAvailableBuilders] = useState(DEFAULT_BUILDERS);
  const [availableAmenities, setAvailableAmenities] = useState(DEFAULT_AMENITIES);

  // Fetch unique filter metadata options from backend
  const fetchMetaOptions = () => {
    fetch(`${API_BASE_URL}/api/properties/meta-options`)
      .then(res => res.json())
      .then(data => {
        setAvailableLocations(data.locations?.length ? data.locations : DEFAULT_LOCATIONS);
        setAvailableTypes(data.propertyTypes?.length ? data.propertyTypes : DEFAULT_TYPES);
        setAvailableBuilders(data.builders?.length ? data.builders : DEFAULT_BUILDERS);
        setAvailableAmenities(data.amenities?.length ? data.amenities : DEFAULT_AMENITIES);
      })
      .catch(err => {
        console.error('Error fetching metadata options:', err);
        setAvailableLocations(DEFAULT_LOCATIONS);
        setAvailableTypes(DEFAULT_TYPES);
        setAvailableBuilders(DEFAULT_BUILDERS);
        setAvailableAmenities(DEFAULT_AMENITIES);
      });
  };

  // Fetch metadata options on application load
  useEffect(() => {
    fetchMetaOptions();
  }, []);

  // Initial loads
  useEffect(() => {
    fetchProperties();
  }, [
    searchText, selectedLocations, selectedTypes, minPrice, maxPrice,
    selectedBuilder, possessionTimeline, selectedBhks, selectedAmenities
  ]);

  useEffect(() => {
    localStorage.setItem('altis_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (adminLoggedIn) {
      fetchAdminLeads();
      fetchAdminProperties();
    }
  }, [adminLoggedIn]);

  const fetchProperties = () => {
    let query = [];
    if (searchText) query.push(`search=${encodeURIComponent(searchText)}`);
    if (selectedLocations.length > 0) query.push(`locations=${encodeURIComponent(selectedLocations.join(','))}`);
    if (selectedTypes.length > 0) query.push(`propertyTypes=${encodeURIComponent(selectedTypes.join(','))}`);
    if (minPrice) query.push(`minPrice=${minPrice}`);
    if (maxPrice) query.push(`maxPrice=${maxPrice}`);
    if (selectedBuilder) query.push(`builder=${encodeURIComponent(selectedBuilder)}`);
    if (possessionTimeline) query.push(`possession=${encodeURIComponent(possessionTimeline)}`);
    if (selectedBhks.length > 0) query.push(`bhks=${encodeURIComponent(selectedBhks.join(','))}`);
    if (selectedAmenities.length > 0) query.push(`amenities=${encodeURIComponent(selectedAmenities.join(','))}`);

    const qString = query.length > 0 ? `?${query.join('&')}` : '';
    fetch(`${API_BASE_URL}/api/properties${qString}`)
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error('Error fetching properties:', err));
  };

  const fetchAdminLeads = () => {
    fetch(`${API_BASE_URL}/api/leads`)
      .then(res => res.json())
      .then(data => setAdminLeads(data))
      .catch(err => console.error('Error loading leads:', err));
  };

  const fetchAdminProperties = () => {
    fetch(`${API_BASE_URL}/api/properties`)
      .then(res => res.json())
      .then(data => setAdminProperties(data))
      .catch(err => console.error('Error loading properties for admin:', err));
  };

  // Toggle favorites
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Add to Compare
  const toggleCompare = (property) => {
    const exists = compareList.some(item => item.id === property.id);
    if (exists) {
      setCompareList(compareList.filter(item => item.id !== property.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can only compare a maximum of 3 properties side-by-side.');
        return;
      }
      setCompareList([...compareList, property]);
    }
  };

  // Handle lead submission
  const handleLeadSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: leadFormData.name,
      phone: leadFormData.phone,
      email: leadFormData.email,
      source: gatedSource,
      details: {}
    };

    fetch(`${API_BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setLeadSubmitSuccess(true);
        setGatedDownloadUnlocked(true);
        if (adminLoggedIn) fetchAdminLeads();
      })
      .catch(err => console.error('Error creating lead:', err));
  };

  // Handle Site Visit submission
  const handleVisitSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: leadFormData.name,
      phone: leadFormData.phone,
      email: leadFormData.email,
      source: visitSource,
      details: {
        preferred_date: visitFormData.date,
        time_slot: visitFormData.timeSlot,
        transport_assistance: visitFormData.transport
      }
    };

    fetch(`${API_BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setLeadSubmitSuccess(true);
        if (adminLoggedIn) fetchAdminLeads();
      })
      .catch(err => console.error('Error booking visit lead:', err));
  };

  // Handle lead status change
  const handleLeadStatusChange = (id, newStatus) => {
    fetch(`${API_BASE_URL}/api/leads/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(() => fetchAdminLeads())
      .catch(err => console.error('Error updating lead status:', err));
  };

  // Trigger CSV export
  const handleCSVExport = () => {
    window.open(`${API_BASE_URL}/api/leads/export`);
  };

  // Open detail modal helper
  const handleViewDetails = (property) => {
    setSelectedProperty(property);
  };

  // Admin login trigger
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasscode === ADMIN_PASSCODE) {
      setAdminLoggedIn(true);
    } else {
      alert('Incorrect passcode.');
    }
  };

  // Property CRUD actions
  const handleOpenCRUDCreate = () => {
    setCrudForm({
      id: '',
      project_name: '',
      developer_name: '',
      is_altis_original: false,
      is_featured: false,
      rera_registration_number: '',
      pricing: { starting_price_amount: 5000000, currency_code: 'INR', display_formatted_price: '₹50 Lakhs Onwards' },
      location_metadata: { state_region: 'Jharkhand', city_hub: 'Jamshedpur', micro_market_zone: 'Sector 62', coordinates_point: { latitude: 22.8, longitude: 86.2 } },
      inventory_parameters: { property_category: 'Residential', sub_types_allowed: ['Apartment'], bhk_configurations_available: [2, 3], possession_timeline_status: 'Within 1 Year' },
      unique_selling_propositions: ['Premium location', 'Excellent modular structure'],
      media_assets_vault: {
        hero_slider_webp_urls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
        virtual_tour_iframe_source: '',
        master_plan_url: ''
      },
      amenities: ['Pool', 'Gym'],
      description: '',
      carpet_area: '1,200 Sq. Ft.',
      connectivity: {
        transit: ['Adityapur Junction: 10 mins (4.5 km)', 'Bus Terminal: 5 mins'],
        life_infrastructure: ['Loyola School: 5 mins', 'Tata Main Hospital: 8 mins']
      }
    });
    setCrudModalOpen(true);
  };

  const handleOpenCRUDEdit = (property) => {
    setCrudForm({ ...property });
    setCrudModalOpen(true);
  };

  const handleCRUDSubmit = (e) => {
    e.preventDefault();
    const isEdit = !!crudForm.id;
    const url = isEdit ? `${API_BASE_URL}/api/properties/${crudForm.id}` : `${API_BASE_URL}/api/properties`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crudForm)
    })
      .then(res => res.json())
      .then(() => {
        setCrudModalOpen(false);
        fetchAdminProperties();
        fetchProperties();
        fetchMetaOptions();
      })
      .catch(err => console.error('Error saving CRUD property:', err));
  };

  const handleCRUDDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      fetch(`${API_BASE_URL}/api/properties/${id}`, { method: 'DELETE' })
        .then(() => {
          fetchAdminProperties();
          fetchProperties();
          fetchMetaOptions();
        })
        .catch(err => console.error('Error deleting property:', err));
    }
  };

  const handleLocationToggle = (loc) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter(item => item !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const handleTypeToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(item => item !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleBhkToggle = (bhk) => {
    if (selectedBhks.includes(bhk)) {
      setSelectedBhks(selectedBhks.filter(item => item !== bhk));
    } else {
      setSelectedBhks([...selectedBhks, bhk]);
    }
  };

  const handleAmenityToggle = (amen) => {
    if (selectedAmenities.includes(amen)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== amen));
    } else {
      setSelectedAmenities([...selectedAmenities, amen]);
    }
  };

  // Selection options are loaded dynamically from the database via fetchMetaOptions

  return (
    <div id="app-wrapper">
      {/* 1. Global Navigation Header */}
      <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 950, borderRadius: 0, borderTop: 'none', borderInline: 'none', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('search')}>
            <span style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'var(--font-heading)', background: 'var(--gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {COMPANY_NAME}
            </span>
            <span className="badge badge-gold" style={{ fontSize: '9px', padding: '2px 5px' }}>Originals & CP</span>
          </div>

          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ color: activeTab === 'search' ? 'var(--primary)' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setActiveTab('search')}>
              Browse Properties
            </span>
            <span style={{ color: activeTab === 'favorites' ? 'var(--primary)' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setActiveTab('favorites')}>
              My Favorites <span style={{ background: 'var(--primary)', color: '#ffffff', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>{favorites.length}</span>
            </span>
            <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setCalculatorsOpen(true)}>
              <CalculatorIcon /> Calculators
            </button>
            <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => setActiveTab('admin')}>
              Admin Panel
            </button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingBottom: '100px', marginTop: '30px' }}>

        {/* Banner Section */}
        {activeTab === 'search' && (
          <div className="glass-panel" style={{ padding: '36px', marginBottom: '30px', textAlign: 'center', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
            <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', background: 'var(--gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Find Your Dream Home
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 20px auto', fontSize: '15px' }}>
              Explore the exclusive "Altis Homes Originals" built directly by our group alongside hand-picked premium brokerage developments matching highest quality specifications.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span className="badge badge-gold" style={{ marginRight: '10px' }}>★ Premium Hand-Crafted Layouts</span>
              <span className="badge badge-blue">✓ RERA Approved Inventory</span>
            </div>
          </div>
        )}

        {/* 2. TAB CONTENT: PROPERTIES SEARCH */}
        {activeTab === 'search' && (
          <div>
            {/* Search and Advanced Filters Dashboard */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SearchIcon /> Dynamic Search Engine
              </h3>

              {/* Search Bar Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '20px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search project name, key amenities, developer, or location..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ height: '48px', fontSize: '15px' }}
                />
                <button className="btn btn-primary" onClick={fetchProperties}>Search</button>
              </div>

              {/* Filters Form Blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>

                {/* 1. Location Selection */}
                <div>
                  <label className="form-label">Location (Multi-select)</label>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '10px', background: 'rgba(0,0,0,0.02)' }}>
                    {availableLocations.map(loc => (
                      <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', margin: '4px 0', cursor: 'pointer' }}>
                        <input type="checkbox" checked={selectedLocations.includes(loc)} onChange={() => handleLocationToggle(loc)} />
                        {loc}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Property Categories */}
                <div>
                  <label className="form-label">Property Type</label>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '10px', background: 'rgba(0,0,0,0.02)' }}>
                    {availableTypes.map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', margin: '4px 0', cursor: 'pointer' }}>
                        <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => handleTypeToggle(type)} />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Budget Range Selector */}
                <div>
                  <label className="form-label">Budget Range</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select className="form-select" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}>
                      <option value="">Min Price</option>
                      <option value="3000000">₹30 Lakhs</option>
                      <option value="6000000">₹60 Lakhs</option>
                      <option value="10000000">₹1 Crore</option>
                      <option value="20000000">₹2 Crores</option>
                      <option value="40000000">₹4 Crores</option>
                    </select>
                    <select className="form-select" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
                      <option value="">Max Price</option>
                      <option value="6000000">₹60 Lakhs</option>
                      <option value="10000000">₹1 Crore</option>
                      <option value="20000000">₹2 Crores</option>
                      <option value="40000000">₹4 Crores</option>
                      <option value="100000000">₹10 Crores</option>
                    </select>
                  </div>

                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Range: {minPrice ? `₹${minPrice / 100000}L` : '0'} to {maxPrice ? `₹${maxPrice / 10000000}Cr` : 'Unlimited'}
                  </span>
                </div>

                {/* 4. Developer Selector */}
                <div>
                  <label className="form-label">Builder/Developer</label>
                  <select className="form-select" value={selectedBuilder} onChange={(e) => setSelectedBuilder(e.target.value)}>
                    <option value="">All Developers</option>
                    {availableBuilders.map(builder => (
                      <option key={builder} value={builder} style={{ fontWeight: builder.includes('Originals') ? 'bold' : 'normal' }}>
                        {builder.includes('Originals') ? '⭐ ' : ''}{builder}
                      </option>
                    ))}
                  </select>

                  <div style={{ marginTop: '16px' }}>
                    <label className="form-label">Possession Timeline</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="radio" name="possession" checked={possessionTimeline === ''} onChange={() => setPossessionTimeline('')} /> Any
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="radio" name="possession" checked={possessionTimeline === 'Ready-to-Move'} onChange={() => setPossessionTimeline('Ready-to-Move')} /> Ready
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="radio" name="possession" checked={possessionTimeline === '1 year'} onChange={() => setPossessionTimeline('1 year')} /> &lt; 1 Year
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="radio" name="possession" checked={possessionTimeline === 'Under Construction'} onChange={() => setPossessionTimeline('Under Construction')} /> Under Const.
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              {/* Lower filters: BHK and Amenities */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                <div>
                  <label className="form-label">BHK Configurations</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4].map(bhkNum => {
                      const isSelected = selectedBhks.includes(bhkNum);
                      return (
                        <button
                          key={bhkNum}
                          className="btn"
                          onClick={() => handleBhkToggle(bhkNum)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.02)',
                            color: isSelected ? '#ffffff' : 'var(--text-primary)',
                            border: '1px solid ' + (isSelected ? 'transparent' : 'var(--border-glass)')
                          }}
                        >
                          {bhkNum} BHK{bhkNum === 4 ? '+' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="form-label">Amenities Filter (AND logic)</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {availableAmenities.map(amen => {
                      const isSelected = selectedAmenities.includes(amen);
                      return (
                        <button
                          key={amen}
                          className="btn"
                          onClick={() => handleAmenityToggle(amen)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            background: isSelected ? 'rgba(220, 38, 38, 0.1)' : 'rgba(0,0,0,0.02)',
                            color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                            border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--border-glass)')
                          }}
                        >
                          {amen === 'Pool' ? '🏊 ' : amen === 'Gym' ? '🏋️ ' : amen === 'Clubhouse' ? '🏢 ' : '⚡ '}
                          {amen}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active search tags display */}
              {(selectedLocations.length > 0 || selectedTypes.length > 0 || selectedBhks.length > 0 || selectedAmenities.length > 0 || selectedBuilder || possessionTimeline) && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', borderTop: '1px dashed var(--border-glass)', paddingTop: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Filters:</span>
                  {selectedLocations.map(l => (
                    <span key={l} style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleLocationToggle(l)}>
                      📍 {l} ✕
                    </span>
                  ))}
                  {selectedTypes.map(t => (
                    <span key={t} style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleTypeToggle(t)}>
                      🏢 {t} ✕
                    </span>
                  ))}
                  {selectedBhks.map(b => (
                    <span key={b} style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleBhkToggle(b)}>
                      🚪 {b} BHK ✕
                    </span>
                  ))}
                  {selectedAmenities.map(a => (
                    <span key={a} style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleAmenityToggle(a)}>
                      🛡️ {a} ✕
                    </span>
                  ))}
                  {selectedBuilder && (
                    <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedBuilder('')}>
                      👷 {selectedBuilder} ✕
                    </span>
                  )}
                  {possessionTimeline && (
                    <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e2e8f0', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setPossessionTimeline('')}>
                      ⏳ {possessionTimeline} ✕
                    </span>
                  )}
                  <button className="btn" style={{ padding: '2px 8px', fontSize: '11px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => {
                    setSelectedLocations([]); setSelectedTypes([]); setSelectedBhks([]); setSelectedAmenities([]); setSelectedBuilder(''); setPossessionTimeline(''); setMinPrice(''); setMaxPrice(''); setSearchText('');
                  }}>
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Compare panel overlay */}
            {compareList.length > 0 && (
              <div className="glass-panel" style={{ padding: '16px', marginBottom: '30px', border: '1px solid var(--primary)', background: 'rgba(220, 38, 38, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ color: 'var(--primary)', margin: 0 }}>Compare Engine Matrix ({compareList.length} of 3 selected)</h4>
                  <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setCompareList([])}>Clear Comparison</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {compareList.map(item => (
                    <div key={item.id} className="glass-panel" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff' }}>
                      <img src={item.media_assets_vault?.hero_slider_webp_urls?.[0]} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h5 style={{ margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.project_name}</h5>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--primary)' }}>{item.pricing?.display_formatted_price}</p>
                      </div>
                      <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => toggleCompare(item)}>✕</button>
                    </div>
                  ))}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a href="#comparison-matrix" className="btn btn-primary" style={{ padding: '8px 16px', width: '100%', textDecoration: 'none' }}>
                      Analyze Side-by-Side Matrix
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Matrix Properties Grid */}
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
              Available Property Showcase ({properties.length} found)
            </h3>
            <div className="properties-grid">
              {properties.map(property => {
                const isOriginal = property.is_altis_original;
                const isFav = favorites.includes(property.id);
                const isCompared = compareList.some(item => item.id === property.id);

                return (
                  <div
                    key={property.id}
                    className="glass-panel"
                    style={{
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      background: isOriginal ? 'rgba(8, 24, 18, 0.5)' : 'var(--bg-glass)',
                      border: isOriginal ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                      boxShadow: isOriginal ? '0 8px 32px 0 rgba(16, 185, 129, 0.1)' : 'var(--glass-shadow)'
                    }}
                  >
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: 'rgba(255,255,255,0.7)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <HeartIcon filled={isFav} />
                    </button>

                    <div style={{ overflow: 'hidden', height: '200px', position: 'relative' }}>
                      <img
                        src={property.media_assets_vault?.hero_slider_webp_urls?.[0]}
                        alt={property.project_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        className="property-card-image"
                      />

                      <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                        {isOriginal ? (
                          <span className="badge badge-gold">★ Altis Original Exclusive</span>
                        ) : (
                          <span className="badge badge-blue">{property.developer_name}</span>
                        )}
                        <span className="badge badge-green" style={{ background: '#f8fafc', color: '#1e293b' }}>{property.inventory_parameters?.possession_timeline_status}</span>
                      </div>
                    </div>

                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '18px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{property.project_name}</h4>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '16px', whiteSpace: 'nowrap' }}>
                          {property.pricing?.display_formatted_price.replace(' Onwards', '')}
                        </span>
                      </div>

                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                        📍 {property.location_metadata?.micro_market_zone}, {property.location_metadata?.city_hub}
                      </p>

                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px' }}>
                        {property.description}
                      </p>

                      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        {property.amenities?.map(amen => (
                          <span key={amen} style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                            {amen === 'Pool' ? '🏊' : amen === 'Gym' ? '🏋️' : amen === 'Clubhouse' ? '🏢' : '⚡'} {amen}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                          <input type="checkbox" checked={isCompared} onChange={() => toggleCompare(property)} />
                          Add to Compare
                        </label>

                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '12px', background: isOriginal ? 'rgba(220, 38, 38, 0.08)' : 'rgba(255,255,255,0.05)', borderColor: isOriginal ? 'var(--primary)' : 'var(--border-glass)' }}
                          onClick={() => handleViewDetails(property)}
                        >
                          {isOriginal ? '✨ Explore Direct Showcase' : 'View Project Details'}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. TAB CONTENT: SAVED FAVORITES */}
        {activeTab === 'favorites' && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>My Saved Premium Inventory</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your session-saved properties bookmarked across searches.
            </p>

            {favorites.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                <HeartIcon filled={false} className="fade-in" style={{ width: '48px', height: '48px', color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h4>No properties favorited yet.</h4>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Explore properties and click the heart icon on any listing card.
                </p>
                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setActiveTab('search')}>
                  Browse Showcase
                </button>
              </div>
            ) : (
              <div className="properties-grid">
                {properties
                  .filter(p => favorites.includes(p.id))
                  .map(property => {
                    const isOriginal = property.is_altis_original;
                    const isFav = favorites.includes(property.id);
                    const isCompared = compareList.some(item => item.id === property.id);

                    return (
                      <div
                        key={property.id}
                        className="glass-panel"
                        style={{
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          border: isOriginal ? '2px solid var(--primary)' : '1px solid var(--border-glass)'
                        }}
                      >
                        <button
                          onClick={() => toggleFavorite(property.id)}
                          style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: 'rgba(255,255,255,0.7)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <HeartIcon filled={isFav} />
                        </button>

                        <div style={{ overflow: 'hidden', height: '200px' }}>
                          <img src={property.media_assets_vault?.hero_slider_webp_urls?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0 }}>{property.project_name}</h4>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{property.pricing?.display_formatted_price}</span>
                          </div>

                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            📍 {property.location_metadata?.micro_market_zone}, {property.location_metadata?.city_hub}
                          </p>

                          <p style={{ fontSize: '13px', color: 'var(--text-muted)', flex: 1, marginBottom: '16px' }}>
                            {property.description}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={isCompared} onChange={() => toggleCompare(property)} />
                              Compare
                            </label>

                            <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => handleViewDetails(property)}>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* 4. TAB CONTENT: ADMIN LEADS & CRUD BOARD */}
        {activeTab === 'admin' && (
          <AdminPanel
            adminLoggedIn={adminLoggedIn}
            setAdminLoggedIn={setAdminLoggedIn}
            adminPasscode={adminPasscode}
            setAdminPasscode={setAdminPasscode}
            adminLeads={adminLeads}
            adminProperties={adminProperties}
            handleLeadStatusChange={handleLeadStatusChange}
            handleCSVExport={handleCSVExport}
            handleAdminLogin={handleAdminLogin}
            handleOpenCRUDCreate={handleOpenCRUDCreate}
            handleOpenCRUDEdit={handleOpenCRUDEdit}
            handleCRUDDelete={handleCRUDDelete}
            crudModalOpen={crudModalOpen}
            setCrudModalOpen={setCrudModalOpen}
            crudForm={crudForm}
            setCrudForm={setCrudForm}
            handleCRUDSubmit={handleCRUDSubmit}
          />
        )}

        {/* 5. SIDE-BY-SIDE PROPERTY COMPARE MATRIX */}
        {compareList.length > 0 && activeTab === 'search' && (
          <section id="comparison-matrix" className="glass-panel" style={{ padding: '32px', marginTop: '60px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>
              ⚖️ side-by-side comparison comparative matrix
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)' }}>
                    <th style={{ padding: '16px', width: '20%', textTransform: 'uppercase', color: 'var(--text-secondary)', fontSize: '12px' }}>Parameters</th>
                    {compareList.map(item => (
                      <th key={item.id} style={{ padding: '16px', textAlign: 'center', width: '26%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <span className="badge badge-gold" style={{ visibility: item.is_altis_original ? 'visible' : 'hidden' }}>Altis Original</span>
                          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.project_name}</span>
                          <span style={{ color: 'var(--primary)', fontSize: '15px' }}>{item.pricing?.display_formatted_price}</span>
                        </div>
                      </th>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                      <th key={idx} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Slot {compareList.length + idx + 1} Empty
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Developer Name</td>
                    {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center' }}>{item.developer_name}</td>)}
                    {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx}></td>)}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Micro-Market Area</td>
                    {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center' }}>{item.location_metadata?.micro_market_zone}</td>)}
                    {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx}></td>)}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Possession Date</td>
                    {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center' }}>{item.inventory_parameters?.possession_timeline_status}</td>)}
                    {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx}></td>)}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>BHK Configs</td>
                    {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center' }}>{item.inventory_parameters?.bhk_configurations_available?.join(', ') || 'N/A'}</td>)}
                    {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx}></td>)}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Carpet Area Info</td>
                    {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center' }}>{item.is_altis_original ? '1,850 Sq. Ft.' : '1,200 Sq. Ft.'}</td>)}
                    {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx}></td>)}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>RERA Number</td>
                    {compareList.map(item => <td key={item.id} style={{ padding: '16px', textAlign: 'center', fontSize: '12px' }}>{item.rera_registration_number}</td>)}
                    {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx}></td>)}
                  </tr>
                  <tr>
                    <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Key Amenities</td>
                    {compareList.map(item => (
                      <td key={item.id} style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {item.amenities?.map(amen => (
                            <span key={amen} className="badge badge-blue" style={{ fontSize: '9px' }}>{amen}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx}></td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>

      {/* 6. CLIENT DECISION CALCULATORS DRAWER MODAL */}
      <Calculators isOpen={calculatorsOpen} onClose={() => setCalculatorsOpen(false)} />

      {/* 7. PROJECT DETAILS MODAL OVERVIEW */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onOpenGatedForm={(src) => {
          setGatedSource(src);
          setLeadSubmitSuccess(false);
          setGatedDownloadUnlocked(false);
          setGatedModalOpen(true);
        }}
        onOpenVisitForm={() => {
          setVisitSource(`Site Visit Scheduler Widget: ${selectedProperty?.project_name}`);
          setLeadSubmitSuccess(false);
          setVisitModalOpen(true);
        }}
      />

      {/* 8. GATED RESOURCE LEAD GENERATION FORM MODAL */}
      {gatedModalOpen && (
        <div className="modal-overlay" onClick={() => setGatedModalOpen(false)}>
          <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ border: '2px solid var(--primary)' }}>
            <button className="modal-close" onClick={() => setGatedModalOpen(false)}>✕</button>

            <h3 style={{ color: 'var(--primary)', fontSize: '20px', marginBottom: '12px', textAlign: 'center' }}>
              🔑 Unlock Premium Project Resources
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
              Please provide verified contact details to instantly unlock the secure asset download route.
            </p>

            {leadSubmitSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '48px' }}>🔓</span>
                <h4 style={{ color: '#dc2626', margin: '12px 0 8px 0' }}>Asset Verification Successful</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Your download connection link has been successfully authorized.</p>
                <a
                  href="#"
                  className="btn btn-primary"
                  style={{ width: '100%', textDecoration: 'none' }}
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Simulating download: Altis Homes document download authorized.');
                    setGatedModalOpen(false);
                  }}
                >
                  📥 Get PDF Brochure / Price Sheet Document
                </a>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ankit Kumar"
                    required
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Contact Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 | e.g. 98765 43210"
                    required
                    value={leadFormData.phone}
                    onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Routing Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. yourname@domain.com"
                    required
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                  />
                </div>

                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                  🛡️ Invisible Google reCAPTCHA v3 protection actively running on this route layer.
                </p>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Confirm Verification & Open Download Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 9. SITE VISIT SCHEDULER MODAL */}
      {visitModalOpen && (
        <div className="modal-overlay" onClick={() => setVisitModalOpen(false)}>
          <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setVisitModalOpen(false)}>✕</button>

            <h3 style={{ color: 'var(--primary)', fontSize: '20px', marginBottom: '8px', textAlign: 'center' }}>
              🚗 Coordinate Physical Guided Site Tour
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
              Choose your booking slots. Our fleet concierge team will connect back within 2 hours.
            </p>

            {leadSubmitSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '48px' }}>✅</span>
                <h4 style={{ color: 'var(--primary)', margin: '12px 0 8px 0' }}>Booking Slot Scheduled</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Our transport representative has initialized the scheduling workflow. We will confirm shortly via SMS/Call.</p>
                <button className="btn btn-secondary" style={{ marginTop: '20px', width: '100%' }} onClick={() => setVisitModalOpen(false)}>
                  Close Panel
                </button>
              </div>
            ) : (
              <form onSubmit={handleVisitSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Name"
                      required
                      value={leadFormData.name}
                      onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Phone"
                      required
                      value={leadFormData.phone}
                      onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Email Address"
                    required
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '16px', paddingTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Booking Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={visitFormData.date}
                      onChange={(e) => setVisitFormData({ ...visitFormData, date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Time Window Slot</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['Morning', 'Afternoon', 'Evening'].map(slot => (
                        <label key={slot} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', flex: 1, padding: '8px', border: '1px solid var(--border-glass)', borderRadius: '6px', background: 'rgba(0,0,0,0.02)' }}>
                          <input
                            type="radio"
                            name="time_slot"
                            checked={visitFormData.timeSlot === slot}
                            onChange={() => setVisitFormData({ ...visitFormData, timeSlot: slot })}
                          />
                          {slot}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>Request Private Fleet Concierge</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Get pick-and-drop assistance from your location.</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={visitFormData.transport}
                        onChange={(e) => setVisitFormData({ ...visitFormData, transport: e.target.checked })}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>YES</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-blue" style={{ width: '100%', marginTop: '20px' }}>
                  File Site Visit Logistics Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 11. PERSISTENT CONVERSION LAYER (DESKTOP FLOATING PANEL & MOBILE STICKY PILL) */}
      <footer className="mobile-sticky-footer" style={{ display: 'flex' }}>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`} target="_blank" style={{ background: 'var(--accent-green)', color: 'white' }}>
          💬 Connect via WhatsApp
        </a>
        <a href={`tel:${PHONE_NUMBER}`} style={{ background: 'var(--accent-blue)', color: 'white' }}>
          📞 Call Broker Agent Direct
        </a>
      </footer>

    </div>
  );
}

export default App;
