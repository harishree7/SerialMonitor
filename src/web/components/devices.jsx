import { Menu, Dropdown, Button, Icon, message } from "antd";
import Serial from "serialport";
import Promise from "promise";
import React from "react";
const Item = Menu.Item;
export default class DeviceSelector extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { serial: null };
    this.ports = [];
    this.currentIndex = -1;
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
    const self = this;
    this.state.serial = new Serial(
      this.ports[this.currentIndex].comName,
      { baudRate: 115200 },
      err => {
        console.log("connecting...", err);
        if (self.state.serial.isOpen) {
          self.state.serial.on("data", buffer => {
            self.onReceived(buffer);
          });
        }
      }
    );
    self.state.serial.on("open", () => {});
  }
  setReceiver(receiver) {
    this.callback = receiver;
  }
  sendMessage(msg) {
    return new Promise(resolve => {
      if (this.state.serial && this.state.serial.isOpen) {
        this.state.serial.write(new Buffer(msg), (err, bytesWritten) => {
          resolve(bytesWritten);
        });
      } else {
        resolve(-1);
      }
    });
  }
  onReceived(buffer) {
    if (this.callback) {
      this.callback(buffer);
    }
  }
  handleMenuClick(e) {
    this.currentIndex = Number(e.key) < this.ports.length ? e.key : -1;
    if (this.currentIndex != -1) {
      if (this.state.serial && this.state.serial.isOpen) {
        this.state.serial.close(err => {
          console.log("closing..", err);
          this.connect();
        });
      } else {
        this.connect();
      }
    } else {
      if (this.state.serial) {
        this.state.serial.close(err => {
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
      items.push(
        <Item ref={i} key={i}>
          {this.ports[i].comName}
        </Item>
      );
    }
    if (
      this.ports.length > 0 &&
      this.state.serial &&
      this.state.serial.isOpen
    ) {
      items.push(
        <Item ref={this.ports.length} key={this.ports.length}>
          {"Disconnect"}
        </Item>
      );
    }
    const menu = (
      <Menu ref="menu" onClick={this.handleMenuClick.bind(this)}>
        {items}
      </Menu>
    );
    return (
      <div ref="list" className="devices-list">
        <Dropdown
          ref="drop"
          overlay={menu}
          trigger={["click"]}
          size={"large"}
          onClick={this.handleButtonClick.bind(this)}
        >
          <a className="ant-dropdown-link" href="#" style={{ fontSize: 14 }}>
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
