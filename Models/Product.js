const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true
  },
  productType: {
    type: String,
    required: true
  },
  formType: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  genericType: {
    type: String,
    required: true
  },
  packaging: {
    type: String,
    required: true
  },
  genericName: {
    type: String,
    required: true
  },
  category: {
    type: [String],
    default: []
  },
  composition: {
    type: [String],
    default: []
  },
  uses: {
    type: [String],
    default: []
  },
  highlights: {
    type: [String],
    default: []
  },
  image: {
    type: String
  }
});

module.exports = mongoose.model('Product', ProductSchema);
