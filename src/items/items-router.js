const express = require("express");
const path = require("path");
const ItemsService = require("./items-service");
const xss = require("xss");

const itemsRouter = express.Router();
const jsonParser = express.json();

const serializeItem = (item) => ({
  id: item.id,
  item_name: xss(item.item_name),
  days_until_expire: item.days_until_expire,
  count_down_date: item.count_down_date,
  user_id: item.user_id,
});

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

    // newItem.item_name = item_name;
    // newItem.days_until_expire = days_until_expire;
    // newItem.count_down_date = count_down_date;
    // newItem.user_id = user_id;

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
  .get((req, res, next) => {
    return res.status(200).json(serializeItem(res.item));
  })
  .delete((req, res, next) => {
    ItemsService.deleteItem(req.app.get("db"), res.item.id)
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
        error: "Please submit Item name",
      });
    }

    ItemsService.editItem(req.app.get("db"), item, req.item.id)
      .then((item) => {
        return res
          .status(204)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(serializeItem(item));
      })
      .catch(next);
  });

module.exports = itemsRouter;
