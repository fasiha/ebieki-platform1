import { createSignal, For, onMount, Show, type Component } from "solid-js";
import { setUser, user } from "./signals";

const [users, setUsers] = createSignal<string[]>([]);
const [networkError, setNetworkError] = createSignal("");

fetchUsers(); // fire and forget

async function fetchUsers() {
  const res = await fetch("/api/users");
  if (res.ok) {
    const json = await res.json();
    if (
      Array.isArray(json) &&
      json.every((x: unknown) => typeof x === "string")
    ) {
      setUsers(json.sort());
    }
    setNetworkError("");
  } else {
    setNetworkError(`Couldn't get users: ${res.status} ${res.statusText}`);
  }
}

async function createUser(name: string): Promise<boolean> {
  const res = await fetch("/api/users", {
    ...jsonOptions,
    method: "PUT",
    body: JSON.stringify({ name }),
  });
  if (res.ok) {
    setUser(name);
    setUsers((prev) => prev.concat(name).sort());
    setNetworkError("");
    return true;
  } else {
    setNetworkError(
      `Couldn't create a new user: ${res.status} ${res.statusText}`
    );
    return false;
  }
}
const jsonOptions: ResponseInit = {
  headers: {
    "Content-Type": "application/json",
  },
};

const Login: Component = () => {
  const [selected, setSelected] = createSignal("");
  const [newUser, setNewUser] = createSignal("");

  const handleCreateUser = async () => {
    const result = await createUser(newUser());
    if (result) {
      setNewUser("");
    }
  };

  const handleLogin = () => {
    setUser(selected());
    localStorage.setItem("user", selected());
  };

  return (
    <div>
      <label>
        Who are you?{" "}
        <input
          type="text"
          list="usersList"
          value={selected()}
          onInput={(e) => setSelected(e.target.value)}
        />
        <datalist id="usersList">
          <For each={users()}>{(user, index) => <option>{user}</option>}</For>
        </datalist>
      </label>
      <Show when={users().includes(selected())}>
        <button onClick={handleLogin}>Log in as {selected()}</button>
      </Show>
      <label>
        {" "}
        Or sign up as a new user?{" "}
        <input
          type="text"
          value={newUser()}
          onInput={(e) => setNewUser(e.target.value)}
        />
      </label>
      <Show when={newUser()}>
        <button onClick={handleCreateUser}>Sign up as {newUser()}</button>
      </Show>
    </div>
  );
};

export const User: Component = () => {
  onMount(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(savedUser);
  });
  const handleLogout = () => {
    setUser("");
    localStorage.removeItem("user");
  };
  return (
    <div>
      <Show when={networkError()}>
        <div class="network-error">{networkError()}</div>
      </Show>
      <Show when={user()} fallback={<Login />}>
        <div>
          Welcome {user()}! <button onClick={handleLogout}>Logout</button>
        </div>
      </Show>
    </div>
  );
};
