const firebaseConfig = {
  apiKey: "AIzaSyCMGJnWBMUryJxTh_6s3tJhX-pwhl7Vr5Y",
  authDomain: "cat-store-557dd.firebaseapp.com",
  databaseURL: "https://cat-store-557dd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cat-store-557dd",
  storageBucket: "cat-store-557dd.appspot.com",
  messagingSenderId: "889973624541",
  appId: "1:889973624541:web:965d8b8f6b539e54ac5534",
  measurementId: "G-ZTL1W4RHXH"
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();
const db = firebase.database();

document.getElementById("CihuyTittle").onclick = function () {
  window.location.href = "https://filecihuy.github.io/";
};

document.addEventListener("contextmenu", (event) => event.preventDefault());

function showToast(type, text) {
  const toastContainer = document.getElementById("toast-container");
  const oldToast = toastContainer.querySelector(".toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span style="flex:1">${text}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

async function copyToClipboard(text) {
  if (!navigator.clipboard) {
    showToast("failed", "Browser tidak mendukung fitur ini.");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast("success", "Link berhasil disalin! 🎉");
  } catch (err) {
    showToast("failed", "Gagal menyalin link.");
    console.error("Gagal menyalin link:", err);
  }
}

const openBtn = document.getElementById("openDialogBtn");
const dialog = document.getElementById("uploadDialog");
const dialogContent = dialog.querySelector(".dialog-content");
const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const uploadBtn = document.getElementById("uploadBtn");
const dropArea = document.getElementById("dropArea");
const fileInfoDialog = document.getElementById("fileInfoDialog");
const fileInfoDialogContent = fileInfoDialog.querySelector(".dialog-content");
const detailFileInfo = document.getElementById("detailFileInfo");
const deleteFileBtn = document.getElementById("deleteFileBtn");
const downloadFileBtn = document.getElementById("downloadFileBtn");
const closeInfoDialogBtn = fileInfoDialog.querySelector(".close-btn");

let selectedFile = null;
let fileCategory = null;
let isUploading = false;

function openDialog() {
  dialog.style.display = "flex";
  setTimeout(() => dialogContent.classList.add("show"), 10);
  dialogContent.classList.remove("hide");

  fileInput.value = "";
  fileInfo.innerHTML = "";
  fileInfo.style.display = "none";
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Upload";
  selectedFile = null;
  isUploading = false;
}

function closeDialog() {
  dialogContent.classList.remove("show");
  dialogContent.classList.add("hide");

  setTimeout(() => {
    dialog.style.display = "none";
    dialogContent.classList.remove("hide");
  }, 260);

  fileInput.value = "";
  fileInfo.innerHTML = "";
  fileInfo.style.display = "none";
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Upload";
  selectedFile = null;
  isUploading = false;
}

function closeFileInfoDialog() {
  fileInfoDialogContent.classList.remove("show");
  fileInfoDialogContent.classList.add("hide");

  setTimeout(() => {
    fileInfoDialog.style.display = "none";
    fileInfoDialogContent.classList.remove("hide");
  }, 260);
}

openBtn.onclick = openDialog;
closeInfoDialogBtn.onclick = closeFileInfoDialog;

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});

fileInfoDialog.addEventListener("click", (event) => {
  if (event.target === fileInfoDialog) closeFileInfoDialog();
});

async function showFileInfoDialog(key, category) {
  try {
    const fileRef = db.ref(`FileCihuy/${category}/${key}`);
    const snap = await fileRef.once("value");
    const fileData = snap.val();

    if (!fileData) {
      showToast("failed", "File tidak ditemukan.");
      return;
    }

    const passwordInput = document.getElementById("passwordInput");
    passwordInput.value = "";

    let infoHtml = `
      <span><strong>Nama</strong>: <span style="word-break:break-all;">${fileData.name}</span></span>
      <span><strong>Ukuran</strong>: ${fileData.size}</span>
      <span><strong>Tipe</strong>: ${fileData.type}</span>
      <span><strong>Tgl Upload</strong>: ${fileData.date}</span>
      ${fileData.duration ? `<span><strong>Durasi</strong>: ${fileData.duration}</span>` : ""}
      <span style="display:none;flex-wrap:wrap;gap:4px;">
        <strong>URL</strong>: 
        <a href="#" onclick="event.preventDefault(); copyToClipboard('${fileData.url}')" style="word-break:break-all;color:#3b82f6;text-decoration:none;cursor:pointer;">
          Copy Link
        </a>
      </span>
    `;

    detailFileInfo.innerHTML = infoHtml;

    const correctPassword = "2580";

    downloadFileBtn.onclick = () => {
      const enteredPassword = passwordInput.value;
      if (!enteredPassword) return showToast("failed", "Password harus diisi!");
      if (enteredPassword === correctPassword) {
        showToast("success", "Memulai download...");
        window.open(fileData.url, "_blank");
      } else {
        showToast("failed", "Password salah!");
      }
    };

    deleteFileBtn.onclick = async () => {
      const enteredPassword = passwordInput.value;
      if (!enteredPassword) return showToast("failed", "Password harus diisi!");
      if (enteredPassword !== correctPassword) return showToast("failed", "Password salah!");

      if (confirm(`Apakah Anda yakin ingin menghapus file "${fileData.name}"?`)) {
        try {
          const storageRef = storage.refFromURL(fileData.url);
          await storageRef.delete();
          await fileRef.remove();

          showToast("success", "File berhasil dihapus.");
          closeFileInfoDialog();

          const categoryCardId = `card-${category === "more" ? "others" : category}`;
          document.getElementById(categoryCardId).click();
        } catch (err) {
          showToast("failed", "Gagal menghapus file: " + err.message);
        }
      }
    };

    fileInfoDialog.style.display = "flex";
    setTimeout(() => fileInfoDialogContent.classList.add("show"), 10);
    fileInfoDialogContent.classList.remove("hide");
  } catch (e) {
    showToast("failed", "Gagal mengambil info file: " + e.message);
  }
}

function formatSize(bytes) {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + " GB";
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
  return bytes + " B";
}

function ellipsisFilename(name, maxLen = 18) {
  if (name.length <= maxLen) return name;
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) return name.substring(0, maxLen - 3) + "...";

  const ext = name.substring(dotIndex);
  const base = name.substring(0, maxLen - 3 - ext.length);
  return base + "..." + ext;
}

