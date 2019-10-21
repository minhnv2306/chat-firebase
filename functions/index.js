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

// Ref: https://www.itwonders-web.com/blog/push-notification-using-firebase-demo-tutorial
exports.sendNotificationWhenNewMessage = functions.firestore
  .document('rooms/{room_id}')
  .onUpdate(async (snapshot, context) => {
    // const newVal = snapshot.after.data();
    // const oldVal = snapshot.before.data();

    const payload = {
      data: {
        notification: JSON.stringify({
          title: 'Firebase',
          body: 'Firebase is awesome',
          click_action: 'http://localhost:3000/',
          icon:
            'https://www.saremcotech.com/wp-content/uploads/2018/07/firebase-icon.png'
        })
      }
    };

    console.log(payload);
    const response = await admin
      .messaging()
      .sendToDevice(
        [
          'cfIrXSLMJia7osLU7OjG0H:APA91bFBNIZ1w4Am2rrke6lKxey4EvSct9cMqLNrz5S8-VoUhDulFl2xs0U9dZ3iEmpEowtoAOOZ7CbO8-B1cZNRrxZ0x1NQEKb-l_NFkcmECdbEguqO_hA80XU3HQmVLdh0cEBM6KWW'
        ],
        payload
      );
    return Promise.all([1, 2]);
  });
