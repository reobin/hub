import React from "react";
import { Socket, Presence } from "phoenix";

class Chat extends React.Component {
  constructor(props) {
    console.log(props);
    super(props);
    this.state = {
      userName: this.props.userName,
      roomName: this.props.roomName,
      userTyping: false,
      userTypingTimer: {},
      inputMessage: "",
      messages: this.props.messages,
      onlineUsers: []
    };
  }

  componentDidMount() {
    const socket = new Socket("/socket", {});

    this.channel = socket.channel(`room:${this.state.roomName}`, {
      username: this.state.userName
    });

    const presence = new Presence(this.channel);
    socket.connect();
    presence.onSync(() => {
      this.renderOnlineUsers(presence);
    });

    this.channel
      .join()
      .receive("ok", response => {
        console.log("Joined successfully", response);
      })
      .receive("error", resp => {
        console.log("Unable to join", resp);
      });
    this.channel.on("shout", payload => {
      this.setState({
        messages: this.state.messages.concat(payload)
      });
    });
  }

  renderOnlineUsers(presence) {
    const response = [];
    presence.list((id, { metas: [user, ...rest] }) => {
      response.push({ username: user.username, typing: user.typing });
    });
    this.setState({ onlineUsers: response });
  }

  handleInputMessage(event) {
    this.setState({
      inputMessage: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ userTyping: false });
    this.channel.push("user:typing", {
      typing: false,
      username: this.state.userName
    });
    this.channel.push("shout", {
      name: this.state.userName,
      body: this.state.inputMessage,
      channel: this.state.roomName
    });
    this.setState({
      inputMessage: ""
    });
  }

  userStartsTyping() {
    if (this.state.userTyping) return;
    this.setState({ userTyping: true });
    this.channel.push("user:typing", {
      typing: true,
      username: this.state.userName
    });
    clearTimeout(this.state.userTypingTimer);
  }

  onKeyUp() {
    clearTimeout(this.state.userTypingTimer);
    this.setState({
      userTypingTimer: setTimeout(this.userStopsTyping.bind(this), 2000)
    });
  }

  userStopsTyping() {
    clearTimeout(this.state.userTypingTimer);
    this.setState({ userTyping: false });
    this.channel.push("user:typing", {
      typing: this.state.userTyping,
      username: this.state.userName
    });
  }

  render() {
    const messages = this.state.messages.map((message, index) => (
      <div className="message-row" key={index}>
        <b>{message.name}</b>
        <span>{message.body}</span>
      </div>
    ));
    return (
      <React.Fragment>
        <b id="room-title">
          Chat room : <span id="room-id">{this.state.roomName}</span>
        </b>
        <div className="chat-container">
          <div id="msg-list">{messages}</div>
          <div className="online-user-list">
            <b>Online users :</b>
            <ul id="js-userList-container">
              {this.state.onlineUsers.map((user, index) => (
                <li key={index}>
                  {user.username}
                  {user.typing && <b> typing...</b>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <form id="msg-form" onSubmit={this.handleSubmit.bind(this)}>
          <input
            type="text"
            id="msg-text"
            className="input"
            placeholder="Type your message..."
            autoFocus
            autoComplete="off"
            value={this.state.inputMessage}
            onChange={this.handleInputMessage.bind(this)}
            onKeyDown={this.userStartsTyping.bind(this)}
            onKeyUp={this.onKeyUp.bind(this)}
          />
          <input type="submit" id="send-btn" className="input" value="Send" />
        </form>
      </React.Fragment>
    );
  }
}
export default Chat;
