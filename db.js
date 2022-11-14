const mongoose = require('mongoose');

// const username = process.env.MONGO_USERNAME;
const username = 'sontmac1203';
// const password = process.env.MONGO_PASSWORD;
const password = 'thienson123';
const databaseName = 'ece-413-final-project';

try {
  mongoose.connect(
    `mongodb+srv://${username}:${password}@cluster0.l515c.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
} catch (e) {
  console.log(e);
}

module.exports = mongoose;
