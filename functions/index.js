// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  const snapshot = await admin
    .database()
    .ref('/messages')
    .push({ original: original });
  // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
  res.redirect(303, snapshot.ref.toString());
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database
  .ref('/messages/{pushId}/original')
  .onCreate((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const original = snapshot.val();
    console.log('Uppercasing', context.params.pushId, original);
    const uppercase = original.toUpperCase();
    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    return snapshot.ref.parent.child('uppercase').set(uppercase);
  });

// Perform Realtime Database sanitization and maintenance
exports.removeVulgarWords = functions.firestore
  .document('rooms/{room_id}')
  .onUpdate((snapshot, context) => {
    const newVal = snapshot.after.data();
    const messages = newVal.messages;

    messages.map(m => {
      if (m.content == 'ahuhu') {
        m.content = 'ahihi';
      }
    });

    console.log('Hihi', newVal);

    return snapshot.after.ref.set(newVal);
  });

function getAccessToken() {
  var MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
  var SCOPES = [MESSAGING_SCOPE];

  return new Promise(function(resolve, reject) {
    var { google } = require('googleapis');
    var key = require('./service-account.json');
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}

/* Ref: 
 https://www.itwonders-web.com/blog/push-notification-using-firebase-demo-tutorial
 https://medium.com/@ThatJenPerson/authenticating-firebase-cloud-messaging-http-v1-api-requests-e9af3e0827b8
 make request with https: https://nodejs.dev/making-http-requests-with-nodejs
*/
exports.sendNotificationWhenNewMessage = functions.firestore
  .document('rooms/{room_id}')
  .onUpdate(async (snapshot, context) => {
    const newVal = snapshot.after.data();
    // const oldVal = snapshot.before.data();

    const accessToken = await getAccessToken();
    var PROJECT_ID = 'my-first-firebase-projec-6cf07';
    var HOST = 'fcm.googleapis.com';
    var PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';

    var https = require('https');
    var data = JSON.stringify({
      message: {
        token:
          'cfIrXSLMJia7osLU7OjG0H:APA91bFBNIZ1w4Am2rrke6lKxey4EvSct9cMqLNrz5S8-VoUhDulFl2xs0U9dZ3iEmpEowtoAOOZ7CbO8-B1cZNRrxZ0x1NQEKb-l_NFkcmECdbEguqO_hA80XU3HQmVLdh0cEBM6KWW',
        notification: {
          title: 'Sky team',
          body: 'This is a message from FCM'
        },
        webpush: {
          headers: {
            Urgency: 'high',
            TTL: '86400'
          },
          notification: {
            body: 'You have new message in the room',
            requireInteraction: 'true',
            icon:
              'https://www.saremcotech.com/wp-content/uploads/2018/07/firebase-icon.png',
            click_action: `http://localhost:3000/rooms/${newVal.id}`
          }
        }
      }
    });

    var options = {
      hostname: HOST,
      path: PATH,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    var req = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        console.log('BODY: ' + chunk);
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    req.write(data);
    req.end();
  });
