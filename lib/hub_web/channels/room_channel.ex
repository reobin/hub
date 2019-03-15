defmodule HubWeb.RoomChannel do
  use HubWeb, :channel

  def join("room:" <> group_id, payload, socket) do
    {:ok, socket}
  end

  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  def handle_in("shout", %{"message" => message}, socket) do
    broadcast!(socket, "shout", %{message: message})
    {:noreply, socket}
  end
end
