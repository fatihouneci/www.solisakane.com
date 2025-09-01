import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../express.js';
import User from '../models/user.model.js';
import config from '../config/config.js';

describe('User Management Tests', () => {
  let testUser;
  let authToken;

  before(async () => {
    await mongoose.connect(config.mongoUri + '_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    
    // Create and login test user
    testUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      telephone: '+1234567890'
    });
    await testUser.save();

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  describe('GET /api/users', () => {
    it('should get list of users', async () => {
      // Create additional users
      const user2 = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123'
      });
      await user2.save();

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data.length).to.be.at.least(1);
      expect(response.body.page).to.equal(1);
      expect(response.body.pages).to.be.a('number');
    });

    it('should not get users without authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.message).to.include('No token provided');
    });
  });

  describe('GET /api/users/search', () => {
    beforeEach(async () => {
      // Create additional users for search tests
      const users = [
        {
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
          password: 'password123'
        },
        {
          firstName: 'Bob',
          lastName: 'Williams',
          email: 'bob.williams@example.com',
          password: 'password123'
        },
        {
          firstName: 'Charlie',
          lastName: 'Brown',
          email: 'charlie.brown@example.com',
          password: 'password123'
        }
      ];

      for (const userData of users) {
        const user = new User(userData);
        await user.save();
      }
    });

    it('should search users by name', async () => {
      const response = await request(app)
        .get('/api/users/search?search=Alice')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data.length).to.be.at.least(1);
      expect(response.body.data[0].fullName).to.include('Alice');
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app)
        .get('/api/users/search?search=NonExistentUser')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data.length).to.equal(0);
    });

    it('should exclude specified users', async () => {
      const user2 = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123'
      });
      await user2.save();

      const response = await request(app)
        .get(`/api/users/search?exclude=${user2._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      
      const foundUser = response.body.data.find(user => user._id === user2._id.toString());
      expect(foundUser).to.be.undefined;
    });
  });

  describe('PUT /api/users/:userId', () => {
    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Johnny',
        lastName: 'Doe',
        telephone: '+0987654321'
      };

      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('Modification éffectuée');
      expect(response.body.user.firstName).to.equal('Johnny');
      expect(response.body.user.telephone).to.equal('+0987654321');
    });

    it('should not update other user\'s profile', async () => {
      const otherUser = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123'
      });
      await otherUser.save();

      const updateData = {
        firstName: 'Hacked'
      };

      const response = await request(app)
        .put(`/api/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).to.include('User is not authorized');
    });
  });

  describe('GET /api/users/:userId', () => {
    it('should get user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data._id).to.equal(testUser._id.toString());
      expect(response.body.data.password).to.be.undefined;
    });

    it('should return 400 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(400);

      expect(response.body.message).to.include('User not found');
    });
  });
});
