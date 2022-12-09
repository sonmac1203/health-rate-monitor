# Heart Rate Monitor Docs

Documentaion of defined REST API routes

## 1. Sign a user up

Hit this endpoint to sign a user up with approved credentials

**URL** : `/api/signup`

**Method** : `POST`

**Body** : 
```json
{
  "name": "Name",
  "email": "email@gmail.com",
  "password": "VeryStrongPassword123",
}
```

### Behaviors

#### If the email was used already
**Code** : `401`

```json
{ 
  "success": false, 
  "message": "This email already used" 
}
```

#### If succeeded
**Code** : `201`

```json
{ 
  "success": true, 
  "message": "User email@gmail.com has been created." 
}
```

## 2. Log in

When a user attempts to log in after providing the credentials, this endpoint will be called. The server first checks if the email is correct, then compares the hashed passwords before responding with a token for authentication.

**URL** : `/api/login`

**Method** : `POST`

**Body** : 
```json
{
  "email": "email@gmail.com",
  "password": "VeryStrongPassword123",
}
```

### Behaviors

#### If the email was not recognized
**Code** : `401`

```json
{ 
  "success": false, 
  "message": "Email not found. Please try again" 
}
```

#### If wrong password
**Code** : `401`

```json
{ 
  "success": false, 
  "message": "Incorrect password. Please try again." 
}
```

#### If succeeded
**Code** : `201`

```json
{ 
  "success": true, 
  "token": "thisisaverylongtoken",
  "message": "Login success." 
}
```

## 3. Verify authentication

Verify if the authentication has been completed then fetch user data from database for further interactions.

**URL** : `/api/auth`

**Method** : `GET`

**Headers** : 
```json
{
  "x-auth": "sampletokenforauthentication",
}
```

### Behaviors

#### If succeeded
**Code** : `200`

```json
{ 
  "success": false, 
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "access_token": "...",
    "last_access": "...",
    "devices_added": 1,
    "devices": [{...}],
    "recent_settings": [{...}],
  }
}
```

## 4. Update profile

Update the user's profile with either new user name or new password. If the user wants to change the password, they have to provide the current password correctly.

**URL** : `/api/update_profile`

**Method** : `POST`

**Body** : 
```json
{
  "name": "Name",
  "email": "email@gmail.com",
  "currentPassword": "VeryStrongPassword123",
  "newPassword": "VeryStrongAndNewPassword123",
}
```

### Behaviors

#### If current password matches
**Code** : `201`

```json
{ 
  "success": true, 
  "message": "User profile has been updated." 
}
```

#### If current password does not matches
**Code** : `401`

```json
{ 
  "success": false, 
  "message": "Current password do not match. Please try again." 
}
```

## 5. Update access token

Update/Add the user's access token associating with the Particle.io account, which is used for sending data from the server to the device.

**URL** : `/api/update_access_token`

**Method** : `POST`

**Body** : 
```json
{
  "email": "email@gmail.com",
  "accessToken": "thisisanparticleaccesstoken",

}
```

### Behaviors

#### If succeeded
**Code** : `201`

```json
{ 
  "success": true, 
  "message": "User access token has been updated." 
}
```

## 6. Add a new device

This endpoint will be called as the user attempts to add a new device to their dashboard. The body of this request has to include the Particle access token. As the endpoint is hit, the server will increment the number of devices recorded by 1, then append the device information to the `devices` array, then send a POST request to the Particle Cloud with the default settings (frequency, start time, end time) and the enclosed access token.

**URL** : `/api/add_new_device`

**Method** : `POST`

**Body** : 
```json
{
  "email": "email@gmail.com",
  "accessToken": "thisisanparticleaccesstoken",
  "deviceName": "thenameofthisdevice",
  "deviceID": "theidofthisdevice",
}
```

### Behaviors

#### If device has been recorded and settings were sent successfully
**Code** : `201`

```json
{ 
  "success": true,
  "settings_sent": true,
  "device_added": true,
  "message": "Device has been added and default settings have been sent to device." 
}
```

#### If device has been recorded but settings were not sent
**Code** : `201`

```json
{ 
  "success": false,
  "settings_sent": false,
  "device_added": true,
  "message": "Device has been added but default settings were not sent to device." 
}
```

## 7. Remove a new device

This endpoint will be called as the user attempts to remove a device from their portal. The server will look for the device object with the matching id number and delete them from the `devices` array from user's record.

**URL** : `/api/remove_device`

**Method** : `POST`

**Body** : 
```json
{
  "email": "email@gmail.com",
  "deviceID": "theidofthisdevice",
}
```

### Behaviors

#### If succeeded
**Code** : `201`

```json
{ 
  "success": true, 
  "message": "Device has been removed." 
}
```

## 8. Update the measurement settings of a device

This endpoint will be called as the user attempts to update the measurement settings. Similarly to the `add_new_device` endpoint, the body of this request includes an `access_token`. As this endpoint is called, the server will update the record in the database with new values, then add the settings to an array called `recent_settings` for future use (limit to only 3 records), then make a POST request to Particle Cloud to notify the device. 

