import mongoose from 'mongoose';

export interface Post {
  title: string;
  body: string;
  author: mongoose.Schema.Types.ObjectId | string;
  image: string;
  dateCreated: Date;
  likes: mongoose.Schema.Types.ObjectId[];
}

export interface PostDocument extends Post, mongoose.Document {}
export interface PostModel extends mongoose.Model<PostDocument> {}

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    maxlength: 500,
    trim: true,
    required: true,
  },
  body: {
    type: String,
    minlength: 0,
    maxlength: 10000,
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, minlength: 0, maxlength: 500, default: '' },
  dateCreated: { type: Date, default: Date.now, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const PostModel: PostModel = mongoose.model<PostDocument, PostModel>('Post', postSchema);

export default PostModel;
