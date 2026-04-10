// ─── Base fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data.data;
}

// ─── Students ─────────────────────────────────────────────────────────────────
const Students = {
  getAll:   ()              => apiFetch("/api/students"),
  getOne:   (id)            => apiFetch(`/api/students/${id}`),
  search:   (q)             => apiFetch(`/api/students/search?q=${encodeURIComponent(q)}`),
  stats:    ()              => apiFetch("/api/students/stats"),
  create:   (body)          => apiFetch("/api/students",      { method: "POST",   body: JSON.stringify(body) }),
  update:   (id, body)      => apiFetch(`/api/students/${id}`,{ method: "PUT",    body: JSON.stringify(body) }),
  delete:   (id)            => apiFetch(`/api/students/${id}`,{ method: "DELETE" }),
};

// ─── Courses ──────────────────────────────────────────────────────────────────
const Courses = {
  getAll:   ()              => apiFetch("/api/courses"),
  getOne:   (id)            => apiFetch(`/api/courses/${id}`),
  stats:    ()              => apiFetch("/api/courses/stats"),
  create:   (body)          => apiFetch("/api/courses",       { method: "POST",   body: JSON.stringify(body) }),
  update:   (id, body)      => apiFetch(`/api/courses/${id}`, { method: "PUT",    body: JSON.stringify(body) }),
  delete:   (id)            => apiFetch(`/api/courses/${id}`, { method: "DELETE" }),
};

// ─── Enrollments ──────────────────────────────────────────────────────────────
const Enrollments = {
  getAll:        ()         => apiFetch("/api/enrollments"),
  byStudent:     (sid)      => apiFetch(`/api/enrollments/student/${sid}`),
  byCourse:      (cid)      => apiFetch(`/api/enrollments/course/${cid}`),
  stats:         ()         => apiFetch("/api/enrollments/stats"),
  gpaReport:     ()         => apiFetch("/api/enrollments/reports/gpa"),
  courseReport:  ()         => apiFetch("/api/enrollments/reports/courses"),
  enroll:        (body)     => apiFetch("/api/enrollments",   { method: "POST",   body: JSON.stringify(body) }),
  updateGrade:   (id, grade)=> apiFetch(`/api/enrollments/${id}/grade`, { method: "PATCH", body: JSON.stringify({ grade }) }),
  delete:        (id)       => apiFetch(`/api/enrollments/${id}`, { method: "DELETE" }),
};
