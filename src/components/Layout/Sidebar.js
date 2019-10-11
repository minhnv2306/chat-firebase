import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import { Input } from 'antd';
import { List, Avatar, Checkbox, Spin, message, Alert } from 'antd';
import { Tabs } from 'antd';

const { TabPane } = Tabs;
const { Search } = Input;

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      requests: [],
      invites: []
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

  componentDidMount() {}
  callback = key => {
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
    let a = this.props.db
      .collection('users')
      .orderBy('email')
      .startAt(value)
      .endAt(value)
      .get()
      .then(querySnapshot => {
        let request = [];
        querySnapshot.forEach(function(doc) {
          if (doc) {
            request.push(doc.data());
          }
        });
        this.setState({ requests: request });
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
        });
      });
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
      name: 'Direct chat',
      type: 2,
      member: [{ role: 2, user: id }, { role: 2, user: _this.props.user.uid }],
      check_members: [id, _this.props.user.uid]
    });

    this.setState(prevState => ({
      invites: prevState.invites.filter(item => item.id != id)
    }));
  };

  render() {
    var roomsHTML = [];
    var rooms = this.props.rooms;

    if (typeof rooms !== 'undefined' && rooms.length > 0) {
      this.props.rooms.map((room, i) => {
        room.content = '';
        if (typeof room.messages !== 'undefined' && room.messages.length > 0) {
          room.content = room.messages[room.messages.length - 1].content;
        }

        roomsHTML.push(
          <li key={i} className="contact active">
            <div className="wrap">
              <span className="contact-status online" />
              <img src={room.avatar} alt={room.name} />
              <div className="meta">
                <p className="name">{room.name}</p>
                <p className="preview">{room.content}</p>
              </div>
            </div>
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
            <button id="settings">
              <i className="fa fa-cog fa-fw" aria-hidden="true" />{" "}
              <span>Settings</span>
            </button>
          </div>
        </div>
        <Modal
          title="Tim kiem ban be"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Tabs defaultActiveKey="1" onChange={this.callback}>
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
                        <Button onClick={() => this.hanleSendRequest(item.id)}>
                          Gửi lời mời kết bạn
                        </Button>
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
