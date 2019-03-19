defmodule HubWeb.RoomChannel do
  use HubWeb, :channel

  def join("room:" <> _room_name, _payload, socket) do
    {:ok, socket}
  end

  def handle_in("shout", payload, socket) do
    # TODO make async
    Hub.Chats.create_message(payload)
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end
end
