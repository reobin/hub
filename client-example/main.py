#!/usr/bin/env python

# WS client example

import asyncio
import websockets
import json
import sys

URL = "wss://guarded-fortress-70241.herokuapp.com/socket/websocket"
# URL = "ws://localhost:4000/socket/websocket"

online_users = []


class Prompt:
    def __init__(self, loop=None):
        self.loop = loop or asyncio.get_event_loop()
        self.q = asyncio.Queue(loop=self.loop)
        self.loop.add_reader(sys.stdin, self.on_input)

    def on_input(self):
        asyncio.ensure_future(self.q.put(sys.stdin.readline()), loop=self.loop)

    async def __call__(self, msg=None, **kwargs):
        if msg:
            print(msg, **kwargs)
        return (await self.q.get()).rstrip("\n")


async def send_messages(connection, room_name, username):
    prompt = Prompt()
    while True:
        message_body = await prompt()
        if message_body:
            message = {
                "topic": f"room:{room_name}",
                "event": "shout",
                "payload": {
                    "body": message_body,
                    "channel": room_name,
                    "name": username,
                },
                "ref": None,
            }

            await connection.send(json.dumps(message))


async def create_connection(room_name, username):
    connection = await websockets.connect(URL)
    data = {
        "topic": f"room:{room_name}",
        "event": "phx_join",
        "payload": {"username": username},
        "ref": None,
    }
    await connection.send(json.dumps(data))
    print(f"> connection query")
    return connection


async def join_a_room(websocket):
    response = await websocket.recv()
    print(f"< connected")

    async for message_data in websocket:
        message = json.loads(message_data)
        if message["event"] == "shout":
            name = message["payload"]["name"]
            body = message["payload"]["body"]
            print(f"< {name} says : {body}")
        elif message["event"] == "presence_diff":
            manage_presence(message)
        elif message["event"] == "presence_state":
            online_users.extend(list(message["payload"].keys()))


def manage_presence(message):
    join_info_keys = list(message["payload"]["joins"].keys())
    leave_info_keys = list(message["payload"]["leaves"].keys())

    user_joined = True if join_info_keys else False

    if user_joined:
        username = join_info_keys[0]
        if join_info_keys[0] in online_users:
            typing = message["payload"]["joins"][username]["metas"][0]["typing"]
            typing_message = "is" if typing else "has stopped"
            print(f"{username} {typing_message} typing")
        else:
            online_users.append(join_info_keys[0])
            print(f"{username} has joined")
            print(f"Online users: {online_users}")
    else:
        username = leave_info_keys[0]
        online_users.remove(username)
        print(f"{username} has left")


if __name__ == "__main__":
    loop = asyncio.get_event_loop()

    print("Enter your name:")
    username = input() or "guest"

    print("Chat room you wish to join:")
    room_name = input() or "lobby"

    connection = loop.run_until_complete(create_connection(room_name, username))

    asyncio.ensure_future(join_a_room(connection))
    asyncio.ensure_future(send_messages(connection, room_name, username))
    loop.run_forever()

