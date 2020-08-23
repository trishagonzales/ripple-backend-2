import _ from 'lodash';
import faker from 'faker';
import UserModel from '../models/user.model';
import PostModel from '../models/post.model';
import { authorProperties, postProperties } from '../services/Post.service';

export interface CreateUserParams {
  userData: UserData;
  hashPassword?: boolean;
  emailValidated?: boolean;
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function createUser({ userData, hashPassword = false, emailValidated = false }: CreateUserParams) {
  const user = new UserModel({
    ...userData,
    password: hashPassword ? await UserModel.hashPassword(userData.password) : userData.password,
    emailValidated,
  });
  await user.save();

  return {
    user,
    authToken: user.generateToken(),
  };
}

export interface PostData {
  title: string;
  body: string;
  author: string;
}

export async function createPost(postData: PostData, author: string) {
  const post = new PostModel({ ...postData, author });
  await post.save();
  return await PostModel.findById(post._id).populate('author', authorProperties).select(postProperties);
}

export function generateUserData(): UserData {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
}

export function generateProfileData() {
  return {
    firstName: faker.name.firstName,
    lastName: faker.name.lastName,
    gender: 'female',
    age: _.random(120),
    bio: faker.lorem.paragraph,
    location: faker.address.city,
  };
}

export function generatePostData() {
  return {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(3),
    author: '',
  };
}
