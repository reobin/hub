import React from "react";
import PropTypes from "prop-types";
import Message from "./message";

const MessageList = ({ messages }) => (
  <div className="msg-list">
    {messages.map((message, index) => (
      <Message key={index} name={message.name} body={message.body} />
    ))}
  </div>
);

MessageList.propTypes = {
  messages: PropTypes.array.isRequired
};

export default MessageList;
