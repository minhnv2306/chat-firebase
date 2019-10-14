import React, { Component } from "react";
import { Row, Col, Modal } from "antd";
import { Link } from "react-router-dom";
import "../../../src/css/layout.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default class Header extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col span={4}>
            <img
              className="header-logo"
              src="http://product.hstatic.net/1000021001/product/upload_a378176cbd894c57b91adb86ab89af9c_master.jpg"
              alt="Sky logo"
            />
            <span className="header-name">Sky's Team</span>
          </Col>
          <Col span={15}>
            <Row className="text-center header-icon">
              <Col span={6} />
              <Col span={3}>
                <Link to="#">
                  <i className="fa fa-home" aria-hidden="true" />
                </Link>
              </Col>
              <Col span={3}>
                <Link to="#">
                  <i className="fa fa-video-camera" aria-hidden="true" />
                </Link>
              </Col>
              <Col span={3}>
                <Link to="#">
                  <i className="fa fa-users" aria-hidden="true" />
                </Link>
              </Col>
              <Col span={3}>
                <Link to="#">
                  <i className="fa fa-archive" aria-hidden="true" />
                </Link>
              </Col>
              <Col span={6} />
            </Row>
          </Col>
          <Col span={5} />
        </Row>
      </div>
    );
  }
}
