defmodule HubWeb.RoomChannelTest do
  use HubWeb.ChannelCase

  setup do
    {:ok, _, socket} =
      socket(HubWeb.UserSocket, "user_id", %{some: :assign})
      |> subscribe_and_join(HubWeb.RoomChannel, "room:lobby")

    {:ok, socket: socket}
  end

  test "ping replies with status ok", %{socket: socket} do
    ref = push socket, "ping", %{"hello" => "there"}
    assert_reply ref, :ok, %{"hello" => "there"}
  end

  test "shout broadcasts to room:lobby", %{socket: socket} do
    push socket, "shout", %{"message" => "hello"}
    assert_broadcast "shout", %{message: "hello"}
  end

  test "broadcasts are pushed to the client", %{socket: socket} do
    broadcast_from! socket, "broadcast", %{"some" => "data"}
    assert_push "broadcast", %{"some" => "data"}
  end
end
