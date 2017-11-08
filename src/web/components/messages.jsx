import { Icon } from "antd";
import React from "react";
export default class Messages extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      messages: [],
      messagesCountMax: 200
    };
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
      if (this.state.messages.length > this.state.messagesCountMax) {
        this.state.messages.shift();
      }
    }
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
    return (
      <div ref="messages" className="messages-panel">
        {messages}
      </div>
    );
  }
}
