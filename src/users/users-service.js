const bcrypt = require("bcryptjs");
const xss = require("xss");

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&])[\S]+/;

const UsersService = {
  hasUserWithUsername(db, user_name) {
    return db("shelf_life_users")
      .where({ user_name })
      .first()
      .then((user) => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("shelf_life_users")
      .returning("*")
      .then(([user]) => user);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    return {
      id: user.id,
      first_name: xss(user.first_name),
      last_name: xss(user.last_name),
      user_name: xss(user.user_name),
      date_created: new Date(user.date_created),
    };
  },
  validatePassword(password) {
    if (password.length < 8) {
      return "Your password needs to be at least 8 characters long";
    }
    if (password.length > 100) {
      return "Your password needs to be less than 100 characters";
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Your password needs to contain at least 1 upper and lower case letter, at least 1 number, and at least 1 special character";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with empty spaces";
    }
    return null;
  },
};

module.exports = UsersService;
