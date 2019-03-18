defmodule HubWeb.RoomControllerTest do
  use HubWeb.ConnCase

  test "GET /c", %{conn: conn} do
    conn = get(conn, "/c")
    assert html_response(conn, 200)
  end

  test "GET /c/testroom", %{conn: conn} do
    conn = get(conn, "/c/testroom")
    assert html_response(conn, 200)
  end
end
