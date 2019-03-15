import {Socket} from 'phoenix';

const socket = new Socket('/socket', {params: {token: window.userToken}});

socket.connect();

let group = document.getElementById('group-a').classList.contains('selected') ? 'lobbyA' : 'lobbyB';
let channel = socket.channel(`room:${group}` , {});

const msgContainer = document.getElementById('msg-list');

const name = document.getElementById('name');
const msg = document.getElementById('msg-text');
const btn = document.getElementById('send-btn');

const groupATab = document.getElementById('group-a');
const groupBTab = document.getElementById('group-b');

const addOnShoutListener = () => {
  channel.on('shout', data => {
    const msgDisplay = document.createElement('span');
    msgDisplay.classList.add('msg');
    const name = data.name || 'guest';
    msgDisplay.innerHTML = '<b>' + name + '</b>: ' + data.message;
    msgContainer.appendChild(msgDisplay);                    
  });
}

const shout = () => {
  if (msg.value.length > 0) {
    channel.push('shout', {
      name: name.value,
      message: msg.value
    });
    msg.value = '';
  }
}

const changeGroup = (groupTab, otherGroupTab) => {
  groupTab.classList.toggle('selected');
  otherGroupTab.classList.toggle('selected');

  group = document.getElementById('group-a').classList.contains('selected') ? 'lobbyA' : 'lobbyB';

  channel = socket.channel(`room:${group}` , {});

  addOnShoutListener();
  addShoutEventListeners();
  addChangeGroupEventListeners();

  msgContainer.innerHTML = '';

  channel.join()
    .receive('ok', resp => { console.log(`Joined successfully ${group}`, resp) })
    .receive('error', resp => { console.log(`Unable to join ${group}`, resp) });
}

const addShoutEventListeners = () => {
  msg.addEventListener('keypress', event => {
    if (event.keyCode == 13) {
      shout();
    }
  });
  btn.addEventListener('mouseup', () => shout());
}

const addChangeGroupEventListeners = () => {
  groupATab.addEventListener('mouseup', () => {
    if (!groupATab.classList.contains('selected')) {
      changeGroup(groupATab, groupBTab);
    }
  });
  groupBTab.addEventListener('mouseup', () => {
    if (!groupBTab.classList.contains('selected')) {
      changeGroup(groupBTab, groupATab);
    }
  });
}

addOnShoutListener();
addShoutEventListeners();
addChangeGroupEventListeners();

channel.join()
  .receive('ok', resp => { console.log('Joined successfully', resp) })
  .receive('error', resp => { console.log('Unable to join', resp) });

export default socket;
