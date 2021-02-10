const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeTestUsersArray() {
  return [
    {
      id: 1,
      first_name: 'demo-first-1',
      last_name: 'demo-last-1',
      user_name: 'test@test.com',
      password: 'Password!1',
      date_created: '2021-01-20T16:28:32.615Z',
    },
    {
      id: 2,
      first_name: 'demo-first-2',
      last_name: 'demo-last-2',
      user_name: 'test@tester.com',
      password: 'Password!2',
      date_created: '2021-01-19T16:28:32.615Z',
    },
    {
      id: 3,
      first_name: 'demo-first-3',
      last_name: 'demo-last-3',
      user_name: 'test@testerz.com',
      password: 'Password!3',
      date_created: '2021-01-15T16:28:32.615Z',
    },
    {
      id: 4,
      first_name: 'demo-first-4',
      last_name: 'demo-last-4',
      user_name: 'test@testies.com',
      password: 'Password!4',
      date_created: '2021-01-18T16:28:32.615Z',
    },
    {
      id: 5,
      first_name: 'demo-first-5',
      last_name: 'demo-last-5',
      user_name: 'test@testiod.com',
      password: 'Password!5',
      date_created: '2021-01-22T16:28:32.615Z',
    },
  ];
}

function makeTestItemsArray() {
  return [
    {
      id: 1,
      item_name: 'apples',
      days_until_expire: 5,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 1,
    },
    {
      id: 2,
      item_name: 'bananas',
      days_until_expire: 8,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 2,
    },
    {
      id: 3,
      item_name: 'kiwi',
      days_until_expire: 10,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 3,
    },
    {
      id: 4,
      item_name: 'avocado',
      days_until_expire: 2,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 3,
    },
    {
      id: 5,
      item_name: 'lettuce',
      days_until_expire: 5,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 5,
    },
    {
      id: 6,
      item_name: 'Beans',
      days_until_expire: 17,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 1,
    },
    {
      id: 7,
      item_name: 'rice',
      days_until_expire: 32,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 2,
    },
    {
      id: 8,
      item_name: 'ground beef',
      days_until_expire: 5,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 3,
    },
    {
      id: 9,
      item_name: 'bread',
      days_until_expire: 7,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 2,
    },
    {
      id: 10,
      item_name: 'mango',
      days_until_expire: 3,
      count_down_date: '2021-02-05T16:28:32.615Z',
      user_id: 5,
    },
  ];
}

function cleanTables(db) {
  return db.raw(
    'TRUNCATE user_items, shelf_life_users RESTART IDENTITY CASCADE'
  );
}

function makeItemsFixtures() {
  const testUsers = makeTestUsersArray();
  const testItems = makeTestItemsArray();
  return { testUsers, testItems };
}

function seedTestUsers(db, users) {
  const hashUserPasswords = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));

  return db
    .into('shelf_life_users')
    .insert(hashUserPasswords)
    .then(() => {
      return db.raw(
        `SELECT setval('shelf_life_users_id_seq', ?)`,
        users[users.length - 1].id
      );
    });
}

function seedTestItemTables(db, users, items) {
  return seedTestUsers(db, users)
    .then(() => {
      return db.into('user_items').insert(items);
    })
    .then(() => {
      return db.raw(
        `SELECT setval('user_items_id_seq', ?)`,
        items[items.length - 1].id
      );
    });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeTestUsersArray,
  makeAuthHeader,
  makeTestItemsArray,
  seedTestUsers,
  seedTestItemTables,
  cleanTables,
  makeItemsFixtures,
};
