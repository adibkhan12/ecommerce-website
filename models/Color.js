const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.models.Color || mongoose.model('Color', ColorSchema);
