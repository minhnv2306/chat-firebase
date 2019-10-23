import React, { Component } from 'react';
import 'antd/dist/antd.css';
import '../css/timeline.css';
import { Timeline } from 'antd';
import setFirebaseConfig from './../helpers/firebase';
import moment from 'moment';

export default class TimeLine extends Component {
  state = {
    logs: []
  };

  componentDidMount() {
    var firebase = setFirebaseConfig();
    var db = firebase.database();
    var _this = this;

    db.ref('git').on('value', function(snapshot) {
      _this.setState({
        logs: snapshot.val()
      });
    });
  }
  render() {
    const { logs } = this.state;
    const timelineHTML = [];
    var logsArrTmp = [];

    for (var key in logs) {
      var value = logs[key];

      logsArrTmp.push(value);
    }

    for (var i = logsArrTmp.length - 1; i >= 0; i--) {
      const value = logsArrTmp[i];
      timelineHTML.push(
        <Timeline.Item key={i}>
          <img src={value.user_avatar} width="22" /> {value.content} [
          {moment(value.created_at).format('LLL')}]
          <br />
          <a href={value.click_action}> View detail </a>
        </Timeline.Item>
      );
    }
    return (
      <Timeline mode="alternate" className="timeline">
        <div className="padding-left-20">
          <h1> Demo Cloud Function</h1>
          <p>Integrate with third-party services and APIs</p>
          <p>
            Github repository use webhook (push event):
            https://github.com/minhbnv-1408/test_webhook
          </p>
        </div>

        {timelineHTML}
      </Timeline>
    );
  }
}
