const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  banner: {
    type: String
  },
  trailer: {
    url: String,
    publicId: String
  },
  genre: [{
    type: String,
    required: true
  }],
  cast: [{
    name: String,
    role: String,
    image: String
  }],
  director: String,
  releaseYear: Number,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  totalEpisodes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  categories: [{
    type: String,
    enum: ['top-picks', 'recommended', 'new-releases', 'upcoming'],
    default: []
  }],
  browseCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster category and sorting queries
seriesSchema.index({ categories: 1, isPublished: 1 });
seriesSchema.index({ browseCategories: 1, isPublished: 1 });
seriesSchema.index({ views: -1 });
seriesSchema.index({ rating: -1 });
seriesSchema.index({ createdAt: -1 });
seriesSchema.index({ title: 'text' }); // For search functionality

module.exports = mongoose.model('Series', seriesSchema);
