import React from 'react';
import { Row, Col, Modal } from 'antd';
import 'antd/dist/antd.css';
import '../../src/css/layout.css';
import setFirebaseConfig from './../helpers/firebase';
import Sidebar from './Layout/Sidebar';
import Header from './Layout/Header';
import RoomInfo from './Layout/RoomInfo';
import ChatBox from './Layout/ChatBox';
import * as roomService from './../services/room';
import { withRouter } from 'react-router';
import CreateRoomForm from './Room/CreateRoomForm';
import moment from 'moment';

var db;
var firebase;
var _ = require('underscore');
var initRoomInfoState = {
  messages: [],
  members: [],
  roomInfo: {},
  images: []
};

class Home extends React.Component {
  state = {
    ...initRoomInfoState,
    user: {},
    rooms: [],
    roomEffect: '',
    visibleCreateRoom: false,
    myFriends: [],
    percentUploadFile: 0
  };

  showCreateRoomModal = () => {
    this.setState({
      visibleCreateRoom: true
    });
  };

  hideCreateRoomModal = () => {
    this.setState({
      visibleCreateRoom: false
    });
  };

  async changeDirectRoomNameAndAvatar(room) {
    const myFriend = _.reject(room.members, { user: this.state.user.uid });
    const roomId = this.props.match.params.roomId;
    const user = await this.getUserInfo(myFriend[0].user);
    const rooms = this.state.rooms;
    const indexDirectRoom = _.findIndex(rooms, function(r) {
      return r.id == room.id;
    });

    if (user && rooms.length > 0) {
      rooms[indexDirectRoom].name = user.name;
      rooms[indexDirectRoom].avatar = user.avatar;

      this.setState({
        rooms: rooms
      });

      if (roomId == room.id) {
        this.setState({
          roomInfo: {
            name: user.name,
            avatar: user.avatar
          }
        });
      }
    }
  };
  
  async getRoomInfo(roomId) {
    const roomInfo = await db.collection('rooms')
      .where('id', '==', roomId)
      .get();

    if (roomInfo.docs[0]) {
      return roomInfo.docs[0].data();
    } else {
      return null;
    }
  }

  async getMembersInfoInTheRoom(room) {
    var members = room.members;
    var result = [];

    for (let i = 0; i < members.length; i++) {
      var user = await db
        .collection('users')
        .where('id', '==', members[i].user)
        .get();

      result.push(user.docs[0].data());
    }

    return result;
  }

  async getFilesInTheRoom(roomId) {
    // Get all files of the room
    // Ref: https://firebase.google.com/docs/storage/web/list-files

    var listRef = await firebase.storage().ref().child('images/' + roomId).listAll();
    var result = [];

    for (let i = 0; i < listRef.items.length; i++) {
      var image = await listRef.items[i].getDownloadURL()

      result.push(image);
    }

    return result;
  }

