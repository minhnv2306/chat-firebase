// This import loads the firebase namespace along with all its type information.
import * as firebase from 'firebase/app';
 
// These imports load individual services into the firebase namespace.
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';

export default function setFirebaseConfig()
{
    // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyArfI3_9gUv2OJvCxBGpT3gzf2DOkrqldw",
    authDomain: "my-first-firebase-projec-6cf07.firebaseapp.com",
    databaseURL: "https://my-first-firebase-projec-6cf07.firebaseio.com",
    projectId: "my-first-firebase-projec-6cf07",
    storageBucket: "my-first-firebase-projec-6cf07.appspot.com",
    messagingSenderId: "914257577932",
    appId: "1:914257577932:web:865e6de26cd38f59fcbf69"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  return firebase;
}
