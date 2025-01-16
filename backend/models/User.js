import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username / 请提供用户名'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters / 用户名至少3个字符'],
    maxlength: [20, 'Username cannot exceed 20 characters / 用户名最多20个字符']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email / 请提供邮箱'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email / 请提供有效的邮箱']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password / 请提供密码'],
    minlength: [6, 'Password must be at least 6 characters / 密码至少6个字符'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters / 个人简介最多500个字符']
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true
  },
  createdMusic: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Music'
  }],
  favorites: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Music'
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 比较密码
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 更新最后登录时间
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = Date.now();
  await this.save();
};

const User = mongoose.model('User', userSchema);

export { User }; 