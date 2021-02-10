const express = require("express");
const path = require("path");
const UsersService = require("./users-service");

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter.post("/", jsonParser, (req, res, next) => {
  const { first_name, last_name, user_name, password } = req.body;

  for (const field of ["first_name", "last_name", "user_name", "password"])
    if (!req.body[field])
      return res.status(400).json({
        error: { message: `Missing '${field}' in request body`},
      });

  const passwordError = UsersService.validatePassword(password);

  if (passwordError) return res.status(400).json({ error: { message: passwordError} });

  UsersService.hasUserWithUsername(req.app.get("db"), user_name)
    .then((hasUserWithUsername) => {
      if (hasUserWithUsername)
        return res.status(400).json({ error: { message: "Username already exists" } });

      return UsersService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          first_name,
          last_name,
          user_name,
          password: hashedPassword,
        };

        return UsersService.insertUser(req.app.get("db"), newUser).then(
          (user) => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(UsersService.serializeUser(user));
          }
        );
      });
    })
    .catch(next);
});

module.exports = usersRouter;
