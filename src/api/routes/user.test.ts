import req from 'supertest';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { Server } from 'http';
import UserModel from '../../models/user.model';
import { config } from '../../utils/config';
import { createUser, generateUserData } from '../../test-utils/test-utils';
// import { logger } from '../../utils/logger';

// const log = logger.extend('test');

export const userData = generateUserData();
export const dataWithoutPassword = _.pick(userData, ['firstName', 'lastName', 'email']);

describe('/api/users', () => {
  let server: Server;
  const baseUrl = '/api/users';

  beforeAll(async () => {
    const exports = await import('@root/index');
    server = exports.server;
  });
  afterAll(() => {
    server.close();
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  describe('POST /', () => {
    it('return status 400 if inputs are not provided/invalid', async () => {
      const res = await req(server).post(baseUrl);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/invalid input/i);
    });

    it('return status 400 if user is already registered', async () => {
      await createUser({ userData });
      const res = await req(server).post(baseUrl).set('Content-Type', 'application/json').send(userData);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/user already registered/i);
    });

    it('return status 201 & user data & is saved in database if valid inputs are provided', async () => {
      const res = await req(server).post(baseUrl).set('Content-Type', 'application/json').send(userData);
      const user = await UserModel.findById({ _id: res.body._id });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(dataWithoutPassword);
      expect(user).toBeDefined();
    });
  });

  describe('GET /me', () => {
    it('return status 200 and user data if user is logged on', async () => {
      const { authToken } = await createUser({ userData });
      const res = await req(server)
        .get(baseUrl + '/me')
        .set('x-auth-token', authToken);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(dataWithoutPassword);
    });
  });

  describe('GET /resend-validate-email-link', () => {
    const url = baseUrl + '/resend-validate-email-link';

    it('return status 400 if email is already validated', async () => {
      const { authToken } = await createUser({ userData, emailValidated: true });
      const res = await req(server).get(url).set('x-auth-token', authToken);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/email already validated/i);
    });

    it('return status 200 if user is logged on', async () => {
      const { authToken } = await createUser({ userData });
      const res = await req(server).get(url).set('x-auth-token', authToken);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /email/validate/:token', () => {
    const url = baseUrl + '/email/validate';

    it('return status 400 if url token is invalid', async () => {
      const { authToken } = await createUser({ userData });
      const res = await req(server).get(`${url}/invalid-token`).set('x-auth-token', authToken);

      expect(res.status).toBe(400);
    });

    it('return status 400 if email is already validated', async () => {
      const { user, authToken } = await createUser({ userData, emailValidated: true });
      const urlToken = jwt.sign({ userId: user._id }, config.JWT_KEY as string);
      const res = await req(server).get(`${url}/${urlToken}`).set('x-auth-token', authToken);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/already validated/i);
    });

    it('return status 200 and emailValidated is set to true if valid url token is provided', async () => {
      const { user, authToken } = await createUser({ userData });
      const urlToken = jwt.sign({ userId: user._id }, config.JWT_KEY as string);
      const res = await req(server).get(`${url}/${urlToken}`).set('x-auth-token', authToken);

      const updatedUser = await UserModel.findById(user._id);

      expect(res.status).toBe(200);
      expect(updatedUser?.emailValidated).toBe(true);
    });
  });

  describe('POST /password/validate', () => {
    const url = baseUrl + '/password/validate';

    it('return status 400 if password is invalid', async () => {
      const { authToken } = await createUser({ userData, hashPassword: true });
      const res = await req(server).post(url).send({ password: 'invalid' }).set('x-auth-token', authToken);

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/invalid password/i);
    });

    it('return status 200 if password is valid', async () => {
      const { authToken } = await createUser({ userData, hashPassword: true });
      const res = await req(server).post(url).send({ password: userData.password }).set('x-auth-token', authToken);

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /password/reset/:token', () => {
    const url = baseUrl + '/password/reset';

    it('return status 200 & password is updated in database if valid token is provided', async () => {
      const newPass = 'newPassword';
      const { user, authToken } = await createUser({ userData });
      const urlToken = jwt.sign({ userId: user._id }, config.JWT_KEY as string);
      const res = await req(server)
        .put(`${url}/${urlToken}`)
        .set('x-auth-token', authToken)
        .send({ password: newPass });

      const updatedUser = await UserModel.findById(user._id);

      expect(res.status).toBe(200);
      expect(await updatedUser?.validatePassword(newPass)).toBe(true);
    });
  });

  describe('PUT /update-email', () => {
    const url = baseUrl + '/email';

    it('return status 200 and new email if valid email is provided', async () => {
      const newEmail = 'newEmail@gmail.com';
      const { authToken } = await createUser({ userData });
      const res = await req(server).put(url).send({ email: newEmail }).set('x-auth-token', authToken);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', newEmail);
    });
  });

  describe('PUT /update-password', () => {
    const url = baseUrl + '/password';

    it('return status 200 & password is updated in database if input is provided', async () => {
      const newPass = 'newPassword';
      const { user, authToken } = await createUser({ userData });
      const res = await req(server).put(url).send({ password: newPass }).set('x-auth-token', authToken);

      const updatedUser = await UserModel.findById(user._id);

      expect(res.status).toBe(200);
      expect(await updatedUser?.validatePassword(newPass)).toBe(true);
    });
  });

  describe('DEL /me', () => {
    const url = baseUrl + '/me';

    it('return status 200 and user is deleted from database', async () => {
      const { user, authToken } = await createUser({ userData });
      const res = await req(server).delete(url).set('x-auth-token', authToken);

      const updatedUser = await UserModel.findById(user._id);

      expect(res.status).toBe(200);
      expect(updatedUser).toBeNull();
    });
  });
});
