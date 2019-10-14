import React, { Component } from 'react';
import { Drawer, Avatar } from 'antd';

const _ = require('underscore');

export default class ChatBox extends Component {
  state = {
    visible: false,
    member: {}
  };
  componentDidUpdate() {
    var maxLength = this.props.messages.length;

    if (this.refs[maxLength - 1]) {
      this.refs[maxLength - 1].scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }

  showDrawer = memberId => {
    const { members } = this.props;
    const member = _.findWhere(members, { id: memberId });

    this.setState({
      visible: true,
      member: member
    });
  };

  onClose = () => {
    this.setState({
      visible: false
    });
  };

  render() {
    var messagesHTML = [];
    const { members, uid } = this.props;
    const { member } = this.state;

    this.props.messages.map((m, index) => {
      var userInfo = _.findWhere(members, { id: m.user });

      if (userInfo) {
        const className = userInfo.id == uid ? 'replies' : 'sent';
        messagesHTML.push(
          <li className={className} ref={index} key={index}>
            <img
              src={userInfo.avatar}
              onClick={() => this.showDrawer(m.user)}
            />
            {m.is_file ? (
              <img className="image-msg img-rounded" src={m.content} />
            ) : (
              <p>{m.content}</p>
            )}
          </li>
        );
      }
    });

    return (
      <div>
        <ul>{messagesHTML}</ul>
        <Drawer
          title="User information"
          placement="right"
          closable={false}
          onClose={this.onClose}
          visible={this.state.visible}
          width={350}
        >
          <Avatar src={member.avatar} size={90} />
          <p style={{ paddingTop: '20px' }}>User name: {member.name}</p>
          <p>Email: {member.email}</p>
        </Drawer>
      </div>
    );
  }
}
