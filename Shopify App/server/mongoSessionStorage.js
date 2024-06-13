const { SessionStorage } = require('@shopify/shopify-api/dist/auth/session');
const connectDB = require('./db');

class MongoDBSessionStorage extends SessionStorage {
    constructor() {
        super();
        this.collection = null;
    }

    async ready() {
        if (!this.collection) {
            const db = await connectDB();
            this.collection = db.collection('sessions');
        }
    }

    async storeSession(session) {
        await this.ready();
        const result = await this.collection.updateOne(
            { id: session.id },
            { $set: session },
            { upsert: true }
        );
        return result.acknowledged;
    }

    async loadSession(id) {
        await this.ready();
        const session = await this.collection.findOne({ id });
        return session ? session : undefined;
    }

    async deleteSession(id) {
        await this.ready();
        const result = await this.collection.deleteOne({ id });
        return result.deletedCount > 0;
    }

    async deleteSessions(ids) {
        await this.ready();
        const result = await this.collection.deleteMany({ id: { $in: ids } });
        return result.deletedCount > 0;
    }

    async findSessionsByShop(shop) {
        await this.ready();
        const sessions = await this.collection.find({ shop }).toArray();
        return sessions;
    }
}

module.exports = MongoDBSessionStorage;
