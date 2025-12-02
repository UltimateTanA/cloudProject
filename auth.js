// src/utils/auth.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // try parse JSON body; if parse fails return text
  let data;
  try { data = await res.json(); } catch { data = await res.text(); }

  if (!res.ok) {
    // normalize error: if backend returned { message } use it
    const message = (data && data.message) ? data.message : (typeof data === "string" ? data : "Request failed");
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export function signup({ username, password }) {
  return request("/signup", { username, password });
}

export function login({ username, password }) {
  return request("/login", { username, password });
}
