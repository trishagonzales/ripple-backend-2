import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../utils/config';

export interface User {
  email: string;
  emailValidated: boolean;
  password: string;
  likedPosts: mongoose.Schema.Types.ObjectId[];

  avatar?: string;
  firstName: string;
  lastName: string;
  gender?: 'male' | 'female' | 'not specified';
  age?: number;
  bio?: string;
  location?: string;
  createdAt: Date;
}

export interface UserDocument extends User, mongoose.Document {
  generateToken(): string;
  validatePassword(password: string): Promise<boolean>;
}

export interface UserModel extends mongoose.Model<UserDocument> {
  hashPassword(password: string): Promise<string>;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    minlength: 1,
    maxlength: 255,
    trim: true,
    unique: true,
    required: true,
  },
  emailValidated: { type: Boolean, default: false },
  password: {
    type: String,
    minlength: 1,
    maxlength: 255,
    trim: true,
    required: true,
  },
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],

  avatar: { type: String, maxlength: 500 },
  firstName: {
    type: String,
    minlength: 1,
    maxlength: 255,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    minlength: 1,
    maxlength: 255,
    trim: true,
    required: true,
  },
  gender: { type: String, enum: ['male', 'female', 'not specified'] },
  age: { type: Number, min: 1, max: 200 },
  bio: { type: String, minlength: 0, maxlength: 5000 },
  location: { type: String, minlength: 0, maxlength: 255 },
  createdAt: { type: Date, default: Date.now, required: true },
});

userSchema.methods.generateToken = function () {
  return jwt.sign({ userId: this._id }, config.JWT_KEY as string, { expiresIn: '100d' });
};

userSchema.methods.validatePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password: string) {
  return bcrypt.hash(password, await bcrypt.genSalt(10));
};

const UserModel: UserModel = mongoose.model<UserDocument, UserModel>('User', userSchema);

export default UserModel;
