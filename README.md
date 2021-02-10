# Shelf Life Server | Node.js/Express

Link to front end client: https://shelf-life.vercel.app/

## About the Shelf Life Server

This server is built using Node.js/Express with the purpose of being the API for the Shelf Life Client which allows Users to add an item with a timer that tracks an expiration date. 

## Documentation

### Endpoints

#### Login Endpoint

`POST /api/login`

| Body Key     | Type     | Description                         |
| :----------- | :------- | :---------------------------------- |
| `user_name`  | `string` |      user_name is required          |
| `password`   | `string` |      user_name is required          |

#### Register User Endpoint

`POST /api/users`

| Body Key     | Type     | Description                         |
| :----------- | :------- | :---------------------------------- |
| `first_name` | `string` |      first_name is required         |
| `last_name`  | `string` |      last_name is required          |
| `user_name`  | `string` |      user_name is required          |
| `password`   | `string` |      password is required           |

#### Item Endpoints

- Get user items
`GET /api/items`

- Get item details
`GET /api/items/:itemId`

- Delete item
`DELETE /api/items/:itemId`

##### Patch item
`PATCH /api/items/:itemId`

| Body Key            | Type     | Description                        |
| :------------------ | :------- | :--------------------------------- |
|     `item_name`     | `string` |        item_name is required       |
| `days_until_expire` | `string` |  how many days until item expires  |
|  `count_down_date`  | `string` |    Date when item was created      |
|      `user_id`      | `string` |       user_id is required          |

### Status Codes

This API returns the following status codes:

| Status Code | Description             |
| :---------- | :---------------------- |
| 200         | `OK`                    |
| 201         | `CREATED`               |
| 400         | `BAD REQUEST`           |
| 404         | `NOT FOUND`             |
| 500         | `INTERNAL SERVER ERROR` |

### Technology Used

Node.js
Express
PostgreSQL
Testing with Mocha and Chai

#### To install locally

Clone the github repo to your machine.
Run 'npm install' in git
Run 'npm start'