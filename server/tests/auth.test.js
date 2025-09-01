import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../express.js';
import User from '../models/user.model.js';
import config from '../config/config.js';

describe('Authentication Tests', () => {
  let testUser;
  let authToken;

  before(async () => {
    // Connect to test database
    await mongoose.connect(config.mongoUri + '_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    // Clean up test database
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        telephone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('Veuillez vérifier votre e-mail');
      expect(response.body.activationToken).to.exist;
    });

    it('should not register user with existing email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).to.include('Cette adresse exist déjà');
    });

    it('should validate required fields', async () => {
      const userData = {
        firstName: 'John',
        // Missing lastName, email, password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).to.be.false;
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      testUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        telephone: '+1234567890'
      });
      await testUser.save();
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.token).to.exist;
      authToken = response.body.token;
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'john.doe@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).to.include('L\'e-mail et le mot de passe ne correspondent pas');
    });

    it('should not login with non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).to.include('Utilisateur introuvable');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Create and login user
      testUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
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

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.user.email).to.equal('john.doe@example.com');
      expect(response.body.user.password).to.be.undefined;
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).to.include('No token provided');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.message).to.include('Invalid token');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      testUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      });
      await testUser.save();
    });

    it('should send password reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'john.doe@example.com' })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.include('Veuillez vérifier votre adresse électronique');
    });

    it('should not send reset email for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(400);

      expect(response.body.message).to.include('aucun utilisateur trouvé');
    });
  });
});
