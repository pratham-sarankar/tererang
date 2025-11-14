# Tere Rang Admin Panel

Admin panel for managing products in the Tere Rang e-commerce platform.

## Features

- View all products in a table format
- Add new products with detailed information
- Edit existing products
- Delete products
- Search and filter products
- Manage product images, sizes, and highlights
- MongoDB integration for data persistence

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + MongoDB + Mongoose
- **UI Components**: Lucide React icons
- **HTTP Client**: Axios

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Installation

1. Navigate to the admin directory:
   ```bash
   cd admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the admin directory with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tererang-admin
   NODE_ENV=development
   ```

4. Configure frontend API URL:
   Create a `.env.local` file in the admin directory with:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

2. (Optional) Seed the database with sample products:
   ```bash
   npm run seed
   ```

3. Start the backend server:
   ```bash
   npm run server:dev
   ```
   The server will run on http://localhost:5000

4. In a new terminal, start the frontend development server:
   ```bash
   npm run dev
   ```
   The admin panel will be available at http://localhost:5173

## Product Schema

Products in the database have the following structure:

```javascript
{
  title: String,           // Product name
  description: String,     // Product description
  brand: String,          // Brand name (default: "Tere Rang")
  oldPrice: String,       // Original price (e.g., "₹5,999")
  newPrice: String,       // Discounted price (e.g., "₹4,299")
  image: String,          // Main product image URL
  additionalImages: [String], // Array of additional image URLs
  sizes: [String],        // Available sizes (e.g., ["S", "M", "L", "XL"])
  heightOptions: [String], // Height options (e.g., ["Up to 5'3''", "5'4''-5'6''"])
  highlights: [{          // Product highlights
    icon: String,         // Icon name (e.g., "Zap", "Gift", "Ruler")
    text: String          // Highlight text
  }],
  category: String        // Product category (default: "general")
}
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Usage

### Adding a Product

1. Click the "Add Product" button
2. Fill in all required fields (marked with *)
3. Add sizes, height options, and highlights using the + buttons
4. Click "Create Product" to save

### Editing a Product

1. Click the edit icon next to any product in the list
2. Modify the fields as needed
3. Click "Update Product" to save changes

### Deleting a Product

1. Click the delete icon next to any product
2. Confirm the deletion in the popup dialog

## Project Structure

```
admin/
├── server/              # Backend server
│   ├── config/         # Database configuration
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── seed.js         # Database seeding script
├── src/                # Frontend source
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── utils/          # Utility functions
├── .env                # Backend environment variables
├── .env.local          # Frontend environment variables
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start the frontend development server with hot reload
- `npm run server` - Start the backend server
- `npm run server:dev` - Start the backend server with auto-restart
- `npm run seed` - Seed the database with sample products
- `npm run lint` - Check for code issues
- `npm run build` - Build the frontend for production

## Notes

- Make sure MongoDB is running before starting the backend server
- The admin panel uses Tailwind CSS for styling
- All images are referenced by URL (no file upload functionality yet)
