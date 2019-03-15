// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative paths, for example:
import socket from "./socket"

const channel = socket.channel('room:lobby', {});

channel.on('shout', payload => {
  const msgDisplay = document.createElement("div");
  const name = payload.name || 'guest';
  msgDisplay.innerHTML = '<b>' + name + '</b>: ' + payload.message;
  msgContainer.appendChild(msgDisplay);                    
});

channel.join();

const msgContainer = document.getElementById('msg-list');
const name = document.getElementById('name');
const msg = document.getElementById('msg');

// "listen" for the [Enter] keypress event to send a message:
msg.addEventListener('keypress', function (event) {
  if (event.keyCode == 13 && msg.value.length > 0) { // don't sent empty msg.
    channel.push('shout', { // send the message to the server on "shout" channel
      name: name.value,     // get value of "name" of person sending the message
      message: msg.value    // get message text (value) from msg input field.
    });
    msg.value = '';         // reset the message input field for next message.
  }
});