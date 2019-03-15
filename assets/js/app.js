import css from "../css/app.css"
import "phoenix_html"
import socket from "./socket"

const channel = socket.channel('room:lobby', {});

channel.on('shout', data => {
  const msgDisplay = document.createElement("span");
  msgDisplay.classList.add("msg");
  const name = data.name || 'guest';
  msgDisplay.innerHTML = '<b>' + name + '</b>: ' + data.message;
  msgContainer.appendChild(msgDisplay);                    
});

channel.join();

const msgContainer = document.getElementById('msg-list');
const name = document.getElementById('name');
const msg = document.getElementById('msg-text');
const btn = document.getElementById('send-btn')

const shout = () => {
  if (msg.value.length > 0) {
    channel.push('shout', {
      name: name.value,
      message: msg.value
    });
    msg.value = '';
  }
}

msg.addEventListener('keypress', event => {
  if (event.keyCode == 13) {
    shout();
  }
});

btn.addEventListener('mouseup', () => shout());

