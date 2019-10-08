import React from 'react';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import setFirebaseConfig from './../helpers/firebase';
import Header from './Layout/Header';
import Footer from './Layout/Footer';
import Sidebar from './Layout/Sidebar';
import RoomInfo from './Layout/RoomInfo';

export default class Example extends React.Component {
  componentDidMount() {
    const _this = this;
    var firebase = setFirebaseConfig();

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
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        });

      } else {
        // User is signed out.
        window.location.href = '/login';
      }
    });
  }
  state = {
    name: '',
    email: '',
    photoURL: ''
  };

  render() {
    return (
      <div>
        <Row>
          <Col span={4}>
            <Sidebar />
          </Col>
          <Col span={16}>
            <div id="frame">
              <div className="content">
                <div className="contact-profile">
                  <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                  <p>Harvey Specter</p>
                  <div className="social-media">
                    <i className="fa fa-facebook" aria-hidden="true"></i>
                    <i className="fa fa-twitter" aria-hidden="true"></i>
                     <i className="fa fa-instagram" aria-hidden="true"></i>
                  </div>
                </div>
                <div className="messages">
                  <ul>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>How the hell am I supposed to get a jury to believe you when I am not even sure that I do?!</p>
                    </li>
                    <li className="replies">
                      <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                      <p>When you're backed against the wall, break the god damn thing down.</p>
                    </li>
                    <li className="replies">
                      <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                      <p>Excuses don't win championships.</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>Oh yeah, did Michael Jordan tell you that?</p>
                    </li>
                    <li className="replies">
                      <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                      <p>No, I told him that.</p>
                    </li>
                    <li className="replies">
                      <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                      <p>What are your choices when someone puts a gun to your head?</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                    <li className="replies">
                      <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                      <p>Wrong. You take the gun, or you pull out a bigger one. Or, you call their bluff. Or, you do any one of a hundred and forty six other things.</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                    <li className="replies">
                      <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                      <p>Wrong. You take the gun, or you pull out a bigger one. Or, you call their bluff. Or, you do any one of a hundred and forty six other things.</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                    <li className="sent">
                      <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                      <p>What are you talking about? You do what they say or they shoot you.</p>
                    </li>
                  </ul>
                </div>
                <div className="message-input">
                  <div className="wrap">
                  <input type="text" placeholder="Write your message..." />
                  <button className="submit">Enter</button>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col span={4}>
            <RoomInfo />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Footer />
          </Col>
        </Row>
      </div>
    );
  }
};
