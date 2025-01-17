import { Schema, model, Document, Model } from 'mongoose';
import { UserRole } from '../../domain/user';

export interface IUser {
  email: string;
  password: string;
  username: string;
  roles: UserRole[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  findByRole(role: string): Promise<IUser[]>;
}

const userRoles = [UserRole.USER, UserRole.ADMIN];

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roles: {
      type: [String],
      required: true,
      enum: userRoles,
      default: [UserRole.USER],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};

userSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username });
};

userSchema.statics.findByRole = function(role: string) {
  return this.find({ roles: role });
};

export const UserModel = model<IUser, IUserModel>('User', userSchema); 