defmodule Hub.Periodically do
  import Ecto.Query, only: [from: 2]
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, %{})
  end

  def init(state) do
    delete_old_messages()
    {:ok, state}
  end

  def handle_info(:work, state) do
    {:ok, an_hour_ago} = DateTime.from_unix(DateTime.to_unix(DateTime.utc_now()) - 60 * 60)

    query = from m in "messages", where: m.updated_at <= ^an_hour_ago
    Hub.Repo.delete_all(query, [])

    delete_old_messages()
    {:noreply, state}
  end

  defp delete_old_messages() do
    Process.send_after(self(), :work, 5 * 60 * 1000)
  end
end
