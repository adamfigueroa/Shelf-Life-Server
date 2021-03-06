const ItemsService = {
    getAllItems(db) {
        return db
        .select('*')
        .from('user_items')
    },

    getUserItems(db, submitted_id) {
        return db
        .select('*')
        .from('user_items')
        .where({ user_id: submitted_id })
    },

    getById(db, id) {
        return db
        .select("*")
        .from('user_items')
        .where({ id })
        .first();
    },

    insertItem(db, newItem) {
        return db
        .insert(newItem)
        .into('user_items')
        .returning('*')
        .then(([item]) => item)
        .then(item => ItemsService.getById(db, item.id))
    },

    deleteItem(db, item_id) {
        return db('user_items')
        .where({
            id: item_id
        })
        .delete();
    },
    
    editItem(db, item, id) {
        return db('user_items')
        .where({
            id: id
        })
        .update(item);
    }
};

module.exports = ItemsService;