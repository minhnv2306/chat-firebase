import React, { Component } from 'react';
import * as firebaseui from 'firebaseui';
import setFirebaseConfig from './../helpers/firebase';
import './../css/login.css';

export default class Login extends Component {
  componentDidMount() {
    // Initialize the FirebaseUI Widget using Firebase.
    var firebase = setFirebaseConfig();
    var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          return true;
        },
        uiShown: function() {
          // The widget is rendered.
          // Hide the loader.
          document.getElementById('loader').style.display = 'none';
        }
      },
      // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
      signInFlow: 'popup',
      signInSuccessUrl: '/',
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID
      ],
      // Terms of service url.
      tosUrl: '<your-tos-url>',
      // Privacy policy url.
      privacyPolicyUrl: '<your-privacy-policy-url>'
    };

    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);

    // By using an observer, you ensure that the Auth object isn't in an intermediate state—such as initialization—when you get the current user
    // docs: https://firebase.google.com/docs/auth/web/manage-users
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        window.location.href = '/';
      }
    });
  }
  render() {
    return (
      <div>
        <h1 className="header"> Sky'sssss </h1>
        <div className="login__content">
          <h2> Login to sky'ss app </h2>
          <div id="firebaseui-auth-container"></div>
          <div id="loader">Loading...</div>
        </div>
      </div>
    );
  }
}
