require IEx

defmodule HubWeb.RoomChannel do
  use HubWeb, :channel

  def join("room:" <> _room_name, %{"username" => username}, socket) do
    socket = assign(socket, :username, username)
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    push(socket, "presence_state", HubWeb.Presence.list(socket))

    {:ok, _} =
      HubWeb.Presence.track(socket, socket.assigns.username, %{
        username: socket.assigns.username
      })

    {:noreply, socket}
  end

  def handle_in("shout", payload, socket) do
    Hub.Chats.create_message(payload)
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end
end
