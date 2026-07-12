const Lead = require('../models/Lead');

exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ timestamp: -1 });
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve leads from MongoDB' });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { name, phone, email, source, details } = req.body;
    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Name, Phone, and Email are required fields' });
    }

    const newLead = await Lead.create({
      id: 'lead-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      name,
      phone,
      email,
      source: source || 'General Enquiry',
      status: 'New',
      details: details || {}
    });

    res.status(201).json(newLead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save lead to MongoDB' });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const updated = await Lead.findOneAndUpdate({ id }, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update lead status in MongoDB' });
  }
};

exports.exportLeadsCSV = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ timestamp: -1 });
    
    let csvContent = '\uFEFF'; // Add UTF-8 BOM
    csvContent += 'System Timestamp,Lead Identity Name,Contact Phone Number,Target Email Route,Attribution Origin Form Source,Operational Status Tracking,Preferred Date,Time Slot,Transport Assistance\n';
    
    leads.forEach(lead => {
      const row = [
        `"${(lead.timestamp || '').replace(/"/g, '""')}"`,
        `"${(lead.name || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.source || '').replace(/"/g, '""')}"`,
        `"${(lead.status || '').replace(/"/g, '""')}"`,
        `"${(lead.details?.preferred_date || '')}"`,
        `"${(lead.details?.time_slot || '')}"`,
        `"${lead.details?.transport_assistance !== undefined ? (lead.details.transport_assistance ? 'YES' : 'NO') : ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export leads' });
  }
};
