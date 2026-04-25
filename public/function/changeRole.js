btn.addEventListener("click", async () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const data = await Users.toggleRole(user.id);

        const role = data[0].role;

        localStorage.setItem("role", role);
        console.log("Current role:", role);

        if (role === "seller") {
            window.location.href = "/seller";
        } else {
            window.location.href = "/customer";
        }

    } catch (err) {
        console.error("Toggle role error:", err);
    }
});