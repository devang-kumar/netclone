const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
    },
    preferences: {
      type: [String],
      default: []
    }
  },
  watchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series'
  }],
  watchHistory: [{
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series'
    },
    episode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Episode'
    },
    watchedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  subscription: {
    status: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    expiryDate: Date,
    planId: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
