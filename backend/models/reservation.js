const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Partially Paid', 'Not Paid'],
      default: 'Pending',
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    pickupDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    availabilityDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Draft', 'Confirmed', 'Cancelled'], // Example statuses
      default: 'Draft',
    },
    additionalCost: {
      type: Number,
      default: 0,
    },
    travelCost: {
      type: Number,
      default: 0,
    },
    securityDepositPercentage: {
      type: Number,
      default: 30,
    },
    advancePercentage: {
      type: Number,
      default: 50,
    },
    total: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      required: false,
    },
    bufferAfter: {
      type: Number,
    },
    bufferBefore: {
      type: Number,
    },
    availability: {
      type: Number,
    },
  },
  {
    timestamps: true, // This option will add createdAt and updatedAt fields
  }
);

// Create the model
const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
