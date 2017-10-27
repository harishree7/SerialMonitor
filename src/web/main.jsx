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
      tags: [],
      senders: [],
      sendingIndex: 0,
      sending: false,
      sendingMode: 1,
      needCondition: false,
      needInterval: false,
      needLoop: false,
      condition: "ok"
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
  sendNextMessage() {
    if (this.state.sendingMode == 2) {
      if (this.state.sending) {
        if (this.state.sendingIndex < this.state.senders.length) {
          this.sendMessage(this.state.senders[this.state.sendingIndex]);
          this.state.sendingIndex++;
          if (this.state.sendingIndex >= this.state.senders.length) {
            if (this.state.needLoop) {
              this.state.sendingIndex = 0;
            } else {
              this.setState({ sending: false });
            }
          }
          if (this.state.needInterval) {
            setTimeout(
              this.sendNextMessage.bind(this),
              this.state.interval * 1000
            );
          }
        } else {
          this.state.sendingIndex = 0;
          if (!this.state.needLoop) {
            this.setState({ sending: false });
          }
        }
      }
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
    var msg = buffer.toString();
    this.addMessage(msg, true);
    if (this.state.sendingMode == 2) {
      if (this.state.needCondition) {
        if (msg.indexOf(this.state.condition) > -1) {
          this.sendNextMessage();
        }
      }
    }
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
    const self = this;
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
          <Tabs
            defaultActiveKey="1"
            onChange={e => {
              self.state.sendingMode = e * 1.0;
            }}
          >
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
                    onClick={() => {
                      $("#files").click();
                    }}
                  >
                    浏览文件
                  </Button>
                  <input
                    type="file"
                    id="files"
                    style={{ display: "none" }}
                    onChange={e => {
                      var selectedFile = e.target.files[0];
                      var name = selectedFile.name;
                      var size = selectedFile.size;
                      var reader = new FileReader();
                      reader.readAsText(selectedFile);
                      reader.onload = e => {
                        self.state.senders = e.target.result.split("\n");
                        $("#sender-message").val(self.state.senders.join("\n"));
                      };
                    }}
                  />
                  <Button
                    style={{ margin: "2px 0" }}
                    type="primary"
                    icon={self.state.sending ? "pause" : "upload"}
                    onClick={e => {
                      var sending = !self.state.sending;
                      self.setState({ sending: sending });
                      if (sending) {
                        setTimeout(self.sendNextMessage.bind(self), 200);
                      }
                    }}
                  >
                    {self.state.sending ? "暂停传送" : "开始传送"}
                  </Button>
                  <Button
                    style={{ margin: "2px 0" }}
                    type="danger"
                    icon="poweroff"
                    onClick={e => {
                      self.setState({ sending: false });
                      self.state.sendingIndex = 0;
                    }}
                  >
                    停止传送
                  </Button>
                </div>
                <div className="sender-message">
                  <TextArea
                    id="sender-message"
                    ref="sender-message"
                    rows={5}
                    autosize={{ minRows: 5, maxRows: 5 }}
                    defaultValue=""
                    onChange={e => {
                      self.state.senders = e.target.value.split("\n");
                    }}
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
                    self.state.needInterval = e.target.checked;
                  }}
                  defaultChecked={self.state.needInterval}
                >
                  定时
                </Checkbox>
                <Input
                  id="interval"
                  style={{ width: 40, marginRight: 2 }}
                  defaultValue={"0.5"}
                  onChange={e => {
                    $("#interval").val(
                      isNaN(Number(e.target.value))
                        ? "0.5"
                        : "" + e.target.value * 1.0
                    );
                    console.log(e.target.value);
                    self.state.interval = isNaN(Number(e.target.value))
                      ? 0.5
                      : e.target.value * 1.0;
                  }}
                />秒
                <Checkbox
                  style={{ marginLeft: 20 }}
                  defaultChecked={self.state.needLoop}
                  onChange={e => {
                    self.state.needLoop = e.target.checked;
                  }}
                >
                  循环
                </Checkbox>
                <Checkbox
                  style={{ marginLeft: 20 }}
                  defaultChecked={self.state.needCondition}
                  onChange={e => {
                    self.state.needCondition = e.target.checked;
                  }}
                >
                  条件
                </Checkbox>
                <Input
                  style={{ width: 80, marginRight: 2 }}
                  defaultValue={"ok"}
                  onChange={e => {
                    self.state.condition = e.target.value;
                  }}
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
