const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '音乐标题是必需的'],
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipfsHash: {
    type: String,
    required: true,
    unique: true
  },
  genre: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  plays: {
    type: Number,
    default: 0
  },
  rewards: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'private'],
    default: 'published'
  }
}, {
  timestamps: true
});

// 添加播放次数
musicSchema.methods.addPlay = function() {
  this.plays += 1;
  return this.save();
};

// 添加分享次数
musicSchema.methods.addShare = function() {
  this.shares += 1;
  return this.save();
};

// 添加奖励
musicSchema.methods.addReward = function(amount) {
  this.rewards += amount;
  return this.save();
};

const Music = mongoose.model('Music', musicSchema);

module.exports = Music; 