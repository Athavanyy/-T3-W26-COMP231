const API_BASE = "/api";

const state = {
  token: localStorage.getItem("ccms_token") || "",
  user: null,
  view: "home",
  message: "",
  messageType: "success",
  selectedEvent: null,
  selectedAnnouncement: null,
};

const app = document.getElementById("app");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const d = new Date(text);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  }
  return text;
}

function dateOnly(value) {
  if (!value) return "";
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function timeOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

function statusBadge(status) {
  const s = String(status || "").toUpperCase();
  let cls = "gray";
  if (["ACTIVE", "APPROVED", "PUBLISHED", "REGISTERED"].includes(s))
    cls = "green";
  if (["PENDING", "DRAFT"].includes(s)) cls = "orange";
  if (["INACTIVE", "DISABLED", "REJECTED", "CANCELLED", "REMOVED"].includes(s))
    cls = "red";
  return `<span class="badge ${cls}">${escapeHtml(s || "UNKNOWN")}</span>`;
}

function setMessage(text, type = "success") {
  state.message = text || "";
  state.messageType = type;
  render();
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let body = null;
  try {
    body = await response.json();
  } catch (_) {
    body = null;
  }
  if (!response.ok) {
    const message = body?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

function formData(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  Object.keys(data).forEach((key) => {
    if (data[key] === "") delete data[key];
  });
  return data;
}

function queryString(data) {
  const params = new URLSearchParams();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function roleLabel(role) {
  return String(role || "").replaceAll("_", " ");
}

async function login(email, password) {
  try {
    const result = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    state.token = result.token;
    state.user = result.user;
    localStorage.setItem("ccms_token", state.token);
    state.view = defaultViewForRole(state.user.role);
    setMessage(
      `Logged in as ${state.user.full_name || state.user.email}`,
      "success",
    );
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function registerUser(data) {
  try {
    await api("/auth/register", { method: "POST", body: JSON.stringify(data) });
    await login(data.email, data.password);
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function logout() {
  localStorage.removeItem("ccms_token");
  state.token = "";
  state.user = null;
  state.view = "home";
  state.message = "";
  render();
}

async function loadMe() {
  if (!state.token) return render();
  try {
    const result = await api("/auth/me");
    state.user = result.user;
    state.view = defaultViewForRole(state.user.role);
    render();
  } catch (error) {
    localStorage.removeItem("ccms_token");
    state.token = "";
    state.user = null;
    state.message = "Saved login expired. Please login again.";
    state.messageType = "error";
    render();
  }
}

function defaultViewForRole(role) {
  const r = String(role || "").toUpperCase();
  if (r === "ADMIN") return "admin-users";
  if (r === "CLUB_EXECUTIVE") return "exec-club";
  return "student-clubs";
}

function render() {
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <h1>Campus Club Management System</h1>
        </div>
        <div class="user-pill">
          ${
            state.user
              ? `
            <span class="badge">${escapeHtml(roleLabel(state.user.role))}</span>
            <strong>${escapeHtml(state.user.full_name || state.user.email)}</strong>
            <button class="secondary small" data-action="logout">Logout</button>
          `
              : `<span class="badge gray">Not logged in</span>`
          }
        </div>
      </header>
      <main class="page">
        ${state.message ? `<div class="notice ${state.messageType === "error" ? "error" : "success"}">${escapeHtml(state.message)}</div>` : ""}
        ${state.user ? renderDashboard() : renderLogin()}
      </main>
    </div>
    <div id="modal-root"></div>
  `;
  bindGlobalEvents();
  if (state.user) bindDashboardEvents();
  else bindLoginEvents();
}

function renderLogin() {
  return `
    <div class="login-wrap">
      <section class="card">
        <h2>Login</h2>
        <form id="login-form">
          <div class="field">
            <label>Email</label>
            <input name="email" type="email" value="student@college.ca" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input name="password" type="password" value="password123" required />
          </div>
          <div class="form-actions">
            <button type="submit">Login</button>
          </div>
        </form>
        <div class="quick-logins">
          <button class="secondary" data-quick-login="student@college.ca">Student demo login</button>
          <button class="secondary" data-quick-login="executive@college.ca">Club Executive demo login</button>
          <button class="secondary" data-quick-login="admin@college.ca">Admin demo login</button>
        </div>
      </section>
      <section class="card">
        <h2>Register New User</h2>
        <form id="register-form" class="form-grid">
          <div class="field full">
            <label>Full Name</label>
            <input name="fullName" required />
          </div>
          <div class="field full">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input name="password" type="password" value="password123" required />
          </div>
          <div class="field">
            <label>Role</label>
            <select name="role">
              <option value="STUDENT">STUDENT</option>
              <option value="CLUB_EXECUTIVE">CLUB_EXECUTIVE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div class="form-actions full">
            <button type="submit">Register & Login</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderDashboard() {
  return `
    ${renderTabs()}
    <section id="view-root" class="card">
      ${renderCurrentViewShell()}
    </section>
  `;
}

function tabButton(id, label) {
  return `<button class="tab ${state.view === id ? "active" : ""}" data-view="${id}">${label}</button>`;
}

function renderTabs() {
  const role = String(state.user.role || "").toUpperCase();
  let tabs = "";
  if (role === "STUDENT") {
    tabs = [
      tabButton("student-clubs", "Browse Clubs"),
      tabButton("student-events", "Browse Events"),
      tabButton("student-announcements", "Announcements"),
    ].join("");
  } else if (role === "CLUB_EXECUTIVE") {
    tabs = [
      tabButton("exec-club", "My Club"),
      tabButton("exec-members", "Members & Requests"),
      tabButton("exec-events", "Events"),
      tabButton("exec-announcements", "Announcements"),
    ].join("");
  } else if (role === "ADMIN") {
    tabs = [
      tabButton("admin-users", "Users"),
      tabButton("admin-clubs", "Clubs"),
      tabButton("admin-announcements", "Announcements"),
      tabButton("admin-activities", "Activities & Reports"),
      tabButton("admin-all-data", "All Database Data"),
    ].join("");
  }
  return `<nav class="tabs">${tabs}</nav>`;
}

function renderCurrentViewShell() {
  const titles = {
    "student-clubs": "Student: Browse/Search Clubs",
    "student-events": "Student: Browse/Register Events",
    "student-announcements": "Student: Announcements",
    "exec-club": "Club Executive: Club Profile",
    "exec-members": "Club Executive: Members & Join Requests",
    "exec-events": "Club Executive: Event Management",
    "exec-announcements": "Club Executive: Announcement Management",
    "admin-users": "Admin: User Management",
    "admin-clubs": "Admin: Club Management",
    "admin-announcements": "Admin: Announcement Moderation",
    "admin-activities": "Admin: Activities & Reports",
    "admin-all-data": "Admin: All Database Tables",
  };
  return `
    <div class="section-head">
      <div>
        <h2>${escapeHtml(titles[state.view] || "Dashboard")}</h2>
      </div>
      <button class="secondary" data-action="refresh-view">Refresh</button>
    </div>
    <div id="dynamic-view"><div class="empty">Loading...</div></div>
  `;
}

function bindGlobalEvents() {
  document
    .querySelectorAll('[data-action="logout"]')
    .forEach((btn) => btn.addEventListener("click", logout));
}

function bindLoginEvents() {
  document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = formData(e.currentTarget);
    login(data.email, data.password);
  });
  document.getElementById("register-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    registerUser(formData(e.currentTarget));
  });
  document.querySelectorAll("[data-quick-login]").forEach((btn) => {
    btn.addEventListener("click", () =>
      login(btn.dataset.quickLogin, "password123"),
    );
  });
}

function bindDashboardEvents() {
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      state.message = "";
      render();
    });
  });
  document
    .querySelector('[data-action="refresh-view"]')
    ?.addEventListener("click", loadCurrentView);
  loadCurrentView();
}

async function loadCurrentView() {
  const root = document.getElementById("dynamic-view");
  if (!root) return;
  root.innerHTML = '<div class="empty">Loading live data...</div>';
  try {
    if (state.view === "student-clubs") return await loadStudentClubs(root);
    if (state.view === "student-events") return await loadStudentEvents(root);
    if (state.view === "student-announcements")
      return await loadStudentAnnouncements(root);
    if (state.view === "exec-club") return await loadExecutiveClub(root);
    if (state.view === "exec-members") return await loadExecutiveMembers(root);
    if (state.view === "exec-events") return await loadExecutiveEvents(root);
    if (state.view === "exec-announcements")
      return await loadExecutiveAnnouncements(root);
    if (state.view === "admin-users") return await loadAdminUsers(root);
    if (state.view === "admin-clubs") return await loadAdminClubs(root);
    if (state.view === "admin-announcements")
      return await loadAdminAnnouncements(root);
    if (state.view === "admin-activities")
      return await loadAdminActivities(root);
    if (state.view === "admin-all-data") return await loadAdminAllData(root);
  } catch (error) {
    root.innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`;
  }
}

function renderCardList(items, renderItem, emptyMessage = "No records found.") {
  if (!items || items.length === 0)
    return `<div class="empty">${escapeHtml(emptyMessage)}</div>`;
  return `<div class="grid">${items.map(renderItem).join("")}</div>`;
}

function showModal(title, data) {
  const modalRoot = document.getElementById("modal-root");

  function formatValue(key, value) {
    if (value === null || value === undefined || value === "") return "—";

    if (typeof value === "object") {
      return `<pre style="margin:0;font-size:0.8rem;background:#f8f9fa;padding:4px 8px;border-radius:4px;max-height:150px;overflow:auto;">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
    }

    if (
      key === "created_at" ||
      key === "updated_at" ||
      key === "joined_at" ||
      key === "request_date" ||
      key === "registered_at" ||
      key === "published_at" ||
      key === "left_at" ||
      key === "assigned_at"
    ) {
      return new Date(value).toLocaleString();
    }
    if (key === "event_date") return new Date(value).toLocaleDateString();
    if (key === "event_time") return String(value).slice(0, 5);

    if (
      key === "status" ||
      key === "request_status" ||
      key === "registration_status"
    ) {
      return statusBadge(value);
    }

    if (key === "role") {
      const cls =
        value === "ADMIN"
          ? "green"
          : value === "CLUB_EXECUTIVE"
            ? "orange"
            : "gray";
      return `<span class="badge ${cls}">${escapeHtml(value)}</span>`;
    }

    return escapeHtml(String(value));
  }

  // Helper: Render data
  function renderDetails(data) {
    // If data is an array, render as table
    if (Array.isArray(data)) {
      if (data.length === 0)
        return `<p class="empty">No registrations found.</p>`;
      return renderTable(data, "Registrations");
    }

    // If data is an object with a 'data' property that's an array (common API pattern)
    if (data && data.data && Array.isArray(data.data)) {
      if (data.data.length === 0)
        return `<p class="empty">No registrations found.</p>`;
      return renderTable(data.data, "Registrations");
    }

    // If data is a plain object, render as detail grid
    if (data && typeof data === "object") {
      const sensitive = ["password", "password_hash", "token", "ipAddress"];
      const entries = Object.entries(data)
        .filter(([key]) => !sensitive.includes(key))
        .filter(([key]) => !key.startsWith("_"));

      if (entries.length === 0)
        return `<p class="empty">No data to display</p>`;

      return `<div class="detail-grid">
        ${entries
          .map(([key, value]) => {
            const label = key
              .replace(/_/g, " ")
              .replace(/([A-Z])/g, " $1")
              .trim()
              .toUpperCase();
            return `
            <div class="detail-row">
              <span class="detail-label">${escapeHtml(label)}</span>
              <span class="detail-value">${formatValue(key, value)}</span>
            </div>
          `;
          })
          .join("")}
      </div>`;
    }

    // Fallback
    return `<p class="empty">No details available</p>`;
  }

  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close-modal="1">
      <div class="modal detail-modal">
        <div class="modal-header">
          <h2>${escapeHtml(title)}</h2>
          <button class="secondary small" data-close-modal="1">✕ Close</button>
        </div>
        <div class="modal-body">
          ${renderDetails(data)}
        </div>
      </div>
    </div>
  `;

  // Close button
  modalRoot.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.dataset.closeModal) modalRoot.innerHTML = "";
    });
  });

  // Close on backdrop click
  modalRoot.querySelector(".modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) modalRoot.innerHTML = "";
  });
}

function renderTable(rows, title = "") {
  if (rows && rows.error)
    return `<div class="notice error">${escapeHtml(rows.error)}</div>`;
  if (!Array.isArray(rows) || rows.length === 0)
    return `<div class="empty">No rows${title ? ` in ${escapeHtml(title)}` : ""}.</div>`;
  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).forEach((key) => set.add(key));
      return set;
    }, new Set()),
  );
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${keys.map((key) => `<th>${escapeHtml(key)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${keys.map((key) => `<td>${escapeHtml(fmt(row?.[key]))}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function loadStudentClubs(root, filters = {}) {
  let categories = [];
  try {
    categories = (await api("/student/clubs/categories")).data || [];
  } catch (_) {
    categories = [];
  }
  const clubs = (await api(`/student/clubs${queryString(filters)}`)).data || [];
  root.innerHTML = `
    <form id="student-club-filter" class="form-grid three">
      <div class="field"><label>Keyword</label><input name="keyword" value="${escapeHtml(filters.keyword || "")}" placeholder="coding, music..." /></div>
      <div class="field"><label>Category</label><select name="category"><option value="">All</option>${categories.map((c) => `<option value="${escapeHtml(c)}" ${filters.category === c ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}</select></div>
      <div class="field"><label>&nbsp;</label><button type="submit">Search Clubs</button></div>
    </form>
    ${renderCardList(
      clubs,
      (club) => `
      <article class="item">
        <h3>${escapeHtml(club.club_name)}</h3>
        <div class="meta">${statusBadge(club.status)} <span class="badge gray">${escapeHtml(club.category || "No Category")}</span></div>
        <p>${escapeHtml(club.description)}</p>
        <p class="help"><strong>Meeting:</strong> ${escapeHtml(club.meeting_details || "Not listed")}</p>
        <div class="actions">
          <button class="small" data-student-club-details="${club.club_id}">Details</button>
          <button class="small success" data-join-club="${club.club_id}">Submit Join Request</button>
        </div>
      </article>
    `,
      "No clubs found.",
    )}
  `;
  document
    .getElementById("student-club-filter")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      loadStudentClubs(root, formData(e.currentTarget));
    });
  root.querySelectorAll("[data-student-club-details]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        showModal(
          "Club Details",
          (await api(`/student/clubs/${btn.dataset.studentClubDetails}`)).data,
        );
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
  root.querySelectorAll("[data-join-club]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        const res = await api("/student/membership/join", {
          method: "POST",
          body: JSON.stringify({ clubId: Number(btn.dataset.joinClub) }),
        });
        setMessage(res.message || "Join request submitted.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
}

async function loadStudentEvents(root, filters = {}) {
  const events =
    (await api(`/student/events${queryString(filters)}`)).data || [];
  root.innerHTML = `
    <form id="student-event-filter" class="form-grid three">
      <div class="field"><label>Keyword</label><input name="keyword" value="${escapeHtml(filters.keyword || "")}" /></div>
      <div class="field"><label>Club ID</label><input name="clubId" type="number" value="${escapeHtml(filters.clubId || "")}" /></div>
      <div class="field"><label>Category</label><input name="category" value="${escapeHtml(filters.category || "")}" /></div>
      <div class="field"><label>Date From</label><input name="dateFrom" type="date" value="${escapeHtml(filters.dateFrom || "")}" /></div>
      <div class="field"><label>Date To</label><input name="dateTo" type="date" value="${escapeHtml(filters.dateTo || "")}" /></div>
      <div class="field"><label>&nbsp;</label><button type="submit">Search Events</button></div>
    </form>
    ${renderCardList(
      events,
      (event) => `
      <article class="item">
        <h3>${escapeHtml(event.title)}</h3>
        <div class="meta">${statusBadge(event.status)} <span class="badge gray">${escapeHtml(event.club_name || `Club #${event.club_id}`)}</span></div>
        <p>${escapeHtml(event.description)}</p>
        <p class="help"><strong>Date:</strong> ${escapeHtml(dateOnly(event.event_date))} &nbsp; <strong>Time:</strong> ${escapeHtml(timeOnly(event.event_time))} &nbsp; <strong>Location:</strong> ${escapeHtml(event.location)}</p>
        <div class="actions">
          <button class="small" data-student-event-details="${event.event_id}">Details</button>
          <button class="small success" data-register-event="${event.event_id}">Register</button>
        </div>
      </article>
    `,
      "No events found.",
    )}
  `;
  document
    .getElementById("student-event-filter")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      loadStudentEvents(root, formData(e.currentTarget));
    });
  root.querySelectorAll("[data-student-event-details]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        showModal(
          "Event Details",
          (await api(`/student/events/${btn.dataset.studentEventDetails}`))
            .data,
        );
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
  root.querySelectorAll("[data-register-event]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        const res = await api("/student/events/register", {
          method: "POST",
          body: JSON.stringify({ eventId: Number(btn.dataset.registerEvent) }),
        });
        setMessage(res.message || "Registered successfully.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
}

async function loadStudentAnnouncements(root) {
  const announcements = (await api("/student/announcements")).data || [];
  root.innerHTML = `
    ${renderCardList(
      announcements,
      (ann) => `
      <article class="item">
        <h3>${escapeHtml(ann.title)}</h3>
        <div class="meta">${statusBadge(ann.status)} <span class="badge gray">${escapeHtml(ann.club_name || `Club #${ann.club_id}`)}</span></div>
        <p>${escapeHtml(ann.message)}</p>
        <p class="help">Created: ${escapeHtml(fmt(ann.created_at))}</p>
        <div class="actions"><button class="small" data-ann-details="${ann.announcement_id}">Details</button></div>
      </article>
    `,
      "No announcements found.",
    )}
  `;
  root.querySelectorAll("[data-ann-details]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        showModal(
          "Announcement Details",
          (await api(`/student/announcements/${btn.dataset.annDetails}`)).data,
        );
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
}

async function loadExecutiveClub(root) {
  const response = await api("/executive/club");
  const clubs = Array.isArray(response.data) ? response.data : [response.data];

  root.innerHTML = `
    <p class="help">Showing all clubs assigned to this executive.</p>

    ${clubs
      .map(
        (club) => `
      <article class="item">
        <h3>${escapeHtml(club.club_name)}</h3>
        <div class="meta">
          ${statusBadge(club.status)}
          <span class="badge gray">${escapeHtml(club.category || "")}</span>
          <span class="badge gray">Club ID: ${escapeHtml(club.club_id)}</span>
        </div>
        <p>${escapeHtml(club.description || "")}</p>
        <p class="help"><strong>Meeting:</strong> ${escapeHtml(club.meeting_details || "Not listed")}</p>

        <details>
          <summary>Update this club</summary>
          <form class="club-update-form form-grid" data-club-id="${escapeHtml(club.club_id)}">
            <div class="field">
              <label>Name</label>
              <input name="name" value="${escapeHtml(club.club_name || "")}" />
            </div>

            <div class="field">
              <label>Category</label>
              <input name="category" value="${escapeHtml(club.category || "")}" />
            </div>

            <div class="field full">
              <label>Description</label>
              <textarea name="description">${escapeHtml(club.description || "")}</textarea>
            </div>

            <div class="field full">
              <label>Meeting Details</label>
              <input name="meeting_details" value="${escapeHtml(club.meeting_details || "")}" />
            </div>

            <div class="form-actions full">
              <button type="submit">Save This Club</button>
            </div>
          </form>
        </details>
      </article>
    `,
      )
      .join("")}
  `;

  root.querySelectorAll(".club-update-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const clubId = e.currentTarget.dataset.clubId;

      try {
        await api(`/executive/club/${clubId}`, {
          method: "PUT",
          body: JSON.stringify(formData(e.currentTarget)),
        });

        setMessage("Club profile updated.", "success");
        await loadExecutiveClub(root);
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  });
}

async function loadExecutiveMembers(root) {
  const [membersRes, requestsRes] = await Promise.all([
    api("/executive/members"),
    api("/executive/members/requests"),
  ]);
  const members = membersRes.data || [];
  const requests = requestsRes.data || [];
  root.innerHTML = `
    <div class="grid">
      <section class="item">
        <h3>Active Members</h3>
        ${members.length ? renderTable(members) : '<div class="empty">No active members.</div>'}
      </section>
      <section class="item">
        <h3>Pending Join Requests</h3>
        ${
          requests.length
            ? `
          <div class="table-wrap"><table class="compact-table">
            <thead><tr><th>ID</th><th>Student</th><th>Email</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>${requests
              .map(
                (r) => `
              <tr>
                <td>${escapeHtml(r.request_id)}</td>
                <td>${escapeHtml(r.full_name)}</td>
                <td>${escapeHtml(r.email)}</td>
                <td>${escapeHtml(fmt(r.request_date))}</td>
                <td class="inline-controls">
                  <button class="small success" data-approve-request="${r.request_id}">Approve</button>
                  <button class="small danger" data-reject-request="${r.request_id}">Reject</button>
                </td>
              </tr>`,
              )
              .join("")}
            </tbody>
          </table></div>`
            : '<div class="empty">No pending requests.</div>'
        }
      </section>
    </div>
    <div class="footer-note">To remove a member, enter the Membership ID from the table.</div>
    <form id="remove-member-form" class="form-grid three">
      <div class="field"><label>Membership ID</label><input name="membershipId" type="number" required /></div>
      <div class="field"><label>&nbsp;</label><button class="danger" type="submit">Remove Member</button></div>
    </form>
  `;
  root
    .querySelectorAll("[data-approve-request]")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        handleRequestAction("approve", btn.dataset.approveRequest),
      ),
    );
  root
    .querySelectorAll("[data-reject-request]")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        handleRequestAction("reject", btn.dataset.rejectRequest),
      ),
    );
  document
    .getElementById("remove-member-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api("/executive/members/remove", {
          method: "DELETE",
          body: JSON.stringify({
            membershipId: Number(formData(e.currentTarget).membershipId),
          }),
        });
        setMessage("Member removed.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
}

