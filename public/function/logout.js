// logout.js

export function logout() {
    localStorage.clear();
    window.location.href = "/Auth";
}

export const Logout = {
    init() {
        const btn = document.getElementById("confirmLogout");
        if (!btn) return;

        btn.addEventListener("click", logout);
    }
};