import req from 'supertest';
import _ from 'lodash';
import faker from 'faker';
import { Server } from 'http';
import UserModel, { UserDocument } from '@models/user.model';
import PostModel, { PostDocument } from '@models/post.model';
import { createUser, generateUserData, generatePostData } from '@test-utils/test-utils';
// import { authorProperties, postProperties } from '../../services/Post.service';
// import { logger } from '../../utils/logger';

// const log = logger.extend('post-test');

describe('/api/posts', () => {
  let server: Server;
  let user: UserDocument;
  let authToken: string;
  let posts: PostDocument[];
  const numberOfPosts = 3;
  const baseUrl = '/api/posts';

  beforeAll(async () => {
    const exports = await import('@root/index');
    server = exports.server;
  });
  afterAll(() => {
    server.close();
  });

  beforeEach(async (done) => {
    const newUser = await createUser({ userData: generateUserData() });
    user = newUser.user;
    authToken = newUser.authToken;
    const postsData = _.times(numberOfPosts, generatePostData);
    postsData.forEach((post) => (post.author = user._id));
    posts = await PostModel.insertMany(postsData);
    done();
  });
  afterEach(async (done) => {
    await UserModel.deleteMany({});
    await PostModel.deleteMany({});
    posts = [];
    done();
  });

  describe('GET /', () => {
    it('return status 200 and all saved posts when a user is logged on', async () => {
      const res = await req(server).get(baseUrl).set('x-auth-token', authToken);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(numberOfPosts);
    });
  });

  describe('GET /:id', () => {
    it('return status 200', async () => {
      const post = posts[0];
      const res = await req(server).get(`${baseUrl}/${post?._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', post._id.toString());
      expect(res.body).toHaveProperty('title', post.title);
      expect(res.body).toHaveProperty('body', post.body);
    });
  });

  describe('GET /user/:id', () => {
    const url = baseUrl + '/user';

    it('return status 200 and all posts from one user', async () => {
      const res = await req(server).get(`${url}/${user._id}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /liked', () => {
    it('return status 200', async () => {
      const res = await req(server)
        .get(baseUrl + '/liked')
        .set('x-auth-token', authToken);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /', () => {
    it('return status 200', async () => {
      const res = await req(server)
        .post(baseUrl)
        .set('x-auth-token', authToken)
        .send({ title: 'New title', body: 'New text' });

      const post = await PostModel.findById(res.body._id);

      expect(res.status).toBe(201);
      expect(post).toBeDefined();
    });
  });

  describe('PUT /:id', () => {
    it('return status 200', async () => {
      const post = posts[0];
      const newPost = { title: faker.lorem.sentence(), body: faker.lorem.paragraphs(3) };
      const res = await req(server).put(`${baseUrl}/${post._id}`).set('x-auth-token', authToken).send(newPost);

      const updatedPost = await PostModel.findById(post._id);

      expect(res.status).toBe(200);
      expect(updatedPost).toMatchObject(newPost);
    });
  });

  describe('DEL /:id', () => {
    it('return status 200', async () => {
      const post = posts[0];
      const res = await req(server).delete(`${baseUrl}/${post._id}`).set('x-auth-token', authToken);

      const deletedPost = await PostModel.findById(post._id);

      expect(res.status).toBe(200);
      expect(deletedPost).toBeNull();
    });
  });

  describe('PUT /:id/like', () => {
    it('return status 200', async () => {
      const post = posts[0];
      const url = `${baseUrl}/${post._id}/like`;
      const { authToken } = await createUser({
        userData: {
          firstName: 'firstname',
          lastName: 'lastname',
          email: 'email@gmail.com',
          password: 'password',
        },
      });
      const res = await req(server).put(url).set('x-auth-token', authToken);

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /:id/unlike', () => {
    it('return status 200', async () => {
      const post = posts[0];
      const url = `${baseUrl}/${post._id}/unlike`;
      const { user, authToken } = await createUser({
        userData: {
          firstName: 'firstname',
          lastName: 'lastname',
          email: 'email@gmail.com',
          password: 'password',
        },
      });
      const queriedPost = await PostModel.findById(post._id);
      queriedPost?.likes.push(user._id);
      await queriedPost?.save();
      const res = await req(server).put(url).set('x-auth-token', authToken);

      expect(res.status).toBe(200);
    });
  });
});
