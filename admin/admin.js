const API = window.PORTFOLIO_API_URL || "http://localhost:3000/api";
const $ = (selector) => document.querySelector(selector);
let token = localStorage.getItem("portfolio-admin-token");

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Request failed");
  return body;
}

function showDashboard() { $("#login-view").hidden = true; $("#dashboard-view").hidden = false; loadDashboard(); }
function showError(form, error) { form.querySelector(".message").textContent = error.message; }

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const result = await request("/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    token = result.accessToken; localStorage.setItem("portfolio-admin-token", token); showDashboard();
  } catch (error) { showError(form, error); }
});

async function loadDashboard() {
  try {
    const [content, projects, inquiries] = await Promise.all([request("/content"), request("/projects"), request("/inquiries")]);
    const hero = content.find((item) => item.key === "hero")?.value || {};
    $("#hero-form").heading.value = hero.heading || "";
    $("#hero-form").description.value = hero.description || "";
    $("#total-projects").textContent = projects.length;
    $("#total-inquiries").textContent = inquiries.length;
    $("#new-inquiries").textContent = inquiries.filter((item) => item.status === "new").length;
    $("#projects").innerHTML = projects.map((project) => `<div class="row"><span><strong>${escapeHtml(project.title)}</strong><br>${escapeHtml(project.description)}</span><button data-delete-project="${project.id}" class="secondary">Delete</button></div>`).join("") || "<p>No projects yet.</p>";
    $("#inquiries").innerHTML = inquiries.map((item) => `<div class="row"><span><strong>${escapeHtml(item.subject)}</strong> — ${escapeHtml(item.name)} (${escapeHtml(item.email)})<br>${escapeHtml(item.message)}</span><select data-status="${item.id}"><option ${item.status === "new" ? "selected" : ""}>new</option><option ${item.status === "read" ? "selected" : ""}>read</option><option ${item.status === "replied" ? "selected" : ""}>replied</option></select></div>`).join("") || "<p>No inquiries yet.</p>";
  } catch (error) { if (error.message.includes("Authentication")) { localStorage.removeItem("portfolio-admin-token"); location.reload(); } }
}

$("#hero-form").addEventListener("submit", async (event) => {
  event.preventDefault(); const form = event.currentTarget;
  try { await request("/content/hero", { method: "PUT", body: JSON.stringify({ heading: form.heading.value, description: form.description.value }) }); form.querySelector(".message").textContent = "Saved."; } catch (error) { showError(form, error); }
});
$("#project-form").addEventListener("submit", async (event) => {
  event.preventDefault(); const form = event.currentTarget;
  try { await request("/projects", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); form.reset(); form.querySelector(".message").textContent = "Added."; loadDashboard(); } catch (error) { showError(form, error); }
});
document.addEventListener("click", async (event) => { const id = event.target.dataset.deleteProject; if (id && confirm("Delete this project?")) { await request(`/projects/${id}`, { method:"DELETE" }); loadDashboard(); } });
document.addEventListener("change", async (event) => { const id = event.target.dataset.status; if (id) await request(`/inquiries/${id}`, { method:"PATCH", body:JSON.stringify({ status:event.target.value }) }); });
$("#logout").addEventListener("click", () => { localStorage.removeItem("portfolio-admin-token"); location.reload(); });
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char])); }
if (token) showDashboard();
