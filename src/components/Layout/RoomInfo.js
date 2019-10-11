import React, { Component } from 'react';
import '../../../src/css/description.css';
import { Avatar, Tag, Collapse } from 'antd';

const { Panel } = Collapse;

export default class RoomInfo extends Component {
  render() {
    const members = this.props.members;
    
    return (
      <div id="frame">
        <div className="content">
          <div className="contact-profile"></div>
          <div className="description">
            <div className="des-content">
              {
                members.map((member, index) => {
                  if (index < 3)
                    return (
                      <Avatar
                        src={member.avatar}
                        size={80}
                        key={member.id}
                      />
                    )
                })
              }
            </div>
            <h2 style={{ textAlign: 'center', paddingTop: '10px' }}>
              {this.props.roomInfo.name}
            </h2>
          </div>
          <Collapse defaultActiveKey={['1', '2']}>
            <Panel header={"People (" + members.length + ")"} key="1">
              {
                members.map((member) => (
                  <div key={member.id} style={{ paddingBottom: '6px'}}>
                    <Avatar src={member.avatar} />
                    <span style={{ paddingLeft: '5px', fontSize: '14px' }}>
                      {member.name}
                    </span>
                    <span style={{ float: 'right', paddingTop: '7px' }}>
                      <Tag color="#2db7f5">Admin</Tag>
                    </span>
                  </div>
                ))
              }
            </Panel>
            <Panel header="Images" key="2">
              <div>
                <img
                  src="https://www.w3schools.com/bootstrap/cinqueterre.jpg"
                  heigth="150"
                  width="33%"
                  style={{ padding: '3px' }}
                />
                <img
                  src="https://www.w3schools.com/bootstrap/cinqueterre.jpg"
                  heigth="150"
                  width="33%"
                  style={{ padding: '3px' }}
                />
                <img
                  src="https://www.w3schools.com/bootstrap/cinqueterre.jpg"
                  heigth="150"
                  width="33%"
                  style={{ padding: '3px' }}
                />
                <img
                  src="https://www.w3schools.com/bootstrap/cinqueterre.jpg"
                  heigth="150"
                  width="33%"
                  style={{ padding: '3px' }}
                />
                <img
                  src="https://www.w3schools.com/bootstrap/cinqueterre.jpg"
                  heigth="150"
                  width="33%"
                  style={{ padding: '3px' }}
                />
                <img
                  src="https://www.w3schools.com/bootstrap/cinqueterre.jpg"
                  heigth="150"
                  width="33%"
                  style={{ padding: '3px' }}
                />
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
    );
  }
}
