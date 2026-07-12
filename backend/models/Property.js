const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  project_name: { type: String, required: true },
  developer_name: { type: String, required: true },
  is_altis_original: { type: Boolean, default: false },
  is_featured: { type: Boolean, default: false },
  rera_registration_number: String,
  pricing: {
    starting_price_amount: Number,
    currency_code: { type: String, default: 'INR' },
    display_formatted_price: String
  },
  location_metadata: {
    state_region: String,
    city_hub: String,
    micro_market_zone: String,
    coordinates_point: {
      latitude: Number,
      longitude: Number
    }
  },
  inventory_parameters: {
    property_category: String,
    sub_types_allowed: [String],
    bhk_configurations_available: [Number],
    possession_timeline_status: String
  },
  unique_selling_propositions: [String],
  media_assets_vault: {
    hero_slider_webp_urls: [String],
    virtual_tour_iframe_source: String,
    master_plan_url: String
  },
  amenities: [String],
  description: String,
  carpet_area: String,
  connectivity: {
    transit: [String],
    life_infrastructure: [String]
  }
});

module.exports = mongoose.model('Property', propertySchema);
