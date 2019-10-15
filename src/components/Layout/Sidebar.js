import React, { Component } from 'react';
import { Modal, Button, Input } from 'antd';
import { List, Avatar, Checkbox, Spin, message, Alert, Badge } from 'antd';
import { Link } from 'react-router-dom';
import { Tabs } from 'antd';
import { generateRoomId } from './../../helpers/function';

const { TabPane } = Tabs;
const { Search } = Input;
var _ = require('underscore');

export default class Sidebar extends Component {
  componentDidUpdate() {
    const rooms = this.props.rooms;
    const roomHasUnReadMsg = _.filter(rooms, function(r) {
      return r.unReadMessageNumber;
    });

    if (roomHasUnReadMsg.length > 0) {
      document.getElementsByTagName('title')[0].innerHTML =
        "Sky'ss(" + roomHasUnReadMsg.length + ')';
    } else {
      document.getElementsByTagName('title')[0].innerHTML = "Sky'ss";
    }
  }

  render() {
    var roomsHTML = [];
    var rooms = this.props.rooms;
    var currentRoomId = this.props.currentRoomId;

    if (typeof rooms !== 'undefined' && rooms.length > 0) {
      this.props.rooms.map((room, i) => {
        room.content = '';
        if (typeof room.messages !== 'undefined' && room.messages.length > 0) {
          room.content = room.messages[room.messages.length - 1].content;
        }

        const isActive = currentRoomId == room.id ? 'active' : '';

        roomsHTML.push(
          <li key={i} className={'contact ' + isActive}>
            <Link to={'/rooms/' + room.id}>
              <div className="wrap">
                <span className="contact-status online" />
                <img src={room.avatar} alt={room.name} />
                <div className="meta">
                  <p className="name">
                    {room.name}
                    {room.unReadMessageNumber > 0 &&
                      ' (' + room.unReadMessageNumber + ')'}
                  </p>
                  <p className="preview">{room.content}</p>
                </div>
              </div>
            </Link>
          </li>
        );
      });
    }

    return (
      <div id="frame">
        <div id="sidepanel">
          <div id="profile">
            <div className="wrap">
              <img
                id="profile-img"
                src={this.props.user.photoURL}
                className="online"
                alt=""
              />
              <p>{this.props.user.name}</p>
              <i
                className="fa fa-chevron-down expand-button"
                aria-hidden="true"
              />
              <div id="status-options">
                <ul>
                  <li id="status-online" className="active">
                    <span className="status-circle" /> <p>Online</p>
                  </li>
                  <li id="status-away">
                    <span className="status-circle" /> <p>Away</p>
                  </li>
                  <li id="status-busy">
                    <span className="status-circle" /> <p>Busy</p>
                  </li>
                  <li id="status-offline">
                    <span className="status-circle" /> <p>Offline</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div id="search">
            <label htmlFor="">
              <i className="fa fa-search" aria-hidden="true" />
            </label>
            <input type="text" placeholder="Search contacts..." />
          </div>
          <div id="contacts">
            <ul>{roomsHTML}</ul>
          </div>
        </div>
      </div>
    );
  }
}
