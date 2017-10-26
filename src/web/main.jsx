import React from "react";
import $ from "jquery";
import { Icon, Input, Button, Checkbox, Tabs, Select, Tag } from "antd";
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;
import DeviceSelector from "./components/devices.jsx";
import "./styles/style.scss";
export default class MainUI extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      ending: "\n",
      messages: [],
      tags: []
    };
  }
  componentDidMount() {
    this.refs.devices.setReceiver(this.onReceived.bind(this));
  }
  createNewTag(msg) {
    if (this.state.tags.indexOf(msg) == -1) {
      this.state.tags.push(msg);
      if (this.state.tags.length > 10) {
        this.state.tags.shift();
      }
      this.forceUpdate();
    }
  }
  sendMessage(msg) {
    if (msg.length > 0) {
      this.addMessage(msg, false);
      this.refs.devices.sendMessage(msg + this.state.ending);
    }
  }
  addMessage(msg, received) {
    var time = new Date();
    var msgs = msg.split("\r\n");
    for (var i = 0; i < msgs.length; i++) {
      this.state.messages.push({
        time: time,
        msg: msgs[i],
        received: received
      });
      if (this.state.messages.length > 50) {
        this.state.messages.shift();
      }
    }
    this.forceUpdate();
  }
  onReceived(buffer) {
    this.addMessage(buffer.toString(), true);
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
    for (var i = this.state.messages.length - 1; i >= 0; i--) {
      var msg = this.state.messages[i];
      messages.push(
        <p
          key={Math.random()}
          className={msg.received ? "message-received" : "message-sent"}
        >
          <Icon type={msg.received ? "arrow-down" : "arrow-up"} />
          {msg.time.getTime()} : {msg.msg}
        </p>
      );
    }
    var tags = [];
    for (var i = this.state.tags.length - 1; i >= 0; i--) {
      var tag = this.state.tags[i];
      tags.push(
        <Tag
          key={tag + "-" + Math.random()}
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
          <div className="messages-hex">
            <Checkbox
              onChange={e => {
                console.log(`checked = ${e.target.checked}`);
              }}
            >
              Hex
            </Checkbox>
          </div>
          <div className="messages-clear">
            <Icon
              onClick={(e => {
                this.state.messages = [];
                this.forceUpdate();
              }).bind(this)}
              style={{}}
              type="delete"
            />
          </div>
        </div>
        <div className="sender">
          <Tabs defaultActiveKey="1" onChange={() => {}}>
            <TabPane tab="单行模式" key="1">
              <div className="sender-tool">
                <div style={{ float: "left", width: 140 }}>
                  <Checkbox
                    onChange={e => {
                      console.log(`checked = ${e.target.checked}`);
                    }}
                  >
                    Hex
                  </Checkbox>
                  <Select
                    defaultValue="1"
                    style={{ width: 80 }}
                    onChange={(e => {
                      this.state.ending =
                        e == 0 ? "" : e == 1 ? "\n" : e == 2 ? "\r" : "\r\n";
                    }).bind(this)}
                  >
                    <Option value="0">无结束符</Option>
                    <Option value="1">\n</Option>
                    <Option value="2">\r</Option>
                    <Option value="3">\r\n</Option>
                  </Select>
                </div>
                <div className="input-sender">
                  <Input
                    addonAfter={<Icon type="enter" />}
                    placeholder="发送的字符串"
                    onPressEnter={(e => {
                      this.sendMessage(e.target.value);
                      this.createNewTag(e.target.value);
                      e.target.value = "";
                    }).bind(this)}
                  />
                </div>

                <div className="tags-list">{tags}</div>
              </div>
            </TabPane>
            <TabPane tab="多行模式" key="2">
              <div className="sender-tool">
                <div className="sender-control">
                  <Button
                    style={{ margin: "2px 0" }}
                    type="primary"
                    icon="plus"
                  >
                    浏览文件
                  </Button>
                  <Button
                    style={{ margin: "2px 0" }}
                    type="primary"
                    icon="upload"
                  >
                    开始传送
                  </Button>
                  <Button
                    style={{ margin: "2px 0" }}
                    type="danger"
                    icon="poweroff"
                  >
                    停止传送
                  </Button>
                </div>
                <div className="sender-message">
                  <TextArea
                    ref="sender-message"
                    rows={5}
                    autosize={{ minRows: 5, maxRows: 5 }}
                  />
                </div>
                <Select
                  defaultValue="1"
                  style={{ width: 80, margin: "2px 20px 2px 0" }}
                  onChange={(e => {
                    this.state.ending =
                      e == 0 ? "" : e == 1 ? "\n" : e == 2 ? "\r" : "\r\n";
                  }).bind(this)}
                >
                  <Option value="0">无结束符</Option>
                  <Option value="1">\n</Option>
                  <Option value="2">\r</Option>
                  <Option value="3">\r\n</Option>
                </Select>
                <Checkbox
                  onChange={e => {
                    console.log(`checked = ${e.target.checked}`);
                  }}
                >
                  定时
                </Checkbox>
                <Input
                  style={{ width: 40, marginRight: 2 }}
                  defaultValue={"1.0"}
                  onChange={e => {}}
                />秒
                <Checkbox
                  style={{ marginLeft: 20 }}
                  onChange={e => {
                    console.log(`checked = ${e.target.checked}`);
                  }}
                >
                  循环
                </Checkbox>
                <Checkbox
                  style={{ marginLeft: 20 }}
                  onChange={e => {
                    console.log(`checked = ${e.target.checked}`);
                  }}
                >
                  条件
                </Checkbox>
                <Input
                  style={{ width: 80, marginRight: 2 }}
                  defaultValue={"ok"}
                  onChange={e => {}}
                />
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
