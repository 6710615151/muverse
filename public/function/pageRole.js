export function pageRole() {
    const role = localStorage.getItem('role');

    if (role === "customer") {
        window.location.replace("/customer");
    } else if (role === "seller") {
        window.location.replace("/seller");
    } else if (role === "admin") {
        window.location.replace("/admin");
    }
}

export function checkRole(page) {
    const role = localStorage.getItem('role');

    if (page !== role) {
      //  window.location.replace("/wrong");
    }
}