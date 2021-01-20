const xss = require('xss');

const ItemsService = {
    serializeItem(item) {
        return {
            id: item.id,
            item_name: xss(item.item_name),
            days_until_expire: item.days_until_expire,
            count_down_date: item.count_down_date
        }
    },

    getAllItems(db) {
        return db
        .select('*')
        .from('user_items')
    },

    getUserItems(db, submitted_id) {
        return db
        .select('*')
        .where({ user_id: submitted_id })
        .from('user_items')
    },

    getById(db, submitted_id, user_id) {
        return ItemsService.getUserItems(db, submitted_id)
        .where('id', user_id)
        .first();
    }
};

module.exports = RoutinesService;