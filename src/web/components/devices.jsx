import { Menu, Dropdown, Button, Icon, message } from "antd";
import Serial from "serialport";
import Promise from "promise";
import React from "react";
export default class DeviceSelector extends React.Component {
  constructor(...args) {
    super(...args);
    this.ports = [];
    this.currentIndex = -1;
    this.listeners = [];
    Serial.list(this.onSerialList.bind(this));
  }
  onSerialList(err, ports) {
    this.ports = [];
    for (var i = 0; i < ports.length; i++) {
      if (ports[i].comName.toLowerCase().indexOf("bluetooth") > -1) {
        continue;
      }
      this.ports.push(ports[i]);
    }
    this.forceUpdate();
  }
  handleButtonClick(e) {
    Serial.list(this.onSerialList.bind(this));
  }
  connect() {
    this.serial = new Serial(
      this.ports[this.currentIndex].comName,
      { baudRate: 115200 },
      err => {
        console.log("connecting...", err);
      }
    );
    this.serial.on("data", this.onReceived.bind(this));
  }
  sendMessage(msg) {
    return new Promise(resolve => {
      if (this.serial && this.serial.isOpen) {
        this.serial.write(new Buffer(msg), (err, bytesWritten) => {
          resolve(bytesWritten);
        });
      } else {
        resolve(-1);
      }
    });
  }
  onReceived(buffer) {
    var msg = buffer.toString();
    console.log("received:", msg);
  }
  handleMenuClick(e) {
    this.currentIndex = Number(e.key) < this.ports.length ? e.key : -1;
    if (this.currentIndex != -1) {
      if (this.serial && this.serial.isOpen) {
        this.serial.close(err => {
          console.log("closing..", err);
          this.connect();
        });
      } else {
        this.connect();
      }
    } else {
      if (this.serial) {
        this.serial.close(err => {
          console.log("closing..", err);
        });
      }
    }
    this.forceUpdate();
  }
  render() {
    if (this.currentIndex > this.ports.length - 1) {
      this.currentIndex = -1;
    }
    var items = [];
    for (var i = 0; i < this.ports.length; i++) {
      items.push(<Menu.Item key={i}>{this.ports[i].comName}</Menu.Item>);
    }
    if (this.ports.length > 0) {
      items.push(<Menu.Item key={this.ports.length}>{"Disconnect"}</Menu.Item>);
    }
    const menu = <Menu onClick={this.handleMenuClick.bind(this)}>{items}</Menu>;
    return (
      <div>
        <Dropdown
          ref="menu"
          overlay={menu}
          trigger={["click"]}
          onClick={this.handleButtonClick.bind(this)}
        >
          <a className="ant-dropdown-link" href="#">
            {this.currentIndex == -1
              ? "未连接"
              : this.ports[this.currentIndex].comName}{" "}
            <Icon type="down" />
          </a>
        </Dropdown>
      </div>
    );
  }
}
