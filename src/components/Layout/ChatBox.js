import React, { Component } from 'react';

const _ = require('underscore');
var ref;

export default class ChatBox extends Component {
  componentDidUpdate() {
    var maxLength = this.props.messages.length;

    if (this.refs[maxLength - 1]) {
      this.refs[maxLength - 1].scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }
  render() {
    var messagesHTML = [];
    var members = this.props.members;

    this.props.messages.map((m, index) => {
      var userInfo = _.findWhere(this.props.members, { id: m.user });

      if (userInfo) {
        if (userInfo.id != this.props.uid) {
          messagesHTML.push(
            <li className="sent" ref={index} key={index}>
              <img src={userInfo.avatar} alt="" />
              <p>{m.content}</p>
            </li>
          );
        } else {
          messagesHTML.push(
            <li className="replies" ref={index} key={index}>
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
