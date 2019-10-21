importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// Your web app's Firebase configuration
var firebaseConfig = {
  messagingSenderId: '914257577932'
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload) {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  const notificationInfo = JSON.parse(payload.data.notification);
  // Customize notification here
  const notificationTitle = notificationInfo.title;
  const notificationOptions = {
    body: notificationInfo.body,
    icon: notificationInfo.icon
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
