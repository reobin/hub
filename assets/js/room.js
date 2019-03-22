import { Presence } from "phoenix"

class Room {
  constructor(socket, roomName) {
    this.mainContainer = document.getElementById('main-container');
    this.msgContainer = document.getElementById('msg-list');
    this.msgInput = document.getElementById('msg-text');
    this.msgForm = document.getElementById('msg-form');

    this.channel = socket.channel(`room:${roomName}`, { username: document.getElementById("user-name").innerText });
    let presence = new Presence(this.channel);
    this.userTyping = false;

    socket.connect();

    presence.onSync(() => this.renderOnlineUsers(presence));

    this.channel.join()
      .receive('ok', resp => { console.log('Joined successfully', resp) })
      .receive('error', resp => { console.log('Unable to join', resp) });

    this.listenForChats();
  }

  renderOnlineUsers(presence) {
    const response = []
    presence.list((id, { metas: [user, ...rest] }) => {
      const typingIndicator = user.typing ? '<b>typing</b>' : '';
      response.push(`<li>${user.username} ${typingIndicator}</li>`);
    });
    document.querySelector("#js-userList-container").innerHTML = response.join("");
  }

  userStartsTyping() {
    if (this.userTyping) return;
    this.userTyping = true;
    this.channel.push('user:typing', { typing: this.userTyping, username: document.getElementById("user-name").innerText });
  }

  userStopsTyping() {
    if (!this.userTyping) return;
    this.userTyping = false;
    this.channel.push('user:typing', { typing: this.userTyping, username: document.getElementById("user-name").innerText });
  }

  listenForChats() {
    this.msgInput.addEventListener('keydown', () => {
      this.userStartsTyping();
    })

    this.msgInput.addEventListener('keyup', () => {
      if (!this.msgInput.value) {
        this.userStopsTyping();
      }
    })

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