// Data Awal Menu Kafe
let menus = [
  { id: 1, name: "Es Kopi Susu Senja", category: "Kopi", price: 24000, emoji: "🧋", desc: "Espresso house blend, susu segar, dan gula aren organik.", available: true },
  { id: 2, name: "Americano Single Origin", category: "Kopi", price: 20000, emoji: "☕", desc: "Double shot Arabica Gayo dengan karakter citrus & caramel.", available: true },
  { id: 3, name: "Caffè Latte", category: "Kopi", price: 26000, emoji: "🥛", desc: "Espresso lembut berpadu steamed milk microfoam.", available: true },
  { id: 4, name: "Uji Matcha Latte", category: "Non-Kopi", price: 28000, emoji: "🍵", desc: "Pure matcha grade ceremonial dari Kyoto dengan susu creamy.", available: true },
  { id: 5, name: "Belgian Dark Chocolate", category: "Non-Kopi", price: 27000, emoji: "🍫", desc: "Cokelat hitam pekat 70% dengan tekstur velvety.", available: true },
  { id: 6, name: "Butter Croissant", category: "Makanan", price: 22000, emoji: "🥐", desc: "Pastry renyah berlapis mentega Prancis panggang hangat.", available: true },
  { id: 7, name: "Truffle Fries", category: "Makanan", price: 29000, emoji: "🍟", desc: "Kentang goreng renyah dengan minyak truffle & keju parmesan.", available: true },
  { id: 8, name: "Burnt Cheesecake", category: "Makanan", price: 32000, emoji: "🍰", desc: "Basque cheesecake lembut dengan bagian atas karamel.", available: false }
];

let cart = [];
let orders = [
  {
    id: "ORD-101",
    time: "08:30",
    hour: "08:00",
    customer: "Meja 02 - Dina",
    type: "Dine-in",
    status: "ready",
    items: [{ name: "Caffè Latte", qty: 2, note: "Hot, Normal Sugar", price: 26000 }],
    total: 57200
  },
  {
    id: "ORD-102",
    time: "09:15",
    hour: "09:00",
    customer: "Takeaway - Bima",
    type: "Takeaway",
    status: "brewing",
    items: [
      { name: "Es Kopi Susu Senja", qty: 1, note: "Ice, Less Sugar", price: 24000 },
      { name: "Butter Croissant", qty: 1, note: "Hangatkan", price: 22000 }
    ],
    total: 50600
  }
];

let activeCategory = "Semua";
let searchQuery = "";
let discountRate = 0;
let selectedMenu = null;
let selectedTemp = "Ice";
let selectedSugar = "Normal Sugar";

const formatRp = (num) => "Rp " + Math.round(num).toLocaleString("id-ID");

// Theme Switcher
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", isDark ? "light" : "dark");
  themeToggle.textContent = isDark ? "🌙 Mode Gelap" : "☀️ Mode Terang";
});

// Tab Navigation
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view-section").forEach(v => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`view-${btn.dataset.tab}`).classList.add("active");

    if (btn.dataset.tab === "queue") renderQueue();
    if (btn.dataset.tab === "manage") renderManageTable();
    if (btn.dataset.tab === "sales") renderAnalytics();
  });
});

// Render Menu Grid
function renderMenus() {
  const grid = document.getElementById("menuGrid");
  const filtered = menus.filter(m => {
    const matchCat = activeCategory === "Semua" || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  grid.innerHTML = filtered.map(item => `
    <div class="menu-card ${item.available ? "" : "sold-out"}">
      <div>
        <div class="menu-emoji">${item.emoji}</div>
        <div class="menu-cat">${item.category}</div>
        <div class="menu-name">${item.name}</div>
        <div class="menu-desc">${item.desc}</div>
      </div>
      <div class="menu-footer">
        <span class="menu-price">${formatRp(item.price)}</span>
        <button class="btn btn-primary" ${item.available ? "" : "disabled"} onclick="openCustomModal(${item.id})">
          ${item.available ? "+ Tambah" : "Habis"}
        </button>
      </div>
    </div>
  `).join("");
}

// Category & Search Events
document.getElementById("categoryPills").addEventListener("click", (e) => {
  if (!e.target.classList.contains("pill")) return;
  document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
  e.target.classList.add("active");
  activeCategory = e.target.dataset.cat;
  renderMenus();
});

document.getElementById("searchMenu").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderMenus();
});

