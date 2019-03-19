defmodule HubWeb.RoomController do
  use HubWeb, :controller

  @default_room "lobby"

  def show(conn, %{"id" => room_name}) do
    render_room(conn, room_name)
  end

  def show(conn, _params) do
    render_room(conn, @default_room)
  end

  defp render_room(conn, room_name) do
    messages = Hub.Chats.list_messages_from_room(room_name)
    render(conn, "index.html", %{room_name: room_name, messages: messages})
  end
end
