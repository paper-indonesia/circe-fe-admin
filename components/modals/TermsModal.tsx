"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  // This is intentionally empty - content is rendered directly in JSX below

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 px-8 py-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white mb-1">
                Terms & Conditions
              </DialogTitle>
              <DialogDescription className="text-white/90 text-sm">
                Syarat & Ketentuan Penggunaan Platform Reserva
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Metadata */}
          <div className="relative mt-4 flex items-center gap-4 text-xs text-white/80">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              Effective: January 2025
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              Version 1.0
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          <div className="h-full overflow-y-auto px-8 py-6">
            <div className="space-y-6">
              {/* Important Notice */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong>Pemberitahuan Penting:</strong> Dengan menggunakan Platform Reserva, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi dokumen ini serta Kebijakan Privasi kami.
                </p>
              </div>

              {/* Section 1: DEFINISI */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">1</span>
                  DEFINISI
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Aplikasi Pelanggan:</strong> Aplikasi mobile dan/atau situs web yang digunakan Pengguna Akhir untuk membuat akun, menelusuri layanan, dan melakukan Pemesanan.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Konsol Admin:</strong> Dashboard berbasis web untuk Mitra mengelola outlet, staf, jadwal, produk/layanan, dan transaksi.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Mitra:</strong> Entitas bisnis (klinik, salon, spa, atau penyedia layanan lainnya) yang terdaftar di Platform untuk menawarkan layanannya kepada Pengguna Akhir.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Pengguna Akhir (End-User):</strong> Individu yang menggunakan Aplikasi Pelanggan untuk memesan layanan dari Mitra.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Pengguna Admin:</strong> Staf atau pemilik Mitra yang menggunakan Konsol Admin.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Pengguna:</strong> Mencakup Pengguna Akhir dan Pengguna Admin.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Pemesanan (Booking):</strong> Reservasi layanan pada tanggal dan waktu tertentu yang dilakukan melalui Platform.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Deposit:</strong> Pembayaran uang muka untuk mengamankan slot Pemesanan, yang dapat bersifat dapat dikembalikan (refundable) atau tidak dapat dikembalikan (non-refundable) sesuai Kebijakan Mitra.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Kebijakan Mitra:</strong> Ketentuan khusus yang ditetapkan masing-masing Mitra terkait pembatalan, pengembalian dana, keterlambatan, dan hal-hal lain yang ditampilkan pada saat proses pemesanan.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Layanan Platform:</strong> Seluruh fitur, fungsi, konten, dan layanan yang disediakan melalui Aplikasi Pelanggan dan Konsol Admin.
                  </div>
                  <div className="pl-4 border-l-2 border-purple-200 py-2">
                    <strong>Keadaan Kahar (Force Majeure):</strong> Peristiwa di luar kendali wajar para pihak, termasuk namun tidak terbatas pada bencana alam, pandemi, perang, kerusuhan, pemogokan massal, gangguan jaringan telekomunikasi nasional, kebijakan pemerintah yang membatasi operasional, atau peristiwa luar biasa lainnya yang diakui secara hukum.
                  </div>
                </div>
              </div>

              {/* Section 2: RUANG LINGKUP & PERSETUJUAN */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">2</span>
                  RUANG LINGKUP & PERSETUJUAN
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">2.1 Persetujuan Syarat</h4>
                    <p className="text-sm text-gray-700 mb-2">Dengan membuat akun, mengakses, atau menggunakan Layanan Platform (baik Aplikasi Pelanggan maupun Konsol Admin), Anda menyatakan bahwa:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li>Anda telah membaca dan memahami Syarat & Ketentuan ini</li>
                      <li>Anda menyetujui untuk terikat pada seluruh ketentuan dalam dokumen ini</li>
                      <li>Anda telah membaca dan menyetujui Kebijakan Privasi kami</li>
                      <li>Jika Anda mewakili suatu entitas/perusahaan, Anda memiliki wewenang yang sah untuk mengikat entitas tersebut</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">2.2 Penerimaan Elektronik</h4>
                    <p className="text-sm text-gray-700 mb-2">Persetujuan Anda terhadap Syarat ini dapat dilakukan melalui:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li>Mencentang kotak persetujuan (checkbox) saat registrasi</li>
                      <li>Mengklik tombol "Setuju" atau "Daftar"</li>
                      <li>Menggunakan Layanan Platform secara berkelanjutan</li>
                    </ul>
                    <p className="text-sm text-gray-700 mt-2">Penerimaan elektronik ini memiliki kekuatan hukum yang setara dengan tanda tangan manual sesuai UU No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE) sebagaimana telah diubah dengan UU No. 19 Tahun 2016.</p>
                  </div>
                </div>
              </div>

              {/* Section 3: KELAYAKAN & AKUN */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">3</span>
                  KELAYAKAN & AKUN
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">3.1 Kelayakan Pengguna</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li>Pengguna Akhir harus berusia minimal 18 tahun atau 17 tahun dengan persetujuan orang tua/wali yang sah</li>
                      <li>Pengguna Admin harus berusia minimal 18 tahun dan memiliki kewenangan hukum untuk mewakili Mitra</li>
                      <li>Pengguna harus merupakan warga negara Indonesia atau warga negara asing yang secara sah berada di Indonesia</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">3.2 Verifikasi Identitas</h4>
                    <p className="text-sm text-gray-700 mb-2">Kami berhak meminta dokumen identitas (KTP, Paspor, atau dokumen sah lainnya) untuk tujuan:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li>Verifikasi akun</li>
                      <li>Pencegahan penipuan</li>
                      <li>Kepatuhan terhadap peraturan Anti Pencucian Uang (APU) dan Pencegahan Pendanaan Terorisme (PPT)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">3.3 Tanggung Jawab Akun</h4>
                    <p className="text-sm text-gray-700 mb-2">Anda bertanggung jawab untuk:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li>Menjaga kerahasiaan username, password, dan kredensial akun lainnya</li>
                      <li>Semua aktivitas yang terjadi di bawah akun Anda</li>
                      <li>Memberikan informasi yang akurat, lengkap, dan terkini</li>
                      <li>Memperbarui informasi akun jika terjadi perubahan</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 4: HUBUNGAN PARA PIHAK & MODEL BISNIS */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">4</span>
                  HUBUNGAN PARA PIHAK & MODEL BISNIS
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">4.1 Status Reserva sebagai Platform</h4>
                    <p className="text-sm text-gray-700 mb-2">Reserva adalah penyedia platform teknologi yang memfasilitasi hubungan antara Pengguna Akhir dengan Mitra. Reserva BUKAN:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li>Penyedia layanan kesehatan, kecantikan, atau layanan lain yang ditawarkan Mitra</li>
                      <li>Agen, karyawan, atau mitra usaha dari Mitra</li>
                      <li>Pihak dalam kontrak penyediaan layanan antara Pengguna Akhir dan Mitra</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">4.2 Tanggung Jawab Mitra</h4>
                    <p className="text-sm text-gray-700 mb-2">Mitra bertanggung jawab penuh atas:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li><strong>Legalitas operasional:</strong> Kepemilikan izin usaha, izin praktik, dan perizinan lain yang diwajibkan oleh peraturan perundang-undangan</li>
                      <li><strong>Kualitas layanan:</strong> Standar profesional, kompetensi staf, kebersihan, keamanan, dan kesesuaian layanan dengan deskripsi</li>
                      <li><strong>Penetapan harga:</strong> Akurasi harga, pajak, dan biaya tambahan</li>
                      <li><strong>Kepatuhan hukum:</strong> Perlindungan konsumen, standar industri, regulasi kesehatan (jika berlaku), dan peraturan ketenagakerjaan</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 5: PEMESANAN, PERUBAHAN, DAN PEMBATALAN */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">5</span>
                  PEMESANAN, PERUBAHAN, DAN PEMBATALAN
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">5.1 Proses Pemesanan</h4>
                    <p className="text-sm text-gray-700 mb-2">Pemesanan dianggap sah dan mengikat setelah:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li>Sistem menampilkan konfirmasi pemesanan dengan nomor booking unik</li>
                      <li>Notifikasi konfirmasi dikirim ke email/nomor telepon terdaftar</li>
                      <li>Pembayaran (jika diperlukan) berhasil diproses</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">5.2 Perubahan Jadwal (Reschedule)</h4>
                    <p className="text-sm text-gray-700 mb-2">Perubahan jadwal tunduk pada ketersediaan slot dan kebijakan Mitra (minimal 24 jam sebelum jadwal).</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">5.3 Pembatalan oleh Pengguna Akhir</h4>
                    <p className="text-sm text-gray-700 mb-2">Kebijakan pembatalan ditentukan oleh masing-masing Mitra:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li><strong>Pembatalan gratis:</strong> {'>'} 48 jam sebelum jadwal</li>
                      <li><strong>Dengan potongan:</strong> 24-48 jam sebelum jadwal (deposit dikembalikan 50%)</li>
                      <li><strong>Tidak dapat dibatalkan:</strong> {'<'} 24 jam sebelum jadwal (deposit hangus)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">5.4 Keterlambatan dan No-Show</h4>
                    <p className="text-sm text-gray-700">Batas toleransi keterlambatan umumnya 10-15 menit. Mitra berhak mempersingkat durasi layanan atau membatalkan dengan deposit hangus untuk keterlambatan {'>'} 30 menit tanpa pemberitahuan.</p>
                  </div>
                </div>
              </div>

              {/* Section 6: HARGA, PEMBAYARAN, DAN DEPOSIT */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">6</span>
                  HARGA, PEMBAYARAN, DAN DEPOSIT
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">6.1 Penetapan Harga</h4>
                    <p className="text-sm text-gray-700">Harga layanan ditentukan sepenuhnya oleh Mitra dan dapat berbeda antar outlet. Harga yang telah dikonfirmasi tidak akan berubah.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">6.2 Metode Pembayaran</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li>Virtual Account (BCA, Mandiri, BNI, BRI)</li>
                      <li>Kartu Kredit/Debit (Visa, Mastercard, JCB)</li>
                      <li>E-Wallet (OVO, ShopeePay, GoPay)</li>
                      <li>QRIS</li>
                      <li>Pembayaran di Tempat (jika diaktifkan Mitra)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">6.3 Deposit</h4>
                    <p className="text-sm text-gray-700">Deposit adalah pembayaran uang muka (umumnya 20%-50% dari total harga) untuk mengamankan slot. Jenis: <strong>Refundable</strong> (dapat dikembalikan jika pembatalan memenuhi syarat) atau <strong>Non-refundable</strong> (tidak dapat dikembalikan).</p>
                  </div>
                </div>
              </div>

              {/* Section 7-8: KONTEN & ATURAN PENGGUNAAN */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">7</span>
                  KONTEN, IKLAN, DAN MATERI INFORMASI
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>Materi informasi dalam Platform bersifat umum dan untuk tujuan edukasi. Reserva tidak memberikan diagnosis medis atau saran medis. Pengguna dapat mengunggah konten (foto profil, ulasan, rating) dan memberikan lisensi non-eksklusif kepada Reserva untuk menyimpan dan menampilkan konten tersebut.</p>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg mt-2">
                    <p className="text-sm text-amber-900">
                      <strong>Penting:</strong> Ulasan harus jujur berdasarkan pengalaman pribadi. Dilarang memberikan ulasan palsu atau berbayar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">8</span>
                  ATURAN PENGGUNAAN & LARANGAN
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Dilarang Keras:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li><strong>Gangguan Sistem:</strong> Serangan DDoS, SQL injection, bot, scraper tanpa izin</li>
                      <li><strong>Penyalahgunaan Transaksi:</strong> Penipuan pembayaran, chargeback tidak berdasar, manipulasi sistem</li>
                      <li><strong>Konten Terlarang:</strong> Malware, pornografi, SARA, hoax, spam, phishing</li>
                      <li><strong>Penyalahgunaan Data:</strong> Mengumpulkan data pribadi tanpa izin, menjual data pengguna</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                    <p className="text-sm text-red-900">
                      <strong>Konsekuensi:</strong> Pelanggaran dapat mengakibatkan penangguhan/penutupan akun permanen, pelaporan ke pihak berwajib, dan tuntutan hukum.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 9: PRIVASI */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">9</span>
                  PRIVASI & PERLINDUNGAN DATA PRIBADI
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>Pengumpulan, penggunaan, dan penyimpanan data pribadi diatur dalam Kebijakan Privasi kami sesuai UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP).</p>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Hak-Hak Anda:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Hak Akses: Mendapatkan konfirmasi dan salinan data</li>
                      <li>Hak Perbaikan: Meminta koreksi data yang tidak akurat</li>
                      <li>Hak Penghapusan: Meminta penghapusan data (dalam kondisi tertentu)</li>
                      <li>Hak Portabilitas: Menerima data dalam format terstruktur</li>
                      <li>Hak Menolak: Menolak pemrosesan untuk tujuan tertentu</li>
                    </ul>
                  </div>
                  <p className="pt-2">Ajukan permintaan melalui email reservaofficialig@gmail.com. Kami akan merespons dalam 14 hari kerja.</p>
                </div>
              </div>

              {/* Section 10: KETERSEDIAAN LAYANAN */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">10</span>
                  KETERSEDIAAN LAYANAN & PEMELIHARAAN SISTEM
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>Pemeliharaan sistem dilakukan secara berkala (00:00-06:00 WIB). Kami tidak bertanggung jawab atas gangguan akibat <strong>Keadaan Kahar</strong> (Force Majeure) seperti bencana alam, pandemi, perang, kebijakan pemerintah yang membatasi operasional, atau serangan siber skala besar.</p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mt-2">
                    <p className="text-sm text-blue-900">
                      Jika Keadaan Kahar berlangsung {'>'} 30 hari, salah satu pihak dapat mengakhiri perjanjian tanpa penalti.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sections 11-15: Key Business Terms */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">11</span>
                      BIAYA LANGGANAN & PAJAK (UNTUK MITRA)
                    </h3>
                    <p className="text-sm text-gray-700">Mitra dikenakan biaya berlangganan bulanan/tahunan dan biaya transaksi (1%-6%). Keterlambatan pembayaran dapat mengakibatkan penangguhan akses.</p>
                  </div>

                  <div className="pt-3 border-t">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">12</span>
                      HAK KEKAYAAN INTELEKTUAL
                    </h3>
                    <p className="text-sm text-gray-700">Platform dan konten adalah milik Reserva. Pengguna diberikan lisensi terbatas, non-eksklusif, dan dapat dicabut. DILARANG: menyalin, reverse engineering, atau membuat karya turunan dari Platform.</p>
                  </div>

                  <div className="pt-3 border-t">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">13</span>
                      PERNYATAAN & PENYANGKALAN (DISCLAIMER)
                    </h3>
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                      <p className="text-sm text-red-900">
                        <strong>PENTING:</strong> Platform disediakan "sebagaimana adanya" (as is). Reserva TIDAK menjamin ketersediaan 100%, akurasi informasi, atau kualitas layanan Mitra. Reserva TIDAK bertanggung jawab atas hasil perawatan, efek samping, atau sengketa antara Pengguna dan Mitra.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">14</span>
                      BATASAN TANGGUNG JAWAB
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>Reserva TIDAK bertanggung jawab atas kerugian tidak langsung, kehilangan keuntungan, atau kehilangan data.</p>
                      <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                        <p><strong>Batasan Maksimum:</strong> Total tanggung jawab kami tidak melebihi <strong>Rp 1.000.000</strong> atau jumlah yang Anda bayarkan kepada Reserva dalam 3 bulan terakhir (yang lebih besar).</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">15</span>
                      GANTI RUGI (INDEMNIFIKASI)
                    </h3>
                    <p className="text-sm text-gray-700">Anda setuju untuk membebaskan dan mengganti kerugian Reserva dari klaim pihak ketiga yang timbul dari pelanggaran Anda terhadap Syarat ini, konten yang Anda unggah, atau (untuk Mitra) layanan yang Anda berikan.</p>
                  </div>
                </div>
              </div>

              {/* Sections 16-20: Legal & Administrative */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">16</span>
                      PENGAKHIRAN
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">Pengguna dapat menghapus akun kapan saja. Reserva dapat menangguhkan/menutup akun karena pelanggaran, penipuan, atau keterlambatan pembayaran. Data transaksi dapat disimpan untuk kepatuhan hukum meskipun akun ditutup.</p>
                  </div>

                  <div className="pt-3 border-t">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">17</span>
                      HUKUM YANG MENGATUR & PENYELESAIAN SENGKETA
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Hukum:</strong> Hukum Republik Indonesia</p>
                      <p><strong>Yurisdiksi:</strong> Pengadilan Jakarta Pusat</p>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mt-2">
                        <p className="text-sm text-blue-900">
                          <strong>Penyelesaian Bertahap:</strong><br/>
                          1. Musyawarah (30 hari)<br/>
                          2. Mediasi (opsional)<br/>
                          3A. Arbitrase (untuk sengketa B2B dengan Mitra) - BANI Jakarta<br/>
                          3B. Litigasi atau BPSK (untuk sengketa dengan Konsumen)
                        </p>
                      </div>
                      <p className="pt-2"><strong>Pengaduan:</strong> reservaofficialig@gmail.com | Waktu respons: 3x24 jam (konsumen), 2 hari kerja (Mitra)</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">18</span>
                      PERUBAHAN SYARAT & KETENTUAN
                    </h3>
                    <p className="text-sm text-gray-700">Kami berhak mengubah Syarat ini. Untuk perubahan material, Anda akan diberi pemberitahuan melalui email. Penggunaan berkelanjutan Platform setelah perubahan berarti persetujuan Anda.</p>
                  </div>

                  <div className="pt-3 border-t">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">19</span>
                      KETENTUAN UMUM
                    </h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li><strong>Keterpisahan:</strong> Ketentuan yang tidak sah akan dipisahkan tanpa mempengaruhi ketentuan lainnya</li>
                      <li><strong>Keseluruhan Perjanjian:</strong> Syarat ini (+ Kebijakan Privasi) merupakan keseluruhan perjanjian</li>
                      <li><strong>Pengalihan:</strong> Anda tidak boleh mengalihkan hak tanpa persetujuan. Reserva dapat mengalihkan dalam hal merger/akuisisi</li>
                      <li><strong>Pemberitahuan:</strong> Email ke alamat terdaftar atau pengumuman di Platform</li>
                      <li><strong>Bahasa:</strong> Jika terdapat inkonsistensi terjemahan, versi Bahasa Indonesia yang berlaku</li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t">
                    <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 text-sm font-bold">20</span>
                      PERNYATAAN PENUTUP
                    </h3>
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-l-4 border-purple-600 p-4 rounded-r-lg">
                      <p className="text-sm text-purple-900 leading-relaxed">
                        Dengan menggunakan Platform Reserva, Anda mengakui bahwa Anda telah membaca dan memahami Syarat & Ketentuan ini secara keseluruhan, telah diberi kesempatan untuk berkonsultasi dengan penasihat hukum, dan menyetujui untuk terikat pada seluruh ketentuan. Kami berkomitmen menyediakan platform yang aman, andal, dan transparan. <strong>Terima kasih atas kepercayaan Anda!</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Ada Pertanyaan?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Jika ada pertanyaan terkait Terms & Conditions ini, silakan hubungi kami:
                </p>
                <a
                  href="mailto:reservaofficialig@gmail.com"
                  className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                >
                  reservaofficialig@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-white px-8 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
