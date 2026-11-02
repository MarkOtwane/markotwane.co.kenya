const API = window.PORTFOLIO_API_URL || "http://localhost:3000/api";
const $ = (selector, root = document) => root.querySelector(selector);
let token = localStorage.getItem("portfolio-admin-token");

// ---------- API helpers ----------

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...(isForm ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && token) { logout(); throw new Error("Your session expired. Please sign in again."); }
  if (!response.ok) throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message || "Request failed");
  return body;
}

const mediaUrl = (value) => (/^media\//.test(value || "") ? `${API}/${value}` : value ? new URL(value, new URL("../", location.href)).href : "");
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
const clone = (value) => JSON.parse(JSON.stringify(value));

function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char])); }

function toast(message, isError = false) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.toggle("error", isError);
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 3000);
}

async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  return request("/media", { method: "POST", body: form });
}

// ---------- Content schema: one entry per editable part of the site ----------

const titleFields = [
  { name: "titleLead", label: "Section title" },
  { name: "titleAccent", label: "Section title (green part)" }
];

const SOCIAL_PLATFORMS = ["facebook", "twitter", "instagram", "linkedin", "github", "youtube", "tiktok", "whatsapp", "behance", "dribbble", "medium", "telegram"];

const EDITORS = {
  hero: {
    title: "Home section",
    type: "object",
    fields: [
      { name: "eyebrow", label: "Small line above the heading" },
      { name: "greeting", label: "Greeting" },
      { name: "name", label: "Your name (shown in green)" },
      { name: "role", label: "Role / title" },
      { name: "description", label: "Introduction", type: "textarea", wide: true },
      { name: "image", label: "Profile photo", type: "image", wide: true },
      { name: "cvUrl", label: "CV link (paste your Google Docs share link)", wide: true, placeholder: "https://docs.google.com/document/d/…/view" },
      { name: "cvLabel", label: "CV button text" },
      { name: "contactLabel", label: "Contact button text" }
    ]
  },
  about: {
    title: "About section",
    type: "object",
    fields: [
      ...titleFields,
      { name: "infoTitle", label: "Small heading", wide: true },
      { name: "text", label: "About text", type: "textarea", wide: true },
      { name: "stats", label: "Stat cards", type: "list", itemTitle: (item) => `${item.value || ""} ${item.label || ""}`, fields: [{ name: "value", label: "Number (e.g. 30+)" }, { name: "label", label: "Label" }] },
      { name: "skillsTitle", label: "Skills heading" },
      { name: "timelineTitle", label: "Timeline heading" }
    ]
  },
  skills: {
    title: "Skills",
    type: "list",
    itemTitle: (item) => `${item.name || "New skill"} — ${item.level ?? 0}%`,
    fields: [{ name: "name", label: "Skill" }, { name: "level", label: "Level (%)", type: "range" }]
  },
  experience: {
    title: "Timeline",
    type: "list",
    itemTitle: (item) => `${item.role || "New entry"}${item.company ? ` · ${item.company}` : ""}`,
    fields: [
      { name: "role", label: "Role" },
      { name: "company", label: "Company" },
      { name: "period", label: "Period (e.g. 2023 to present)" },
      { name: "description", label: "Description", type: "textarea", wide: true }
    ]
  },
  portfolio: {
    title: "Portfolio section",
    type: "object",
    fields: [...titleFields, { name: "intro", label: "Intro text", type: "textarea", wide: true }]
  },
  projects: {
    title: "Projects",
    type: "projects",
    itemTitle: (item) => item.title || "New project",
    fields: [
      { name: "title", label: "Title", wide: true },
      { name: "description", label: "Short description", type: "textarea", wide: true },
      { name: "image", label: "Screenshot", type: "image", wide: true },
      { name: "githubUrl", label: "GitHub / source link", placeholder: "https://github.com/…" },
      { name: "liveUrl", label: "Live site link", placeholder: "https://…" },
      { name: "technologies", label: "Technologies (comma separated)", type: "tags", wide: true }
    ]
  },
  blog: {
    title: "Blog section",
    type: "object",
    fields: [...titleFields, { name: "emptyText", label: "Text shown when there are no posts", wide: true }]
  },
  blogs: {
    title: "Blog posts",
    type: "list",
    itemTitle: (item) => item.title || "New post",
    fields: [
      { name: "title", label: "Title", wide: true },
      { name: "excerpt", label: "Summary", type: "textarea", wide: true },
      { name: "image", label: "Cover image", type: "image", wide: true },
      { name: "url", label: "Link to the full article", wide: true, placeholder: "https://…" }
    ]
  },
  contact: {
    title: "Contact section",
    type: "object",
    fields: [
      ...titleFields,
      { name: "heading", label: "Heading", wide: true },
      { name: "text", label: "Text", type: "textarea", wide: true },
      { name: "location", label: "Location" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "languages", label: "Languages" },
      { name: "socials", label: "Social links", type: "list", itemTitle: (item) => item.platform || "New link", fields: [{ name: "platform", label: "Platform", type: "select", options: SOCIAL_PLATFORMS }, { name: "url", label: "Link", placeholder: "https://…" }] }
    ]
  },
  site: {
    title: "Site settings",
    type: "object",
    fields: [
      { name: "title", label: "Browser tab title", wide: true },
      { name: "description", label: "Search engine description", type: "textarea", wide: true },
      { name: "footerText", label: "Footer text" },
      { name: "footerLinkText", label: "Footer link text" },
      { name: "footerLinkUrl", label: "Footer link URL", wide: true }
    ]
  }
};

