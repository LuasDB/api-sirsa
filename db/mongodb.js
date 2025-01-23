const { MongoClient } = require('mongodb');

  const uri = 'mongodb+srv://LuasDB:quesadilla16@mongodb101.ag92n.mongodb.net/';
  const client = new MongoClient(uri);
  const database = client.db('laboratorySirsa');

module.exports = {
  database,client
}
