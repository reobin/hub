defmodule Hub.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application
  use Supervisor

  def init(stack) do
    {:ok, stack}
  end

  def start(_type, _args) do
    # List all child processes to be supervised
    children = [
      # Start the Ecto repository
      Hub.Repo,
      # Start the endpoint when the application starts
      HubWeb.Endpoint,
      # Starts a worker by calling: Hub.Worker.start_link(arg)
      # {Hub.Worker, arg},
      worker(Hub.Periodically, [])
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Hub.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    HubWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
