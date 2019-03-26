import React, { useState } from "react";
import PropTypes from "prop-types";

const MessageForm = ({ handleSubmit, userStartsTyping, onKeyUp }) => {
  const [inputMessage, setinputMessage] = useState("");

  const onSubmit = e => {
    e.preventDefault();
    handleSubmit(inputMessage);
    setinputMessage("");
  };

  return (
    <form className="msg-form" onSubmit={onSubmit}>
      <input
        type="text"
        className="msg-text input"
        placeholder="Type your message..."
        autoFocus
        autoComplete="off"
        value={inputMessage}
        onChange={e => setinputMessage(e.target.value)}
        onKeyDown={userStartsTyping}
        onKeyUp={onKeyUp}
      />
      <input type="submit" className="send-btn input" value="Send" />
    </form>
  );
};

MessageForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  userStartsTyping: PropTypes.func.isRequired,
  onKeyUp: PropTypes.func.isRequired
};

export default MessageForm;