**URL** : `/api/update_measurement_settings`

**Method** : `POST`

**Body** : 
```json
{
  "email": "email@gmail.com",
  "deviceID": "theidofthisdevice",
  "setting_name": "setting_0",
  "frequency": 30, // in minutes
  "start_time": 360, // in minutes from midnight
  "end_time": 1200, // in minutes from midnight
  "accessToken": "anaccesstokenforparticle,
}
```

### Behaviors

#### If settings have been updated and also got sent successfully
**Code** : `201`

```json
{ 
  "success": true,
  "settings_sent": true,
  "settings_updated": true,
  "message": "Measurement settings have been updated and the settings have been sent to device!" 
}
```

#### If device has been recorded but settings were not sent
**Code** : `201`

```json
{ 
  "success": false,
  "settings_sent": false,
  "settings_updated": true,
  "message": "Measurement settings have been updated but the settings have not been sent to device!" 
}
```

## 9. Get daily readings of a device

This endpoint will be called to fetch the data for the daily chart of the particular device. The `date` param is sent in the format `YYYY-MM-DD`. As the endpoint is called, the server will ultilize the Date API of Javascript to determine the first and last moment of the queried date (from the url), then filter out the readings within that range. 

**URL** : `/api/particle/device_report_daily/{deviceID}/${date}`

**Method** : `GET`

### Behaviors

#### If there is no readings within the date queried
**Code** : `201`

```json
{ 
  "success": false,
  "message": "The data for the requested date was not found." 
}
```

#### If succeeded
**Code** : `201`

```json
{
  "success": true,
  "user": {
      "_id": "6392fb8e3665db544a377e55",
      "name": "Son Son", // name of user
      "email": "sontmac1203@gmail.com", // email of user
      "devices_added": 5, // number of devices added
      "access_token": "7b382ce8773b5ef97117e6bad67ec41692766c9b", // Particle access token
      "lastAccess": "2022-12-09T14:18:06.258Z",
      "devices": [
          {
              "measurement_settings": { // current settings
                  "frequency": 40,
                  "start_time": 180,
                  "end_time": 1240
              },
              "device_id": "e00fce6859b53e65f4af355a", // device ID
              "device_name": "Dev_2",
              "_id": "63930d143500ad8b89dccae3",
              "time_added": "2022-12-09T10:25:24.147Z",
              "reports": [
                  {
                      "data": {
                          "heart_rate": 71,
                          "oxygen_level": 88
                      },
                      "stored_at": "2022-12-09T14:22:58.439Z",
                      "published_at": "2022-12-03T13:00:00.000Z",
                      "_id": "639344c217df16b3c9f4f3de"
                  },
                  {...}
              ]
          },
      ],
      "recent_settings": [
          {
              "setting_name": "",
              "frequency": 5,
              "start_time": 180,
              "end_time": 1240,
              "_id": "63930eba3500ad8b89dccb7d"
          },
          {...}
      ],
  }
}
```

## 10. Get weekly summary of a device

This endpoint will be called to fetch the data for the weekly chart of the particular device. As the endpoint is called, the server will ultilize the Date API of Javascript to determine the first and last moment of the past 7 days, then calculate the maximum, minimum, and average of all the qualified readings.

**URL** : `/api/particle/device_report_weekly/{deviceID}`

**Method** : `GET`

### Behaviors

#### If there is no readings within the past 7 days
**Code** : `201`

```json
{ 
  "success": false,
  "message": "TThe data for the requested week was not found.",
}
```

#### If succeeded
**Code** : `201`

```json
{
  "success": true,
  "message": "The data for the requested week has been found.",
  "data": [
      {
          "_id": "6392ff2f127bd60c3c994b64",
          "max_heart_rate": 207, // maximum heart rate
          "min_heart_rate": 201, // minimum heart rate
          "avg_heart_rate": 204, // average heart rate
          "max_oxygen_level": 50, // maximum oxygen level
          "min_oxygen_level": 45, // minimum oxygen level
          "avg_oxygen_level": 47.5 // average oxygen level
      },
      {...}
  ]
}
```

## 11. Publish readings from the device to server

This special endpoint will called by the device as it publishes the readings to the server. The body will include the event name, device ID, the readings, and the published time. As the request is received, the server will look for the user owning the device with the matching ID, then append the information to an array called `reports` within the device's record. At the same time, the server extracts the access token from the found user and use it to send back an **ACK** request to the device to notify the successfull data storing. 

**URL** : `/api/particle/report`

**Method** : `POST`

**Body** : 
```json
{
  "event": "heartRateAndOxygenLevel", // event name
  "data": "96,88", // readings
  "coreid": "e00fce6859b53e65f4af355a", // device ID
  "published_at": "2022-12-08T16:00:00Z" // published time
}
```

### Behaviors

#### If readings were stored but ACK was not received
**Code** : `201`

```json
{ 
  "success": false,
  "message": "The new report has been saved but device has not acknowledged!" 
}
```

#### If readings were stored but ACK was received
**Code** : `201`

```json
{ 
  "success": true,
  "message": "The new report has been saved and device has acknowledged!" 
}
```
