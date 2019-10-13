import React, { Component } from 'react';
import { Modal, Button, Input } from 'antd';
import { List, Avatar, Checkbox, Spin, message, Alert } from 'antd';
import { Link } from "react-router-dom";
import { Tabs } from 'antd';
import { generateRoomId } from './../../helpers/function';

const { TabPane } = Tabs;
const { Search } = Input;

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      requests: [],
      invites: [],
      visibleCreateRoom: false
    };
  }

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  changeTabRequestsAndFriends = key => {
    this.setState({ invites: [] });
    const _this = this;
    if (key == 2) {
      _this.props.db
        .collection('users')
        .where('id', '==', this.props.user.uid)
        .get()
        .then(function(snapshot) {
          snapshot.forEach(function(doc) {
            var invite = doc.data().requests;

            invite.map(async idUser => {
              var user = await _this.props.db
                .collection('users')
                .where('id', '==', idUser)
                .get();
              _this.setState({
                invites: [..._this.state.invites, user.docs[0].data()]
              });
            });
          });
        });
    }
  };

  search = value => {
    var _this = this;
    this.props.db
      .collection('users')
      .orderBy('email')
      .startAt(value)
      .endAt(value)
      .get()
      .then(querySnapshot => {
        let result = [];
        querySnapshot.forEach(function(doc) {
          if (doc) {
            if (doc.data().id != _this.props.user.uid) {
              result.push(doc.data());
            }
          }
        });
        this.setState({ requests: result });
      });
  };

  hanleSendRequest = id => {
    var _this = this;
    this.props.db
      .collection('users')
      .where('id', '==', id)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          var data = doc.data();
          _this.props.db
            .collection('users')
            .doc(doc.id)
            .update({ requests: data.requests.concat(_this.props.user.uid) });
          message.success('Gửi lời mời kết bạn thành công', 10);
        });
      });

    this.setState(prevState => ({
      requests: prevState.requests.filter(item => item.id != id)
    }));
  };

  handleAcceptRequest = id => {
    var _this = this;
    this.props.db
      .collection('users')
      .where('id', '==', _this.props.user.uid)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          var data = doc.data();
          var a = data.requests.filter(function(value, index, array) {
            return value != id;
          });
          _this.props.db
            .collection('users')
            .doc(doc.id)
            .update({
              requests: a
            });
        });
      });

    this.props.db
      .collection('users')
      .where('id', '==', id)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          var data = doc.data();
          _this.props.db
            .collection('users')
            .doc(doc.id)
            .update({ friends: data.friends.concat(_this.props.user.uid) });
        });
      });

    this.props.db
      .collection('users')
      .where('id', '==', this.props.user.uid)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          var data = doc.data();

          _this.props.db
            .collection('users')
            .doc(doc.id)
            .update({ friends: data.friends.concat(id) });
        });
      });

    this.props.db.collection('rooms').add({
      id: generateRoomId(),
      name: 'Direct chat',
      type: 2,
      members: [{ role: 2, user: id }, { role: 2, user: _this.props.user.uid }],
      messages: [],
      check_members: [id, _this.props.user.uid]
    });

    this.setState(prevState => ({
      invites: prevState.invites.filter(item => item.id != id)
    }));
    message.success('Chấp nhận lời mời kết bạn thành công', 10);
  };

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

        const isActive = (currentRoomId == room.id) ? 'active' : '';

        roomsHTML.push(
          <li key={i} className={"contact " + isActive} >
            <Link to={"/rooms/" + room.id}>
              <div className="wrap">
                <span className="contact-status online" />
                <img src={room.avatar} alt={room.name} />
                <div className="meta">
                  <p className="name">{room.name}</p>
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
          <div id="bottom-bar">
            <button id="addcontact" onClick={this.showModal}>
              <i className="fa fa-user-plus fa-fw" aria-hidden="true" />{' '}
              <span>Add contact</span>
            </button>
            <button id="settings" onClick={this.props.showCreateRoomModal}>
              <i className="fa fa-cog fa-fw" aria-hidden="true" />{' '}
              <span>Create room</span>
            </button>
          </div>
        </div>

        <Modal
          title="Tim kiem ban be"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Tabs defaultActiveKey="1" onChange={this.changeTabRequestsAndFriends}>
            <TabPane tab="Tìm kiếm bạn bè" key="1">
              <Search
                placeholder="input search text"
                enterButton="Search"
                size="large"
                onSearch={value => this.search(value)}
              />
              {this.state.requests.length > 0 ? (
                <List
                  dataSource={this.state.requests}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        avatar={<Avatar className="" src={item.avatar} />}
                        title={item.name}
                        description={item.email}
                      />

                      <Button.Group className="btn-accept">
                        {item.requests.includes(this.props.user.uid) ? (
                          <Button className="friends">
                            Đã gửi lời mời kết bạn
                          </Button>
                        ) : (
                          ''
                        )}
                        {item.friends.includes(this.props.user.uid) ? (
                          <Button className="friends"> Đã là bạn bè</Button>
                        ) : (
                          ''
                        )}
                        {!item.requests.includes(this.props.user.uid) &&
                        !item.friends.includes(this.props.user.uid) ? (
                          <Button
                            onClick={() => this.hanleSendRequest(item.id)}
                          >
                            Gửi lời mời kết bạn
                          </Button>
                        ) : (
                          ''
                        )}
                      </Button.Group>
                    </List.Item>
                  )}
                ></List>
              ) : (
                ''
              )}
            </TabPane>
            <TabPane tab=" Thêm bạn bè" key="2">
              {this.state.invites.length > 0 ? (
                <List
                  dataSource={this.state.invites}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        avatar={<Avatar className="" src={item.avatar} />}
                        title={item.name}
                        description={item.email}
                      />

                      <Button.Group className="btn-accept">
                        <Button
                          onClick={() => this.handleAcceptRequest(item.id)}
                        >
                          Chấp nhận lời mời
                        </Button>
                      </Button.Group>
                    </List.Item>
                  )}
                ></List>
              ) : (
                'Chưa có lời mời kết bạn nào'
              )}
            </TabPane>
          </Tabs>
        </Modal>
      </div>
    );
  }
}
