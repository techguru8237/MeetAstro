const express = require('express');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const Customer = require('../models/customer');
const router = express.Router();

// Storage to save attachements
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the folder based on file type
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
      cb(null, 'uploads/customers/images'); // Image files
    } else {
      cb(null, 'uploads/customers/documents'); // Document files
    }
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Create a new customer
router.post('/create', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();

    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res
      .status(400)
      .json({ message: 'Failed to create customer', error: error.message });
  }
});

// Read All Customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch customers', error: error.message });
  }
});

// Update a customer
router.put(
  '/update/:id',
  upload.fields([{ name: 'newFiles', maxCount: 10 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      // Update secondary photos if provided
      if (req.files.newFiles && req.files.newFiles.length > 0) {
        const newAttachments = req.files.newFiles?.map((file) => ({
          name: file.originalname, // File name
          size: file.size, // File size in bytes
          link: file.path.replace(/^uploads/, ''), // File link
        }));

        // Combine existing attachments with new ones
        updatedData.attachments = [
          ...(updatedData.attachments || []),
          ...newAttachments,
        ];
      } else {
        updatedData.attachments = [...(updatedData.attachments || [])];
      }

      // Update the customer with the new data
      const updatedCustomer = await Customer.findByIdAndUpdate(
        id,
        updatedData,
        {
          new: true,
          runValidators: true, // Ensure validators are run for the update
        }
      );

      res.json(updatedCustomer);
    } catch (error) {
      console.error('Error updating customer:', error);
      res
        .status(400)
        .json({ message: 'Failed to update customer', error: error.message });
    }
  }
);

// Get a customer by ID
router.get('/one', async (req, res) => {
  try {
    const customer = await Customer.findById(req.query.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch customer', error: error.message });
  }
});

// Delete a customer
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({
      message: 'Customer deleted successfully',
      customer: deletedCustomer,
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res
      .status(500)
      .json({ message: 'Failed to delete customer', error: error.message });
  }
});

module.exports = router;
