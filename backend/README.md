# Altis Homes Backend API

Node.js and Express REST API backing the Altis Homes platform. It connects to MongoDB Atlas for structured listings and leads database records and uses MongoDB GridFS to store and serve uploaded images/videos.

## Features

* **Property CRUD Operations**: Query listings with advanced location, price, BHK, builder, and amenity filters.
* **Database-Backed File Storage (GridFS)**: Uploaded files are converted into binary streams and stored directly inside your MongoDB cluster, making the server completely stateless.
* **Lead Capturing**: Secured REST endpoint to log customer site visit requests and brochure downloads.
* **Auto-Seeding**: Automatic population of initial property listings and mock leads from local JSON files when the database is empty.
* **Request Logger**: Custom terminal middleware logging request paths, response times, status codes, and JSON payloads.

---

## Environment Variables

Create a `.env` file in this directory with the following keys:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
CORS_ORIGIN=http://localhost:5173
ADMIN_PASSCODE=admin123
SEED_ON_EMPTY=false
```

---

## Available Scripts

* **`npm start`**: Runs the API server locally using standard `node server.js`.
* **`npm run dev`**: Runs the server using nodemon (if installed) for auto-reloading.
