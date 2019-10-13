import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { Form, Select, Input, Button, message } from 'antd';
import UploadAvatar from './UploadAvatar';
import { generateRoomId } from './../../helpers/function';

const { Option } = Select;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

class CreateRoom extends React.Component {
  state = {
    loading: false,
    imageUrl: '',
    imageOrigin: ''
  };

  handleChangeAvatar = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          loading: false,
          imageOrigin: info.file,
        }),
      );
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    var _this = this;
    const currentUser = this.props.user;
    
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const db = this.props.db;
        const membersObj = [{
          role: 1,
          user: currentUser.uid
        }];

        values.members.map(member => {
          membersObj.push({
            role: 1,
            user: member
          })
        })

        if (this.state.imageUrl) {
          var firebase = this.props.firebase;
          var image = this.state.imageUrl;
          var storage = firebase.storage();
          // Create a storage reference from our storage service
          var storageRef = storage.ref();
          // Create a child reference
          var imagesRef = storageRef.child('room/avatars/' + this.state.imageOrigin.name);

          // Upload file and metadata to the object 'images/mountains.jpg'
          var uploadTask = imagesRef
            .putString(image, 'data_url');

          // Listen for state changes, errors, and completion of the upload.
          uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            function(snapshot) {
              // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
              var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

                db.collection('rooms').add({
                  name: values.name,
                  type: 3,
                  members: membersObj,
                  check_members: [currentUser.uid, ...values.members],
                  messages: [],
                  avatar: downloadURL,
                  id: generateRoomId()
                });
              });
            }
          )
        } else {
          db.collection('rooms').add({
            id: generateRoomId(),
            name: values.name,
            type: 3,
            members: membersObj,
            check_members: [currentUser.uid, ...values.members],
            messages: [],
            avatar: 'https://miro.medium.com/max/300/1*R4c8lHBHuH5qyqOtZb3h-w.png'
          });
        }
        message.success('Create room successfully');

        _this.props.hideCreateRoomModal();
      }
    });
  };

  handleSelectChange = value => {
    this.props.form.setFieldsValue({
      note: `Hi, ${value === 'male' ? 'man' : 'lady'}!`,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { friends } = this.props;
    const friendsHTML = [];
    for (let i = 0; i < friends.length; i++) {
      friendsHTML.push(<Option key={i.toString(36) + i} value={friends[i].id}>{friends[i].name}</Option>);
    }
    return (
      <Form labelCol={{ span: 5 }} wrapperCol={{ span: 24 }} onSubmit={this.handleSubmit}>
        <Form.Item wrapperCol={{ span: 12, offset: 10}}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please input room name!' }],
          })(<Input placeholder="Name"/>)}
        </Form.Item>
        <Form.Item wrapperCol={{ span: 12 , offset: 10}} >
          {getFieldDecorator('members', {
              rules: [{ required: true, message: 'Please select your friends!' }],
            })(
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Please select members"
            >
              {friendsHTML}
            </Select>
          )}
        </Form.Item>
        <Form.Item wrapperCol={{ span: 12 }} className="room__upload-avatar">
          <UploadAvatar onChangeAvatar={this.handleChangeAvatar} imageUrl={this.state.imageUrl} />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 12, offset: 2 }} >
          <Button type="primary" htmlType="submit">
            Create room
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const CreateRoomForm = Form.create({ name: 'coordinated' })(CreateRoom);

export default CreateRoomForm;
