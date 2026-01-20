import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index.js';
import User from '../models/User.js';

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shukra_living_test';

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication', () => {
  describe('POST /api/auth/create-account', () => {
    it('should create a new user account', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '9876543210'
      };

      const response = await request(app)
        .post('/api/auth/create-account')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Account created successfully');
      expect(response.body.tempToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '9876543210'
      };

      const response = await request(app)
        .post('/api/auth/create-account')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    let user;
    
    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        userId: 'testuser123',
        password: 'password123',
        isVerified: true
      });
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userId: 'testuser123',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('john.doe@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userId: 'testuser123',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});