const PAGES = [
  { id: "overview", label: "Overview", icon: "fa-chart-line", hint: "A quick look at your site activity." },
  { id: "inquiries", label: "Inquiries", icon: "fa-inbox", hint: "Messages sent from the contact form." },
  { id: "home", label: "Home", icon: "fa-house", editors: ["hero"], hint: "The first screen visitors see." },
  { id: "about", label: "About", icon: "fa-user", editors: ["about"], hint: "Your story and stat cards." },
  { id: "skills", label: "Skills", icon: "fa-bars-progress", editors: ["skills"], hint: "Skill bars shown on the About page." },
  { id: "timeline", label: "Timeline", icon: "fa-briefcase", editors: ["experience"], hint: "Your work history." },
  { id: "projects", label: "Projects", icon: "fa-folder-open", editors: ["portfolio", "projects"], hint: "Your portfolio of work." },
  { id: "blog", label: "Blog", icon: "fa-newspaper", editors: ["blog", "blogs"], hint: "Articles shown on the Blogs page." },
  { id: "contact", label: "Contact", icon: "fa-envelope", editors: ["contact"], hint: "Contact details and social links." },
  { id: "site", label: "Site settings", icon: "fa-gear", editors: ["site"], hint: "Browser title, search description and footer." },
  { id: "media", label: "Media library", icon: "fa-images", hint: "Images you have uploaded." },
  { id: "account", label: "Account", icon: "fa-lock", hint: "Change your admin password." }
];

// ---------- State ----------

const state = { content: {}, projects: [], inquiries: [], dirty: new Set(), page: "overview" };

async function loadData() {
  const [content, projects, inquiries] = await Promise.all([request("/content"), request("/projects"), request("/inquiries")]);
  state.content = Object.fromEntries(content.map((entry) => [entry.key, entry.value]));
  state.projects = projects;
  state.inquiries = inquiries;
}

// ---------- Generic form builder ----------

