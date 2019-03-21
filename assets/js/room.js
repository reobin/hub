class Room {
  constructor(socket, roomName) {
    this.mainContainer = document.getElementById('main-container');
    this.msgContainer = document.getElementById('msg-list');
    this.msgInput = document.getElementById('msg-text');
    this.msgForm = document.getElementById('msg-form');

    this.channel = socket.channel(`room:${roomName}`, {});

    this.channel.join()
      .receive('ok', resp => { console.log('Joined successfully', resp) })
      .receive('error', resp => { console.log('Unable to join', resp) });

    this.listenForChats();
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
    const msgDisplay = document.createElement('span');
    msgDisplay.classList.add('msg');
    msgDisplay.innerHTML = `
      <div class="message-row" >
        <b>${name}</b>
        <span>${body}</span>
      </div>`;
    this.msgContainer.appendChild(msgDisplay);
    this.msgContainer.scrollTop = msgDisplay.offsetTop;
  }
};

export default Room;