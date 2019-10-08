import React, { Component } from 'react';

const _ = require('underscore');

export default class ChatBox extends Component {
  render() {
    var messagesHTML = [];
    var members = this.props.members;

    this.props.messages.map(m => {
      var userInfo = _.findWhere(this.props.members, { id: m.user });

      if (userInfo) {
        if (userInfo.id != this.props.uid) {
          messagesHTML.push(
            <li className="sent">
              <img src={userInfo.avatar} alt="" />
              <p>{m.content}</p>
            </li>
          );
        } else {
          messagesHTML.push(
            <li className="replies">
              <img src={userInfo.avatar} alt="" />
              <p>{m.content}</p>
            </li>
          );
        }
      }
    });

    return <ul>{messagesHTML}</ul>;
  }
}