function fieldElement(field, data, onChange) {
  const wrapper = document.createElement("label");
  if (field.wide || field.type === "textarea" || field.type === "image") wrapper.className = "wide";
  wrapper.append(field.label);
  const set = (value) => { data[field.name] = value; onChange(); };

  if (field.type === "textarea") {
    const input = document.createElement("textarea");
    input.value = data[field.name] ?? "";
    input.addEventListener("input", () => set(input.value));
    wrapper.append(input);
  } else if (field.type === "select") {
    const select = document.createElement("select");
    const options = field.options.includes(data[field.name]) || !data[field.name] ? field.options : [data[field.name], ...field.options];
    select.innerHTML = options.map((option) => `<option ${option === data[field.name] ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
    if (!data[field.name]) data[field.name] = options[0];
    select.addEventListener("change", () => set(select.value));
    wrapper.append(select);
  } else if (field.type === "range") {
    const row = document.createElement("div");
    row.className = "range-row";
    row.innerHTML = `<input type="range" min="0" max="100" step="5"><input type="number" min="0" max="100">`;
    const [range, number] = row.querySelectorAll("input");
    range.value = number.value = data[field.name] ?? 50;
    if (data[field.name] === undefined) data[field.name] = 50;
    const update = (value) => { const level = Math.max(0, Math.min(100, Number(value) || 0)); range.value = number.value = level; set(level); };
    range.addEventListener("input", () => update(range.value));
    number.addEventListener("change", () => update(number.value));
    wrapper.append(row);
  } else if (field.type === "image") {
    const row = document.createElement("div");
    row.className = "image-field";
    row.innerHTML = `<span class="preview"></span><input type="text" placeholder="Upload an image or paste a link"><button type="button" class="secondary"><i class="fas fa-upload"></i> Upload</button><input type="file" accept="image/*" hidden>`;
    const [text, file] = row.querySelectorAll("input");
    const preview = $(".preview", row);
    const showPreview = () => { preview.innerHTML = text.value ? `<img src="${escapeHtml(mediaUrl(text.value))}" alt="">` : `<span class="no-image"><i class="fas fa-image"></i></span>`; };
    text.value = data[field.name] ?? "";
    showPreview();
    text.addEventListener("input", () => { set(text.value); showPreview(); });
    $("button", row).addEventListener("click", () => file.click());
    file.addEventListener("change", async () => {
      if (!file.files[0]) return;
      const button = $("button", row);
      button.disabled = true;
      try { const media = await uploadImage(file.files[0]); text.value = media.url; set(media.url); showPreview(); toast("Image uploaded. Remember to save."); }
      catch (error) { toast(error.message, true); }
      finally { button.disabled = false; file.value = ""; }
    });
    wrapper.append(row);
  } else if (field.type === "tags") {
    const input = document.createElement("input");
    input.value = (data[field.name] || []).join(", ");
    input.addEventListener("input", () => set(input.value.split(",").map((tag) => tag.trim()).filter(Boolean)));
    wrapper.append(input);
  } else {
    const input = document.createElement("input");
    input.type = "text";
    input.value = data[field.name] ?? "";
    if (field.placeholder) input.placeholder = field.placeholder;
    input.addEventListener("input", () => set(input.value));
    wrapper.append(input);
  }
  return wrapper;
}

function renderFields(fields, data, container, onChange) {
  fields.forEach((field) => {
    if (field.type === "list") {
      const label = document.createElement("div");
      label.className = "list-label";
      label.textContent = field.label;
      container.append(label);
      if (!Array.isArray(data[field.name])) data[field.name] = [];
      container.append(listElement(field, data[field.name], onChange));
    } else {
      container.append(fieldElement(field, data, onChange));
    }
  });
}

function listElement(schema, items, onChange, openIndex = -1) {
  const list = document.createElement("div");
  list.className = "list";
  const rerender = (open) => list.replaceWith(listElement(schema, items, onChange, open));

  items.forEach((item, index) => {
    const details = document.createElement("details");
    details.className = "list-item";
    details.open = index === openIndex;
    details.innerHTML = `
      <summary>
        <i class="fas fa-chevron-right chevron"></i>
        <span class="title"></span>
        <span class="actions">
          <button type="button" class="icon" data-act="up" title="Move up" ${index === 0 ? "disabled" : ""}><i class="fas fa-arrow-up"></i></button>
          <button type="button" class="icon" data-act="down" title="Move down" ${index === items.length - 1 ? "disabled" : ""}><i class="fas fa-arrow-down"></i></button>
          <button type="button" class="icon danger" data-act="remove" title="Remove"><i class="fas fa-trash"></i></button>
        </span>
      </summary>
      <div class="body fields-grid"></div>`;
    const title = $(".title", details);
    const updateTitle = () => { title.textContent = schema.itemTitle ? schema.itemTitle(item) : `Item ${index + 1}`; };
    updateTitle();
    renderFields(schema.fields, item, $(".body", details), () => { updateTitle(); onChange(); });
    $(".actions", details).addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      event.preventDefault();
      const act = button.dataset.act;
      if (act === "remove") {
        if (!confirm(`Remove "${title.textContent}"?`)) return;
        items.splice(index, 1);
        onChange(); rerender(-1);
      } else {
        const target = act === "up" ? index - 1 : index + 1;
        [items[index], items[target]] = [items[target], items[index]];
        onChange(); rerender(target);
      }
    });
    list.append(details);
  });

  const add = document.createElement("button");
  add.type = "button";
  add.className = "secondary add-btn";
  add.innerHTML = `<i class="fas fa-plus"></i> Add`;
  add.addEventListener("click", () => { items.push({ id: newId() }); onChange(); rerender(items.length - 1); });
  list.append(add);
  return list;
}

function editorCard(key) {
  const schema = EDITORS[key];
  const card = document.createElement("section");
  card.className = "card";
  card.innerHTML = `
    <div class="editor-head">
      <h2>${escapeHtml(schema.title)}</h2>
      <div class="save-bar"><span class="dirty" hidden>Unsaved changes</span><button type="button" class="save"><i class="fas fa-check"></i> Save</button></div>
    </div>
    <div class="fields-grid"></div>`;

  const isProjects = schema.type === "projects";
  const draft = isProjects ? clone(state.projects) : clone(state.content[key] ?? (schema.type === "list" ? [] : {}));
  const dirtyLabel = $(".dirty", card);
  const markDirty = () => { state.dirty.add(key); dirtyLabel.hidden = false; };
  const body = $(".fields-grid", card);

  if (schema.type === "object") renderFields(schema.fields, draft, body, markDirty);
  else body.append(listElement(schema, draft, markDirty));

  const saveButton = $(".save", card);
  saveButton.addEventListener("click", async () => {
    saveButton.disabled = true;
    try {
      if (isProjects) await saveProjects(draft);
      else state.content[key] = (await request(`/content/${key}`, { method: "PUT", body: JSON.stringify(draft) })).value;
      state.dirty.delete(key);
      dirtyLabel.hidden = true;
      toast(`${schema.title} saved.`);
      // New projects now have server ids; rebuild from the saved list so a second save doesn't create duplicates
      if (isProjects) card.replaceWith(editorCard(key));
    } catch (error) {
      toast(error.message, true);
    } finally {
      saveButton.disabled = false;
    }
  });
  return card;
}

async function saveProjects(draft) {
  const missingTitle = draft.findIndex((project) => !project.title?.trim());
  if (missingTitle >= 0) throw new Error(`Project ${missingTitle + 1} needs a title.`);
  const keep = new Set(draft.map((project) => project.id));
  for (const project of state.projects) if (!keep.has(project.id)) await request(`/projects/${project.id}`, { method: "DELETE" });
  const existing = new Set(state.projects.map((project) => project.id));
  for (const [index, project] of draft.entries()) {
    const payload = { title: project.title, description: project.description || "", image: project.image || "", githubUrl: project.githubUrl || "", liveUrl: project.liveUrl || "", technologies: project.technologies || [], sortOrder: index };
    if (existing.has(project.id)) await request(`/projects/${project.id}`, { method: "PATCH", body: JSON.stringify(payload) });
    else await request("/projects", { method: "POST", body: JSON.stringify(payload) });
  }
  state.projects = await request("/projects");
}

// ---------- Pages ----------

function inquiryRows(inquiries) {
  if (!inquiries.length) return `<p class="empty">No messages yet.</p>`;
  return inquiries.map((item) => `
    <div class="row">
      <div>
        <strong>${escapeHtml(item.subject)}</strong> <span class="${item.status === "new" ? "status-new" : "meta"}">· ${escapeHtml(item.status)}</span>
        <div class="meta">${escapeHtml(item.name)} &lt;${escapeHtml(item.email)}&gt; · ${new Date(item.createdAt).toLocaleString()}</div>
        <p class="message-text">${escapeHtml(item.message)}</p>
      </div>
      <div class="row-actions">
        <a class="link-btn" href="mailto:${escapeHtml(item.email)}?subject=${encodeURIComponent("Re: " + item.subject)}"><i class="fas fa-reply"></i> Reply</a>
        <select data-status="${item.id}" aria-label="Status">${["new", "read", "replied"].map((status) => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}</select>
        <button type="button" class="icon danger" data-delete-inquiry="${item.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join("");
}

function overviewPage(page) {
  const newCount = state.inquiries.filter((item) => item.status === "new").length;
  page.innerHTML = `
    <section class="stats">
      <div><strong>${state.inquiries.length}</strong><span>Total inquiries</span></div>
      <div><strong>${newCount}</strong><span>New inquiries</span></div>
      <div><strong>${state.projects.length}</strong><span>Projects</span></div>
    </section>
    <section class="card"><h2>Latest messages</h2>${inquiryRows(state.inquiries.slice(0, 5))}</section>`;
}

function inquiriesPage(page) {
  page.innerHTML = `<section class="card">${inquiryRows(state.inquiries)}</section>`;
}

async function mediaPage(page) {
  page.innerHTML = `
    <section class="card">
      <div class="editor-head"><h2>Upload images</h2><button type="button" id="media-upload"><i class="fas fa-upload"></i> Upload</button><input type="file" id="media-file" accept="image/*" multiple hidden></div>
      <p class="hint">JPEG, PNG, WebP, GIF or SVG up to 5 MB. Copy an image's path into any image field.</p>
      <div class="media-grid" id="media-grid"><p class="empty">Loading…</p></div>
    </section>`;
  const grid = $("#media-grid", page);
  const refresh = async () => {
    const media = await request("/media");
    grid.innerHTML = media.map((item) => `
      <figure>
        <img src="${escapeHtml(mediaUrl(`media/${item.id}`))}" alt="${escapeHtml(item.filename)}" loading="lazy">
        <figcaption>
          <span title="${escapeHtml(item.filename)}">${escapeHtml(item.filename)}</span>
          <span class="actions">
            <button type="button" class="icon" data-copy="media/${item.id}" title="Copy path"><i class="fas fa-copy"></i></button>
            <button type="button" class="icon danger" data-delete-media="${item.id}" title="Delete"><i class="fas fa-trash"></i></button>
          </span>
        </figcaption>
      </figure>`).join("") || `<p class="empty">No images uploaded yet.</p>`;
  };
  $("#media-upload", page).addEventListener("click", () => $("#media-file", page).click());
  $("#media-file", page).addEventListener("change", async (event) => {
    const files = [...event.target.files];
    try { for (const file of files) await uploadImage(file); toast(`${files.length} image(s) uploaded.`); }
    catch (error) { toast(error.message, true); }
    event.target.value = "";
    refresh();
  });
  grid.addEventListener("click", async (event) => {
    const copy = event.target.closest("[data-copy]");
    const remove = event.target.closest("[data-delete-media]");
    if (copy) { await navigator.clipboard.writeText(copy.dataset.copy).catch(() => {}); toast(`Copied ${copy.dataset.copy}`); }
    if (remove && confirm("Delete this image? Pages using it will show a broken image.")) { await request(`/media/${remove.dataset.deleteMedia}`, { method: "DELETE" }); refresh(); }
  });
  refresh().catch((error) => toast(error.message, true));
}

function accountPage(page) {
  page.innerHTML = `
    <form class="card" id="password-form">
      <h2>Change password</h2>
      <label>Current password<input type="password" name="currentPassword" required autocomplete="current-password"></label>
      <label>New password<input type="password" name="newPassword" required minlength="8" autocomplete="new-password"></label>
      <label>Confirm new password<input type="password" name="confirm" required minlength="8" autocomplete="new-password"></label>
      <button><i class="fas fa-key"></i> Update password</button>
    </form>`;
  $("#password-form", page).addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.newPassword.value !== form.confirm.value) return toast("The new passwords don't match.", true);
    try {
      await request("/auth/password", { method: "POST", body: JSON.stringify({ currentPassword: form.currentPassword.value, newPassword: form.newPassword.value }) });
      form.reset();
      toast("Password updated.");
    } catch (error) { toast(error.message, true); }
  });
}

