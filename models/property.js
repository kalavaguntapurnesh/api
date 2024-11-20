const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    propertyType: {
      type: String,
    },
    addressLane: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {timestamps: true},
);

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
