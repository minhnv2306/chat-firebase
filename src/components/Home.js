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

  changeDirectRoomNameAndAvatar(room) {
    const _this = this;
    const myFriend = _.reject(room.members, { user: _this.state.user.uid });
    const roomId = this.props.match.params.roomId;

    db.collection('users')
      .where('id', '==', myFriend[0].user)
      .get()
      .then(function(snapshot) {
        if (snapshot.docs[0]) {
          let user = snapshot.docs[0].data();
          let rooms = _this.state.rooms;
          const indexDirectRoom = _.findIndex(rooms, function(r) {
            return r.id == room.id;
          });

          rooms[indexDirectRoom].name = user.name;
          rooms[indexDirectRoom].avatar = user.avatar;

          _this.setState({
            rooms: rooms
          });

          if (roomId == room.id) {
            _this.setState({
              roomInfo: {
                name: user.name,
                avatar: user.avatar
              }
            });
          }
        }
      });
  }

  getMessagesInRoomAndListenerSnapshot(roomId) {
    const _this = this;

    db.collection('rooms')
      .where('id', '==', roomId)
      .get()
      .then(function(snapshot) {
        snapshot.forEach(function(doc) {
          let room = doc.data();

          if (room.type == 2) {
            _this.changeDirectRoomNameAndAvatar(room);
          }

          var members = doc.data().members;

          members.map(async m => {
            var user = await db
              .collection('users')
              .where('id', '==', m.user)
              .get();

            if (
              user.docs[0] &&
              _.findWhere(_this.state.members, {
                id: user.docs[0].data().id
              }) == undefined
            ) {
              _this.setState({
                members: [..._this.state.members, user.docs[0].data()]
              });
            }
          });

          _this.setState({
            roomInfo: {
              name: doc.data().name,
              avatar: doc.data().avatar
            }
          });
        });
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

    var storage = firebase.storage();
    // Create a storage reference from our storage service
    var storageRef = storage.ref();
    // Create a reference under which you want to list
    var listRef = storageRef.child('images/' + roomId);

    // Find all the prefixes and items.
    listRef
      .listAll()
      .then(function(res) {
        res.prefixes.forEach(function(folderRef) {
          // All the prefixes under listRef.
          // You may call listAll() recursively on them.
        });
        res.items.forEach(function(itemRef) {
          // All the items under listRef.
          itemRef.getDownloadURL().then(function(downloadURL) {
            _this.setState({
              images: [..._this.state.images, downloadURL]
            });
          });
        });
      })
      .catch(function(error) {
        // Uh-oh, an error occurred!
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
        rooms
      });

      // Restart state for new room
      this.setState(initRoomInfoState);
      this.getMessagesInRoomAndListenerSnapshot(roomId);
    }
  }

  componentDidMount() {
    const _this = this;
    const roomId = this.props.match.params.roomId;

    firebase = setFirebaseConfig();
    db = firebase.firestore();

    // Retrieve Firebase Messaging object.
    const messaging = firebase.messaging();

    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messaging
      .requestPermission()
      .then(function() {
        console.log('Have permission');

        return messaging.getToken();
      })
      .then(function(token) {
        console.log(token);
      })
      .catch(function(err) {
        console.log('Error occurred', err);
      });

    messaging.onMessage(function(payload) {
      console.log('onMessage: ', payload);
    });

    if (roomId) {
      this.getMessagesInRoomAndListenerSnapshot(roomId);
    }

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        _this.setState({
          user: {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid
          }
        });

        db.collection('users')
          .where('id', '==', user.uid)
          .get()
          .then(function(snapshot) {
            if (snapshot.size == 0) {
              db.collection('users').add({
                id: user.uid,
                name: user.displayName,
                email: user.email,
                avatar: user.photoURL,
                friends: [],
                requests: []
              });
            }
          });

        db.collection('users')
          .where('id', '==', user.uid)
          .get()
          .then(function(snapshot) {
            if (snapshot.size > 0) {
              let currentUserInfo = snapshot.docs[0].data();

              if (currentUserInfo.friends.length > 0) {
                let friends = currentUserInfo.friends;

                friends.map(function(uid) {
                  db.collection('users')
                    .where('id', '==', uid)
                    .get()
                    .then(function(snapshot) {
                      if (snapshot.docs[0]) {
                        let userTmp = snapshot.docs[0].data();
                        let friendTmp = {
                          id: userTmp.id,
                          name: userTmp.name,
                          email: userTmp.email
                        };

                        _this.setState({
                          myFriends: [..._this.state.myFriends, friendTmp]
                        });
                      }
                    });
                });
              }
            }
          });

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
                    rooms: [..._this.state.rooms, room]
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
                      rooms
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
    if (
      ((e.type == 'keyup' && e.key === 'Enter') || e.type == 'click') &&
      content
    ) {
      const userId = this.state.user.uid;
      var msgData = {
        user: userId,
        content: content,
        is_notification: false
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

          const userId = _this.state.user.uid;
          var msgData = {
            user: userId,
            content: downloadURL,
            is_notification: false,
            is_file: true
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
                    Select a room to start conversation{' '}
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
