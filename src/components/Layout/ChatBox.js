import React, { Component } from 'react';

export default class ChatBox extends Component {
  render() {
    return (
      <ul>
        <li className="sent">
          <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
          <p>How the hell am I supposed to get a jury to believe you when I am not even sure that I do?!</p>
        </li>
        <li className="replies">
          <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
          <p>When you're backed against the wall, break the god damn thing down.</p>
        </li>
        <li className="replies">
          <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
          <p>Excuses don't win championships.</p>
        </li>
        <li className="sent">
          <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
          <p>Oh yeah, did Michael Jordan tell you that?</p>
        </li>
        <li className="replies">
          <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
          <p>No, I told him that.</p>
        </li>
      </ul>
    )
  }
};
