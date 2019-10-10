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
        const className = (userInfo.id == this.props.uid) ? 'replies' : 'sent';
        messagesHTML.push(
          <li className={className} ref={index} key={index}>
            <img src={userInfo.avatar} alt="" />
            { m.is_file ? (<img className="image-msg img-rounded" src={m.content} />) : (<p>{m.content}</p>)}
          </li>
        );
      }
    });

    return <ul>{messagesHTML}</ul>;
  }
}