function getCategory(ext) {
  ext = ext.toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"].includes(ext)) return "image";
  if ([".mp4", ".mkv", ".mov", ".avi", ".wmv", ".webm"].includes(ext)) return "video";
  if ([".mp3", ".wav", ".ogg", ".aac", ".flac", ".m4a"].includes(ext)) return "music";
  if ([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".html", ".css", ".js", ".json", ".xml", ".md"].includes(ext)) return "document";
  if ([".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"].includes(ext)) return "archives";
  if (ext === ".apk") return "apk";
  return "more";
}

function getTodayString() {
  const date = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(date.getDate()).padStart(2, "0")}/${months[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
}

fileInput.onchange = function () {
  const file = fileInput.files[0];
  if (!file) {
    fileInfo.style.display = "none";
    uploadBtn.disabled = true;
    selectedFile = null;
    return;
  }

  selectedFile = file;
  const name = file.name;
  const ext = name.includes(".") ? name.substring(name.lastIndexOf(".")).toLowerCase() : "";
  fileCategory = getCategory(ext);

  const sizeStr = formatSize(file.size);
  const shortName = ellipsisFilename(name, 18);

  let infoHtml = `
    <span><strong>Nama</strong> : <span class="filename-ellipsis" title="${name}">${shortName}</span></span>
    <span><strong>Ukuran</strong> : ${sizeStr}</span>
    <span><strong>Ekstensi</strong> : ${ext}</span>
  `;

  if (fileCategory === "apk") {
    uploadBtn.disabled = true;
    setTimeout(() => showToast("failed", "Maaf, file bertipe <b>APK</b> tidak diperbolehkan diupload."), 250);
  } else {
    uploadBtn.disabled = false;

    if (fileCategory === "video" || fileCategory === "music") {
      const url = URL.createObjectURL(file);
      const media = document.createElement(fileCategory === "video" ? "video" : "audio");
      media.preload = "metadata";
      media.src = url;

      media.onloadedmetadata = function () {
        URL.revokeObjectURL(url);

        const dur = Math.floor(media.duration);
        const hrs = Math.floor(dur / 3600);
        const min = Math.floor((dur % 3600) / 60);
        const sec = dur % 60;

        const timeStr = hrs > 0
          ? `${hrs}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
          : `${min}:${String(sec).padStart(2, "0")}`;

        infoHtml += `<span><strong>Durasi</strong> : ${timeStr}</span>`;
        fileInfo.innerHTML = infoHtml;
        fileInfo.style.display = "flex";
      };

      media.style.display = "none";
      document.body.appendChild(media);
      media.onloadeddata = () => setTimeout(() => document.body.removeChild(media), 500);
    }
  }

  fileInfo.innerHTML = infoHtml;
  fileInfo.style.display = "flex";
};

uploadBtn.onclick = async function () {
  if (isUploading || !selectedFile || fileCategory === "apk") return;

  isUploading = true;
  uploadBtn.textContent = "Uploading...";
  uploadBtn.disabled = true;

  const storagePath = `FileCihuy/${fileCategory}/${selectedFile.name}`;
  const storageRef = storage.ref(storagePath);

  try {
    const uploadTask = storageRef.put(selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        uploadBtn.textContent = `Uploading... ${percent}%`;
      },
      (error) => {
        showToast("failed", "Upload gagal: " + error.message);
        uploadBtn.textContent = "Upload";
        uploadBtn.disabled = false;
        isUploading = false;
      },
      async () => {
        const url = await uploadTask.snapshot.ref.getDownloadURL();
        const today = getTodayString();
        const ext = selectedFile.name.includes(".")
          ? selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase()
          : "";

        const meta = {
          name: selectedFile.name,
          url,
          ext,
          type: fileCategory,
          size: formatSize(selectedFile.size),
          date: today
        };

        if (fileCategory === "video" || fileCategory === "music") {
          const tempUrl = await storageRef.getDownloadURL();
          const media = document.createElement(fileCategory === "video" ? "video" : "audio");
          media.src = tempUrl;

          await new Promise((res) => (media.onloadedmetadata = res));

          const dur = Math.floor(media.duration);
          const hrs = Math.floor(dur / 3600);
          const min = Math.floor((dur % 3600) / 60);
          const sec = dur % 60;

          meta.duration = hrs > 0
            ? `${hrs}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
            : `${min}:${String(sec).padStart(2, "0")}`;
        }

        await db.ref(`FileCihuy/${fileCategory}`).push(meta);

        showToast("success", "File berhasil diupload!");
        closeDialog();
        uploadBtn.textContent = "Upload";
        isUploading = false;
      }
    );
  } catch (e) {
    showToast("failed", "Upload gagal: " + e.message);
    uploadBtn.textContent = "Upload";
    uploadBtn.disabled = false;
    isUploading = false;
  }
};

