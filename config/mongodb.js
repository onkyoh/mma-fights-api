const MongoClient = require('mongodb').MongoClient;

const connectDB = async () => {
    try {
        const client = await MongoClient.connect(
            process.env.DATABASE_URL || process.env.TEST_URL,
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        return client.db('mmafightcardsapi-main-db-00d096174c0').collection('cards')
    } catch (err) {
        throw err
    }
}

module.exports = connectDB