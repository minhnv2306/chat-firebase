import React, { Component } from 'react';

export default class Sidebar extends Component {
  render() {
    return (
      <div id="frame">
        <div id="sidepanel">
          <div id="profile">
            <div className="wrap">
              <img id="profile-img" src={this.props.user.photoURL} className="online" alt="" />
              <p>{ this.props.user.name}</p>
              <i className="fa fa-chevron-down expand-button" aria-hidden="true"></i>
              <div id="status-options">
                <ul>
                  <li id="status-online" className="active"><span className="status-circle"></span> <p>Online</p></li>
                  <li id="status-away"><span className="status-circle"></span> <p>Away</p></li>
                  <li id="status-busy"><span className="status-circle"></span> <p>Busy</p></li>
                  <li id="status-offline"><span className="status-circle"></span> <p>Offline</p></li>
                </ul>
              </div>
            </div>
          </div>
          <div id="search">
            <label htmlFor=""><i className="fa fa-search" aria-hidden="true"></i></label>
            <input type="text" placeholder="Search contacts..." />
          </div>
          <div id="contacts">
            <ul>
              <li className="contact">
                <div className="wrap">
                  <span className="contact-status online"></span>
                  <img src="https://www.w3schools.com/bootstrap/img_avatar3.png" alt="" />
                  <div className="meta">
                    <p className="name">Louis Litt</p>
                    <p className="preview">You just got LITT up, Mike.</p>
                  </div>
                </div>
              </li>
              <li className="contact active">
                <div className="wrap">
                  <span className="contact-status busy"></span>
                  <img src="https://www.w3schools.com/bootstrap/img_avatar3.png" alt="" />
                  <div className="meta">
                    <p className="name">Harvey Specter</p>
                    <p className="preview">Wrong. You take the gun, or you pull out a bigger one. Or, you call their bluff. Or, you do any one of a hundred and forty six other things.</p>
                  </div>
                </div>
              </li>
              <li className="contact">
                <div className="wrap">
                  <span className="contact-status away"></span>
                  <img src="https://www.w3schools.com/bootstrap/img_avatar3.png" alt="" />
                  <div className="meta">
                    <p className="name">Rachel Zane</p>
                    <p className="preview">I was thinking that we could have chicken tonight, sounds good?</p>
                  </div>
                </div>
              </li>
              <li className="contact">
                <div className="wrap">
                  <span className="contact-status online"></span>
                  <img src="https://www.w3schools.com/bootstrap/img_avatar3.png" alt="" />
                  <div className="meta">
                    <p className="name">Donna Paulsen</p>
                    <p className="preview">Mike, I know everything! I'm Donna..</p>
                  </div>
                </div>
              </li>
              <li className="contact">
                <div className="wrap">
                  <span className="contact-status busy"></span>
                  <img src="https://www.w3schools.com/bootstrap/img_avatar3.png" alt="" />
                  <div className="meta">
                    <p className="name">Jessica Pearson</p>
                    <p className="preview">Have you finished the draft on the Hinsenburg deal?</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div id="bottom-bar">
            <button id="addcontact"><i className="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>Add contact</span></button>
            <button id="settings"><i className="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Settings</span></button>
          </div>
        </div>
      </div>
    );
  }
};
