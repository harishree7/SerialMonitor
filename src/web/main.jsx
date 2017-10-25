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
      messages: [
        { time: new Date(), msg: "hello", received: true },
        { time: new Date(), msg: "world", received: false }
      ],
      tags: ["test"]
    };
  }
  componentDidMount() {}
  createNewTag() {}
  sendMessage(msg) {
    console.log(msg);
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
    for (var i = 0; i < this.state.tags.length; i++) {
      var tag = this.state.tags[i];
      tags.push(
        <Tag
          key={Math.random()}
          closable
          onClick={(e => {
            this.sendMessage(e.target.innerText);
          }).bind(this)}
        >
          {tag}
        </Tag>
      );
    }
    return (
      <div className="content">
        <div className="nav">
          <div className="devices">
            <DeviceSelector ref="device" />
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
              style={{ fontSize: 18 }}
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
                  onChange={() => {}}
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
                  }).bind(this)}
                />
                <div className="tags-list">{tags}</div>
              </div>
            </TabPane>
            <TabPane tab="多行模式" key="2">
              <div className="sender-tool">
                <TextArea ref="send-message" rows={4} />

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
          </Tabs>
        </div>
      </div>
    );
  }
}
