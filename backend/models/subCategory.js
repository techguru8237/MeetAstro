const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const SubCategory = mongoose.model('SubCategory', SubCategorySchema);


module.exports = SubCategory;
