#!/usr/bin/env python

# WS client example

import asyncio
import websockets
import json
import sys

URL = "wss://guarded-fortress-70241.herokuapp.com/socket/websocket"


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


async def send_messages(connection, room_name):
    prompt = Prompt()
    while True:
        message_body = await prompt()
        message = {
            "topic": f"room:{room_name}",
            "event": "shout",
            "payload": {"body": message_body, "channel": room_name, "name": "reobin"},
            "ref": None,
        }

        await connection.send(json.dumps(message))


async def create_connection(room_name):
    connection = await websockets.connect(URL)
    data = {
        "topic": f"room:{room_name}",
        "event": "phx_join",
        "payload": {"username": "reobin"},
        "ref": None,
    }
    await connection.send(json.dumps(data))
    print(f"> {data}")
    return connection


async def join_a_room(websocket):

    response = await websocket.recv()
    print(f"< {response}")

    async for message_body in websocket:
        message = json.loads(message_body)

        if message["event"] == "shout":
            print(f"< {message['payload']['body']}")


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    room_name = sys.argv[1]
    connection = loop.run_until_complete(create_connection(room_name))

    asyncio.ensure_future(join_a_room(connection))
    asyncio.ensure_future(send_messages(connection, room_name))
    loop.run_forever()