function renderNav() {
  const newCount = state.inquiries.filter((item) => item.status === "new").length;
  $("#nav").innerHTML = PAGES.map((page) => `
    <button type="button" data-page="${page.id}" class="${page.id === state.page ? "active" : ""}">
      <i class="fas ${page.icon}"></i> ${page.label}${page.id === "inquiries" && newCount ? `<span class="badge">${newCount}</span>` : ""}
    </button>`).join("");
}

function renderPage() {
  const page = PAGES.find((item) => item.id === state.page) || PAGES[0];
  $("#page-title").textContent = page.label;
  $("#page-hint").textContent = page.hint || "";
  const container = $("#page");
  container.innerHTML = "";
  if (page.editors) page.editors.forEach((key) => container.append(editorCard(key)));
  else if (page.id === "overview") overviewPage(container);
  else if (page.id === "inquiries") inquiriesPage(container);
  else if (page.id === "media") mediaPage(container);
  else if (page.id === "account") accountPage(container);
  renderNav();
}

function goTo(pageId) {
  if (state.dirty.size && !confirm("You have unsaved changes. Leave this page and discard them?")) return;
  state.dirty.clear();
  state.page = pageId;
  history.replaceState(null, "", `#${pageId}`);
  renderPage();
  window.scrollTo(0, 0);
}

