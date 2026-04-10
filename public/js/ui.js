// ─── Toast ────────────────────────────────────────────────────────────────────
function toast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${type === "success" ? "✓" : "✕"}</span>${message}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

// ─── Loading ──────────────────────────────────────────────────────────────────
function setLoading(el, on) {
  if (on) {
    el.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
  }
}

// ─── Grade badge ──────────────────────────────────────────────────────────────
function gradeBadge(grade) {
  if (!grade) return `<span class="grade-badge grade-null">—</span>`;
  const cls = { "B+": "Bp", "C+": "Cp", "D+": "Dp" }[grade] || grade;
  return `<span class="grade-badge grade-${cls}">${grade}</span>`;
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function confirm(message) {
  return window.confirm(message);
}

// ─── Active nav link ──────────────────────────────────────────────────────────
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    const active = href === "/" ? path === "/" : path.startsWith(href);
    link.classList.toggle("active", active);
  });
}

document.addEventListener("DOMContentLoaded", setActiveNav);
