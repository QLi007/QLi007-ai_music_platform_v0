import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../../domain/user';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  roles: UserRole[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    roles: {
      type: [String],
      required: true,
      default: ['user'],
      enum: ['user', 'admin'],
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 索引
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ roles: 1 });

// 静态方法
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username });
};

userSchema.statics.findByRole = function(role: string) {
  return this.find({ roles: role });
};

export const UserModel = model<IUser>('User', userSchema); 