const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Item Endpoints', function () {
  let db;

  const { testUsers, testItems } = helpers.makeItemsFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));
  after('disconnect from db', () => db.destroy());

  describe('GET /api/items', () => {
    beforeEach('Create tables and seed', () => {
      return helpers.seedTestItemTables(db, testUsers, testItems);
    });

    context('Successful Login', () => {
      it('responds with 200 and empty array when user has no items', () => {
        return supertest(app)
          .get('/api/items')
          .set('Authorization', helpers.makeAuthHeader(testUsers[3]))
          .expect(200, []);
      });

      it('responds with 200 and user items', () => {
        const expectedItems = [
          {
            id: 1,
            item_name: 'apples',
            days_until_expire: 5,
            count_down_date: '2021-02-05T16:28:32.615Z',
            user_id: 1,
          },
          {
            id: 6,
            item_name: 'Beans',
            days_until_expire: 17,
            count_down_date: '2021-02-05T16:28:32.615Z',
            user_id: 1,
          },
        ];

        return supertest(app)
          .get('/api/items')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedItems);
      });
    });
  });

  describe('POST /api/items', () => {
    beforeEach('Create tables and seed', () => {
      return helpers.seedTestItemTables(db, testUsers, testItems);
    });

    it('responds with 400 and "Missing item_name in request body" if item name is not included', () => {
      const badItem = {
        item_name: null,
        days_until_expire: 5,
        count_down_date: testItems[0].count_down_date,
        user_id: 1,
      };
      return supertest(app)
        .post('/api/items')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(badItem)
        .expect(400, {
          error: { message: "Missing 'item_name' in request body" },
        });
    });

    it('responds with 201 and the edited item', () => {
      const goodItem = {
        item_name: 'test item',
        days_until_expire: 5,
        count_down_date: testItems[0].count_down_date,
        user_id: 1,
      };
      return supertest(app)
        .post('/api/items')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(goodItem)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id');
          expect(res.body.item_name).to.eql(goodItem.item_name);
          expect(res.body.days_until_expire).to.eql(goodItem.days_until_expire);
          expect(res.body.count_down_date).to.eql(goodItem.count_down_date);
          expect(res.headers.location).to.equal(`/api/items/${res.body.id}`);
        });
    });
  });
});
