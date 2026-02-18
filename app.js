const API_URL = "https://script.google.com/macros/s/AKfycbxglquGl7MCNAUXDtTY0iBQptxcNKsiA_CJYhldy-1EC-Lcj3YztK2fY52hs3h51ZpQdg/exec";

// Cache Elemen
const dom = {
  rekap: document.getElementById("rekap"),
  namaSelect: document.getElementById("nama"),
  tanggal: document.getElementById("tanggal"),
  poin: document.getElementById("poin"),
  namaTS: document.getElementById("namaTS"),
  buttons: document.querySelectorAll("button")
};

// Fungsi Helper: Toggle Loading Tombol
function setSubmitting(isSubmitting) {
  dom.buttons.forEach(btn => btn.disabled = isSubmitting);
}

// 1. Load Data dari Google Sheets
async function loadData() {
  try {
    dom.rekap.innerHTML = `<tr><td colspan="4" style="text-align:center">Memuat data...</td></tr>`;
    
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    // Render Tabel
    dom.rekap.innerHTML = data.result.map(r => {
      const statusClass = r.rata < 18.5 ? "merah" : "biru";
      return `
        <tr>
          <td><strong>${r.nama}</strong></td>
          <td>${r.hari}</td>
          <td><span class="${statusClass}">${Number(r.rata).toFixed(1)}</span></td>
          <td>${r.total}</td>
        </tr>
      `;
    }).join("");

    // Render Dropdown Nama
    dom.namaSelect.innerHTML = `<option value="">-- Pilih Nama TS --</option>` + 
      data.tsList.map(n => `<option value="${n}">${n}</option>`).join("");

  } catch (err) {
    dom.rekap.innerHTML = `<tr><td colspan="4" class="merah">Gagal memuat data: ${err.message}</td></tr>`;
  }
}

// 2. Simpan Poin Harian
async function inputHarian() {
  const val = {
    tanggal: dom.tanggal.value,
    nama: dom.namaSelect.value,
    poin: dom.poin.value
  };

  if (!val.tanggal || !val.nama || !val.poin) return alert("Harap isi semua kolom!");

  setSubmitting(true);
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addLog",
        ...val,
        poin: Number(val.poin)
      })
    });
    
    dom.poin.value = "";
    await loadData();
    alert("Data berhasil disimpan!");
  } catch (err) {
    alert("Gagal menyimpan data.");
  } finally {
    setSubmitting(false);
  }
}

// 3. Tambah TS Baru
async function tambahTS() {
  const nama = dom.namaTS.value.trim();
  if (!nama) return alert("Nama TS tidak boleh kosong!");

  setSubmitting(true);
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "addTS", nama })
    });
    
    dom.namaTS.value = "";
    await loadData();
    alert(`TS ${nama} berhasil ditambahkan!`);
  } catch (err) {
    alert("Gagal menambahkan TS.");
  } finally {
    setSubmitting(false);
  }
}

// Inisialisasi
window.addEventListener("DOMContentLoaded", () => {
  // Set tanggal otomatis ke hari ini
  dom.tanggal.value = new Date().toISOString().split('T')[0];
  loadData();
});
                
