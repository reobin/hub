# Hub

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.setup`
  * Install Node.js dependencies with `cd assets && npm install`
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: http://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Mailing list: http://groups.google.com/group/phoenix-talk
  * Source: https://github.com/phoenixframework/phoenix

# Using the Hub websocket API to create an external chat client
An example of a python client is located in the ``./client-example`` folder. For detailed information, keep reading.

## Table of contents
- [Schema](#schema)
- [Sending and receiving data](#sending-and-receiving-data)
- [Creating the connection](#creating-the-connection)
- [Listing online users](#listing-online-users)
- [Receiving a chat message](#receiving-a-chat-message)
- [Get notified when a user joins or leaves the chat room](#get-notified-when-a-user-joins-or-leaves-the-chat-room)
    - [User joins](#user-joins)
    - [User leaves](#user-leaves)
    - [Get notified](#get-notified)
- [Get notified when a user starts or stops typing](#get-notified-when-a-user-starts-or-stops-typing)
- [Send a message](#send-a-message)

## Schema

All API access is over **WSS**, and accessed from ``wss://guarded-fortress-70241.herokuapp.com/socket/websocket``

If you want to test locally, start the server and use the address ``ws://localhost:4000/socket/websocket`` for the client.

All data is sent and received as **JSON**. 

For all the examples below, we will assume the user name is **robin**, and the users interacting with him are named with some king of variation of **robin**. e.g. **robin2**

The name of the chat room we will be interacting with is **lobby**. Everywhere **lobby** is seen, it could be replaced with another name, or set dynamically in your app. e.g. ``room:lobby`` could also be ``room:chatroom`` as long as it's defined as such through all your app. 

## Sending and receiving data

As stated in the [Phoenix Docs](https://hexdocs.pm/phoenix/Phoenix.Socket.Message.html), here is the meaning of the different attributes of a websocket message.

- ``topic`` The string topic or topic:subtopic pair namespace, for example “messages”, “messages:123”
- ``event`` The string event name, for example “phx_join”
- ``payload`` The message payload
- ``ref`` The unique string ref
- ``join_ref`` The unique string ref when joining

The different events are detailed below.

## Creating the connection

To open a connection and thus, joining a chat room, you first need the user's name, and the name of the chat room he wishes to join.

As said above, the server responds to JSON. The message we send to connect should look like this.
```json
{
  topic: "room:lobby",
  event: "phx_join",
  payload: 
  {
    username: "robin"
  },
  ref: null,
}
```

Using the websockets library in Python, it goes like this.
```python
import json
import websockets
import asyncio

URL = "wss://guarded-fortress-70241.herokuapp.com/socket/websocket"

