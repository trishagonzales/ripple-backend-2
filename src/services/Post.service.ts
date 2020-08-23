import fs from 'fs';
import _ from 'lodash';
import mongoose from 'mongoose';
import UserModel from '../models/user.model';
import PostModel from '../models/post.model';
import { HttpError } from '../utils/errorHandler';
// import { logger } from '../utils/logger';

// const log = logger.extend('post-service');

export const postProperties = '_id title body author image dateCreated likes';
export const authorProperties = '_id avatar firstName lastName';

export class PostService {
  //  GET FEED / ALL POSTS FROM DATABASE
  public static async getAllPosts() {
    const posts = await PostModel.find({}).populate('author', authorProperties).select(postProperties);
    return posts;
  }

  //  GET ALL POSTS FROM ONE USER
  public static async getUserPosts(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new HttpError('User not found.', 404);

    const posts = await PostModel.find({ author: userId }).populate('author', authorProperties).select(postProperties);
    return posts;
  }

  //  GET ALL LIKED POSTS
  public static async getLikedPosts(userID: string) {
    const user = await UserModel.findById(userID).populate('likedPosts');
    if (!user) throw new HttpError('User not found.', 404);

    const posts = await PostModel.find({ _id: { $in: user.likedPosts } })
      .populate('author', authorProperties)
      .select(postProperties);
    return posts;
  }

  //  GET A SINGLE POST
  public static async getOnePost(postID: string) {
    const post = await PostModel.findById(postID).populate('author', authorProperties).select(postProperties);
    if (!post) throw new HttpError('Post not found.', 404);

    return post;
  }

  //  CREATE NEW POST
  public static async createNewPost(input: { title: string; body: string }, authorID: string) {
    const newPost = new PostModel({
      title: input.title,
      body: input.body,
      author: authorID,
    });
    return this.filterPostProperties(await newPost.save());
  }

  //  UPDATE POST
  public static async updatePost(newPost: { title: string; body: string }, postID: string, userId: string) {
    const post = await PostModel.findById(postID);
    if (!post) throw new HttpError('Post not found.', 404);

    //  Validate if user owns the post
    if (JSON.stringify(post.author) != JSON.stringify(userId)) throw new HttpError('Access denied.', 401);

    post.title = newPost.title;
    post.body = newPost.body;

    return this.filterPostProperties(await post.save());
  }

  //  DELETE POST
  public static async deletePost(postID: string) {
    const post = await PostModel.findById(postID);
    if (!post) throw new HttpError('Post not found.', 404);
    const deletedPost = await PostModel.findByIdAndDelete(postID);

    if (post.image)
      fs.unlink(process.cwd() + '/tmp/' + post.image, (err) => {
        if (err) throw err;
      });

    return deletedPost;
  }

  //  GET POST IMAGE
  public static async getImage(postID: string) {
    const post = await PostModel.findOne({ _id: postID });
    if (!post) throw new HttpError('No post found', 404);
    if (!post.image) throw new HttpError('No image found for this post.', 404);

    return post.image;
  }

  //  VALIDATE IMAGE BEING UPLOADED
  public static async validateImageUpload(postID: string, userId: string) {
    const post = await PostModel.findById(postID);
    if (!post) throw new HttpError('Post not found', 404);
    //  Validate if user owns the post
    if (JSON.stringify(post.author) != JSON.stringify(userId)) throw new HttpError('Access denied.', 401);
  }

  //  UPLOAD/UPDATE IMAGE
  public static async uploadImage(filename: string, postID: string) {
    const post = await PostModel.findById(postID);
    if (!post) throw new HttpError('Post not found', 404);
    const oldfile = post.image;

    post.image = filename;
    await post.save();

    if (oldfile)
      fs.unlink(process.cwd() + '/tmp/' + oldfile, (err) => {
        if (err) throw err;
      });

    return post.image;
  }

  public static filterPostProperties(document: mongoose.Document) {
    return _.pick(document, postProperties.split(' '));
  }
}
