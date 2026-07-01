import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

/**
 * Aduin.id Admin CMS — Logic
 * Loads data from Firebase Realtime Database, binds to forms, handles save.
 */

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDOK1MFqwmZXDjTjkA7BAvlYqFQwoPNUU",
  authDomain: "aduin-admin.firebaseapp.com",
  databaseURL: "https://aduin-admin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aduin-admin",
  storageBucket: "aduin-admin.firebasestorage.app",
  messagingSenderId: "758831242777",
  appId: "1:758831242777:web:c12ef02c40f213d0681488"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let contentData = {};

// ===== TEMPLATES for new array items =====
const TEMPLATES = {
  stat: { value: "0+", label: "Label Baru" },
  logo: "🏢 NAMA INSTITUSI BARU",
  feature: { icon: "⭐", color: "fi-blue", title: "Fitur Baru", desc: "Deskripsi fitur baru." },
  step: { icon: "📌", number: "0", title: "Langkah Baru", desc: "Deskripsi langkah baru." },
  plan: {
    name: "Paket Baru", price: "Rp 0", priceSuffix: "/bln", period: "Deskripsi paket",
    popular: false, popularBadge: "", buttonText: "Pilih Paket", buttonStyle: "outline",
    link: "aduin-contact.html?paket=baru",
    features: [{ text: "Fitur 1", included: true }]
  },
  testimonial: {
    stars: 5, text: "Testimoni baru.", name: "Nama", role: "Jabatan",
    avatarEmoji: "👤", avatarBg: "#e2e8f0"
  }
};

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    showStatus("Memuat data dari Firebase...");
    const dbRef = ref(db, '/');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      contentData = snapshot.val();
      showStatus("✅ Data dimuat dari Firebase");
    } else {
      contentData = {};
      showStatus("⚠️ Database kosong, silahkan simpan data awal", true);
    }
  } catch (e) {
    contentData = {};
    showStatus("❌ Gagal memuat data", true);
    console.error(e);
  }

  populateSimpleFields();
  renderAllArrays();
  setupEventListeners();
});

// ===== UTILITY: get/set nested value =====
function getVal(obj, path) {
  return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : ""), obj);
}
function setVal(obj, path, val) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((o, k) => {
    if (!o[k]) o[k] = {};
    return o[k];
  }, obj);
  target[last] = val;
}

// ===== POPULATE simple fields =====
function populateSimpleFields() {
  document.querySelectorAll("[data-path]").forEach((el) => {
    const val = getVal(contentData, el.dataset.path);
    if (el.type === "checkbox") el.checked = !!val;
    else el.value = val || "";
  });
}

// ===== RENDER ARRAYS =====
function renderAllArrays() {
  document.querySelectorAll("[data-array-container]").forEach((container) => {
    const path = container.dataset.arrayContainer;
    const arr = getVal(contentData, path);
    container.innerHTML = "";
    if (!Array.isArray(arr)) return;
    arr.forEach((item, idx) => {
      container.appendChild(createArrayCard(path, item, idx));
    });
  });
}

