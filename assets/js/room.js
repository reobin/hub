import { Presence } from "phoenix"

class Room {
  constructor(socket, roomName) {
    this.mainContainer = document.getElementById('main-container');
    this.msgContainer = document.getElementById('msg-list');
    this.msgInput = document.getElementById('msg-text');
    this.msgForm = document.getElementById('msg-form');

    this.channel = socket.channel(`room:${roomName}`, { username: document.getElementById("user-name").innerText });
    let presence = new Presence(this.channel)

    socket.connect()

    presence.onSync(() => this.renderOnlineUsers(presence))

    this.channel.join()
      .receive('ok', resp => { console.log('Joined successfully', resp) })
      .receive('error', resp => { console.log('Unable to join', resp) });

    this.listenForChats();
  }

  renderOnlineUsers(presence) {
    const response = Object.keys(presence.state).map(p => `<li>${p}</li>`)
    document.querySelector("#js-userList-container").innerHTML = response.join("")
  }

  listenForChats() {
    this.msgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.shout();
    });

    this.channel.on('shout', data => {
      this.displayNewMsg(data);
    });
  }

  shout() {
    if (this.msgInput.value.length > 0) {
      this.channel.push('shout', {
        name: document.getElementById('user-name').innerText,
        body: this.msgInput.value,
        channel: document.getElementById('room-id').innerText
      });
      this.msgInput.value = '';
    }
  }

  displayNewMsg({ name, body }) {
    const msgDisplay = document.createElement('div');
    msgDisplay.classList.add('message-row');
    msgDisplay.innerHTML = `
    <b>${name}</b>
    <span>${body}</span>`;
    this.msgContainer.appendChild(msgDisplay);
    this.msgContainer.scrollTop = msgDisplay.offsetTop;
  }
};

export default Room;