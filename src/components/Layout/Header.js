import React, { Component } from 'react';
import {
  Row,
  Col,
  Modal,
  Dropdown,
  Icon,
  Menu,
  List,
  Avatar,
  Button,
  message,
  Badge,
  Tabs,
  Input
} from 'antd';
import { Link } from 'react-router-dom';
import '../../../src/css/layout.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { generateRoomId } from './../../helpers/function';

const { TabPane } = Tabs;
const { Search } = Input;
let isAssignListener = false;

export default class Header extends Component {
  state = {
    invites: [],
    requests: [],
    requestNumber: 0
  };

  componentDidUpdate() {
    if (!isAssignListener && this.props.user) {
      const _this = this;
      const currentUser = this.props.user;

      this.props.db
        .collection('users')
        .where('id', '==', currentUser.uid)
        .onSnapshot(function(snapshot) {
          if (snapshot.docs[0]) {
            _this.setState({
              requestNumber: snapshot.docs[0].data().requests.length
            });
          }
        });
      isAssignListener = true;
    }
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
          message.success('Send friend request successfully');
        });
      });

    this.setState(prevState => ({
      requests: prevState.requests.filter(item => item.id != id)
    }));
  };

  loadInvite = () => {
    this.setState({ invites: [] });
    const _this = this;
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
    message.success('Accept successfully');
  };
  render() {
    const data = this.state.invites;
    const menu = (
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar className="" src={item.avatar} />}
              title={item.name}
              description={item.email}
            />

            <Button
              onClick={() => this.handleAcceptRequest(item.id)}
              style={{ marginRight: '10px' }}
            >
              Accept
            </Button>
          </List.Item>
        )}
      />
    );
    return (
      <div>
        <Modal
          title="Find friends"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <Search
            placeholder="Email"
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
                      <Button className="friends">Sent the request</Button>
                    ) : (
                      ''
                    )}
                    {item.friends.includes(this.props.user.uid) ? (
                      <Button className="friends"> Friends </Button>
                    ) : (
                      ''
                    )}
                    {!item.requests.includes(this.props.user.uid) &&
                    !item.friends.includes(this.props.user.uid) ? (
                      <Button onClick={() => this.hanleSendRequest(item.id)}>
                        Send request
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
        </Modal>
        <Row>
          <Col span={4}>
            <img
              className="header-logo"
              src="http://product.hstatic.net/1000021001/product/upload_a378176cbd894c57b91adb86ab89af9c_master.jpg"
              alt="Sky logo"
            />
            <span className="header-name">Sky's Team</span>
          </Col>
          <Col span={15}>
            <Row className="text-center header-icon">
              <Col span={6} />
              <Col span={3}>
                <Link to="#">
                  <i className="fa fa-home" aria-hidden="true" />
                </Link>
              </Col>
              <Col span={3}>
                <Link to="#">
                  <i className="fa fa-video-camera" aria-hidden="true" />
                </Link>
              </Col>
              <Col span={3}>
                <Link to="#">
                  <i
                    className="fa fa-user-plus"
                    aria-hidden="true"
                    onClick={this.showModal}
                  />
                </Link>
              </Col>
              <Col span={3}>
                <Dropdown
                  overlay={menu}
                  trigger={['click']}
                  onClick={this.loadInvite}
                >
                  <Badge count={this.state.requestNumber}>
                    <i className="fa fa-users" aria-hidden="true" />
                  </Badge>
                </Dropdown>
              </Col>

              <Col span={3}>
                <i
                  className="fa fa-plus-circle"
                  aria-hidden="true"
                  onClick={this.props.showCreateRoomModal}
                />
              </Col>
            </Row>
          </Col>
          <Col span={5} />
        </Row>
      </div>
    );
  }
}
