async function loadGpaReport() {
  const tbody = document.getElementById("gpa-tbody");
  setLoading(tbody, true);
  try {
    const data = await Enrollments.gpaReport();
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">📊</div><p>ไม่มีข้อมูล</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map((s, i) => `
      <tr>
        <td style="color:var(--text-muted)">${i + 1}</td>
        <td class="mono">${s.student_id}</td>
        <td>${s.name}</td>
        <td><span class="badge badge-blue">${s.major}</span></td>
        <td>${s.courses_taken}</td>
        <td>
          <span style="font-family:var(--mono);font-weight:700;color:${gpaColor(s.gpa)}">
            ${s.gpa ?? "—"}
          </span>
        </td>
      </tr>
    `).join("");
  } catch (e) { toast(e.message, "error"); }
}

async function loadCourseReport() {
  const tbody = document.getElementById("course-tbody");
  setLoading(tbody, true);
  try {
    const data = await Enrollments.courseReport();
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty"><div class="empty-icon">📚</div><p>ไม่มีข้อมูล</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(c => `
      <tr>
        <td class="mono">${c.course_id}</td>
        <td>${c.course_name}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;background:var(--border);border-radius:4px;height:6px;overflow:hidden">
              <div style="height:100%;width:${Math.min(100, c.enrolled_count * 10)}%;background:var(--accent);border-radius:4px"></div>
            </div>
            <span class="mono" style="font-size:12px">${c.enrolled_count}</span>
          </div>
        </td>
        <td><span class="badge badge-green">${c.grade_a_count}</span></td>
      </tr>
    `).join("");
  } catch (e) { toast(e.message, "error"); }
}

function gpaColor(gpa) {
  if (!gpa) return "var(--text-muted)";
  if (gpa >= 3.5) return "var(--green)";
  if (gpa >= 2.5) return "var(--accent)";
  if (gpa >= 1.5) return "var(--yellow)";
  return "var(--red)";
}

document.addEventListener("DOMContentLoaded", () => {
  loadGpaReport();
  loadCourseReport();
});
