const express = require('express');
const router = express.Router();
const Payment = require('../models/payment'); // Adjust the import according to your project structure
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payment');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Create a Payment
router.post(
  '/create',
  upload.fields([{ name: 'files', maxCount: 10 }]),
  async (req, res) => {
    try {
      const newPayment = new Payment({
        ...req.body,
      });
      // Update secondary photos if provided
      if (req.files.files && req.files.files.length > 0) {
        const newAttachments = req.files.files?.map((file) => ({
          name: file.originalname, // File name
          size: file.size, // File size in bytes
          url: file.path.replace(/^uploads/, ''), // File link
        }));

        // Combine existing attachments with new ones
        newPayment.attachments = [
          ...(newPayment.attachments || []),
          ...newAttachments,
        ];
      }

      // Save a new payment
      const savedPayment = await newPayment.save();

      // Populate the saved payment
      const populatedPayment = await Payment.findById(savedPayment._id)
        .populate({
          path: 'client',
        })
        .populate({
          path: 'reservation',
        });

      // Return the populated payment
      res.status(201).json({
        message: 'Payment saved successfully',
        payment: populatedPayment,
      });
    } catch (error) {
      console.error('Error creating payment: ', error);

      // Respond with a 500 status code and an error message
      res
        .status(500)
        .json({ message: 'Server error, please try again later.' });
    }
  }
);

// Read all Payments
router.get('/all', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'client',
      })
      .populate({
        path: 'reservation',
      });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch payments', error: error.message });
  }
});

// Update a Payment
router.put(
  '/update/:id',
  upload.fields([{ name: 'newFiles', maxCount: 10 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      // Initialize attachments
      if (req.files.newFiles && req.files.newFiles.length > 0) {
        const newAttachments = req.files.newFiles?.map((file) => ({
          name: file.originalname, // File name
          size: file.size, // File size in bytes
          url: file.path.replace(/^uploads/, ''), // File link
        }));

        // Combine existing attachments with new ones
        updatedData.attachments = [
          ...(updatedData.attachments || []),
          ...newAttachments,
        ];
      } else {
        updatedData.attachments = [...(updatedData.attachments || [])];
      }

      // Find and update the payment
      const updatedPayment = await Payment.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true, // Ensure validators are run for the update
      })
        .populate('client')
        .populate('reservation');

      // Check if payment was found and updated
      if (!updatedPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Return the populated payment
      res.status(200).json({
        message: 'Payment updated successfully',
        payment: updatedPayment,
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      res
        .status(500)
        .json({ message: 'Failed to update payment', error: error.message });
    }
  }
);

// Get Payment by ID
router.get('/get-by-id/:id', async (req, res) => {
  try {
    const payments = await Payment.findById(req.params.id)
      .populate({
        path: 'customer',
      })
      .populate({
        path: 'order',
        populate: {
          path: 'details.product', // Populate the product field within order.details
        },
      });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch payments', error: error.message });
  }
});

// Delete a Payment
router.delete('/:id', async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch payments', error: error.message });
  }
});

module.exports = router;
