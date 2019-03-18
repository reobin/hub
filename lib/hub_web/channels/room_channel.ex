defmodule HubWeb.RoomChannel do
  use HubWeb, :channel

  def join("room:" <> _room_id, _payload, socket) do
    {:ok, socket}
  end

  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end
end