dropArea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    dropArea.querySelector("label").click();
  }
});

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files && files.length > 0) {
    fileInput.files = files;
    fileInput.dispatchEvent(new Event("change"));
  }
});

dropArea.addEventListener("click", (e) => {
  if (e.target === dropArea) fileInput.click();
});

const categoryMap = {
  "card-document": "document",
  "card-image": "image",
  "card-video": "video",
  "card-archives": "archives",
  "card-music": "music",
  "card-others": "more"
};

const fileListView = document.getElementById("file-list-view");

let currentImageViewMode = "list";
let currentImageData = null;

function renderImages(val, category) {
  let html = `
    <div style="font-weight:bold;font-size:1.1rem;margin-bottom:12px;text-align:left;margin-left:25px;display:flex;justify-content:space-between;align-items:center;">
      Daftar File: Images
      <span style="margin-right:19px;" id="viewToggleIcon" class="view-toggle-icon">
        ${
          currentImageViewMode === "list"
            ? `<svg viewBox="0 0 24 24"><path d="M3 5V19C3 19.55 3.45 20 4 20H20C20.55 20 21 19.55 21 19V5C21 4.45 20.55 4 20 4H4C3.45 4 3 4.45 3 5ZM5 18V6H19V18H5ZM7 7H10V10H7V7ZM7 11H10V14H7V11ZM7 15H10V18H7V15ZM11 7H14V10H11V7ZM11 11H14V14H11V11ZM11 15H14V18H11V15ZM15 7H18V10H15V7ZM15 11H18V14H15V11ZM15 15H18V18H15V15Z"/></svg>`
            : `<svg viewBox="0 0 24 24"><path d="M4 14H10V20H4V14ZM14 14H20V20H14V14ZM4 4H10V10H4V4ZM14 4H20V10H14V4Z"/></svg>`
        }
      </span>
    </div>
  `;

  if (currentImageViewMode === "grid") {
    html += `<div class="image-grid-view">`;
    Object.entries(val)
      .reverse()
      .forEach(([key, item]) => {
        html += `
          <div class="image-grid-item" onclick="showFileInfoDialog('${key}', '${category}')">
            <img src="${item.url}" alt="${item.name}">
            <div class="file-name" title="${item.name}">${item.name}</div>
            <div class="file-size">${item.size}</div>
          </div>
        `;
      });
    html += `</div>`;
  } else {
    html += `<div class="file-list-image">`;
    Object.entries(val)
      .reverse()
      .forEach(([key, item]) => {
        html += `
          <div class="file-list-item" onclick="showFileInfoDialog('${key}', '${category}')">
            <span class="icon text-green">🖼️</span>
            <div class="file-details">
              <div class="file-name">${item.name}</div>
              <div class="file-size">${item.size}</div>
            </div>
          </div>
        `;
      });
    html += `</div>`;
  }

  fileListView.innerHTML = html;

  document.getElementById("viewToggleIcon").addEventListener("click", () => {
    currentImageViewMode = currentImageViewMode === "list" ? "grid" : "list";
    renderImages(currentImageData, "image");
  });
}

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", async function () {
    const category = categoryMap[this.id];
    if (!category) return;

    fileListView.innerHTML = `<div style="text-align:center;padding:22px;">Loading...</div>`;
    fileListView.style.display = "block";

    try {
      const snap = await db.ref(`FileCihuy/${category}`).once("value");
      const val = snap.val();

      if (!val) {
        fileListView.innerHTML = `<div style="text-align:center;padding:22px;">Tidak ada file ditemukan.</div>`;
        return;
      }

      if (category === "image") {
        currentImageData = val;
        renderImages(val, category);
      } else {
        let html = `
          <div style="font-weight:bold;font-size:1.1rem;margin-bottom:12px;text-align:left;margin-left:25px;">
            Daftar File: ${card.querySelector("h3").textContent}
          </div>
        `;

        html += `<div style="display:flex;flex-direction:column;gap:13px;margin-left:25px;margin-right:25px;">`;

        Object.entries(val)
          .reverse()
          .forEach(([key, item]) => {
            html += `
              <div class="file-list-item" onclick="showFileInfoDialog('${key}', '${category}')">
                <span class="icon">📄</span>
                <div class="file-details">
                  <div class="file-name">${item.name}</div>
                  <div class="file-size">${item.size}</div>
                </div>
              </div>
            `;
          });

        html += `</div>`;

        fileListView.innerHTML = html;
      }
    } catch (err) {
      fileListView.innerHTML = `<div style="text-align:center;padding:22px;">Error: ${err.message}</div>`;
    }
  });
});