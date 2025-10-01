Tujuan: Ubah repo aplikasi Next.js 14 saya agar terkoneksi ke MongoDB menggunakan MCP, lalu buat dan muat dummy data komprehensif sehingga seluruh fitur dan menu di aplikasi dapat terisi dan bisa diuji end-to-end. Setelah itu, buatkan sebuah **form checklist** (dokumen Markdown di repo) yang berfungsi sebagai panduan eksekusi dan pelacakan progres, lengkap dengan acceptance criteria per bagian. Semua langkah harus saling terhubung dan tervalidasi.

Konteks penting:

* Aplikasi: Next.js 14 App Router, TypeScript, MongoDB/Mongoose, JWT auth.
* Variabel koneksi: gunakan `MONGODB_URI` dan `MONGODB_DB_NAME` dari file `.env`. Jangan hardcode credential.
* Koneksi ke MongoDB wajib melalui **MCP**. Buat dan konfigurasikan MCP client/connector yang aman, lalu gunakan untuk operasi DB (membuat koleksi, index, seeding, verifikasi).
* Target akhir: semua halaman dan menu bekerja, data dummy cukup kaya untuk menguji skenario normal dan edge, serta ada checklist yang menandai mana yang sudah/ belum selesai.

Permintaan kerja ke kamu:

1. **Siapkan koneksi Mongo via MCP**

   * Aktifkan MCP dengan profil koneksi yang membaca variabel dari `.env`.
   * Validasi koneksi: ping, list collections.
   * Pastikan tidak ada credential yang tertulis di kode atau history.

2. **Buat guideline form/checklist**

   * Buat file `docs/mcp-mongo-integration-checklist.md` yang berisi:

     * Bagian “Prerequisites” dan validasi lingkungan.
     * Bagian “MCP Connection” dengan tugas granular (enable MCP, set profile, test ping/list).
     * Bagian “Model & Index Audit” untuk semua koleksi utama (Users, Patients, Staff, Treatments, Bookings, Walk-in queue, Withdrawals).
     * Bagian “Dummy Data Plan” yang mendefinisikan cakupan dataset untuk mengisi seluruh fitur: jumlah dan variasi record, rentang tanggal, status, relasi silang (patient ↔ booking ↔ staff ↔ treatment ↔ payment/withdrawal).
     * Bagian “Seeding Execution” dengan urutan pengerjaan, verifikasi jumlah record, dan checklist integritas relasi.
     * Bagian “Feature Integration Tests” per menu: Dashboard, Calendar (termasuk stacking bookings dan klik detail), Clients/Patients, Staff, Treatments, Walk-in, Withdrawal, Auth. Tiap menu punya sub-checklist behavior yang harus lolos.
     * Bagian “Performance & Index” untuk memastikan query umum cepat dan index relevan aktif.
     * Bagian “Observability & Error Handling”.
     * Bagian “UAT & Regression”.
     * Bagian “Acceptance Criteria” global serta kriteria kelulusan per fitur.
   * Pastikan checklist berbentuk checkbox yang bisa ditandai, tapi kamu juga menyertakan keterangan langkah yang jelas, dependencies antar langkah, dan hasil yang diharapkan.

3. **Audit model dan index**

   * Enumerasi koleksi dan field kunci yang mempengaruhi pencarian, filter, dan join aplikasi.
   * Usulkan dan terapkan index yang diperlukan untuk skenario kalender, pencarian pasien, filter staff/skills, dan laporan finansial.
   * Catat index di checklist.

4. **Rancang dan muat dummy data (via MCP)**

   * Buat dataset yang memastikan seluruh fitur “hidup”:

     * Users: minimal admin, beberapa staff, receptionist, dengan role yang benar.
     * Patients: cukup banyak untuk uji pencarian, validasi duplikat, dan riwayat.
     * Treatments: beragam kategori, durasi, pricing.
     * Bookings: termasuk skenario **stacking** pada slot yang sama, variasi status dan sumber, serta durasi overlap untuk uji drag & drop.
     * Walk-in queue: kombinasi pasien baru dan existing.
     * Withdrawals: cukup data untuk uji earnings/penarikan.
     * Payment status: unpaid, deposit, paid yang terhubung ke bookings.
     * Rentang tanggal: −30 hari sampai +30 hari untuk uji kalender dan filter.
   * Jalankan seeding benar-benar melalui MCP (bukan koneksi langsung), sertai validasi hitungan record dan sampel query untuk membuktikan keterisian.

5. **Verifikasi integrasi fitur**

   * Pastikan setiap menu memuat data yang sesuai, aksi CRUD berjalan, dan relasi silang tersinkron:

     * Booking dari Walk-in muncul di Calendar dan Patient History.
     * Perubahan status payment tercermin pada finansial/withdrawal bila relevan.
     * Proteksi penghapusan entitas yang masih direferensikan.
     * Role-based access efektif di API dan UI.
   * Laporkan hasil verifikasi sebagai centang pada checklist, tambahkan catatan temuan jika ada.

6. **Kinerja dan observabilitas**

   * Konfirmasi index membuat query umum responsif.
   * Pastikan logging error server-side aktif, pesan UI informatif saat gagal.

7. **Lengkapi Acceptance Criteria**

   * Definisikan kriteria kelulusan yang objektif untuk tiap fitur dan untuk keseluruhan integrasi.
   * Tandai selesai hanya jika semua kriteria terpenuhi.

Ekspektasi output dari kamu:

* File `docs/mcp-mongo-integration-checklist.md` berisi form/checklist detail seperti di atas.
* Konfigurasi MCP siap pakai yang membaca `.env`, terdokumentasi singkat di checklist.
* Database terisi dummy data komprehensif sehingga seluruh fitur dapat diuji end-to-end.
* Semua item checklist yang bisa kamu otomasi, tolong otomatisasi; sisanya beri instruksi manual yang jelas.
* Ringkasan hasil uji dan rekomendasi lanjutan bila ada gap.

Batasan dan kualitas:

* Jangan menyalin nilai `.env` ke commit atau log.
* Gunakan MCP untuk seluruh operasi DB.
* Jaga konsistensi relasi, integritas referensial, dan performa query.
* Dokumentasi harus cukup bagi engineer lain untuk mengulangi proses di lingkungan mereka.

Setelah selesai, tampilkan ringkasan progres dan tautkan ke file checklist. Jika ada asumsi yang kamu buat, tulis di bagian “Notes” pada dokumen tersebut.
