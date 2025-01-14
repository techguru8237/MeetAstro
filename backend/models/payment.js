const mongoose = require('mongoose');
const { Schema } = mongoose; // Import Schema and Types
const ObjectId = mongoose.Schema.Types.ObjectId;

const PaymentSchema = new Schema(
  {
    client: { type: ObjectId, ref: 'Customer', required: true },
    reservation: { type: ObjectId, ref: 'Reservation', required: true },
    paymentDate: { type: Date },
    amount: { type: Number },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Check'],
    },
    paymentType: {
      type: String,
      enum: ['Advance', 'Security', 'Final', 'Other'],
    },
    reference: {
      type: String,
    },
    note: {
      type: String,
    },
    attachments: [
      {
        name: {
          type: String,
        },
        size: {
          type: Number,
        },
        url: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
