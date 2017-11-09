import { Tag } from "antd";
import Promise from "promise";
import React from "react";
import localforage from "localforage";
export default class History extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      tags: []
    };
    localforage.getItem("tags").then(
      (r => {
        if (r) {
          this.setState({ tags: r });
        }
      }).bind(this)
    );
  }
  createNewTag(msg) {
    if (this.state.tags.indexOf(msg) == -1) {
      this.state.tags.push(msg);
      if (this.state.tags.length > 10) {
        this.state.tags.shift();
      }
      localforage.setItem("tags", this.state.tags);
      this.forceUpdate();
    }
  }
  handleCloseTag(removedTag) {
    const tags = this.state.tags.concat([]);
    for (var i = 0; i < tags.length; i++) {
      if (tags[i] == removedTag) {
        this.state.tags.splice(i, 1);
        break;
      }
    }
    localforage.setItem("tags", this.state.tags);
  }
  render() {
    var tags = [];
    for (var i = this.state.tags.length - 1; i >= 0; i--) {
      const tag = this.state.tags[i];
      tags.push(
        <Tag
          key={tag + "-" + Math.random()}
          closable
          onClick={(e => {
            this.props.sendTag(e.target.innerText);
          }).bind(this)}
          afterClose={() => {
            this.handleCloseTag(tag);
          }}
        >
          {tag}
        </Tag>
      );
    }
    return <div className="tags-list">{tags}</div>;
  }
}
