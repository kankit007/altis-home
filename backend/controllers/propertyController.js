const Property = require('../models/Property');

exports.getProperties = async (req, res) => {
  try {
    let properties = await Property.find({});
    const { search, locations, propertyTypes, minPrice, maxPrice, builder, possession, bhks, amenities } = req.query;

    if (search) {
      const q = search.toLowerCase();
      properties = properties.filter(p => 
        p.project_name.toLowerCase().includes(q) ||
        p.developer_name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location_metadata.micro_market_zone.toLowerCase().includes(q)
      );
    }

    if (locations) {
      const locList = locations.split(',').map(l => l.trim().toLowerCase());
      properties = properties.filter(p => 
        locList.includes(p.location_metadata.micro_market_zone.toLowerCase()) ||
        locList.includes(p.location_metadata.city_hub.toLowerCase())
      );
    }

    if (propertyTypes) {
      const typeList = propertyTypes.split(',').map(t => t.trim().toLowerCase());
      properties = properties.filter(p => 
        p.inventory_parameters.sub_types_allowed.some(t => typeList.includes(t.toLowerCase())) ||
        typeList.includes(p.inventory_parameters.property_category.toLowerCase())
      );
    }

    if (minPrice) {
      const minVal = parseFloat(minPrice);
      properties = properties.filter(p => p.pricing.starting_price_amount >= minVal);
    }
    if (maxPrice) {
      const maxVal = parseFloat(maxPrice);
      properties = properties.filter(p => p.pricing.starting_price_amount <= maxVal);
    }

    if (builder) {
      const b = builder.trim().toLowerCase();
      properties = properties.filter(p => p.developer_name.toLowerCase().includes(b));
    }

    if (possession) {
      const timelineList = possession.split(',').map(t => t.trim().toLowerCase());
      properties = properties.filter(p => {
        const status = p.inventory_parameters.possession_timeline_status.toLowerCase();
        return timelineList.some(item => {
          if (item.includes('ready') && status.includes('ready')) return true;
          if (item.includes('construction') && status.includes('construction')) return true;
          if (item.includes('1 year') && status.includes('1 year')) return true;
          if (item.includes('3 years') && status.includes('3 years')) return true;
          return status.includes(item);
        });
      });
    }

    if (bhks) {
      const bhkList = bhks.split(',').map(b => parseInt(b.trim())).filter(b => !isNaN(b));
      properties = properties.filter(p => {
        const pBhks = p.inventory_parameters.bhk_configurations_available;
        if (!pBhks || pBhks.length === 0) return false;
        return pBhks.some(bhk => bhkList.includes(bhk));
      });
    }

    if (amenities) {
      const amenList = amenities.split(',').map(a => a.trim().toLowerCase());
      properties = properties.filter(p => {
        const pAmens = (p.amenities || []).map(a => a.toLowerCase());
        return amenList.every(amen => pAmens.includes(amen));
      });
    }

    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve listings from MongoDB' });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({ id: req.params.id });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching property details' });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const newPropertyData = req.body;
    if (!newPropertyData.project_name || !newPropertyData.developer_name) {
      return res.status(400).json({ error: 'Project name and Developer name are required' });
    }

    newPropertyData.id = 'prop-' + Date.now();
    const newProperty = await Property.create(newPropertyData);
    res.status(201).json(newProperty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create property in MongoDB' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Property.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update property details in MongoDB' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Property.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully from MongoDB', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete property from MongoDB' });
  }
};

exports.getMetaOptions = async (req, res) => {
  try {
    const locations = await Property.distinct('location_metadata.micro_market_zone');
    const categories = await Property.distinct('inventory_parameters.property_category');
    const subTypes = await Property.distinct('inventory_parameters.sub_types_allowed');
    const propertyTypes = Array.from(new Set([...categories, ...subTypes])).filter(Boolean);
    const builders = await Property.distinct('developer_name');
    const amenities = await Property.distinct('amenities');

    res.json({
      locations: locations.filter(Boolean),
      propertyTypes: propertyTypes,
      builders: builders.filter(Boolean),
      amenities: amenities.filter(Boolean)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve metadata options from MongoDB' });
  }
};