// ---------- Wiring ----------

function logout() { localStorage.removeItem("portfolio-admin-token"); token = null; location.reload(); }

async function showDashboard() {
  $("#login-view").hidden = true;
  $("#dashboard-view").hidden = false;
  state.page = PAGES.some((page) => page.id === location.hash.slice(1)) ? location.hash.slice(1) : "overview";
  try { await loadData(); renderPage(); }
  catch (error) { toast(error.message, true); }
}

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = $(".message", form);
  const submit = $(".login-submit", form);
  if (!form.email.value.trim() || !form.password.value) return (message.textContent = "Enter your email and password.");
  message.textContent = "";
  submit.disabled = true;
  $("span", submit).textContent = "Signing in…";
  try {
    const result = await request("/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    token = result.accessToken;
    localStorage.setItem("portfolio-admin-token", token);
    showDashboard();
  } catch (error) {
    message.textContent = error.message === "Failed to fetch" ? "Can't reach the server. Is the API running?" : error.message;
  } finally {
    submit.disabled = false;
    $("span", submit).textContent = "Sign in";
  }
});

$(".toggle-password").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const input = $("#login-form").password;
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  $("i", button).className = `fas ${show ? "fa-eye-slash" : "fa-eye"}`;
});

$("#nav").addEventListener("click", (event) => { const button = event.target.closest("[data-page]"); if (button) goTo(button.dataset.page); });
$("#logout").addEventListener("click", () => { if (!state.dirty.size || confirm("You have unsaved changes. Log out anyway?")) { state.dirty.clear(); logout(); } });

document.addEventListener("change", async (event) => {
  const id = event.target.dataset.status;
  if (!id) return;
  try {
    const updated = await request(`/inquiries/${id}`, { method: "PATCH", body: JSON.stringify({ status: event.target.value }) });
    state.inquiries = state.inquiries.map((item) => (item.id === id ? updated : item));
    renderPage();
  } catch (error) { toast(error.message, true); }
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-inquiry]");
  if (!button || !confirm("Delete this message?")) return;
  try {
    await request(`/inquiries/${button.dataset.deleteInquiry}`, { method: "DELETE" });
    state.inquiries = state.inquiries.filter((item) => item.id !== button.dataset.deleteInquiry);
    renderPage();
  } catch (error) { toast(error.message, true); }
});

window.addEventListener("beforeunload", (event) => { if (state.dirty.size) event.preventDefault(); });

if (token) showDashboard();
