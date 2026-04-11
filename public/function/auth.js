import { Users } from "./api.js";

let isLogin = true;

const form = document.getElementById("auth-form");
const toggleBtn = document.getElementById("toggle-btn");
const toggleText = document.getElementById("toggle-text");
const title = document.getElementById("form-title");
const nameField = document.getElementById("name-field");
const phoneField = document.getElementById("phone-field");
const msg = document.getElementById("msg");

toggleBtn.onclick = () => {
  isLogin = !isLogin;

  if (isLogin) {
    title.innerText = "Sign In";
    toggleText.innerText = "Don't have an account?";
    toggleBtn.innerText = "Sign Up";
    nameField.style.display = "none";
    phoneField.style.display = "none";
  } else {
    title.innerText = "Sign Up";
    toggleText.innerText = "Already have an account?";
    toggleBtn.innerText = "Sign In";
    nameField.style.display = "block";
    phoneField.style.display = "block";
  }
};

form.onsubmit = async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value;

  try {
    if (isLogin) {
      const users = await Users.getAll();

      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) throw new Error("Invalid email or password");

      msg.innerText = "Login success ";
      localStorage.setItem("user", JSON.stringify(user));

      setTimeout(() => (location.href = "index.html"), 1000);

    } else {

      await Users.create({ name, email, password, phone });

      msg.innerText = "Account created ";
      toggleBtn.click();
    }
  } catch (err) {
    msg.innerText = err.message;
  }
};