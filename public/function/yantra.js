const card = document.getElementById("card");
const yantra = document.getElementById("yantra");

card.addEventListener("mousemove", (e) => {
  const rect = card.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const midX = rect.width / 2;
  const midY = rect.height / 2;

  const rotateY = ((x - midX) / midX) * 10;
  const rotateX = -((y - midY) / midY) * 10;

  card.style.transform = `
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
  `;

  yantra.style.transform = `
    translateZ(60px)
    rotateX(${rotateX * 1.5}deg)
    rotateY(${rotateY * 1.5}deg)
    scale(1.05)
  `;
});

card.addEventListener("mouseleave", () => {
  card.style.transform = `rotateX(0) rotateY(0)`;
  yantra.style.transform = `translateZ(0) scale(1)`;
});

let items = [];
let current = 0;



async function loadData() {
  //const res = await ;
  //items = await res.json();
  items = [
    {
      name: "NAKA YANTRA",
      price: 99,
      img: "../assets/naka.png",
    },
    {
      name: "TIGER YANTRA",
      price: 99,
      img: "../assets/tiger.png",
    },
    {
      name: "HANUMAN YANTRA",
      price: 888,
      img: "../assets/hanuman.png",
    },
    {
      name: "LORD GANESHA YANTRA",
      price: 999,
      img: "../assets/gens.png",
    }
  ]
  renderItem(0);
}

function renderItem(i) {
  current = i;
  const item = items[i];

  document.querySelector(".left h2").innerText = item.name;
  document.querySelector(".left h3").innerText = item.price + " ฿";

  document.getElementById("yantra").src = item.img;


  const card = document.getElementById("card");
  card.classList.add("flash");
  setTimeout(() => card.classList.remove("flash"), 300);
}

function changeItem(i) {
  renderItem(i);
}

loadData();

const buttons = document.querySelectorAll(".right button");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// clicl buy
document.querySelector(".buy").addEventListener("click", async () => {
  const item = items[current];

  if (!confirm(`confirm "${item.name}" price: ฿${item.price}?`)) return;

  const user_id = localStorage.getItem("user_id");
  if (!user_id) {
    alert("login required to purchase");
    return;
  }

  try {
    const res = await fetch("/api/wallet/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, amount: item.price, payment_method: "WALLET" }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || data.error || "Error processing payment");

    alert(`confirm "${item.name}" price: ฿${item.price} successful! Thank you`);
  } catch (err) {
    alert(`Failed to complete transaction: ${err.message || "Insufficient funds"}`);
  }
});