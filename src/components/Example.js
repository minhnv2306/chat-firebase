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
          <Col span={24}>
            <Header />
          </Col>
        </Row>
        <Row>
          <Col span={4}>
            <Sidebar />
          </Col>
          <Col span={14}>
            <h1> Room Content </h1>
          </Col>
          <Col span={6}>
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
