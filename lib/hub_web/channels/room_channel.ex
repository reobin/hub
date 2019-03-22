require IEx

defmodule HubWeb.RoomChannel do
  use HubWeb, :channel

  alias HubWeb.Presence

  def join("room:" <> _room_name, %{"username" => username}, socket) do
    socket = assign(socket, :username, username)
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    push(socket, "presence_state", Presence.list(socket))

    {:ok, _} =
      Presence.track(socket, socket.assigns.username, %{
        typing: false,
        username: socket.assigns.username
      })

    {:noreply, socket}
  end

  def handle_in("user:typing", %{"username" => username, "typing" => typing}, socket) do
    {:ok, _} =
      Presence.update(socket, socket.assigns.username, %{
        typing: typing,
        username: username
      })

    {:reply, :ok, socket}
  end

  def handle_in("shout", payload, socket) do
    Hub.Chats.create_message(payload)
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end
end
