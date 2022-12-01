//cloud.mongodb.com info:
//Cluster username and Password:
//  username: heartrate
//  passwoord: webdev413
const mongoose = require('mongoose');

// const username = process.env.MONGO_USERNAME;
const username = 'heartrate';
// const password = process.env.MONGO_PASSWORD;
const password = 'webdev413';
const databaseName = 'HeartMonitorDB';

try {
  mongoose.connect(
    // `mongodb+srv://${username}:${password}@heartmonitordb.0ivesko.mongodb.net/?retryWrites=true&w=majority`
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