async function handleRequestAction(action, requestId) {
  try {
    await api(`/executive/members/${action}`, {
      method: "PUT",
      body: JSON.stringify({ requestId: Number(requestId) }),
    });
    setMessage(`Join request ${action}d.`, "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

function eventFormHtml(prefix, event = {}) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  return `
    <form id="${prefix}-event-form" class="form-grid">
      <div class="field"><label>Title</label><input name="title" value="${escapeHtml(event.title || "")}" required /></div>
      <div class="field"><label>Location</label><input name="location" value="${escapeHtml(event.location || "")}" required /></div>
      <div class="field"><label>Date</label><input name="eventDate" type="date" value="${escapeHtml(dateOnly(event.event_date) || tomorrow)}" required /></div>
      <div class="field"><label>Time</label><input name="eventTime" type="time" value="${escapeHtml(timeOnly(event.event_time) || "12:00")}" required /></div>
      <div class="field full"><label>Description</label><textarea name="description" required>${escapeHtml(event.description || "")}</textarea></div>
      <div class="form-actions full"><button type="submit">${prefix === "create" ? "Create Draft Event" : "Update Event"}</button></div>
    </form>
  `;
}

async function loadExecutiveEvents(root) {
  const events = (await api("/executive/events")).data || [];
  const selected = state.selectedEvent;
  root.innerHTML = `
    <div class="grid">
      <section class="item">
        <h3>Create Event</h3>
        ${eventFormHtml("create")}
      </section>
      <section class="item">
        <h3>Edit Selected Event</h3>
        ${selected ? `<p class="help">Editing Event #${escapeHtml(selected.event_id)}: ${escapeHtml(selected.title)}</p>${eventFormHtml("edit", selected)}` : '<div class="empty">Click “Edit” on an event below.</div>'}
      </section>
    </div>
    <h3>My Club Events</h3>
    ${renderCardList(
      events,
      (event) => `
      <article class="item">
        <h3>${escapeHtml(event.title)}</h3>
        <div class="meta">${statusBadge(event.status)} <span class="badge gray">ID: ${escapeHtml(event.event_id)}</span></div>
        <p>${escapeHtml(event.description)}</p>
        <p class="help"><strong>Date:</strong> ${escapeHtml(dateOnly(event.event_date))} ${escapeHtml(timeOnly(event.event_time))} | <strong>Location:</strong> ${escapeHtml(event.location)}</p>
        <div class="actions">
          <button class="small secondary" data-edit-event="${event.event_id}">Edit</button>
          <button class="small success" data-publish-event="${event.event_id}">Publish</button>
          <button class="small danger" data-delete-event="${event.event_id}">Cancel/Delete</button>
          <button class="small" data-event-regs="${event.event_id}">View Registrations</button>
        </div>
      </article>
    `,
      "No events created yet.",
    )}
    <section class="item">
      <h3>Event Registration Summary</h3>
      <button class="secondary small" data-load-registration-summary="1">Load Registration Summary</button>
      <div id="registration-summary" class="footer-note"></div>
    </section>
  `;
  document
    .getElementById("create-event-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api("/executive/events", {
          method: "POST",
          body: JSON.stringify(formData(e.currentTarget)),
        });
        state.selectedEvent = null;
        setMessage("Draft event created.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  document
    .getElementById("edit-event-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api(`/executive/events/${state.selectedEvent.event_id}`, {
          method: "PUT",
          body: JSON.stringify(formData(e.currentTarget)),
        });
        state.selectedEvent = null;
        setMessage("Event updated.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  root.querySelectorAll("[data-edit-event]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.selectedEvent = events.find(
        (event) => String(event.event_id) === String(btn.dataset.editEvent),
      );
      loadExecutiveEvents(root);
    }),
  );
  root.querySelectorAll("[data-publish-event]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api(`/executive/events/${btn.dataset.publishEvent}/publish`, {
          method: "PUT",
        });
        setMessage("Event published.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
  root.querySelectorAll("[data-delete-event]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api(`/executive/events/${btn.dataset.deleteEvent}`, {
          method: "DELETE",
        });
        setMessage("Event cancelled.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
  root.querySelectorAll("[data-event-regs]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        showModal(
          "Event Registrations",
          (
            await api(
              `/executive/events/${btn.dataset.eventRegs}/registrations`,
            )
          ).data,
        );
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
  root
    .querySelector("[data-load-registration-summary]")
    ?.addEventListener("click", async () => {
      try {
        const summary = (await api("/executive/registrations")).data || [];
        document.getElementById("registration-summary").innerHTML =
          renderTable(summary);
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
}

function announcementFormHtml(prefix, ann = {}) {
  return `
    <form id="${prefix}-announcement-form" class="form-grid">
      <div class="field full"><label>Title</label><input name="title" value="${escapeHtml(ann.title || "")}" required /></div>
      <div class="field full"><label>Message</label><textarea name="message" required>${escapeHtml(ann.message || "")}</textarea></div>
      <div class="form-actions full"><button type="submit">${prefix === "create" ? "Create Draft Announcement" : "Update Announcement"}</button></div>
    </form>
  `;
}

async function loadExecutiveAnnouncements(root) {
  const announcements = (await api("/executive/announcements")).data || [];
  const selected = state.selectedAnnouncement;
  root.innerHTML = `
    <div class="grid">
      <section class="item">
        <h3>Create Announcement</h3>
        ${announcementFormHtml("create")}
      </section>
      <section class="item">
        <h3>Edit Selected Announcement</h3>
        ${selected ? `<p class="help">Editing Announcement #${escapeHtml(selected.announcement_id)}</p>${announcementFormHtml("edit", selected)}` : '<div class="empty">Click “Edit” on an announcement below.</div>'}
      </section>
    </div>
    <h3>My Announcements</h3>
    ${renderCardList(
      announcements,
      (ann) => `
      <article class="item">
        <h3>${escapeHtml(ann.title)}</h3>
        <div class="meta">${statusBadge(ann.status)} <span class="badge gray">ID: ${escapeHtml(ann.announcement_id)}</span></div>
        <p>${escapeHtml(ann.message)}</p>
        <div class="actions">
          <button class="small secondary" data-edit-ann="${ann.announcement_id}">Edit</button>
          <button class="small success" data-publish-ann="${ann.announcement_id}">Publish</button>
        </div>
      </article>
    `,
      "No announcements created yet.",
    )}
  `;
  document
    .getElementById("create-announcement-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api("/executive/announcements", {
          method: "POST",
          body: JSON.stringify(formData(e.currentTarget)),
        });
        setMessage("Draft announcement created.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  document
    .getElementById("edit-announcement-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api(
          `/executive/announcements/${state.selectedAnnouncement.announcement_id}`,
          { method: "PUT", body: JSON.stringify(formData(e.currentTarget)) },
        );
        state.selectedAnnouncement = null;
        setMessage("Announcement updated.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
  root.querySelectorAll("[data-edit-ann]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.selectedAnnouncement = announcements.find(
        (ann) => String(ann.announcement_id) === String(btn.dataset.editAnn),
      );
      loadExecutiveAnnouncements(root);
    }),
  );
  root.querySelectorAll("[data-publish-ann]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api(
          `/executive/announcements/${btn.dataset.publishAnn}/publish`,
          { method: "PUT" },
        );
        setMessage("Announcement published.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
}

async function loadAdminUsers(root, filters = {}) {
  const users = (await api(`/admin/users${queryString(filters)}`)).data || [];

  root.innerHTML = `
    <section class="item">
      <h3>Add User</h3>
      <p class="help">RA-04: Administrator can create a new user account and assign a role.</p>
      <form id="admin-add-user-form" class="form-grid">
        <div class="field">
          <label>Full Name</label>
          <input name="fullName" required placeholder="Example Student" />
        </div>
        <div class="field">
          <label>Email</label>
          <input name="email" type="email" required placeholder="example@college.ca" />
        </div>
        <div class="field">
          <label>Password</label>
          <input name="password" type="password" required minlength="8" value="password123" />
        </div>
        <div class="field">
          <label>Role</label>
          <select name="role" required>
            <option value="STUDENT">STUDENT</option>
            <option value="CLUB_EXECUTIVE">CLUB_EXECUTIVE</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div class="form-actions full">
          <button type="submit">Add User</button>
        </div>
      </form>
    </section>

    <section class="item">
      <h3>Filter Users</h3>
      <form id="admin-user-filter" class="form-grid three">
        <div class="field"><label>Keyword</label><input name="keyword" value="${escapeHtml(filters.keyword || "")}" /></div>
        <div class="field"><label>Role</label><select name="role"><option value="">All</option><option>STUDENT</option><option>CLUB_EXECUTIVE</option><option>ADMIN</option></select></div>
        <div class="field"><label>Status</label><select name="status"><option value="">All</option><option>ACTIVE</option><option>INACTIVE</option><option>DISABLED</option></select></div>
        <div class="field"><label>&nbsp;</label><button type="submit">Filter Users</button></div>
      </form>
    </section>

    ${
      users.length
        ? `
      <div class="table-wrap"><table>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>${users
          .map(
            (u) => `
          <tr>
            <td>${escapeHtml(u.user_id)}</td>
            <td>${escapeHtml(u.full_name)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${escapeHtml(u.role)}</td>
            <td>${statusBadge(u.status)}</td>
            <td>${escapeHtml(fmt(u.created_at))}</td>
            <td>
              <div class="inline-controls">
                <select data-role-for="${u.user_id}"><option>STUDENT</option><option>CLUB_EXECUTIVE</option><option>ADMIN</option></select>
                <button class="small" data-update-role="${u.user_id}">Update Role</button>
                <button class="small warning" data-disable-user="${u.user_id}">Disable</button>
                <button class="small success" data-enable-user="${u.user_id}">Enable</button>
              </div>
            </td>
          </tr>`,
          )
          .join("")}
        </tbody>
      </table></div>`
        : '<div class="empty">No users found.</div>'
    }
  `;

  const roleFilter = root.querySelector(
    '#admin-user-filter select[name="role"]',
  );
  if (roleFilter) roleFilter.value = filters.role || "";

  const statusFilter = root.querySelector(
    '#admin-user-filter select[name="status"]',
  );
  if (statusFilter) statusFilter.value = filters.status || "";

  users.forEach((u) => {
    const select = root.querySelector(`[data-role-for="${u.user_id}"]`);
    if (select) select.value = u.role;
  });

  document
    .getElementById("admin-add-user-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        await api("/admin/users", {
          method: "POST",
          body: JSON.stringify(formData(e.currentTarget)),
        });

        setMessage("User added successfully.", "success");
        await loadAdminUsers(root, filters);
      } catch (error) {
        setMessage(error.message, "error");
      }
    });

  document
    .getElementById("admin-user-filter")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      loadAdminUsers(root, formData(e.currentTarget));
    });

  root.querySelectorAll("[data-update-role]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const role = root.querySelector(
        `[data-role-for="${btn.dataset.updateRole}"]`,
      )?.value;

      try {
        await api(`/admin/users/${btn.dataset.updateRole}/role`, {
          method: "PUT",
          body: JSON.stringify({ role }),
        });

        setMessage("User role updated.", "success");
        await loadAdminUsers(root, filters);
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );

  root.querySelectorAll("[data-disable-user]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api(`/admin/users/${btn.dataset.disableUser}/disable`, {
          method: "PUT",
        });

        setMessage("User disabled.", "success");
        await loadAdminUsers(root, filters);
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );

  root.querySelectorAll("[data-enable-user]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api(`/admin/users/${btn.dataset.enableUser}/enable`, {
          method: "PUT",
        });

        setMessage("User enabled.", "success");
        await loadAdminUsers(root, filters);
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
}

async function loadAdminClubs(root, filters = {}) {
  const clubs = (await api(`/admin/clubs${queryString(filters)}`)).data || [];
  root.innerHTML = `
    <form id="admin-club-filter" class="form-grid three">
      <div class="field"><label>Keyword</label><input name="keyword" value="${escapeHtml(filters.keyword || "")}" /></div>
      <div class="field"><label>Status</label><select name="status"><option value="">All</option><option>PENDING</option><option>ACTIVE</option><option>INACTIVE</option></select></div>
      <div class="field"><label>&nbsp;</label><button type="submit">Filter Clubs</button></div>
    </form>
    ${
      clubs.length
        ? `
      <div class="table-wrap"><table>
        <thead><tr><th>ID</th><th>Club</th><th>Category</th><th>Status</th><th>Description</th><th>Meeting</th><th>Actions</th></tr></thead>
        <tbody>${clubs
          .map(
            (c) => `
          <tr>
            <td>${escapeHtml(c.club_id)}</td>
            <td>${escapeHtml(c.club_name)}</td>
            <td>${escapeHtml(c.category)}</td>
            <td>${statusBadge(c.status)}</td>
            <td>${escapeHtml(c.description)}</td>
            <td>${escapeHtml(c.meeting_details)}</td>
            <td>
              <div class="inline-controls">
                <button class="small success" data-approve-club="${c.club_id}">Approve</button>
                <select data-status-for-club="${c.club_id}"><option>PENDING</option><option>ACTIVE</option><option>INACTIVE</option></select>
                <button class="small" data-update-club-status="${c.club_id}">Update Status</button>
                <button class="small danger" data-remove-club="${c.club_id}">Remove</button>
              </div>
            </td>
          </tr>`,
          )
          .join("")}
        </tbody>
      </table></div>`
        : '<div class="empty">No clubs found.</div>'
    }
  `;
  clubs.forEach((c) => {
    const select = root.querySelector(`[data-status-for-club="${c.club_id}"]`);
    if (select) select.value = c.status;
  });
  document
    .getElementById("admin-club-filter")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      loadAdminClubs(root, formData(e.currentTarget));
    });
  root.querySelectorAll("[data-approve-club]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api(`/admin/clubs/${btn.dataset.approveClub}/approve`, {
          method: "PUT",
        });
        setMessage("Club approved.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
  root.querySelectorAll("[data-update-club-status]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const status = root.querySelector(
        `[data-status-for-club="${btn.dataset.updateClubStatus}"]`,
      )?.value;
      try {
        await api(`/admin/clubs/${btn.dataset.updateClubStatus}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        });
        setMessage("Club status updated.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
  root.querySelectorAll("[data-remove-club]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api(`/admin/clubs/${btn.dataset.removeClub}`, {
          method: "DELETE",
        });
        setMessage("Club removed/inactivated.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
}

async function loadAdminAnnouncements(root) {
  const announcements = (await api("/admin/announcements")).data || [];
  root.innerHTML = `
    ${
      announcements.length
        ? `
      <div class="table-wrap"><table>
        <thead><tr><th>ID</th><th>Club</th><th>Title</th><th>Message</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
        <tbody>${announcements
          .map(
            (a) => `
          <tr>
            <td>${escapeHtml(a.announcement_id)}</td>
            <td>${escapeHtml(a.club_name || a.club_id)}</td>
            <td>${escapeHtml(a.title)}</td>
            <td>${escapeHtml(a.message)}</td>
            <td>${statusBadge(a.status)}</td>
            <td>${escapeHtml(fmt(a.created_at))}</td>
            <td><button class="small danger" data-remove-announcement="${a.announcement_id}">Remove</button></td>
          </tr>`,
          )
          .join("")}
        </tbody>
      </table></div>`
        : '<div class="empty">No announcements found.</div>'
    }
  `;
  root.querySelectorAll("[data-remove-announcement]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await api(`/admin/announcements/${btn.dataset.removeAnnouncement}`, {
          method: "DELETE",
        });
        setMessage("Announcement removed.", "success");
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );
}

