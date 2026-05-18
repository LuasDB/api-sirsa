const { MongoClient } = require('mongodb');

  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);
  const database = client.db('laboratorySirsa');

module.exports = {
  database,client
}
