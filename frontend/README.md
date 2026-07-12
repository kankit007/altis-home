# Altis Homes Frontend Client

React application built with Vite and vanilla CSS. It serves as the primary dashboard for client searches and administrative database control.

## Features

* **Advanced Search Filters**: Filter properties by location, type, BHK configs, pricing ranges, builders, and amenities.
* **Interactive Media Gallery**: Custom local media player supporting enlarged image view and video streaming.
* **Pinpoint Location Maps**: Dynamic Google Maps integration utilizing geocodes (latitude/longitude) falling back to address-based searches.
* **EMI & Affordability Calculators**: Tools for mortgage breakdowns and home purchase budgeting.
* **Admin Dashboard**: Gated panel for adding, modifying, and deleting listings with automated formatting previews.

---

## Environment Variables

Create a `.env` file in this directory with the following keys:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_ADMIN_PASSCODE=admin123
```

---

## Available Scripts

* **`npm run dev`**: Starts the Vite local development server.
* **`npm run build`**: Compiles the production build into the `/dist` folder.
* **`npm run preview`**: Previews the local production build.