// Custom Modal Logic
window.openCustomModal = (id) => {
  selectedMenu = menus.find(m => m.id === id);
  if (!selectedMenu) return;

  document.getElementById("modalItemName").textContent = `${selectedMenu.emoji} ${selectedMenu.name}`;
  document.getElementById("modalItemPrice").textContent = formatRp(selectedMenu.price);
  document.getElementById("modalNote").value = "";

  const isDrink = selectedMenu.category === "Kopi" || selectedMenu.category === "Non-Kopi";
  document.getElementById("drinkOptions").style.display = isDrink ? "block" : "none";

  document.getElementById("customModal").classList.add("open");
};

document.querySelectorAll(".option-pills").forEach(group => {
  group.addEventListener("click", (e) => {
    if (!e.target.classList.contains("opt-pill")) return;
    group.querySelectorAll(".opt-pill").forEach(p => p.classList.remove("selected"));
    e.target.classList.add("selected");
    if (group.dataset.group === "temp") selectedTemp = e.target.dataset.val;
    if (group.dataset.group === "sugar") selectedSugar = e.target.dataset.val;
  });
});

document.getElementById("closeCustomModal").addEventListener("click", () => {
  document.getElementById("customModal").classList.remove("open");
});

document.getElementById("confirmAddCart").addEventListener("click", () => {
  const isDrink = selectedMenu.category === "Kopi" || selectedMenu.category === "Non-Kopi";
  const customNote = document.getElementById("modalNote").value.trim();
  const noteParts = [];
  if (isDrink) noteParts.push(`${selectedTemp}, ${selectedSugar}`);
  if (customNote) noteParts.push(customNote);
  const finalNote = noteParts.join(" • ") || "Standar";

  const existing = cart.find(c => c.id === selectedMenu.id && c.note === finalNote);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: selectedMenu.id,
      name: selectedMenu.name,
      price: selectedMenu.price,
      qty: 1,
      note: finalNote
    });
  }

  document.getElementById("customModal").classList.remove("open");
  renderCart();
});

