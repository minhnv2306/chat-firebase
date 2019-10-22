import moment from 'moment';
import React from 'react';
import { Row, Col } from 'antd';
import { generateRoomId } from './function';

export function isDifferentUser(firstMessage, secondMessage) {
  return firstMessage.user != secondMessage.user;
}

export function isDifferentDate(firstMessage, secondMessage) {
  return (
    moment(firstMessage.created_at).format('LL') !=
    moment(secondMessage.created_at).format('LL')
  );
}

export function isDifferentFormatHourAndMinute(firstMessage, secondMessage) {
  return (
    moment(parseInt(firstMessage.created_at)).format('hh:mm A') !=
    moment(parseInt(secondMessage.created_at)).format('hh:mm A')
  );
}

export function generateDateLine(time) {
  return (
    <li key={generateRoomId()}>
      <Row className="date__line">
        <Col span={10} className="line-left">
          <hr />
        </Col>
        <Col span={4} className="date">
          {moment(time).format('LL')}
        </Col>
        <Col span={10} className="line-right">
          <hr />
        </Col>
      </Row>
    </li>
  );
}
