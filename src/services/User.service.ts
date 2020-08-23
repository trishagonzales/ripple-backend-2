import fs from 'fs';
import UserModel from '../models/user.model';
import PostModel from '../models/post.model';
import { Mail } from '../utils/Mail';
import { HttpError } from '../utils/errorHandler';

export interface NewProfile {
  firstName: string;
  lastName: string;
  gender?: 'male' | 'female' | 'not specified';
  age?: number;
  bio?: string;
  location?: string;
}

export const profileProperties = '_id avatar firstName lastName gender age bio location';

export class UserService {
  public id: string;

  constructor(id: string) {
    this.id = id;
  }

  //  GET ALL PROFILES
  public static async getAllProfiles() {
    const users = await UserModel.find({}).select(profileProperties);
    return users;
  }

  //  GET A SINGLE PROFILE
  public static async getProfile(userID: string) {
    const user = await UserModel.findOne({ _id: userID }, profileProperties);
    if (!user) throw new HttpError('No user found.', 404);
    return user;
  }

  //  GET PROFILE PICTURE
  public static async getAvatar(userID: string) {
    const user = await UserModel.findOne({ _id: userID });
    if (!user) throw new HttpError('User not found.', 404);
    if (!user.avatar) throw new HttpError('No profile picture found.', 404);
    return user.avatar;
  }

  //  UPDATE PROFILE
  public async updateProfile(newProfile: NewProfile) {
    const { firstName, lastName, gender, age, bio, location } = newProfile;
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('No user found', 404);

    user.firstName = firstName;
    user.lastName = lastName;
    user.gender = gender;
    user.age = age;
    user.bio = bio;
    user.location = location;

    await user?.save();
    return newProfile;
  }

  //  UPDATE/UPLOAD AVATAR IMAGE
  public async uploadAvatar(filename: string) {
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('No user found', 404);

    const oldfile = user?.avatar;
    user.avatar = filename;
    await user.save();

    if (oldfile)
      fs.unlink(process.cwd() + '/tmp/' + oldfile, (err: any) => {
        if (err) throw err;
      });
  }

  //  GET USER / ACCOUNT DATA
  public async getAccountData() {
    const user = await UserModel.findOne({ _id: this.id }, '-password');
    return user;
  }

  //  SEND VALIDATE EMAIL LINK
  public async sendValidateEmailLink() {
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('User not found', 404);
    if (user.emailValidated) throw new HttpError('Email already validated', 400);
    const mail = new Mail(user.email);
    mail.createConfirmationHtml(user._id, 'Click the button below to validate email.', 'validate-email');
    await mail.send('Validate email');
    return;
  }

  //  VALIDATE EMAIL
  public async validateEmail() {
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('User not found', 404);
    if (user.emailValidated) throw new HttpError('Email is already validated', 400);
    user.emailValidated = true;
    await user.save();
  }

  //  UPDATE EMAIL
  public async updateEmail(newEmail: string) {
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('User not found', 404);
    user.email = newEmail;
    user.emailValidated = false;
    await user.save();
    return user.email;
  }

  //  VALIDATE PASSWORD
  public async validatePassword(password: string) {
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('No user found', 404);
    const isPassValid = await user.validatePassword(password);
    if (!isPassValid) throw new HttpError('Invalid password.', 400);
  }

  //  UPDATE PASSWORD
  public async updatePassword(newPassword: string) {
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('No user found', 404);
    const hashedPass = await UserModel.hashPassword(newPassword);
    user.password = hashedPass;
    await user.save();
  }

  //  DELETE ACCOUNT
  public async deleteAccount() {
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('User not found.', 404);

    if (user.avatar)
      fs.unlink(process.cwd() + '/tmp/' + user.avatar, (err) => {
        if (err) throw err;
      });

    await UserModel.deleteOne({ _id: this.id });
  }

  //  ADD USER TO LIKE LIST
  public async likePost(postID: string) {
    const post = await PostModel.findOne({ _id: postID });
    if (!post) throw new HttpError('Post not found.', 404);
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('User not found.', 404);

    //  User already liked this post
    if (post.likes.indexOf(user._id) !== -1) throw new HttpError('User already liked this post.', 400);

    //  User haven't liked this post yet
    user.likedPosts.push(post._id);
    post.likes.push(user._id);
    await user.save();
    await post.save();
  }

  //  REMOVE USER FROM LIKE LIST
  public async unlikePost(postID: string) {
    const post = await PostModel.findOne({ _id: postID });
    if (!post) throw new HttpError('No post found.', 404);
    const user = await UserModel.findById(this.id);
    if (!user) throw new HttpError('User not found.', 404);

    const userIndex = post.likes.indexOf(user._id);
    const postIndex = user.likedPosts.indexOf(post._id);
    //  User not on liked list
    if (userIndex === -1) throw new HttpError('User already unliked this post.', 400);
    //  User is on liked list
    user.likedPosts.splice(postIndex, 1);
    post.likes.splice(userIndex, 1);
    await user.save();
    await post.save();
  }
}
