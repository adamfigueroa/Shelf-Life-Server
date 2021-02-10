const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');
const AuthService = require('../src/auth/auth-service');

describe('Auth Endpoints', function () {
  let db;

  const { testUsers } = helpers.makeItemsFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/auth/login', () => {
    beforeEach('insert test users', () => {
      return helpers.seedTestUsers(db, testUsers);
    });
    const requiredFields = ['user_name', 'password'];

    requiredFields.forEach((field) => {
      const loginBody = {
        user_name: testUser.user_name,
        password: testUser.password,
      };

      it(`responds with 404 error when ${field} is missing`, () => {
        delete loginBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginBody)
          .expect(400, {
            error: { "message": `Missing ${field} in request body` },
          });
      });
    });

    it('responds with 400 and "Incorrect username or password" when username is not found', () => {
      const badUser = {
        user_name: 'plum fairy',
        password: testUser.password,
      };
      return supertest(app).post('/api/auth/login').send(badUser).expect(400, {
        error: { "message": 'Incorrect username or password' },
      });
    });

    it('responds with 400 and "Incorrect username or password" when username is correct but the password is wrong', () => {
      const badPass = {
        user_name: testUser.user_name,
        password: 'nottherightpassword',
      };
      return supertest(app).post('/api/auth/login').send(badPass).expect(400, {
        error: { "message": 'Incorrect username or password' },
      });
    });

    it('responds with 200 and returns a token on successful login', () => {
      const goodUser = {
        user_name: testUser.user_name,
        password: testUser.password,
      };
      const sub = testUser.user_name;
     const payload = { user_id: testUser.id };
      const jwtToken = AuthService.createJwt(sub, payload);

      return supertest(app)
        .post('/api/auth/login')
        .send(goodUser)
        .expect(200, { "authToken": jwtToken });
    });
  });
});
