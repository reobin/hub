defmodule HubWeb.RoomController do
  use HubWeb, :controller

  @default_room "lobby"

  def show(conn, %{"id" => room_id}) do
    render_room(conn, room_id)
  end

  def show(conn, _params) do
    render_room(conn, @default_room)
  end

  defp render_room(conn, room_id) do
    render(conn, "index.html", %{room_id: room_id})
  end
end
