import React, { Component } from 'react';
import '../../../src/css/description.css';
import { Avatar, Tag, Collapse, Modal } from 'antd';
import { Button } from 'antd';
const { Panel } = Collapse;
export default class RoomInfo extends Component {
  state = {
    imageURL: '',
    isShowImage: false
  };

  showImageModal = imageURL => {
    this.setState({
      isShowImage: true,
      imageURL: imageURL
    });
  };

  hideImageModal = () => {
    this.setState({
      isShowImage: false,
      imageURL: ''
    });
  };

  render() {
    const members = this.props.members;
    const images = this.props.images;

    return (
      <div id="frame">
        <div className="content">
          <div className="description">
            <div className="des-content">
              {members.map((member, index) => {
                if (index < 3)
                  return (
                    <Avatar src={member.avatar} size={80} key={member.id} />
                  );
              })}
            </div>
            <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
              {this.props.roomInfo.name}
            </h2>
          </div>
          <Collapse defaultActiveKey={['1', '2']}>
            <Panel header={'People (' + members.length + ')'} key="1">
              {members.map(member => (
                <div key={member.id} style={{ paddingBottom: '6px' }}>
                  <Avatar src={member.avatar} />
                  <span style={{ paddingLeft: '5px', fontSize: '14px' }}>
                    {member.name}
                  </span>
                  <span style={{ float: 'right', paddingTop: '7px' }}>
                    <Tag color="#2db7f5">Admin</Tag>
                  </span>
                </div>
              ))}
            </Panel>
            <Panel header="Shared Photos" key="2">
              <div>
                {images.map((image, index) => (
                  <img
                    src={image}
                    className="shared-photos"
                    style={{ padding: '3px' }}
                    key={index}
                    onClick={() => this.showImageModal(image)}
                  />
                ))}
              </div>
            </Panel>
          </Collapse>
          <Modal
            title="Image"
            visible={this.state.isShowImage}
            onCancel={this.hideImageModal}
            footer={null}
          >
            <img src={this.state.imageURL} width="100%" />
          </Modal>
        </div>
      </div>
    );
  }
}
