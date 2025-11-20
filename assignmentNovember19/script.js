const API_URL = "https://jsonplaceholder.typicode.com/users";
const PAGE_SIZE = 5;

// State
let allUsers = [];
let currentPage = 1;
let searchTerm = "";

// DOM elements
const tbody = document.getElementById("user-table-body");
const statusDiv = document.getElementById("status");
const searchInput = document.getElementById("search");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");
const addBtn = document.getElementById("add-user-btn");

const overlay = document.getElementById("user-form-overlay");
const formTitle = document.getElementById("form-title");
const userForm = document.getElementById("user-form");
const userIdInput = document.getElementById("user-id");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const cancelBtn = document.getElementById("cancel-btn");

// ---------- Helpers ----------

function showStatus(message, type = "") {
  statusDiv.textContent = message;
  statusDiv.className = "status"; // reset
  if (type) {
    statusDiv.classList.add(type);
  }
}

function openForm(mode, user = null) {
  if (mode === "create") {
    formTitle.textContent = "Add User";
    userIdInput.value = "";
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
  } else if (mode === "edit" && user) {
    formTitle.textContent = "Edit User";
    userIdInput.value = user.id;
    nameInput.value = user.name;
    emailInput.value = user.email;
    phoneInput.value = user.phone;
  }

  overlay.classList.remove("hidden");
}

function closeForm() {
  overlay.classList.add("hidden");
}

// ---------- Rendering ----------

function getFilteredUsers() {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return allUsers;
  return allUsers.filter((u) =>
    u.name.toLowerCase().includes(term)
  );
}

function renderTable() {
  const filtered = getFilteredUsers();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  tbody.innerHTML = "";

  if (pageItems.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "No users found.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    for (const user of pageItems) {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td>
          <button class="btn" data-action="edit" data-id="${user.id}">Edit</button>
          <button class="btn secondary" data-action="delete" data-id="${user.id}">Del</button>
        </td>
      `;

      tbody.appendChild(tr);
    }
  }

  // Pagination controls
  pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// ---------- API calls (async/await) ----------

async function fetchUsers() {
  try {
    showStatus("Loading users...");
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`Failed to load users (status ${res.status})`);
    }

    const data = await res.json();
    allUsers = data;
    currentPage = 1;
    renderTable();
    showStatus("Users loaded.", "success");
  } catch (err) {
    console.error(err);
    showStatus(err.message || "Error loading users.", "error");
  }
}

async function createUser(userData) {
  try {
    showStatus("Creating user...");
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      throw new Error(`Failed to create user (status ${res.status})`);
    }

    const created = await res.json();

    // JSONPlaceholder does not persist, so we manage local state:
    const newId =
      (allUsers.length ? Math.max(...allUsers.map((u) => u.id)) : 0) + 1;
    created.id = newId;

    allUsers.push(created);
    currentPage = Math.ceil(allUsers.length / PAGE_SIZE);
    renderTable();
    showStatus("User created (local only, API is fake).", "success");
  } catch (err) {
    console.error(err);
    showStatus(err.message || "Error creating user.", "error");
  }
}

async function updateUser(id, userData) {
  try {
    showStatus("Updating user...");
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, id }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update user (status ${res.status})`);
    }

    // We don't really need the response body for this fake API
    await res.json().catch(() => null);

    allUsers = allUsers.map((u) =>
      u.id === id ? { ...u, ...userData } : u
    );

    renderTable();
    showStatus("User updated (local only, API is fake).", "success");
  } catch (err) {
    console.error(err);
    showStatus(err.message || "Error updating user.", "error");
  }
}

async function deleteUser(id) {
  const confirmed = window.confirm("Delete this user?");
  if (!confirmed) return;

  try {
    showStatus("Deleting user...");
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Failed to delete user (status ${res.status})`);
    }

    allUsers = allUsers.filter((u) => u.id !== id);
    renderTable();
    showStatus("User deleted (local only, API is fake).", "success");
  } catch (err) {
    console.error(err);
    showStatus(err.message || "Error deleting user.", "error");
  }
}

// ---------- Event listeners ----------

document.addEventListener("DOMContentLoaded", () => {
  fetchUsers();
});

// Search
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  currentPage = 1;
  renderTable();
});

// Pagination
prevBtn.addEventListener("click", () => {
  currentPage--;
  renderTable();
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  renderTable();
});

// Add user button
addBtn.addEventListener("click", () => {
  openForm("create");
});

// Cancel button
cancelBtn.addEventListener("click", () => {
  closeForm();
});

// Submit form (create or update)
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!name || !email || !phone) {
    showStatus("All fields are required.", "error");
    return;
  }

  const userData = { name, email, phone };
  const idValue = userIdInput.value;

  closeForm();

  if (idValue) {
    await updateUser(Number(idValue), userData);
  } else {
    await createUser(userData);
  }
});

// Handle edit/delete clicks (event delegation)
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = Number(btn.dataset.id);
  const user = allUsers.find((u) => u.id === id);

  if (action === "edit" && user) {
    openForm("edit", user);
  } else if (action === "delete") {
    deleteUser(id);
  }
});
