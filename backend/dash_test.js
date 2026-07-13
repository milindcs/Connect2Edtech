import { getDb } from "./mongoClient.js";

const BASE = "http://localhost:10000";
const email = "dash_" + Date.now() + "@example.com";
const password = "Password123";

async function main() {
  await fetch(BASE + "/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Dash", email, phone: "9999999999", password }),
  });
  const r = await fetch(BASE + "/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const { token } = await r.json();
  const h = { Authorization: "Bearer " + token };

  r = await fetch(BASE + "/api/me/enrollments", { headers: h });
  console.log("ENROLLMENTS", r.status, (await r.json()).enrollments?.length);

  r = await fetch(BASE + "/api/me/contacts", { headers: h });
  console.log("CONTACTS", r.status, (await r.json()).contacts?.length);
}
main().catch((e) => { console.error(e); process.exit(1); });
