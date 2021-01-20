CREATE TABLE user_items (
    id SERIAL PRIMARY KEY,
    item_name TEXT NOT NULL,
    days_until_expire INTEGER NOT NULL,
    count_down_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id INTEGER
    REFERENCES shelf_life_users(id) ON DELETE CASCADE NOT NULL
);