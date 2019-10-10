import React from 'react';
import { Row, Col, Icon } from 'antd';
import 'antd/dist/antd.css';
import '../../src/css/layout.css';
import setFirebaseConfig from './../helpers/firebase';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import RoomInfo from './Layout/RoomInfo';
import ChatBox from './Layout/ChatBox';
import * as roomService from './../services/room';

var db;
var firebase;
var _ = require('underscore');

export default class Example extends React.Component {
  state = {
    user: {},
    messages: [],
    members: [],
    roomInfo: {}
  };

  componentDidMount() {
    const _this = this;
    firebase = setFirebaseConfig();
    db = firebase.firestore();

    var first = db
      .collection('rooms')
      .where('id', '==', 1)
      .get()
      .then(function(snapshot) {
        snapshot.forEach(function(doc) {
          var messages = doc.data().messages;
          var members = doc.data().members;

          members.map(async m => {
            var user = await db
              .collection('users')
              .where('id', '==', m.user)
              .get();

            if (
              _.findWhere(_this.state.members, {
                id: user.docs[0].data().id
              }) == undefined
            ) {
              _this.setState({
                members: [..._this.state.members, user.docs[0].data()]
              });
            }
          });

          _this.setState({
            messages: messages,
            roomInfo: {
              name: doc.data().name,
              avatar: doc.data().avatar
            }
          });
        });
      });

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;

        _this.setState({
          user: {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid
          }
        });

        db.collection('users')
          .where('id', '==', user.uid)
          .get()
          .then(function(snapshot) {
            if (snapshot.size == 0) {
              db.collection('users').add({
                id: user.uid,
                name: user.displayName,
                email: user.email,
                avatar: user.photoURL
              });
            }
          });
      } else {
        // User is signed out.
        window.location.href = '/login';
      }
    });

    db.collection('rooms')
      .where('id', '==', 1)
      .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
          var data = change.doc.data();

          _this.setState({
            messages: data.messages
          });
        });
      });
  }

  sendMessage = e => {
    const content = document.getElementById('js-msg-content').value;
    if (
      ((e.type == 'keyup' && e.key === 'Enter') || e.type == 'click') &&
      content
    ) {
      const userId = this.state.user.uid;
      var msgData = {
        user: userId,
        content: content,
        is_notification: false
      };
      roomService.sendMessage(db, 1, msgData);
      document.getElementById('js-msg-content').value = '';
    }
  };

  uploadImage = () => {
    var file = document.getElementById('file');

    file.click();
  };

  uploadFile = e => {
    var _this = this;
    var storage = firebase.storage();

    // Create a storage reference from our storage service
    var storageRef = storage.ref();
    // Create a child reference
    var fileObj = e.target.files[0];
    var imagesRef = storageRef.child('images/' + fileObj.name);

    // Create the file metadata
    var metadata = {
      contentType: 'image/jpeg'
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef
      .child('images/' + fileObj.name)
      .put(fileObj, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function(snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      },
      function(error) {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;

          case 'storage/canceled':
            // User canceled the upload
            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      function() {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log('File available at', downloadURL);

          const userId = _this.state.user.uid;
          var msgData = {
            user: userId,
            content: downloadURL,
            is_notification: false,
            is_file: true
          };

          roomService.sendMessage(db, 1, msgData);
        });
      }
    );
  };

  render() {
    return (
      <div className="div-block">
        <Row>
          <Col span={4}>
            <Sidebar user={this.state.user} />
          </Col>
          <Col span={16}>
            <div id="frame">
              <div className="content">
                <div className="contact-profile">
                  <img src={this.state.roomInfo.avatar} alt="" />
                  <p>{this.state.roomInfo.name}</p>
                  <div className="social-media">
                    <i className="fa fa-facebook" aria-hidden="true"></i>
                    <i className="fa fa-twitter" aria-hidden="true"></i>
                    <i className="fa fa-instagram" aria-hidden="true"></i>
                  </div>
                </div>
                <div className="messages">
                  <ChatBox
                    messages={this.state.messages}
                    members={this.state.members}
                    uid={this.state.user.uid}
                  />
                </div>
                <div className="message-input">
                  <div className="wrap">
                    <input
                      type="text"
                      placeholder="Write your message..."
                      id="js-msg-content"
                      onKeyUp={this.sendMessage}
                    />
                    <input type="file" onChange={this.uploadFile} id="file" class="file"/>
                    <button className="upload-image" onClick={this.uploadImage}>
                      <Icon type="file-image" />
                    </button>
                    <button className="submit" onClick={this.sendMessage}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col span={4}>
            <RoomInfo />
          </Col>
        </Row>
      </div>
    );
  }
}
