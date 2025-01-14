// models/Customer.js
const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // File name
  size: { type: Number, required: true }, // File size in bytes
  link: { type: String, required: true }, // File link
});

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    idNumber: { type: String, required: true },
    phone: { type: String, required: true },
    weddingCity: { type: String, required: true },
    whatsapp: { type: String },
    weddingDate: { type: String },
    weddingTime: { type: String },
    weddingLocation: { type: String },
    type: { type: String, enum: ['Client', 'Prospect'], default: 'Client' },
    attachments: [AttachmentSchema], // Use the new AttachmentSchema
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