// Cart Rendering & Calculation
function renderCart() {
  const container = document.getElementById("cartItems");
  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-cart-msg">Belum ada item di keranjang.</p>`;
  } else {
    container.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="cart-item-note">${item.note}</div>
          <div class="cart-item-subtotal">${formatRp(item.price * item.qty)}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQty(${idx}, -1)">-</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${idx}, 1)">+</button>
        </div>
      </div>
    `).join("");
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal * discountRate;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * 0.1;
  const total = afterDiscount + tax;

  document.getElementById("subtotalText").textContent = formatRp(subtotal);
  document.getElementById("discountText").textContent = "- " + formatRp(discount);
  document.getElementById("taxText").textContent = formatRp(tax);
  document.getElementById("totalText").textContent = formatRp(total);
}

window.updateQty = (idx, delta) => {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
};

document.getElementById("clearCartBtn").addEventListener("click", () => {
  cart = [];
  discountRate = 0;
  document.getElementById("promoInput").value = "";
  renderCart();
});

document.getElementById("applyPromoBtn").addEventListener("click", () => {
  const code = document.getElementById("promoInput").value.trim().toUpperCase();
  if (code === "SENJA10") {
    discountRate = 0.10;
    alert("Kode promo SENJA10 berhasil diterapkan (Diskon 10%)!");
  } else if (code === "KOPI15") {
    discountRate = 0.15;
    alert("Kode promo KOPI15 berhasil diterapkan (Diskon 15%)!");
  } else {
    discountRate = 0;
    alert("Kode promo tidak valid. Coba SENJA10 atau KOPI15.");
  }
  renderCart();
});

// Checkout & Receipt
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);
  const hourStr = now.getHours().toString().padStart(2, "0") + ":00";
  const customer = document.getElementById("customerName").value.trim() || "Pelanggan Umum";
  const type = document.getElementById("orderType").value;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal * discountRate;
  const tax = (subtotal - discount) * 0.1;
  const total = subtotal - discount + tax;

  const newOrder = {
    id: "ORD-" + (101 + orders.length),
    time: timeStr,
    hour: hourStr,
    customer,
    type,
    status: "waiting",
    items: JSON.parse(JSON.stringify(cart)),
    subtotal,
    discount,
    tax,
    total
  };

  orders.unshift(newOrder);
  showReceipt(newOrder);

  cart = [];
  discountRate = 0;
  document.getElementById("promoInput").value = "";
  renderCart();
  updateQueueBadge();
});

function showReceipt(order) {
  const itemsHtml = order.items.map(i => `
    <div>${i.qty}x ${i.name} — ${formatRp(i.price * i.qty)}</div>
    <div style="font-size:0.75rem;color:#555;margin-bottom:4px;">   (${i.note})</div>
  `).join("");

  document.getElementById("receiptContent").innerHTML = `
    <div style="text-align:center;margin-bottom:10px;">
      <strong>KOPI SENJA & RUANG</strong><br/>
      Jl. Kenangan No. 24 • Telp: 0812-3456-7890<br/>
      ================================
    </div>
    <div>No Order : ${order.id}</div>
    <div>Waktu    : ${order.time} (${order.type})</div>
    <div>Pelanggan: ${order.customer}</div>
    <div>--------------------------------</div>
    ${itemsHtml}
    <div>--------------------------------</div>
    <div>Subtotal : ${formatRp(order.subtotal || order.total / 1.1)}</div>
    <div>Diskon   : - ${formatRp(order.discount || 0)}</div>
    <div>PB1 (10%): ${formatRp(order.tax || order.total - order.total / 1.1)}</div>
    <div style="font-weight:bold;font-size:1rem;margin-top:4px;">TOTAL    : ${formatRp(order.total)}</div>
    <div style="text-align:center;margin-top:12px;">
      ================================<br/>
      Terima kasih telah berkunjung!<br/>
      Wi-Fi: KopiSenja_Free | Pass: senja2026
    </div>
  `;
  document.getElementById("receiptModal").classList.add("open");
}

document.getElementById("closeReceiptModal").addEventListener("click", () => {
  document.getElementById("receiptModal").classList.remove("open");
});

// Barista Queue
function updateQueueBadge() {
  const activeCount = orders.filter(o => o.status !== "ready").length;
  document.getElementById("queueBadge").textContent = activeCount;
}

function renderQueue() {
  const grid = document.getElementById("queueGrid");
  grid.innerHTML = orders.map(order => {
    const statusLabel = {
      waiting: "Menunggu Dibuat",
      brewing: "Sedang Diramu",
      ready: "Siap Disajikan"
    }[order.status];

    const nextBtn = order.status === "waiting"
      ? `<button class="btn btn-primary" onclick="advanceOrder('${order.id}', 'brewing')">Mulai Racik</button>`
      : order.status === "brewing"
      ? `<button class="btn btn-success" onclick="advanceOrder('${order.id}', 'ready')">Tandai Siap</button>`
      : `<span class="done-label">✓ Selesai</span>`;

    return `
      <div class="order-ticket">
        <div class="ticket-top">
          <div>
            <strong>${order.id}</strong> • <span class="ticket-time">${order.time}</span>
            <div class="ticket-customer">${order.customer} (${order.type})</div>
          </div>
          <span class="status-badge status-${order.status}">${statusLabel}</span>
        </div>
        <ul class="ticket-list">
          ${order.items.map(i => `<li><strong>${i.qty}x ${i.name}</strong><br/><small>${i.note}</small></li>`).join("")}
        </ul>
        <div class="ticket-footer">
          <strong>${formatRp(order.total)}</strong>
          ${nextBtn}
        </div>
      </div>
    `;
  }).join("");
}

window.advanceOrder = (id, nextStatus) => {
  const target = orders.find(o => o.id === id);
  if (target) target.status = nextStatus;
  renderQueue();
  updateQueueBadge();
};

// Menu Management
document.getElementById("addMenuForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newMenu = {
    id: Date.now(),
    name: document.getElementById("newName").value.trim(),
    category: document.getElementById("newCat").value,
    price: parseInt(document.getElementById("newPrice").value, 10),
    emoji: document.getElementById("newEmoji").value.trim() || "☕",
    desc: document.getElementById("newDesc").value.trim(),
    available: true
  };
  menus.push(newMenu);
  e.target.reset();
  renderMenus();
  renderManageTable();
  alert("Menu baru berhasil ditambahkan!");
});

function renderManageTable() {
  const tbody = document.getElementById("manageTableBody");
  tbody.innerHTML = menus.map(m => `
    <tr>
      <td><strong>${m.emoji} ${m.name}</strong></td>
      <td>${m.category}</td>
      <td>
        <input type="number" class="price-edit-input" value="${m.price}" step="500"
          onchange="updateMenuPrice(${m.id}, this.value)" />
      </td>
      <td>
        <button class="btn ${m.available ? 'stock-available' : 'stock-empty'}"
          onclick="toggleStock(${m.id})">
          ${m.available ? "Tersedia" : "Stok Habis"}
        </button>
      </td>
      <td>
        <button class="btn btn-danger" onclick="deleteMenu(${m.id})">Hapus</button>
      </td>
    </tr>
  `).join("");
}

window.updateMenuPrice = (id, val) => {
  const item = menus.find(m => m.id === id);
  if (item && val > 0) {
    item.price = parseInt(val, 10);
    renderMenus();
  }
};

window.toggleStock = (id) => {
  const item = menus.find(m => m.id === id);
  if (item) {
    item.available = !item.available;
    renderMenus();
    renderManageTable();
  }
};

window.deleteMenu = (id) => {
  menus = menus.filter(m => m.id !== id);
  renderMenus();
  renderManageTable();
};

// Sales Analytics
function renderAnalytics() {
  const totalRev = orders.reduce((s, o) => s + o.total, 0);
  document.getElementById("statRevenue").textContent = formatRp(totalRev);
  document.getElementById("statOrders").textContent = orders.length + " Pesanan";

  const itemCount = {};
  orders.forEach(o => o.items.forEach(i => {
    itemCount[i.name] = (itemCount[i.name] || 0) + i.qty;
  }));
  const topItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("statTopItem").textContent = topItem ? `${topItem[0]} (${topItem[1]}x)` : "-";

  // Hourly Chart
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
  const hourlyTotals = hours.map(h => orders.filter(o => o.hour === h).reduce((s, o) => s + o.total, 0));
  const maxVal = Math.max(...hourlyTotals, 50000);

  document.getElementById("salesChart").innerHTML = hours.map((h, idx) => {
    const pct = Math.round((hourlyTotals[idx] / maxVal) * 100);
    return `
      <div class="bar-col">
        <span class="bar-amount">${hourlyTotals[idx] > 0 ? (hourlyTotals[idx]/1000) + 'k' : ''}</span>
        <div class="bar-fill" style="height:${Math.max(pct, 6)}%;"></div>
        <span class="bar-hour">${h}</span>
      </div>
    `;
  }).join("");

  // History Table
  document.getElementById("historyTableBody").innerHTML = orders.map((o, idx) => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.time}</td>
      <td>${o.customer}</td>
      <td>${o.type}</td>
      <td><strong>${formatRp(o.total)}</strong></td>
      <td><button class="btn btn-outline btn-sm" onclick="reprintOrder(${idx})">Lihat Struk</button></td>
    </tr>
  `).join("");
}

window.reprintOrder = (idx) => {
  showReceipt(orders[idx]);
};

// Init
renderMenus();
renderCart();
updateQueueBadge();
