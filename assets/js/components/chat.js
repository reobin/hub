import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Socket, Presence } from "phoenix";
import MessageForm from "./messages/messageForm";
import MessageList from "./messages/messageList";
import OnlineUserList from "./onlineUsers/onlineUserList";
import RoomLabel from "./roomLabel";

const Chat = ({ userName, roomName, messages: messagesProp }) => {
  const [userTyping, setUserTyping] = useState(false);
  const [userTypingTimer, setTypingTimer] = useState({});
  const [messages, setMessages] = useState(messagesProp);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [channel, setChannel] = useState({});

  useEffect(() => {
    const setupChannel = () => {
      const socket = new Socket("/socket", {});
      const socketChannel = socket.channel(`room:${roomName}`, {
        username: userName
      });
      const presence = new Presence(socketChannel);
      socket.connect();
      presence.onSync(() => {
        renderOnlineUsers(presence);
      });
      socketChannel.join().receive("ok", response => {
        console.log("Joined successfully", response);
      });
      socketChannel.on("shout", message => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
      setChannel(socketChannel);
    };

    setupChannel();
  }, []);

  const renderOnlineUsers = presence => {
    const onlineUserList = [];
    presence.list((id, { metas: [user, ...rest] }) => {
      onlineUserList.push({ username: user.username, typing: user.typing });
    });
    setOnlineUsers(onlineUserList);
  };

  const handleSubmit = inputMessage => {
    setUserTyping(false);
    channel.push("user:typing", {
      typing: false,
      username: userName
    });
    if (inputMessage) {
      channel.push("shout", {
        name: userName,
        body: inputMessage,
        channel: roomName
      });
    }
  };

  const onKeyUp = () => {
    clearTimeout(userTypingTimer);
    setTypingTimer(setTimeout(userStopsTyping, 2000));
  };

  const userStartsTyping = () => {
    if (userTyping || !channel) return;
    pushTypingInfo(true);
  };

  const userStopsTyping = () => {
    if (!userTyping) return;
    pushTypingInfo(false);
  };

  const pushTypingInfo = typing => {
    setUserTyping(typing);
    channel.push("user:typing", {
      typing: typing,
      username: userName
    });
    clearTimeout(userTypingTimer);
  };

  return (
    <React.Fragment>
      <RoomLabel roomName={roomName} />
      <div className="chat-container">
        <MessageList messages={messages} />
        <OnlineUserList onlineUsers={onlineUsers} />
      </div>
      <MessageForm
        handleSubmit={handleSubmit}
        userStartsTyping={userStartsTyping}
        onKeyUp={onKeyUp}
      />
    </React.Fragment>
  );
};

Chat.propTypes = {
  userName: PropTypes.string.isRequired,
  roomName: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired
};

export default Chat;