connection = await websockets.connect(URL)
data = {
    "topic": f"room:{room_name}",
    "event": "phx_join",
    "payload": {"username": username},
    "ref": None,
}
connection.send(json.dumps(data))
```

- ``topic`` dictates the chat room to connect to. The room's name must be preceded by the prefix ``room:``. e.g. ``room:lobby``
- ``event`` is ``phx_join``. This means we're opening the connection to a chat room.
- ``payload`` contains the username of the user trying to connect.

Receiving a response at all means the connection was successfull, but just the the records, here's what the answer looks like.
```json
{
  topic: "room:lobby",
  event: "phx_reply",
  payload: 
  {
    response: {},
    status: "ok"
  },
  ref: null,
}
```

Congratulations, you're connected!

## Listing online users

Right after receiving a response confirming that the connection was successfull, the server sends a second message with the ``event`` tag set to ``presence_state`` containing more useful information. It goes like this.
```json
{
  topic: "room:lobby",
  event: "presence_state",
  payload: 
  {
    robin:
    {
      metas:
      [
        {
          phx_ref:"cSvOUT1SLRM=",
          phx_ref_prev:"QIy9RaBWFhE=",
          typing:false,
          username:"robin"
        }
      ]
    },
    robin2:{metas:[{phx_ref:"ya1DVM0S290=",typing:false,username:"robin2"}]}
  }
]
```

I left the second user, robin, on one line for clarity.

So, as you can see, this message contains the informations on the users that are currently connected to the chat room. Obtaining the name of the users is not the easiest thing in the world, since the name of the key is the actual username, but blame Phoenix Presence putting me in that spot. Here's how I did it in python.
```python
list(message["payload"].keys()
```

This creates a list of string containing the users names. 

## Receiving a chat message

When the message topic is set to ``shout``, this means someone wrote a message to the chat room you're connected to. This what a ``shout`` looks like.
```json
{
  topic: "room:chat",
  event: "shout",
  payload:
  {
    body:"hey",
    channel:"lobby",
    name:"robin"
  }
}
```

Let's build a simple python client that connects to a chat room, waits for the user list (``presence_state``), prints it, and then loops forever waiting for either the user list, or a new message from a user.
```python
import json
import websockets
import asyncio

URL = "wss://guarded-fortress-70241.herokuapp.com/socket/websocket"


async def connect():
    connection = await websockets.connect(URL)
    data = {
        "topic": f"room:lobby",
        "event": "phx_join",
        "payload": {"username": "robin"},
        "ref": None,
    }
    await connection.send(json.dumps(data))
    return connection


async def recv(connection):
    response = await connection.recv()

    async for message_data in connection:
        message = json.loads(message_data)
        if message["event"] == "presence_state":
            print(list(message["payload"].keys()))
        elif message["event"] == "shout":
            name = message["payload"]["name"]
            body = message["payload"]["body"]
            print(f"< {name} says : {body}")


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    connection = loop.run_until_complete(connect())
    asyncio.ensure_future(recv(connection))
    loop.run_forever()
```

The ``main`` is basically just the setup for the main loop. See [asyncio docs](https://docs.python.org/3.6/library/asyncio.html).



The ``connect`` function runs once. Basically, it creates the JSON ``phx_join`` message, and send it to the server.

The ``recv`` function is the one that runs forever. It catches all the messages broadcasted from the server. For now we only want to catch ``presence_state`` and ``shout`` events.

When the event is set to ``shout`` is when a message from a user has been received. We can simply catch the user name, the body of the message, and the channel it has been sent to if we need it, from the JSON object.

## Get notified when a user joins or leaves the chat room

### User joins

Let's start with when a user joins.

The message sent by the server when a user joins is the following.
```json
{
  topic: "room:lobby",
  event: "presence_diff",
  payload: 
  {
    joins:
    {
      robin:
      {
        metas:
        [
          {
            phx_ref: "3739c+OnWg4=",
            typing: false,
            username: "robin"
          }
        ]
      }
    },
    leaves:{}
  }
}
```

The ``event`` is in this case ``presence_diff``, which deals with other events than just a user joining. We will see it in details below.

The ``payload`` contains two object. One of them is ``joins``. When a new user connects to the chat room, ``joins`` contains the information we want. ``leaves``, on the contrary,  contains an object when a user leaves the chat room.

Inside the ``joins`` object, we can find a list of users connecting. Like with the ``presence_state`` event, the name of key present in the object is the actual username of the user connecting.

Here's the thing. The same event will be launched if a client sends the "user stops typing" event.

Knowing that, you should keep a list of online users on your client. When you receive this event, and the user doesn't exist in your list, then the user joined. If it does exist, well something else happened. We will discuss it below.

### User leaves

The event sent when a user leaves is almost copied to the one sent when a user joins. The difference is that all the data is inside the ``leaves`` object, instead of the ``joins`` object.
```json
{
  topic: "room:lobby",
  event: "presence_diff",
  payload: 
  {
    joins: {},
    leaves: 
    {
      robin:
      {
        metas:
        [
          {
            phx_ref: "3739c+OnWg4=",
            typing: false,
            username: "robin"
          }
        ]
      },
    }
  }
}
```
### Get notified

Let's add into the python client the condition accepting one of these events when receiving a message from the server. Our code for ``recv`` then becomes
```python
online_users = []

# ...

async def recv(connection):
    response = await connection.recv()
    print(f"< connected")

    async for message_data in connection:
        message = json.loads(message_data)
        if message["event"] == "shout":
            name = message["payload"]["name"]
            body = message["payload"]["body"]
            print(f"< {name} says : {body}")
        elif message["event"] == "presence_diff":
            manage_presence(message)
        elif message["event"] == "presence_state":
            online_users.extend(list(message["payload"].keys()))
```

To keep the ``recv`` function light, I made the whole management of the ``presence_diff`` event into a different function.
```python
    def manage_presence(message):
        join_info_keys = list(message["payload"]["joins"].keys())
        leave_info_keys = list(message["payload"]["leaves"].keys())
    
        user_joined = True if join_info_keys else False
    
        if user_joined:
            username = join_info_keys[0]
            if join_info_keys[0] not in online_users:
                online_users.append(join_info_keys[0])
                print(f"{username} has joined")
                print(f"Online users: {online_users}")
        else:
            username = leave_info_keys[0]
            online_users.remove(username)
            print(f"{username} has left")
```

If the ``joins`` object contains something, either a user has joined or is typing. 

If the ``joins`` object is empty, and the ``leaves`` object contains something, a user has disconnected.

The management of the ``online_users`` array is really important here because you could mistakingly notify your users that another user has joined when he actually just started or stopped typing.

## Get notified when a user starts or stops typing

The event sent by the server when a user starts or stops typing looks a lot like
the "user has connected" event. The difference is that both ``joins`` and 
``leaves`` objects are filled with the user's data. One of them has the boolean 
``typing`` set to ``True``, while the other has it set to ``False``.
```json
{
  topic: "room:lobby",
  event: "presence_diff",
  payload: 
  {
    joins: {
      robin:
      {
        metas:
        [
          {
            phx_ref: "hFTdWydp4YA",
            typing: true,
            username: "robin"
          }
        ]
      },
    },
    leaves: 
    {
      robin:
      {
        metas:
        [
          {
            phx_ref: "3739c+OnWg4=",
            typing: false,
            username: "robin"
          }
        ]
      },
    }
  }
}
```
The presence data we want is located in the ``joins`` object. Theoritically, 
this means the user **robin**, that was not typing, left, and the new user 
**robin**, that is typing, joined. 

By keeping a list of connected users, it's easy to know when a user has 
connected, or has instead started typing. When the ``joins`` object is not 
empty, you can check if the mentionned user is in the list of connected users. 
If he is, then he started or stopped typing. Otherwise, he just joined the chat
room.

The boolean ``typing`` inside the ``joins`` object dictates wether he actually 
started (``typing == True``) or stopped (``typing == False``).

Let's update or python client.
```python
def manage_presence(message):
    join_info_keys = list(message["payload"]["joins"].keys())
    leave_info_keys = list(message["payload"]["leaves"].keys())

    user_joined = True if join_info_keys else False

    if user_joined:
        username = join_info_keys[0]
        if join_info_keys[0] in online_users: # user is already in the online user list
            typing = message["payload"]["joins"][username]["metas"][0]["typing"]
            typing_message = "is" if typing else "has stopped"
            print(f"{username} {typing_message} typing")
        else: # user is not in the list -> just connected
            online_users.append(join_info_keys[0])
            print(f"{username} has joined")
            print(f"Online users: {online_users}")
    else:
        username = leave_info_keys[0]
        online_users.remove(username)
        print(f"{username} has left")
```

## Send a message
To send a message to a chat room, here is the JSON object you need to send.

```json
{
  topic: "room:lobby",
  event: "shout",
  payload: 
  {
    body: "hello world",
    channel: "lobby",
    name: "robin"
  },
  ref: null
}
```
- ``body`` the message body
- ``channel`` the chat room to send the message to
- ``name`` the username of the user writing

To see the complete python client with all the functionnalities, see ``./client-example``.

If you have followed along, here is what you need to add to manage input and send messages.
```python

# ...

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
            
# ...
            
# and in the main ...

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    connection = loop.run_until_complete(connect())
    asyncio.ensure_future(recv(connection))
    loop.run_forever()

```

Thank you!

