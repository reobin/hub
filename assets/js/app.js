import css from "../css/app.css"
import "phoenix_html"
import socket from "./socket"
import Room from "./room"

const roomName = document.getElementById('room-id').innerText;
const room = new Room(socket, roomName);
