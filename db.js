require('dotenv').config();
const mongoose = require('mongoose');

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const databaseName = process.env.MONGO_DBNAME;

try {
  mongoose.connect(
    `mongodb+srv://${username}:${password}@ece-413-final-project.usehcv0.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
} catch (e) {
  console.log(e);
}

module.exports = mongoose;
