import React from "react";
import PropTypes from "prop-types";

const Message = ({ name, body }) => {
  return (
    <div className="message-row">
      <b>{name}</b>
      <span>{body}</span>
    </div>
  );
};

Message.propTypes = {
  name: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired
};

export default Message;
