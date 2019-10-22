import React, { Component } from 'react';
import { Drawer, Avatar, Progress, Modal } from 'antd';
import moment from 'moment';
import {
  isDifferentUser,
  isDifferentDate,
  isDifferentFormatHourAndMinute,
  generateDateLine
} from '../../helpers/message';

const _ = require('underscore');

export default class ChatBox extends Component {
  state = {
    visible: false,
    member: {},
    isShowImage: false,
    imageMessageURL: ''
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

  showImageModal = imageURL => {
    this.setState({
      isShowImage: true,
      imageMessageURL: imageURL
    });
  };

  hideImageModal = () => {
    this.setState({
      isShowImage: false,
      imageMessageURL: ''
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
    const messages = this.props.messages;

    messages.map((m, index) => {
      var userInfo = _.findWhere(members, { id: m.user });
      let isShowAvatar, isShowTime;

      // Set show avatar and show time of the message
      isShowAvatar = index > 0 && isDifferentUser(m, messages[index - 1]);
      isShowTime =
        index > 0 &&
        (isDifferentUser(m, messages[index - 1]) ||
          isDifferentFormatHourAndMinute(m, messages[index - 1]));
      if (isShowAvatar) isShowTime = true;

      if (index == 0) {
        messagesHTML.push(generateDateLine(m.created_at));

        isShowAvatar = isShowTime = true;
      }

      if (index > 0 && isDifferentDate(m, messages[index - 1])) {
        messagesHTML.push(generateDateLine(m.created_at));

        isShowAvatar = true;
      }

      if (userInfo) {
        // Set class name for the message
        let className;

        if (userInfo.id == uid) {
          if (isShowAvatar) {
            className = 'replies';
          } else {
            className = 'replies replie-no-avatar';
          }
        } else {
          if (isShowAvatar) {
            className = 'sent';
          } else {
            className = 'sent sent-no-avatar';
          }
        }

        messagesHTML.push(
          <li className={className} ref={index} key={index}>
            {isShowAvatar && (
              <img
                src={userInfo.avatar}
                onClick={() => this.showDrawer(m.user)}
              />
            )}
            {m.is_file ? (
              <React.Fragment>
                {isShowTime && (
                  <h6>
                    {moment(
                      parseInt(m.updated_at ? m.updated_at : m.created_at)
                    ).format('hh:mm A')}
                  </h6>
                )}
                <img
                  className="image-msg img-rounded"
                  src={m.content}
                  onClick={() => this.showImageModal(m.content)}
                />
              </React.Fragment>
            ) : (
              <div className="message-content">
                {isShowTime && (
                  <h6>
                    {moment(
                      parseInt(m.updated_at ? m.updated_at : m.created_at)
                    ).format('hh:mm A')}
                  </h6>
                )}
                <p>{m.content}</p>
              </div>
            )}
          </li>
        );
      }
    });

    var progressHTML;

    if (this.props.progress > 0 && this.props.progress < 100) {
      progressHTML = (
        <li className="replies">
          <Progress type="circle" percent={this.props.progress} width={60} />
        </li>
      );
    } else {
      progressHTML = '';
    }

    return (
      <div>
        <ul>
          {messagesHTML}
          {progressHTML}
        </ul>
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

        <Modal
          title="Image"
          visible={this.state.isShowImage}
          onCancel={this.hideImageModal}
          footer={null}
        >
          <img src={this.state.imageMessageURL} width="100%" />
        </Modal>
      </div>
    );
  }
}
