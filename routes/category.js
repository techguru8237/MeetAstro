const express = require('express');
require('dotenv').config();
const router = express.Router();

const Category = require('../models/category');

// Create New Category
router.post('/add', async (req, res) => {
  try {
    const categoryData = new Category(req.body);
    const newCategory = await categoryData.save();
    res.json(newCategory);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({
      message: 'Failed to create customer',
      error: error.message,
    });
  }
});

// Read All Categories
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Error creating customer:', error);
    res
      .status(400)
      .json({ message: 'Failed to create customer', error: error.message });
  }
});

// Update a Category
router.put('/update/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error creating customer:', error);
    res
      .status(400)
      .json({ message: 'Failed to create customer', error: error.message });
  }
});

// Delete a Category
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    res.json(deletedCategory);
  } catch (error) {
    console.error('Error creating customer:', error);
    res
      .status(400)
      .json({ message: 'Failed to create customer', error: error.message });
  }
});

// Add a Subcategory
router.put('/add-subcategory/:id', async (req, res) => {
  try {
    const { subCategory } = req.body;
    const categoryId = req.params.id;

    // Find the category by ID
    const category = await Category.findById(categoryId);

    // Check if the category exists
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if the subcategory already exists
    if (category.subCategories.includes(subCategory)) {
      return res.status(400).json({ message: 'Subcategory must be unique' });
    }

    // Add the new subcategory
    category.subCategories.push(subCategory);

    // Save the updated category
    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error adding subcategory:', error);
    res
      .status(400)
      .json({ message: 'Failed to add subcategory', error: error.message });
  }
});

// Update a Subcategory
router.put('/update-subcategory/:id', async (req, res) => {
  try {
    const { oldname, newname } = req.body;
    const category = await Category.findById(req.params.id); // Use req.params.id

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          subCategories: category.subCategories?.map((item) =>
            item === oldname ? newname : item
          ),
        },
      },
      { new: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res
      .status(400)
      .json({ message: 'Failed to update subcategory', error: error.message });
  }
});

// Delete a Subcategory
router.put('/delete-subcategory/:id', async (req, res) => {
  try {
    const { subCategory } = req.body;
    const category = await Category.findById(req.params.id); // Use req.params.id

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { subCategories: subCategory },
      },
      { new: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res
      .status(400)
      .json({ message: 'Failed to delete subcategory', error: error.message });
  }
});

module.exports = router;
