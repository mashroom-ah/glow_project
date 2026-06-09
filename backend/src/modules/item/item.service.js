const { Item } = require('../../database/models');
const {
    calculateItemStatus,
} = require('../../utils/itemStatus');
const {
    calculateExpirationDate,
} = require('../../utils/expirationDate');

// Маппинг статусов из calculateItemStatus в enum БД
const statusMap = {
    valid: 'fresh',
    expiring_soon: 'expiring_soon',
    expiring: 'expiring',
    expired: 'expired'
};

class ItemService {
    async create(userId, data) {
        const expirationDate = calculateExpirationDate(data);
        const rawStatus = calculateItemStatus(expirationDate);
        const status = statusMap[rawStatus] || 'fresh';

        const item = await Item.create({
            ...data,
            expiration_date: expirationDate,
            user_id: userId,
            status,
            is_active: true,
        });
        return item;
    }

    async getAll(userId) {
        return Item.findAll({
            where: { user_id: userId },
            order: [['is_active', 'DESC'], ['expiration_date', 'ASC']],
        });
    }

    async getById(userId, itemId) {
        const item = await Item.findOne({
            where: { item_id: itemId, user_id: userId },
        });
        if (!item) throw new Error('Item not found');
        return item;
    }

    async update(userId, itemId, data) {
        const item = await this.getById(userId, itemId);
        const expirationDate = calculateExpirationDate(data, item);
        data.expiration_date = expirationDate;
        const rawStatus = calculateItemStatus(expirationDate);
        data.status = statusMap[rawStatus] || 'fresh';
        await item.update(data);
        return item;
    }

    async delete(userId, itemId) {
        const item = await this.getById(userId, itemId);
        await item.destroy();
        return { message: 'Item deleted successfully' };
    }

    async archive(userId, itemId) {
        const item = await this.getById(userId, itemId);
        item.is_active = false;
        await item.save();
        return { message: 'Item archived successfully' };
    }

    async restore(userId, itemId) {
        const item = await this.getById(userId, itemId);
        item.is_active = true;
        await item.save();
        return { message: 'Item restored successfully' };
    }
}

module.exports = new ItemService();