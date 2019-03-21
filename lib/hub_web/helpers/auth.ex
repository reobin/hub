defmodule HubWeb.Helpers.Auth do
  def signed_in?(conn) do
    user_id = Plug.Conn.get_session(conn, :current_user_id)
    if user_id, do: !!Hub.Repo.get(Hub.Accounts.User, user_id)
  end

  def current_user(conn) do
    user_id = Plug.Conn.get_session(conn, :current_user_id)
    if user_id, do: Hub.Repo.get(Hub.Accounts.User, user_id)
  end
end
