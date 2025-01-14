const mongoose = require('mongoose');
// Define the schema for your model
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Name is required
    },
    primaryPhoto: {
      type: String, // URL or path to the primary photo
      required: true,
    },
    secondaryImages: [
      {
        type: String, // Array of URLs or paths for secondary photos
      },
    ],
    videoUrls: [
      {
        type: String, // Array of video URLs or paths
      },
    ],
    rentalCost: {
      type: Number,
      required: true, // Rental cost is required
    },
    buyCost: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    subCategory: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the model from the schema
const Product = mongoose.model('Product', ProductSchema);

// Export the model
module.exports = Product;
