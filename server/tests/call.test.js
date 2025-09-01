import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../express.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import Call from '../models/call.model.js';
import config from '../config/config.js';

describe('Call Management Tests', () => {
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
    await Call.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Call.deleteMany({});
    
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

  describe('Call Initiation', () => {
    it('should initiate an audio call', async () => {
      const callData = {
        chatId: chat._id,
        callType: 'audio',
        recipientId: user2._id
      };

      const response = await request(app)
        .post('/api/calls/initiate')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(callData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.call.callType).to.equal('audio');
      expect(response.body.call.callerId).to.equal(user1._id.toString());
      expect(response.body.call.status).to.equal('initiated');
      expect(response.body.call.callId).to.exist;
    });

    it('should initiate a video call', async () => {
      const callData = {
        chatId: chat._id,
        callType: 'video',
        recipientId: user2._id
      };

      const response = await request(app)
        .post('/api/calls/initiate')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(callData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.call.callType).to.equal('video');
      expect(response.body.call.callerId).to.equal(user1._id.toString());
      expect(response.body.call.status).to.equal('initiated');
    });

    it('should not initiate call to non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const callData = {
        chatId: chat._id,
        callType: 'audio',
        recipientId: fakeUserId
      };

      const response = await request(app)
        .post('/api/calls/initiate')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(callData)
        .expect(400);

      expect(response.body.message).to.include('Recipient not found');
    });
  });

  describe('Call Answering', () => {
    let call;

    beforeEach(async () => {
      call = new Call({
        chatId: chat._id,
        callId: 'test-call-123',
        callerId: user1._id,
        callType: 'audio',
        status: 'initiated'
      });
      await call.save();
    });

    it('should answer a call', async () => {
      const response = await request(app)
        .post(`/api/calls/${call.callId}/answer`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.call.status).to.equal('accepted');
      expect(response.body.call.answeredAt).to.exist;
    });

    it('should decline a call', async () => {
      const response = await request(app)
        .post(`/api/calls/${call.callId}/decline`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.call.status).to.equal('declined');
      expect(response.body.call.endedAt).to.exist;
    });

    it('should not answer call by non-recipient', async () => {
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

      const response = await request(app)
        .post(`/api/calls/${call.callId}/answer`)
        .set('Authorization', `Bearer ${authToken3}`)
        .expect(403);

      expect(response.body.message).to.include('not authorized');
    });
  });

  describe('Call Ending', () => {
    let call;

    beforeEach(async () => {
      call = new Call({
        chatId: chat._id,
        callId: 'test-call-456',
        callerId: user1._id,
        callType: 'audio',
        status: 'accepted',
        answeredAt: new Date()
      });
      await call.save();
    });

    it('should end an active call', async () => {
      const response = await request(app)
        .post(`/api/calls/${call.callId}/end`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.call.status).to.equal('ended');
      expect(response.body.call.endedAt).to.exist;
      expect(response.body.call.duration).to.be.a('number');
    });

    it('should calculate call duration correctly', async () => {
      // Wait a bit to ensure duration calculation
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .post(`/api/calls/${call.callId}/end`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.call.duration).to.be.at.least(0);
    });
  });

  describe('Call History', () => {
    beforeEach(async () => {
      // Create multiple calls with different statuses
      const calls = [
        {
          chatId: chat._id,
          callId: 'call-1',
          callerId: user1._id,
          callType: 'audio',
          status: 'ended',
          duration: 120,
          answeredAt: new Date(Date.now() - 60000),
          endedAt: new Date()
        },
        {
          chatId: chat._id,
          callId: 'call-2',
          callerId: user2._id,
          callType: 'video',
          status: 'missed',
          endedAt: new Date()
        },
        {
          chatId: chat._id,
          callId: 'call-3',
          callerId: user1._id,
          callType: 'audio',
          status: 'declined',
          endedAt: new Date()
        }
      ];

      for (const callData of calls) {
        const call = new Call(callData);
        await call.save();
      }
    });

    it('should get call history for user', async () => {
      const response = await request(app)
        .get('/api/calls/history')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.calls).to.be.an('array');
      expect(response.body.calls.length).to.equal(3);
    });

    it('should filter calls by status', async () => {
      const response = await request(app)
        .get('/api/calls/history?status=ended')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.calls).to.be.an('array');
      expect(response.body.calls.length).to.equal(1);
      expect(response.body.calls[0].status).to.equal('ended');
    });

    it('should get call statistics', async () => {
      const response = await request(app)
        .get('/api/calls/stats')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.stats).to.be.an('object');
      expect(response.body.stats.totalCalls).to.equal(3);
      expect(response.body.stats.totalDuration).to.equal(120);
    });
  });

  describe('WebRTC Signaling', () => {
    let call;

    beforeEach(async () => {
      call = new Call({
        chatId: chat._id,
        callId: 'webrtc-call-123',
        callerId: user1._id,
        callType: 'video',
        status: 'accepted'
      });
      await call.save();
    });

    it('should handle ICE candidate exchange', async () => {
      const iceData = {
        candidate: {
          candidate: 'candidate:1 1 UDP 2113667326 192.168.1.100 54400 typ host',
          sdpMLineIndex: 0,
          sdpMid: '0'
        }
      };

      const response = await request(app)
        .post(`/api/calls/${call.callId}/ice-candidate`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send(iceData)
        .expect(200);

      expect(response.body.success).to.be.true;
    });

    it('should handle SDP offer/answer exchange', async () => {
      const sdpData = {
        type: 'offer',
        sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n...'
      };

      const response = await request(app)
        .post(`/api/calls/${call.callId}/sdp`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send(sdpData)
        .expect(200);

      expect(response.body.success).to.be.true;
    });
  });
});
