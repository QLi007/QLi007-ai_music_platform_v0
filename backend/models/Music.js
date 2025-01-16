import mongoose from 'mongoose';

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a music title / 请提供音乐标题'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters / 标题不能超过100个字符']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters / 描述不能超过500个字符']
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Music must have a creator / 音乐必须有创作者']
  },
  coverImage: {
    type: String,
    default: 'default-music-cover.jpg'
  },
  audioFile: {
    type: String,
    required: [true, 'Please upload an audio file / 请上传音频文件']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide music duration / 请提供音乐时长']
  },
  genre: {
    type: String,
    required: [true, 'Please select a music genre / 请选择音乐类型'],
    enum: ['classical', 'jazz', 'rock', 'pop', 'electronic', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  stats: {
    plays: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// 索引
musicSchema.index({ title: 'text', description: 'text' });
musicSchema.index({ creator: 1, createdAt: -1 });
musicSchema.index({ genre: 1 });

const Music = mongoose.model('Music', musicSchema);

export { Music }; 