
# References - Pulses

## Third-party APIs
- Particle Device Cloud API: send measurement settings to register device

        POST /v1/devices/{device_id}/{function_name}


## Libraries and packages

| Name         | Description                                                                                                                                                                        |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Axios**](https://axios-http.com/docs/intro)        | A promise-based HTTP library that lets developers make requests to either their own or a third-party server to fetch data                                                          |
| [**jQuery**](https://jquery.com/)       | Javascript library that simplifies HTML document traversal and manipulation, event handling, animation and Ajax with an easy-to-use API that works across a multitude of browsers. |
| [**Plotly**](https://plotly.com/javascript/)       | JavaScript Open Source Graphing Library that aided in produces graphical representation of our data.                                                                               |
| [**Font Awesome**](https://fontawesome.com/) | Icon library and toolkit for front-end development                                                                                                                                 |
| **jwt-simple**   | JWT encode and decode module for node.js.                                                                                                                                          |
| **bcryptjs**     | Enables storing of passwords as hashed passwords instead of plaintext                                                                                                              |
| **Mongoose**     | An Object Data Modeling (ODM) library for MongoDB and Node.js                                                                                                                      |
| **dotenv**       | A zero-dependency module that loads environment variables from a .env file into process.env variables                                                                              |


## Code

Instances of the usage of the above libraries
#### Axios


```js
const { data } = await axios.post('/api/update_profile', {
  name: userName,
  email: email,
  currentPassword: currentPassword,
  newPassword: newPassword,
});
if (data.success) {
  location.reload();
} else {
  window.alert(data.message);
}

```

#### Plotly

```js
const chartData = [heartRateTrace, oxygenLevelTrace];
const chartLayout = {
  barmode: 'group',
  showlegend: true,
  legend: { orientation: 'h' },
  title: {
    text: 'Weekly summary',
  },
};
const chartConfig = { responsive: true };
Plotly.newPlot('my-weekly-chart', chartData, chartLayout, chartConfig);
```

#### dotenv

```js
require('dotenv').config();
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const databaseName = process.env.MONGO_DBNAME;
```

#### bcryptjs

```js
const passwordHash = bcrypt.hashSync(req.body.password, 10);
const newUser = new User({
  name: req.body.name || 'Anon',
  email: req.body.email,
  passwordHash: passwordHash,
});
```

