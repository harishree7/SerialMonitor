import React from "react";
import $ from "jquery";
import { Icon, Input, Button, Checkbox, Tabs, Select, Tag } from "antd";
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;
import DeviceSelector from "./components/devices.jsx";
import "./styles/style.css";
export default class MainUI extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      ending: "",
      messages: [],
      tags: []
    };
  }
  componentDidMount() {
    this.refs.devices.setReceiver(this.onReceived);
  }
  createNewTag(msg) {
    this.state.tags.push(msg);
    if (this.state.tags.length > 10) {
      this.state.tags.shift();
    }
    this.forceUpdate();
  }
  sendMessage(msg) {
    if (msg.length > 0) {
      addMessage(msg, false);
    }
  }
  addMessage(msg, received) {
    this.state.messages.push({
      time: new Date(),
      msg: msg,
      received: received
    });
    if (this.state.messages.length > 50) {
      this.state.messages.shift();
    }
    this.forceUpdate();
  }
  onReceived(buffer) {
    addMessage(buffer.toString(), true);
  }
  handleCloseTag(removedTag) {
    const tags = this.state.tags.concat([]);
    for (var i = 0; i < tags.length; i++) {
      if (tags[i] === removedTag) {
        this.state.tags.slice(i, 1);
        break;
      }
    }
    this.forceUpdate();
  }
  render() {
    var messages = [];
    for (var i = 0; i < this.state.messages.length; i++) {
      var msg = this.state.messages[i];
      messages.push(
        <p
          key={Math.random()}
          className={msg.received ? "message-received" : "message-sent"}
        >
          @{msg.time.getTime()} : {msg.msg}
        </p>
      );
    }
    var tags = [];
    for (var i = this.state.tags.length - 1; i >= 0; i--) {
      var tag = this.state.tags[i];
      tags.push(
        <Tag
          key={tag}
          closable
          onClick={(e => {
            this.sendMessage(e.target.innerText);
          }).bind(this)}
          onClose={() => this.handleCloseTag(tag)}
        >
          {tag}
        </Tag>
      );
    }
    return (
      <div className="content">
        <div className="nav">
          <div className="devices">
            <DeviceSelector ref="devices" />
          </div>
        </div>
        <div className="messages">
          <div ref="messages" className="messages-panel">
            {messages}
          </div>
          <div className="messages-tool">
            <Checkbox
              onChange={e => {
                console.log(`checked = ${e.target.checked}`);
              }}
            >
              Hex
            </Checkbox>
            <Icon
              onClick={(e => {
                this.state.messages = [];
                this.forceUpdate();
              }).bind(this)}
              style={{
                fontSize: 24,
                cursor: "pointer",
                verticalAlign: "middle",
                lineHeight: 18
              }}
              type="delete"
            />
          </div>
        </div>
        <div className="sender">
          <Tabs defaultActiveKey="1" onChange={() => {}}>
            <TabPane tab="单行模式" key="1">
              <div className="sender-tool">
                <Checkbox
                  onChange={e => {
                    console.log(`checked = ${e.target.checked}`);
                  }}
                >
                  Hex
                </Checkbox>
                <Select
                  defaultValue="0"
                  style={{ width: 80 }}
                  onChange={(e => {
                    this.state.ending =
                      e == 0 ? "" : e == 1 ? "\r" : e == 2 ? "\n" : "\r\n";
                  }).bind(this)}
                >
                  <Option value="0">无结束符</Option>
                  <Option value="1">\r</Option>
                  <Option value="2">\n</Option>
                  <Option value="3">\r\n</Option>
                </Select>
                <Input
                  className="input-sender"
                  style={{ width: 545, marginLeft: 10 }}
                  addonAfter={<Icon type="enter" />}
                  placeholder="发送的字符串"
                  onPressEnter={(e => {
                    this.sendMessage(e.target.value);
                    this.createNewTag(e.target.value);
                    e.target.value = "";
                  }).bind(this)}
                />
                <div className="tags-list">{tags}</div>
              </div>
            </TabPane>
            <TabPane tab="多行模式" key="2">
              <div className="sender-tool">
                <TextArea ref="send-message" rows={4} />

                <Select
                  defaultValue="0"
                  style={{ width: 80 }}
                  onChange={(e => {
                    this.state.ending =
                      e == 0 ? "" : e == 1 ? "\r" : e == 2 ? "\n" : "\r\n";
                  }).bind(this)}
                >
                  <Option value="0">无结束符</Option>
                  <Option value="1">\r</Option>
                  <Option value="2">\n</Option>
                  <Option value="3">\r\n</Option>
                </Select>
                <Button
                  type="primary"
                  size="large"
                  shape="circle"
                  icon="upload"
                />
                <Button
                  type="danger"
                  size="large"
                  shape="circle"
                  icon="poweroff"
                />
                <Checkbox
                  onChange={e => {
                    console.log(`checked = ${e.target.checked}`);
                  }}
                >
                  定时
                </Checkbox>

                <Checkbox
                  onChange={e => {
                    console.log(`checked = ${e.target.checked}`);
                  }}
                >
                  循环
                </Checkbox>
                <Checkbox
                  onChange={e => {
                    console.log(`checked = ${e.target.checked}`);
                  }}
                >
                  条件
                </Checkbox>
              </div>
            </TabPane>
            <TabPane tab="图形模式" key="3">
              <div>Coming Soon</div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}