async function loadAdminActivities(root) {
  root.innerHTML = `
    <div class="grid">
      <section class="item">
        <h3>Activity Monitoring</h3>
        <p class="help">RA-12 to RA-15: Admin can monitor recent activities, review logs, and identify issue records.</p>

        <form id="activity-filter-form" class="form-grid three">
          <div class="field">
            <label>Action Type</label>
            <select name="actionType">
              <option value="">All</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="CLUB_CREATED">CLUB_CREATED</option>
              <option value="JOIN_REQUEST">JOIN_REQUEST</option>
              <option value="MEMBERSHIP">MEMBERSHIP</option>
              <option value="EVENT_CREATED">EVENT_CREATED</option>
              <option value="EVENT_REGISTRATION">EVENT_REGISTRATION</option>
              <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
            </select>
          </div>

          <div class="field">
            <label>Status</label>
            <input name="status" placeholder="ACTIVE / REJECTED / CANCELLED" />
          </div>

          <div class="field">
            <label>Keyword</label>
            <input name="keyword" placeholder="Name, email, club, event" />
          </div>

          <div class="field">
            <label>Date From</label>
            <input name="dateFrom" type="date" />
          </div>

          <div class="field">
            <label>Date To</label>
            <input name="dateTo" type="date" />
          </div>

          <div class="field">
            <label>Limit</label>
            <input name="limit" type="number" min="1" max="200" value="100" />
          </div>
        </form>

        <div class="actions">
          <button data-load-activities="recent">Recent Activities</button>
          <button data-load-activities="logs" class="secondary">Activity Logs</button>
          <button data-load-activities="failed" class="secondary">Issue / Failed Activities</button>
        </div>

        <div id="activities-output" class="footer-note"></div>
      </section>

      <section class="item">
        <h3>Generate Report</h3>
        <p class="help">RA-16: Admin can select a report type and generate a system summary.</p>

        <form id="report-form" class="form-grid">
          <div class="field full">
            <label>Report Type</label>
            <select name="reportType">
              <option value="club_activity">Club Activity</option>
              <option value="event_participation">Event Participation</option>
              <option value="user_engagement">User Engagement</option>
              <option value="membership_stats">Membership Stats</option>
            </select>
          </div>

          <div class="field">
            <label>Status Filter</label>
            <input name="status" placeholder="ACTIVE / PUBLISHED / STUDENT" />
          </div>

          <div class="field">
            <label>Role Filter</label>
            <select name="role">
              <option value="">Any Role</option>
              <option>STUDENT</option>
              <option>CLUB_EXECUTIVE</option>
              <option>ADMIN</option>
            </select>
          </div>

          <div class="field">
            <label>Date From</label>
            <input name="dateFrom" type="date" />
          </div>

          <div class="field">
            <label>Date To</label>
            <input name="dateTo" type="date" />
          </div>

          <div class="form-actions full">
            <button type="submit">Generate Report</button>
          </div>
        </form>

        <div id="report-output" class="footer-note"></div>
      </section>
    </div>
  `;

  root.querySelectorAll("[data-load-activities]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const type = btn.dataset.loadActivities;
      const filters = formData(document.getElementById("activity-filter-form"));

      const path =
        type === "recent"
          ? `/admin/activities/recent${queryString(filters)}`
          : type === "logs"
            ? `/admin/activities/logs${queryString(filters)}`
            : `/admin/activities/failed${queryString(filters)}`;

      try {
        const rows = (await api(path)).data || [];

        document.getElementById("activities-output").innerHTML = rows.length
          ? renderTable(rows)
          : '<div class="empty">No matching activity records found.</div>';
      } catch (error) {
        setMessage(error.message, "error");
      }
    }),
  );

  document
    .getElementById("report-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = formData(e.currentTarget);

      try {
        const rows =
          (await api(`/admin/reports/generate${queryString(data)}`)).data || [];

        document.getElementById("report-output").innerHTML = rows.length
          ? renderTable(rows)
          : '<div class="empty">No report data found for the selected filters.</div>';
      } catch (error) {
        setMessage(error.message, "error");
      }
    });
}
async function loadAdminAllData(root) {
  const data = (await api("/admin/all-data")).data || {};
  const entries = Object.entries(data);
  root.innerHTML = `
    <p class="help">This page uses the added admin-only <code>/api/admin/all-data</code> endpoint and shows every main database table in one place.</p>
    <div class="list">
      ${entries
        .map(
          ([name, rows]) => `
        <section class="item">
          <div class="section-head"><h3>${escapeHtml(name)} ${Array.isArray(rows) ? `<span class="badge gray">${rows.length} rows</span>` : ""}</h3></div>
          ${renderTable(rows, name)}
        </section>
      `,
        )
        .join("")}
    </div>
  `;
}

loadMe();
