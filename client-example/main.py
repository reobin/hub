#!/usr/bin/env python

# WS client example

import asyncio
import websockets
import json

URL = "wss://guarded-fortress-70241.herokuapp.com/socket/websocket"


async def join_a_room():
    async with websockets.connect(URL) as websocket:
        data = dict(
            topic="room:lobby",
            event="phx_join",
            payload={"username": "reobin"},
            ref=None,
        )
        await websocket.send(json.dumps(data))
        print(f"> {data}")

        recv = await websocket.recv()
        print(f"< {recv}")


asyncio.get_event_loop().run_until_complete(join_a_room())

