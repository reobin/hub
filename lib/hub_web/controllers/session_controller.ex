defmodule HubWeb.SessionController do
  use HubWeb, :controller
  alias Hub.Accounts

  def new(conn, _params) do
    render(conn, "new.html")
  end

  def create(conn, %{"session" => auth_params}) do
    user = Accounts.get_by_username(auth_params["username"])

    conn
    |> put_session(:current_user_id, user.id)
    |> put_flash(:info, "Signed in successfully.")
    |> redirect(to: Routes.page_path(conn, :index))
  end

  def delete(conn, _params) do
    conn
    |> delete_session(:current_user_id)
    |> put_flash(:info, "Signed out successfully.")
    |> redirect(to: Routes.page_path(conn, :index))
  end
end