function createArrayCard(arrayPath, item, index) {
  const card = document.createElement("div");
  card.className = "array-card";

  // Remove button
  const removeBtn = document.createElement("button");
  removeBtn.className = "btn-remove";
  removeBtn.innerHTML = "✕";
  removeBtn.onclick = () => { removeArrayItem(arrayPath, index); };
  card.appendChild(removeBtn);

  const grid = document.createElement("div");
  grid.className = "card-grid";

  if (typeof item === "string") {
    // Simple string array (logos)
    grid.innerHTML = `<div class="form-group full"><label>Teks</label><input type="text" value="${escHtml(item)}" data-array-path="${arrayPath}" data-index="${index}" data-field="__self__" /></div>`;
  } else if (arrayPath.endsWith(".stats")) {
    grid.innerHTML = `
      <div class="form-group"><label>Angka</label><input type="text" value="${escHtml(item.value)}" data-array-path="${arrayPath}" data-index="${index}" data-field="value" /></div>
      <div class="form-group"><label>Label</label><input type="text" value="${escHtml(item.label)}" data-array-path="${arrayPath}" data-index="${index}" data-field="label" /></div>`;
  } else if (arrayPath.endsWith(".items") && arrayPath.startsWith("features")) {
    grid.className = "card-grid cols-3";
    grid.innerHTML = `
      <div class="form-group"><label>Icon (emoji)</label><input type="text" value="${escHtml(item.icon)}" data-array-path="${arrayPath}" data-index="${index}" data-field="icon" /></div>
      <div class="form-group"><label>Warna</label><select data-array-path="${arrayPath}" data-index="${index}" data-field="color">
        ${["fi-blue","fi-green","fi-purple","fi-orange","fi-pink","fi-cyan"].map(c => `<option value="${c}" ${item.color===c?"selected":""}>${c.replace("fi-","")}</option>`).join("")}
      </select></div>
      <div class="form-group"><label>Judul</label><input type="text" value="${escHtml(item.title)}" data-array-path="${arrayPath}" data-index="${index}" data-field="title" /></div>
      <div class="form-group full"><label>Deskripsi</label><textarea rows="2" data-array-path="${arrayPath}" data-index="${index}" data-field="desc">${escHtml(item.desc)}</textarea></div>`;
  } else if (arrayPath.endsWith(".steps")) {
    grid.className = "card-grid cols-3";
    grid.innerHTML = `
      <div class="form-group"><label>Icon</label><input type="text" value="${escHtml(item.icon)}" data-array-path="${arrayPath}" data-index="${index}" data-field="icon" /></div>
      <div class="form-group"><label>Nomor</label><input type="text" value="${escHtml(item.number)}" data-array-path="${arrayPath}" data-index="${index}" data-field="number" /></div>
      <div class="form-group"><label>Judul</label><input type="text" value="${escHtml(item.title)}" data-array-path="${arrayPath}" data-index="${index}" data-field="title" /></div>
      <div class="form-group full"><label>Deskripsi</label><textarea rows="2" data-array-path="${arrayPath}" data-index="${index}" data-field="desc">${escHtml(item.desc)}</textarea></div>`;
  } else if (arrayPath.endsWith(".plans")) {
    grid.innerHTML = `
      <div class="form-group"><label>Nama Paket</label><input type="text" value="${escHtml(item.name)}" data-array-path="${arrayPath}" data-index="${index}" data-field="name" /></div>
      <div class="form-group"><label>Harga</label><input type="text" value="${escHtml(item.price)}" data-array-path="${arrayPath}" data-index="${index}" data-field="price" /></div>
      <div class="form-group"><label>Suffix (misal /bln)</label><input type="text" value="${escHtml(item.priceSuffix)}" data-array-path="${arrayPath}" data-index="${index}" data-field="priceSuffix" /></div>
      <div class="form-group"><label>Periode</label><input type="text" value="${escHtml(item.period)}" data-array-path="${arrayPath}" data-index="${index}" data-field="period" /></div>
      <div class="form-group"><label>Populer?</label><select data-array-path="${arrayPath}" data-index="${index}" data-field="popular"><option value="false" ${!item.popular?"selected":""}>Tidak</option><option value="true" ${item.popular?"selected":""}>Ya</option></select></div>
      <div class="form-group"><label>Badge Populer</label><input type="text" value="${escHtml(item.popularBadge)}" data-array-path="${arrayPath}" data-index="${index}" data-field="popularBadge" /></div>
      <div class="form-group"><label>Teks Tombol</label><input type="text" value="${escHtml(item.buttonText)}" data-array-path="${arrayPath}" data-index="${index}" data-field="buttonText" /></div>
      <div class="form-group"><label>Style Tombol</label><select data-array-path="${arrayPath}" data-index="${index}" data-field="buttonStyle">
        <option value="outline" ${item.buttonStyle==="outline"?"selected":""}>Outline</option>
        <option value="primary" ${item.buttonStyle==="primary"?"selected":""}>Primary</option>
        <option value="dark" ${item.buttonStyle==="dark"?"selected":""}>Dark</option>
      </select></div>
      <div class="form-group full"><label>Link</label><input type="text" value="${escHtml(item.link)}" data-array-path="${arrayPath}" data-index="${index}" data-field="link" /></div>`;

    // Feature list for pricing plans
    const flEditor = document.createElement("div");
    flEditor.className = "feature-list-editor";
    flEditor.innerHTML = `<label style="font-size:13px;font-weight:600;margin-bottom:6px;display:block;">Fitur Paket</label>`;
    (item.features || []).forEach((f, fi) => {
      flEditor.innerHTML += `<div class="fl-item">
        <input type="checkbox" ${f.included?"checked":""} data-array-path="${arrayPath}" data-index="${index}" data-field="features" data-fi="${fi}" data-fprop="included" />
        <input type="text" value="${escHtml(f.text)}" data-array-path="${arrayPath}" data-index="${index}" data-field="features" data-fi="${fi}" data-fprop="text" />
        <button class="fl-remove" data-array-path="${arrayPath}" data-index="${index}" data-fi="${fi}">✕</button>
      </div>`;
    });
    flEditor.innerHTML += `<button class="btn-add-feature" data-array-path="${arrayPath}" data-index="${index}">+ Tambah Fitur</button>`;
    grid.appendChild(flEditor);
  } else if (arrayPath.endsWith(".items") && arrayPath.startsWith("testimonials")) {
    grid.innerHTML = `
      <div class="form-group"><label>Nama</label><input type="text" value="${escHtml(item.name)}" data-array-path="${arrayPath}" data-index="${index}" data-field="name" /></div>
      <div class="form-group"><label>Jabatan</label><input type="text" value="${escHtml(item.role)}" data-array-path="${arrayPath}" data-index="${index}" data-field="role" /></div>
      <div class="form-group"><label>Emoji Avatar</label><input type="text" value="${escHtml(item.avatarEmoji)}" data-array-path="${arrayPath}" data-index="${index}" data-field="avatarEmoji" /></div>
      <div class="form-group"><label>Warna BG Avatar</label><input type="text" value="${escHtml(item.avatarBg)}" data-array-path="${arrayPath}" data-index="${index}" data-field="avatarBg" /></div>
      <div class="form-group"><label>Bintang (1-5)</label><input type="number" min="1" max="5" value="${item.stars}" data-array-path="${arrayPath}" data-index="${index}" data-field="stars" /></div>
      <div class="form-group full"><label>Teks Testimoni</label><textarea rows="3" data-array-path="${arrayPath}" data-index="${index}" data-field="text">${escHtml(item.text)}</textarea></div>`;
  }

  card.appendChild(grid);
  return card;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Simple field changes
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.path) {
      setVal(contentData, el.dataset.path, el.value);
      indicateUnsaved();
    }
    // Array item fields
    if (el.dataset.arrayPath && el.dataset.field) {
      updateArrayField(el);
      indicateUnsaved();
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset.arrayPath && el.dataset.field) {
      updateArrayField(el);
      indicateUnsaved();
    }
  });

  // Add array item buttons
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".btn-add");
    if (addBtn) {
      const path = addBtn.dataset.array;
      const tmpl = addBtn.dataset.template;
      const arr = getVal(contentData, path);
      if (Array.isArray(arr)) {
        arr.push(JSON.parse(JSON.stringify(TEMPLATES[tmpl])));
        renderAllArrays();
        indicateUnsaved();
      }
    }

    // Remove array item
    const removeBtn = e.target.closest(".btn-remove");
    if (removeBtn) {
      const card = removeBtn.closest(".array-card");
      const firstInput = card.querySelector("[data-array-path]");
      if (firstInput) {
        removeArrayItem(firstInput.dataset.arrayPath, parseInt(firstInput.dataset.index));
      }
    }

    // Remove pricing feature
    const flRemove = e.target.closest(".fl-remove");
    if (flRemove) {
      const { arrayPath, index, fi } = flRemove.dataset;
      const arr = getVal(contentData, arrayPath);
      if (arr && arr[index] && arr[index].features) {
        arr[index].features.splice(parseInt(fi), 1);
        renderAllArrays();
        indicateUnsaved();
      }
    }

    // Add pricing feature
    const addFeatureBtn = e.target.closest(".btn-add-feature");
    if (addFeatureBtn) {
      const { arrayPath, index } = addFeatureBtn.dataset;
      const arr = getVal(contentData, arrayPath);
      if (arr && arr[index]) {
        if (!arr[index].features) arr[index].features = [];
        arr[index].features.push({ text: "Fitur baru", included: true });
        renderAllArrays();
        indicateUnsaved();
      }
    }
  });

  // Sidebar navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      const target = document.querySelector(item.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Save to Firebase
  document.getElementById("btnSave").addEventListener("click", saveToFirebase);
}

