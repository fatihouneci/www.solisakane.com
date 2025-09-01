import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../express.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import config from '../config/config.js';

describe('Chat and Messaging Tests', () => {
  let user1, user2;
  let authToken1, authToken2;
  let chat;

  before(async () => {
    await mongoose.connect(config.mongoUri + '_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    
    // Create test users
    user1 = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
    await user1.save();

    user2 = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123'
    });
    await user2.save();

    // Login users
    const login1 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      });
    authToken1 = login1.body.token;

    const login2 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane.smith@example.com',
        password: 'password123'
      });
    authToken2 = login2.body.token;

    // Create test chat
    chat = new Chat({
      users: [user1._id, user2._id],
      isGroupChat: false,
      owner: user1._id
    });
    await chat.save();
  });

  describe('Chat Creation', () => {
    it('should create a new chat between two users', async () => {
      const chatData = {
        users: [user1._id, user2._id],
        isGroupChat: false
      };

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(chatData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.chat.users).to.include(user1._id.toString());
      expect(response.body.chat.users).to.include(user2._id.toString());
      expect(response.body.chat.isGroupChat).to.be.false;
    });

    it('should create a group chat', async () => {
      const user3 = new User({
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        password: 'password123'
      });
      await user3.save();

      const chatData = {
        users: [user1._id, user2._id, user3._id],
        isGroupChat: true,
        chatName: 'Test Group'
      };

      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(chatData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.chat.isGroupChat).to.be.true;
      expect(response.body.chat.chatName).to.equal('Test Group');
      expect(response.body.chat.users.length).to.equal(3);
    });
  });

  describe('Message Sending', () => {
    it('should send a text message', async () => {
      const messageData = {
        chat: chat._id,
        content: 'Hello, this is a test message!',
        type: 'text'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.message.content).to.equal('Hello, this is a test message!');
      expect(response.body.message.sender).to.equal(user1._id.toString());
      expect(response.body.message.chat).to.equal(chat._id.toString());
    });

    it('should send a message with file attachment', async () => {
      const file = new mongoose.Schema.Types.ObjectId();
      
      const messageData = {
        chat: chat._id,
        content: 'Check out this file!',
        type: 'file',
        file: file
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.message.type).to.equal('file');
      expect(response.body.message.file).to.equal(file.toString());
    });

    it('should not send message to chat user is not part of', async () => {
      const user3 = new User({
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        password: 'password123'
      });
      await user3.save();

      const login3 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'bob.johnson@example.com',
          password: 'password123'
        });
      const authToken3 = login3.body.token;

      const messageData = {
        chat: chat._id,
        content: 'This should not work!',
        type: 'text'
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken3}`)
        .send(messageData)
        .expect(403);

      expect(response.body.message).to.include('not authorized');
    });
  });

  describe('Message Retrieval', () => {
    beforeEach(async () => {
      // Create test messages
      const messages = [
        {
          chat: chat._id,
          content: 'First message',
          sender: user1._id,
          type: 'text'
        },
        {
          chat: chat._id,
          content: 'Second message',
          sender: user2._id,
          type: 'text'
        },
        {
          chat: chat._id,
          content: 'Third message',
          sender: user1._id,
          type: 'text'
        }
      ];

      for (const messageData of messages) {
        const message = new Message(messageData);
        await message.save();
      }
    });

    it('should get messages for a chat', async () => {
      const response = await request(app)
        .get(`/api/messages/${chat._id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.messages).to.be.an('array');
      expect(response.body.messages.length).to.equal(3);
      expect(response.body.messages[0].content).to.equal('First message');
    });

    it('should paginate messages', async () => {
      const response = await request(app)
        .get(`/api/messages/${chat._id}?page=1&limit=2`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.messages.length).to.equal(2);
      expect(response.body.pagination.page).to.equal(1);
      expect(response.body.pagination.limit).to.equal(2);
    });
  });

  describe('Message Reactions', () => {
    let message;

    beforeEach(async () => {
      message = new Message({
        chat: chat._id,
        content: 'Test message for reactions',
        sender: user1._id,
        type: 'text'
      });
      await message.save();
    });

    it('should add reaction to message', async () => {
      const response = await request(app)
        .post(`/api/messages/${message._id}/react`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({ reaction: '👍' })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message.likes).to.include(user2._id.toString());
    });

    it('should remove reaction from message', async () => {
      // First add reaction
      await request(app)
        .post(`/api/messages/${message._id}/react`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({ reaction: '👍' });

      // Then remove it
      const response = await request(app)
        .delete(`/api/messages/${message._id}/react`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message.likes).to.not.include(user2._id.toString());
    });
  });
});
