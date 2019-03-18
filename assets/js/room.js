class Room {
  constructor(socket, roomName) {
    this.channel = socket.channel(`room:${roomName}`, {});

    this.msgContainer = document.getElementById('msg-list');
    this.nameInput = document.getElementById('name');
    this.msgInput = document.getElementById('msg-text');
    this.form = document.getElementById('msg-form');

    this.channel.join()
      .receive('ok', resp => { console.log('Joined successfully', resp) })
      .receive('error', resp => { console.log('Unable to join', resp) });

    this.listenForChats();
  }

  listenForChats() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.shout();
    });

    this.channel.on('shout', data => {
      const msgDisplay = document.createElement('span');
      msgDisplay.classList.add('msg');
      const name = data.name || 'guest';
      msgDisplay.innerHTML = '<b>' + name + '</b>: ' + data.message;
      this.msgContainer.appendChild(msgDisplay);
      this.msgContainer.scrollTop = msgDisplay.offsetTop;
    });
  }

  shout() {
    if (this.msgInput.value.length > 0) {
      this.channel.push('shout', {
        name: this.nameInput.value,
        message: this.msgInput.value
      });
      this.msgInput.value = '';
    }
  }
};

export default Room;