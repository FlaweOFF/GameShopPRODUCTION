const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  backgroundImageUrl: {
    type: String,
    default: ''
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please add an original price']
  },
  discountPrice: {
    type: Number,
    default: null
  },
  discountPercentage: {
    type: String,
    default: ''
  },
  discountEndDate: {
    type: String,
    default: ''
  },
  fullDescription: {
    type: String,
    required: [true, 'Please add a full description']
  },
  shortDescription: {
    type: String,
    default: ''
  },
  genres: {
    type: [String],
    default: []
  },
  releaseDate: {
    type: String,
    default: ''
  },
  releaseYear: {
    type: String,
    default: ''
  },
  platformSupport: {
    type: String,
    default: ''
  },
  sku: {
    type: String,
    default: ''
  },
  voicePS5: {
    type: String,
    default: ''
  },
  voicePS4: {
    type: String,
    default: ''
  },
  subtitlesPS5: {
    type: String,
    default: ''
  },
  subtitlesPS4: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isWeeklyDiscount: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  editions: [{
    name: {
      type: String,
      required: true
    },
    originalPrice: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number,
      default: null
    },
    discountPercentage: {
      type: String,
      default: ''
    }
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', GameSchema);