import req from 'supertest';
import _ from 'lodash';
import faker from 'faker';
import { Server } from 'http';
import UserModel from '../../models/user.model';
import { createUser } from '../../test-utils/test-utils';

let server: Server;

describe('/api/auth', () => {
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

  const userData = {
    firstName: 'Firstname',
    lastName: 'Lastname',
    email: 'test@gmail.com',
    password: 'password',
  };

  describe('POST /', () => {
    const url = '/api/auth';

    it('return status 400 if credentials are invalid', async () => {
      await createUser({ userData, hashPassword: true });
      const res = await req(server)
        .post(url)
        .send({ email: faker.internet.email(), password: faker.random.alphaNumeric(10) });

      expect(res.status).toBe(400);
    });

    it('return status 200 & auth token if credentials are valid', async () => {
      await createUser({ userData, hashPassword: true });
      const loginInput = _.pick(userData, ['email', 'password']);
      const res = await req(server).post(url).send(loginInput);

      expect(res.status).toBe(200);
      expect(res.get('x-auth-token')).toBeTruthy();
    });
  });

  // describe('POST /forgot-password', () => {});
});
