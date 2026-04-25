import { Users } from "./api.js";
import { pageRole } from "./pageRole.js";

pageRole()
const imgs = document.querySelectorAll('.bg img');
let cur = 0;

if (imgs.length > 0) {
  imgs[0].classList.add('active');

  setInterval(() => {
    imgs[cur].classList.remove('active');
    cur = (cur + 1) % imgs.length;
    imgs[cur].classList.add('active');
  }, 4500);
}

const container  = document.getElementById('container');
const toggleBtn  = document.getElementById('toggle-btn');
const title      = document.getElementById('toggle-title');
const desc       = document.getElementById('toggle-desc');
const btnText    = document.getElementById('toggle-btn-text');
let isSignUp     = false;

const panelCopy = {
  signIn:  { title: 'Welcome to Muverse',  desc: 'New here? Create you account.', btn: 'Sign Up' },
  signUp:  { title: 'Welcome Back to Muverse',   desc: 'Already a member? Sign in and dive back into Muverse.',   btn: 'Sign In' },
};

function animateText(fn) {
  [title, desc, btnText.parentElement].forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
  });

  setTimeout(() => {
    fn();
    [title, desc, btnText.parentElement].forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, 220);
}

toggleBtn.addEventListener('click', () => {
  isSignUp = !isSignUp;
  container.classList.toggle('signup-mode', isSignUp);

  const copy = isSignUp ? panelCopy.signUp : panelCopy.signIn;

  animateText(() => {
    title.textContent   = copy.title;
    desc.textContent    = copy.desc;
    btnText.textContent = copy.btn;
  });
});

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `msg ${type} show`;
}

function clearMsg(el) {
  el.className = 'msg';
}

const siForm = document.getElementById('sign-in-form');
const siBtn = siForm.querySelector('.btnIn');
const siMsg  = document.getElementById('si-msg');

siForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (siBtn.disabled) return;

  clearMsg(siMsg);

  const email    = document.getElementById('si-email').value.trim();
  const password = document.getElementById('si-pass').value.trim();

  if (!email || !password) {
    showMsg(siMsg, 'Please fill in all fields.', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMsg(siMsg, 'Invalid email format.', 'error');
    return;
  }

  siBtn.disabled = true;
  siBtn.textContent = 'Signing in…';

  try {
    const user = await Users.login(email, password);

    console.log("LOGIN RAW:", user);

    localStorage.setItem('user_id', user.id);
    localStorage.setItem('role', user.role);
    localStorage.getItem('user_id')
    console.log("LOGIN RAW:", user);
    console.log(localStorage.getItem('user_id'));
    showMsg(siMsg, 'Login successful! Redirecting…', 'success');

    setTimeout(() => {
     pageRole();
    }, 1000);

  } catch (err) {
    showMsg(siMsg, err.message || 'Login failed.', 'error');
  } finally {
    siBtn.disabled = false;
    siBtn.textContent = 'Sign In';
  }
});

const suForm = document.getElementById('sign-up-form');
const suBtn  = suForm.querySelector('.btn');
const suMsg  = document.getElementById('su-msg');

suForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (suBtn.disabled) return;

  clearMsg(suMsg);

  const name  = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pass  = document.getElementById('su-pass').value.trim();
  const phone = document.getElementById('su-phone').value.trim();

  if (!name || !email || !pass || !phone) {
    showMsg(suMsg, 'Please fill in all fields.', 'error');
    return;
  }

  if (pass.length < 6) {
    showMsg(suMsg, 'Password must be at least 6 characters.', 'error');
    return;
  }

  suBtn.disabled = true;
  suBtn.textContent = 'Creating account…';

  try {
    await Users.create({
      name,
      email,
      password: pass,
      phone
    });

    showMsg(suMsg, 'Account created! Please sign in.', 'success');

    setTimeout(() => {
      container.classList.remove('signup-mode');
      isSignUp = false;

      const copy = panelCopy.signIn;

      animateText(() => {
        title.textContent   = copy.title;
        desc.textContent    = copy.desc;
        btnText.textContent = copy.btn;
      });

    }, 1200);

  } catch (err) {
    showMsg(suMsg, err.message || 'Signup failed.', 'error');
  } finally {
    suBtn.disabled = false;
    suBtn.textContent = 'Create Account';
  }
});
