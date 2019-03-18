import css from "../css/app.css"
import "phoenix_html"
import socket from "./socket"
import Room from "./room"

const roomIdElement = document.getElementById('room-id');
if (roomIdElement) {
  const room = new Room(socket, roomIdElement.innerText);
}
