const express = require("express");
const path = require("path");
const ItemsService = require("./items-service");
const xss = require("xss");
const { requireAuth } = require("../middleware/jwt-auth");

const itemsRouter = express.Router();
const jsonParser = express.json();

const serializeItem = (item) => ({
  id: item.id,
  item_name: xss(item.item_name),
  days_until_expire: item.days_until_expire,
  count_down_date: item.count_down_date,
  user_id: item.user_id,
});

async function validateItem(req, res, next) {
  try {
    const item = await ItemsService.getById(
      req.app.get("db"),
      req.params.item_id
    );

    if (!item) {
      return res.status(404).json({
        error: "item does not exist",
      });
    }
    req.item = item;
    next();
  } catch (error) {
    next(error);
  }
}

// itemsRouter
// .route("/")
// .get((req, res, next) => {
//   ItemsService.getAllItems(req.app.get("db"))
//     .then((items) => {
//       return res.json(items.map(serializeItem));
//     })
//     .catch(next);
// });

itemsRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    ItemsService.getUserItems(req.app.get("db"), req.user.id)
      .then((items) => {
        return res.json(items.map(serializeItem));
      })
      .catch(next);
  })

  .post(jsonParser, (req, res, next) => {
    const { item_name, days_until_expire, count_down_date, user_id } = req.body;
    const newItem = {
      item_name,
      days_until_expire,
      count_down_date,
      user_id: req.user.id,
    };

    for (const [key, value] of Object.entries(newItem)) {
      if (value === null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    ItemsService.insertItem(req.app.get("db"), newItem)
      .then((item) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(serializeItem(item));
      })
      .catch(next);
  });

itemsRouter
  .route("/:item_id")
  .all(requireAuth)
  .all(validateItem)
  .get((req, res, next) => {
    return res.status(200)
    .json(serializeItem(req.item));
  })
  .delete((req, res, next) => {
    ItemsService.deleteItem(req.app.get("db"), req.params.item_id)
      .then((rowsAffected) => {
        return res.status(204).json({
          message: `The following item has been deleted: ${rowsAffected}`,
        });
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { item_name, days_until_expire, count_down_date, user_id } = req.body;

    if (!item_name) {
      return res.status(400).json({
        error: "Please submit item_name",
      });
    }
    if (!days_until_expire) {
      return res.status(400).json({
        error: "Please submit days_until_expire",
      });
    }
    if (!count_down_date) {
      return res.status(400).json({
        error: "Please submit count_down_date",
      });
    }
    if (!user_id) {
      return res.status(400).json({
        error: "Please submit user_id",
      });
    }

    const editItem = {
      item_name,
      days_until_expire, 
      count_down_date, 
      user_id
    }

    ItemsService.editItem(req.app.get("db"), editItem, req.item.id)
      .then((item) => {
        return res
          .status(204)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(serializeItem(item));
      })
      .catch(next);
  });

module.exports = itemsRouter;
