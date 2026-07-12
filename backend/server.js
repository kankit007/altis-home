const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const Property = require('./models/Property');
const Lead = require('./models/Lead');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB().then(async () => {
  if (process.env.SEED_ON_EMPTY !== 'false') {
    await seedDatabaseIfNeeded();
  }
});

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: corsOrigin.split(',').map(o => o.trim()),
  credentials: true
}));
app.use(express.json());

// Custom request logging middleware for all CRUD operations
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms)`);
    
    // Log the request body for modifications (POST/PUT/PATCH) for transparency
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      // Create a shallow copy to prevent console bloating if there are extremely large properties
      const bodyCopy = { ...req.body };
      if (bodyCopy.password) bodyCopy.password = '******'; // Hide sensitive fields
      console.log(`   └─ Request Body:`, JSON.stringify(bodyCopy));
    }
  });
  
  next();
});

// Routes
const propertyRoutes = require('./routes/propertyRoutes');
const leadRoutes = require('./routes/leadRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/uploads', uploadRoutes);

// Seeding helpers
const PROPERTIES_SEED_FILE = path.join(__dirname, 'data', 'properties.json');
const LEADS_SEED_FILE = path.join(__dirname, 'data', 'leads.json');

function readJSONFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading seed file ${filePath}:`, err);
    return [];
  }
}

async function seedDatabaseIfNeeded() {
  try {
    const propertyCount = await Property.countDocuments();
    if (propertyCount === 0) {
      console.log('MongoDB Property collection is empty. Seeding from local JSON...');
      const seedProperties = readJSONFile(PROPERTIES_SEED_FILE);
      if (seedProperties.length > 0) {
        await Property.insertMany(seedProperties);
        console.log(`Seeded ${seedProperties.length} properties to MongoDB.`);
      }
    }

    const leadCount = await Lead.countDocuments();
    if (leadCount === 0) {
      console.log('MongoDB Lead collection is empty. Seeding from local JSON...');
      const seedLeads = readJSONFile(LEADS_SEED_FILE);
      if (seedLeads.length > 0) {
        await Lead.insertMany(seedLeads);
        console.log(`Seeded ${seedLeads.length} leads to MongoDB.`);
      }
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
