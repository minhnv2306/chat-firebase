import React from 'react';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import '../../src/css/layout.css';
import setFirebaseConfig from './../helpers/firebase';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import RoomInfo from './Layout/RoomInfo';
import ChatBox from './Layout/ChatBox';
import * as roomService from './../services/room';

var db;
var _ = require('underscore');

export default class Example extends React.Component {
  state = {
    user: {},
    messages: [],
    members: []
  };

  componentDidMount() {
    const _this = this;
    var firebase = setFirebaseConfig();
    db = firebase.firestore();

    var first = db
      .collection('rooms')
      .where('id', '==', 1)
      .get()
      .then(function(snapshot) {
        snapshot.forEach(function(doc) {
          var messages = doc.data().messages;

          messages.map(async m => {
            var user = await db
              .collection('users')
              .where('id', '==', m.user)
              .get();

            if (
              _.findWhere(_this.state.members, {
                email: user.docs[0].data().email
              }) == undefined
            ) {
              _this.setState({
                members: [..._this.state.members, user.docs[0].data()]
              });
            }
          });

          _this.setState({
            messages: messages
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
          if (change.type === 'added') {
            console.log('New city: ', change.doc.data());
          }
          if (change.type === 'modified') {
            console.log('Modified city: ', change.doc.data());
            var data = change.doc.data();
            _this.setState({
              messages: data.messages
            });
          }
          if (change.type === 'removed') {
            console.log('Removed city: ', change.doc.data());
          }
        });
      });
  }

  sendMessage = () => {
    const content = document.getElementById('js-msg-content').value;
    const userId = this.state.user.uid;

    var msgData = {
      user: userId,
      content: content,
      is_notification: false
    };

    roomService.sendMessage(db, 1, msgData);
    document.getElementById('js-msg-content').value = '';
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
                  <img
                    src="https://www.w3schools.com/bootstrap/img_avatar3.png"
                    alt=""
                  />
                  <p>Harvey Specter</p>
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
                    />
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