function updateArrayField(el) {
  const { arrayPath, index, field, fi, fprop } = el.dataset;
  const arr = getVal(contentData, arrayPath);
  if (!arr || !arr[index]) return;

  if (field === "__self__") {
    arr[index] = el.value;
  } else if (field === "features" && fi !== undefined) {
    // Pricing plan features
    if (!arr[index].features[fi]) return;
    if (fprop === "included") arr[index].features[fi].included = el.checked;
    else if (fprop === "text") arr[index].features[fi].text = el.value;
  } else if (field === "popular") {
    arr[index][field] = el.value === "true";
  } else if (field === "stars") {
    arr[index][field] = parseInt(el.value) || 5;
  } else {
    arr[index][field] = el.value;
  }
}

function removeArrayItem(path, index) {
  const arr = getVal(contentData, path);
  if (Array.isArray(arr)) {
    arr.splice(index, 1);
    renderAllArrays();
    indicateUnsaved();
  }
}

// ===== SAVE / EXPORT / IMPORT =====
function indicateUnsaved() {
  const el = document.getElementById("saveStatus");
  el.textContent = "📝 Ada perubahan belum disimpan";
  el.style.color = "#f59e0b"; // Orange/Warning
}

async function saveToFirebase() {
  contentData.meta = contentData.meta || {};
  contentData.meta.lastUpdated = new Date().toISOString();
  contentData.meta.updatedBy = "admin";
  
  showStatus("Menyimpan...", false);
  
  try {
    const dbRef = ref(db, '/');
    await set(dbRef, contentData);
    showStatus("✅ Berhasil disimpan ke Firebase!");
  } catch (error) {
    console.error("Error saving data:", error);
    showStatus("❌ Gagal menyimpan", true);
  }
}

function showStatus(msg, isError) {
  const el = document.getElementById("saveStatus");
  el.textContent = msg;
  el.style.color = isError ? "#ef4444" : "#10b981";
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.textContent = ""; }, 4000);
}

function escHtml(str) {
  if (typeof str !== "string") return str;
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
