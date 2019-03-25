defmodule HubWeb.Message do
  @derive Jason.Encoder
  defstruct [:name, :body]
end

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
    messages_response = Hub.Chats.list_messages_from_room(room_name)

    messages =
      Enum.map(messages_response, fn raw_msg ->
        %HubWeb.Message{name: raw_msg.name, body: raw_msg.body}
      end)

    render(conn, "index.html", %{
      room_name: room_name,
      messages: messages,
      sign_in_module: HubWeb.SessionView
    })
  end
end
