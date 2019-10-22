import moment from 'moment';
import React from 'react';

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
    <li>
      <div
        style={{
          width: '100%',
          height: '20px',
          borderBottom: '1px solid #00000030',
          textAlign: 'center'
        }}
      >
        <span
          style={{
            fontSize: '16px',
            backgroundColor: '#F3F5F6',
            padding: '0 10px'
          }}
        >
          {moment(time).format('LL')}
        </span>
      </div>
    </li>
  );
}
