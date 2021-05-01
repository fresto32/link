import {config} from '@link/config';
import {ClientUser, UserProfile} from '@link/schema';
import {waitFor} from '@link/test';
import {RedisLink} from '@link/test/redis-link';
import {INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import * as request from 'supertest';
import {ApiGatewayModule} from './../src/api-gateway.module';

const host = config()['user-repository'].redis.host;
const port = config()['user-repository'].redis.port;

describe('ApiGatewayController (e2e)', () => {
  const redisLink = new RedisLink(port, host);

  let app: INestApplication;

  beforeAll(async () => {
    await redisLink.reset();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await redisLink.reset();
  });

  describe('Account Controller', () => {
    const clientUser: ClientUser = {
      userId: 2,
      username: 'Taj',
      email: 'taj@email.com',
      password: 'password',
    };
    const userProfile: UserProfile = {
      userId: 2,
      username: 'Taj',
      email: 'taj@email.com',
    };
    const loginDetails = {username: 'Taj', password: 'password'};

    const invalidBody = {invalid: 'body'};

    describe('signUp()', () => {
      it('signs up a new user', async () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(clientUser)
          .expect(201);
      });

      it('returns the user created', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(clientUser)
          .expect(userProfile);
      });

      it('does not sign up a duplicate user', async () => {
        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(clientUser)
          .expect(201);

        waitFor(300);

        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(clientUser)
          .expect(400);
      });

      it('does not fall over when receiving invalid body', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(invalidBody)
          .expect(400);
      });
    });

    describe('login()', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(clientUser)
          .expect(201);

        waitFor(100);
      });

      it('logs in a valid user', async () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDetails)
          .expect(201);
      });

      it('creates a Json Web Token for the valid user', async () => {
        const result = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDetails);

        expect(result.body.access_token).toBeTruthy();
      });

      it('denies an invalid user from logging in', async () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({username: 'invalid', password: 'invalid'})
          .expect(400);
      });

      it('does not fall over when receiving invalid body', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(invalidBody)
          .expect(401);
      });
    });

    describe('logOut()', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(clientUser)
          .expect(201);

        waitFor(100);
      });

      it('logs out a valid user', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDetails);

        waitFor(100);

        return request(app.getHttpServer())
          .post('/auth/logout')
          .set('Authorization', `Bearer ${response.body.access_token}`)
          .send()
          .expect(201);
      });

      it('resets the response header', async () => {
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDetails);

        waitFor(100);

        const logOutResponse = await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
          .send();

        expect(logOutResponse.headers['set-cookie']).toEqual([
          'Authentication=; HttpOnly; Path=/; Max-Age=0',
        ]);
      });

      it('denies an invalid user from logging out', async () => {
        return request(app.getHttpServer())
          .post('/auth/logout')
          .send()
          .expect(401);
      });

      it('does not fall over when receiving invalid body', () => {
        return request(app.getHttpServer())
          .post('/auth/logout')
          .send(invalidBody)
          .expect(401);
      });
    });
  });
});
