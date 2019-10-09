import React, { Component } from 'react';
import '../../../src/css/description.css';

export default class RoomInfo extends Component {
  render() {
    return (
      <div id="frame">
        <div className="content">
          <div className="contact-profile"></div>
          <div className="description">
            <div className="title">
              <p>Description</p>
            </div>
            <div className="des-content">
              <p>content</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