  async getMessagesInRoomAndListenerSnapshot(roomId) {
    const _this = this;

    const room = await this.getRoomInfo(roomId);
    
    if (room.type == 2) {
      _this.changeDirectRoomNameAndAvatar(room);
    }

    const membersInfo = await this.getMembersInfoInTheRoom(room);
    const images = await this.getFilesInTheRoom(roomId);

    _this.setState({
      roomInfo: {
        name: room.name,
        avatar: room.avatar,
      },
      members: membersInfo,
      images: images
    });

    db.collection('rooms')
      .where('id', '==', roomId)
      .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
          var data = change.doc.data();

          if (roomId == _this.props.match.params.roomId) {
            _this.setState({
              messages: data.messages
            });
          }
        });
      });
  }

  componentDidUpdate(prevProps) {
    const roomId = this.props.match.params.roomId;

    if (prevProps.match.params.roomId != this.props.match.params.roomId) {
      // Restart unread message number
      const rooms = this.state.rooms;
      const indexRoom = _.findIndex(rooms, {
        id: roomId
      });
      rooms[indexRoom].unReadMessageNumber = 0;

      this.setState({
        rooms,
        roomEffect: roomId
      });

      // Restart state for new room
      this.setState(initRoomInfoState);
      this.getMessagesInRoomAndListenerSnapshot(roomId);
    }
  };

  async getDeviceToken(messaging) {
    try {
      let token = await messaging.requestPermission();

      return messaging.getToken();
    }  catch(e) {
      console.log(e);
    }
  };

  async getUserInfo(userId) {
    let user = await db.collection('users')
      .where('id', '==', userId)
      .get();

    if (user.docs[0]) {
      return user.docs[0].data()
    } else {
      return null;
    }
  }
  async getFriendsOfCurrentUser(userId) {
    let user = await this.getUserInfo(userId);
    let result = [];

    if (user.friends.length > 0) {
      let friends = user.friends;

      for (let i = 0; i < friends.length; i++) {
        let friendTmp = await this.getUserInfo(friends[i]);

        if (friendTmp) {
          result.push({
            id: friendTmp.id,
            name: friendTmp.name,
            email: friendTmp.email
          });
        }
      }
    }

    return result;
  }

  async addUserIntoUserTable(user) {
    try {
      let userDB = await db.collection('users')
        .where('id', '==', user.uid)
        .get();

      if (userDB.size == 0) {
        db.collection('users').add({
          id: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          friends: [],
          requests: []
        });
      }
    } catch (e) {
      console.log('Some error when add user into user table ', e);
    }
  }
  async componentDidMount() {
    const _this = this;
    const roomId = this.props.match.params.roomId;

    firebase = setFirebaseConfig();
    db = firebase.firestore();

    /*
    // Retrieve Firebase Messaging object.
    const messaging = firebase.messaging();

    const token = await this.getDeviceToken(messaging);

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        db.collection("users")
          .where("id", "==", user.uid)
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              const docRef = db.collection("users").doc(doc.id);
              docRef.get().then(function(subdoc) {
                const userObj = subdoc.data();
                if (!userObj.device_token) {
                  userObj.device_token = [token];
                  docRef.set(userObj);
                }

                if (!userObj.device_token.includes(token)) {
                  userObj.device_token.push(token);
                }

                docRef.update({
                  device_token: userObj.device_token
                });
              });
            });
          });
      }
    });

    messaging.onMessage(function(payload) {
      console.log('onMessage: ', payload);
    });
    */

    if (roomId) {
      this.getMessagesInRoomAndListenerSnapshot(roomId);
    }

    firebase.auth().onAuthStateChanged(async function(user) {
      if (user) {
        // User is signed in.

        let friends = await _this.getFriendsOfCurrentUser(user.uid);
        _this.setState({
          myFriends: friends,
          user: {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid
          }
        })

        await _this.addUserIntoUserTable(user);

        db.collection('rooms')
          .where('check_members', 'array-contains', user.uid)
          .onSnapshot(
            function(snapshot) {
              snapshot.docChanges().forEach(function(change) {
                if (change.type === 'added') {
                  let room = change.doc.data();

                  if (room.type == 2) {
                    _this.changeDirectRoomNameAndAvatar(room);
                  }

                  _this.setState({
                    rooms: [..._this.state.rooms, room],
                    roomEffect: _this.props.match.params.roomId
                  });
                }
                if (change.type === 'modified') {
                  const room = change.doc.data();
                  const roomId = _this.props.match.params.roomId;

                  if (room.id != roomId) {
                    const rooms = _this.state.rooms;
                    const indexRoom = _.findIndex(rooms, {
                      id: room.id
                    });

                    rooms[indexRoom].unReadMessageNumber =
                      room.messages.length - rooms[indexRoom].messages.length;

                    _this.setState({
                      rooms,
                      roomEffect: room.id
                    });
                  }
                }
                if (change.type === 'removed') {
                  console.log('Removed city: ', change.doc.data());
                }
              });
            },
            function(error) {}
          );
      } else {
        // User is signed out.
        window.location.href = '/login';
      }
    });
  }

  sendMessage = e => {
    const roomId = this.props.match.params.roomId;
    const content = document.getElementById('js-msg-content').value;
    const now = moment().valueOf();
    if (
      ((e.type == 'keyup' && e.key === 'Enter') || e.type == 'click') &&
      content
    ) {
      const userId = this.state.user.uid;
      var msgData = {
        user: userId,
        content: content,
        is_notification: false,
        created_at: now,
        updated_at: now
      };
      roomService.sendMessage(db, roomId, msgData);
      document.getElementById('js-msg-content').value = '';
    }
  };

  uploadImage = () => {
    var file = document.getElementById('file');

    file.click();
  };

  uploadFile = e => {
    const roomId = this.props.match.params.roomId;
    var _this = this;
    var storage = firebase.storage();

    // Create a storage reference from our storage service
    var storageRef = storage.ref();
    // Create a child reference
    var fileObj = e.target.files[0];

    var nameFile = fileObj.name
      .split('.')
      .slice(0, -1)
      .join('.');

    const newNameFile = fileObj.name.replace(nameFile, nameFile + Date.now());
    var imagesRef = storageRef.child('images/' + roomId + '/' + newNameFile);

    // Create the file metadata
    var metadata = {
      contentType: 'image/jpeg'
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = imagesRef.put(fileObj, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function(snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        _this.setState({
          percentUploadFile: parseInt(progress)
        });

        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      },
      function(error) {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;

          case 'storage/canceled':
            // User canceled the upload
            break;

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      function() {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log('File available at', downloadURL);
          const now = moment().valueOf();

          const userId = _this.state.user.uid;
          var msgData = {
            user: userId,
            content: downloadURL,
            is_notification: false,
            is_file: true,
            created_at: now,
            updated_at: now
          };

          roomService.sendMessage(db, roomId, msgData);
        });
      }
    );
  };

  logout = () => {
    firebase
      .auth()
      .signOut()
      .then(
        function() {
          // Sign-out successful.
        },
        function(error) {
          // An error happened.
        }
      );
  };

  render() {
    const roomId = this.props.match.params.roomId;
    const { myFriends } = this.state;

    return (
      <div className="div-block">
        <Modal
          title="Create new room"
          visible={this.state.visibleCreateRoom}
          onOk={this.showCreateRoomModal}
          onCancel={this.hideCreateRoomModal}
          footer={null}
        >
          <CreateRoomForm
            friends={this.state.myFriends}
            db={db}
            firebase={firebase}
            user={this.state.user}
            hideCreateRoomModal={this.hideCreateRoomModal}
          />
        </Modal>
        <Row className="class-header">
          <Col span={24}>
            <Header
              user={this.state.user}
              db={db}
              showCreateRoomModal={this.showCreateRoomModal}
              logout={this.logout}
            />
          </Col>
        </Row>
        <Row>
          <Col span={4}>
            <Sidebar
              user={this.state.user}
              db={db}
              rooms={this.state.rooms}
              currentRoomId={roomId}
              showCreateRoomModal={this.showCreateRoomModal}
            />
          </Col>

          {roomId ? (
            <React.Fragment>
              <Col span={15}>
                <div id="frame">
                  <div className="content">
                    <div className="contact-profile">
                      <img src={this.state.roomInfo.avatar} alt="" />
                      <p>{this.state.roomInfo.name}</p>
                    </div>
                    <div className="messages">
                      <ChatBox
                        messages={this.state.messages}
                        members={this.state.members}
                        uid={this.state.user.uid}
                        progress={this.state.percentUploadFile}
                        roomEffect={this.state.roomEffect}
                      />
                    </div>
                    <div className="message-input">
                      <div className="wrap">
                        <input
                          type="text"
                          placeholder="Write your message..."
                          id="js-msg-content"
                          onKeyUp={this.sendMessage}
                        />
                        <input
                          type="file"
                          onChange={this.uploadFile}
                          id="file"
                          className="file"
                        />
                        <i
                          className="fa fa-paperclip attachment"
                          aria-hidden="true"
                          onClick={this.uploadImage}
                        ></i>
                        <button className="submit" onClick={this.sendMessage}>
                          <i
                            className="fa fa-paper-plane"
                            aria-hidden="true"
                          ></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={5}>
                <RoomInfo
                  members={this.state.members}
                  roomInfo={this.state.roomInfo}
                  images={this.state.images}
                />
              </Col>
            </React.Fragment>
          ) : (
            <div className="chatbox">
              <Row>
                <Col span={4}></Col>
                <Col span={12} className="no-room">
                  <h3 className="home-welcome">
                    Welcome, {this.state.user.name}
                  </h3>
                  <img className="home-avatar" src={this.state.user.photoURL} />
                  <p className="home-title">
                    Select a room to start conversation
                  </p>
                  <div className="home-footer">
                    <p>
                      You are signed in as <span>{this.state.user.email}</span>
                    </p>
                    <p className="copyright">
                      Copyright © 2019 <span>SKY MT-N</span> - Design by
                      <span>SKY MT-N</span>
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Row>
      </div>
    );
  }
}

export default withRouter(Home);
