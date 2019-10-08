import React from 'react';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import '../../src/css/layout.css';
import setFirebaseConfig from './../helpers/firebase';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import RoomInfo from './Layout/RoomInfo';
import ChatBox from './Layout/ChatBox';

export default class Example extends React.Component {
  componentDidMount() {
    const _this = this;
    var firebase = setFirebaseConfig();
    var db = firebase.firestore();

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
            photoURL: user.photoURL
          }
        });

        db.collection('users').where('id', '==', user.uid).get().then(function(snapshot) {
          if (snapshot.size == 0) {
            db.collection('users').add({
              id: user.uid,
              name: user.displayName,
              email: user.email
            });
          }
        })

      } else {
        // User is signed out.
        window.location.href = '/login';
      }
    });
  }
  state = {
    user: {},
  };

  render() {
    return (
      <div className="div-block">
        <Row>
          <Col span={4}>
            <Sidebar user={this.state.user}/>
          </Col>
          <Col span={16}>
            <div id="frame">
              <div className="content">
                <div className="contact-profile">
                  <img src="https://www.w3schools.com/bootstrap/img_avatar3.png" alt="" />
                  <p>Harvey Specter</p>
                  <div className="social-media">
                    <i className="fa fa-facebook" aria-hidden="true"></i>
                    <i className="fa fa-twitter" aria-hidden="true"></i>
                     <i className="fa fa-instagram" aria-hidden="true"></i>
                  </div>
                </div>
                <div className="messages">
                  <ChatBox />
                </div>
                <div className="message-input">
                  <div className="wrap">
                  <input type="text" placeholder="Write your message..." />
                  <button className="submit">Send</button>
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
};
