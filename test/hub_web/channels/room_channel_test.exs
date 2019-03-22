defmodule HubWeb.RoomChannelTest do
  use HubWeb.ChannelCase

  setup do
    {:ok, _, socket} =
      socket(HubWeb.UserSocket, "user_id", %{some: :assign})
      |> subscribe_and_join(HubWeb.RoomChannel, "room:lobby", %{"username" => "guest"})

    {:ok, socket: socket}
  end

  test "shout broadcasts to room:lobby", %{socket: socket} do
    push(socket, "shout", %{"message" => "hello"})
    assert_broadcast "shout", %{"message" => "hello"}
  end

  test "broadcasts are pushed to the client", %{socket: socket} do
    broadcast_from!(socket, "broadcast", %{"some" => "data"})
    assert_push "broadcast", %{"some" => "data"}
  end
end
