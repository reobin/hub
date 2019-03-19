defmodule Hub.ChatsTest do
  use Hub.DataCase

  describe "messages" do
    alias Hub.Chats.Message
    alias Hub.Chats

    @valid_attrs %{body: "some body", channel: "some channel", name: "some name"}
    @update_attrs %{
      body: "some updated body",
      channel: "some updated channel",
      name: "some updated name"
    }
    @invalid_attrs %{body: nil, channel: nil, name: nil}

    def message_fixture(attrs \\ %{}) do
      {:ok, message} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Chats.create_message()

      message
    end

    test "list_messages/0 returns all messages" do
      message = message_fixture()
      assert Chats.list_messages() == [message]
    end

    # emliore test
    test "list_messages_from_room/0 returns all messages from a specified room" do
      message = message_fixture()
      assert Chats.list_messages_from_room("some channel") == [message]
    end

    test "create_message/1 with valid data creates a message" do
      assert {:ok, %Message{} = message} = Chats.create_message(@valid_attrs)
      assert message.body == "some body"
      assert message.channel == "some channel"
      assert message.name == "some name"
    end

    test "create_message/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Chats.create_message(@invalid_attrs)
    end

    test "change_message/1 returns a message changeset" do
      message = message_fixture()
      assert %Ecto.Changeset{} = Chats.change_message(message)
    end
  end
end
