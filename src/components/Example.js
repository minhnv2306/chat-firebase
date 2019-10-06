import React from 'react';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import setFirebaseConfig from './../helpers/firebase';
import Header from './Layout/Header';
import Footer from './Layout/Footer';
import Sidebar from './Layout/Sidebar';
import RoomInfo from './Layout/RoomInfo';

export default class Example extends React.Component {
  render() {
    var firebase = setFirebaseConfig();

    firebase.database().ref('/messages').once('value', function(snapshot) {
      console.log(snapshot.val());
    })
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
