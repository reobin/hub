defmodule HubWeb.SessionController do
  use HubWeb, :controller
  alias Hub.Accounts

  def new(conn, _params) do
    render(conn, "new.html", %{error: "", room_name: ""})
  end

  def create(conn, %{"session" => auth_params, "room_name" => room_name}) do
    next_path =
      if room_name != "",
        do: Routes.room_path(conn, :show, id: room_name),
        else: Routes.page_path(conn, :index)

    case Accounts.get_by_username(auth_params["username"]) do
      nil ->
        create_user_and_redirect(conn, auth_params, room_name, next_path)

      user ->
        conn
        |> put_session(:current_user_id, user.id)
        |> put_flash(:info, "Signed in successfully.")
        |> redirect(to: next_path)
    end
  end

  def delete(conn, _params) do
    conn
    |> delete_session(:current_user_id)
    |> put_flash(:info, "Signed out successfully.")
    |> redirect(to: Routes.page_path(conn, :index))
  end

  defp create_user_and_redirect(conn, auth_params, room_name, next_path) do
    case Accounts.create_user(auth_params) do
      {:ok, user} ->
        conn
        |> put_session(:current_user_id, user.id)
        |> put_flash(:info, "User created successfully.")
        |> redirect(to: next_path)

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html",
          changeset: changeset,
          error: "Username field is required",
          room_name: room_name
        )
    end
  end
end
