import req from 'supertest';
import _ from 'lodash';
import { Server } from 'http';
import UserModel from '../../models/user.model';
import { NewProfile } from '../../services/User.service';
import { createUser, generateUserData } from '../../test-utils/test-utils';
import { userData } from './user.test';

describe('/api/profiles', () => {
  let server: Server;
  const users = _.times(4, generateUserData);
  const baseUrl = '/api/profiles';

  beforeAll(async () => {
    const exports = await import('@root/index');
    server = exports.server;
  });
  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    await UserModel.insertMany(users);
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  describe('GET /', () => {
    it('return status 200 and all profiles', async () => {
      const res = await req(server).get(baseUrl);

      expect(res.status).toBe(200);
      users.forEach((user) => {
        expect(res.body).toEqual(
          expect.arrayContaining([expect.objectContaining(_.pick(user, ['_id firstName lastName']))])
        );
      });
    });
  });

  describe('GET /:id', () => {
    it('return status 200 and profile object', async () => {
      const user = await UserModel.findOne({ email: users[0].email });
      const res = await req(server).get(`${baseUrl}/${user?._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ ..._.pick(users[0], ['firstName', 'lastName']) });
    });
  });

  describe('PUT /', () => {
    it('return status 200 & new profile & user is updated in database', async () => {
      const newProfile: NewProfile = {
        firstName: 'New FirstName',
        lastName: 'New LastName',
        gender: 'female',
        age: 25,
        bio: 'New bio',
        location: 'New location',
      };
      const { user, authToken } = await createUser({ userData });
      const res = await req(server)
        .put(baseUrl + '/me')
        .set('x-auth-token', authToken)
        .send(newProfile);

      const updatedUser = await UserModel.findById(user.id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(newProfile);
      expect(updatedUser).toMatchObject(newProfile);
    });
  });
});
