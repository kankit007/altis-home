const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  timestamp: { type: String, default: () => new Date().toISOString().replace('T', ' ').substring(0, 19) },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  source: String,
  status: { type: String, default: 'New' },
  details: {
    preferred_date: String,
    time_slot: String,
    transport_assistance: Boolean
  }
});

module.exports = mongoose.model('Lead', leadSchema);
