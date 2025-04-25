const mongoose = require('mongoose');

const StoreSettingsSchema = new mongoose.Schema({
  uahToRubRate: {
    type: Number,
    required: [true, 'Укажите курс гривны к рублю'],
    default: 2.5
  },
  defaultMarkup: {
    type: Number,
    required: [true, 'Укажите стандартную наценку в процентах'],
    default: 50
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StoreSettings', StoreSettingsSchema);