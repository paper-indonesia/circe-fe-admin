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
  const termsContent = `PEMBERITAHUAN PENTING
Dokumen ini mengatur hubungan hukum antara Anda dengan Reserva. Mohon baca dengan saksama sebelum menggunakan layanan kami. Dengan menggunakan Platform Reserva, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi dokumen ini serta Kebijakan Privasi kami.

1. DEFINISI
Aplikasi Pelanggan: Aplikasi mobile dan/atau situs web yang digunakan Pengguna Akhir untuk membuat akun, menelusuri layanan, dan melakukan Pemesanan.
Konsol Admin: Dashboard berbasis web untuk Mitra mengelola outlet, staf, jadwal, produk/layanan, dan transaksi.
Mitra: Entitas bisnis (klinik, salon, spa, atau penyedia layanan lainnya) yang terdaftar di Platform untuk menawarkan layanannya kepada Pengguna Akhir.
Pengguna Akhir (End-User): Individu yang menggunakan Aplikasi Pelanggan untuk memesan layanan dari Mitra.
Pengguna Admin: Staf atau pemilik Mitra yang menggunakan Konsol Admin.
Pengguna: Mencakup Pengguna Akhir dan Pengguna Admin.
Pemesanan (Booking): Reservasi layanan pada tanggal dan waktu tertentu yang dilakukan melalui Platform.
Deposit: Pembayaran uang muka untuk mengamankan slot Pemesanan, yang dapat bersifat dapat dikembalikan (refundable) atau tidak dapat dikembalikan (non-refundable) sesuai Kebijakan Mitra.
Kebijakan Mitra: Ketentuan khusus yang ditetapkan masing-masing Mitra terkait pembatalan, pengembalian dana, keterlambatan, dan hal-hal lain yang ditampilkan pada saat proses pemesanan.
Layanan Platform: Seluruh fitur, fungsi, konten, dan layanan yang disediakan melalui Aplikasi Pelanggan dan Konsol Admin.
Keadaan Kahar (Force Majeure): Peristiwa di luar kendali wajar para pihak, termasuk namun tidak terbatas pada bencana alam, pandemi, perang, kerusuhan, pemogokan massal, gangguan jaringan telekomunikasi nasional, kebijakan pemerintah yang membatasi operasional, atau peristiwa luar biasa lainnya yang diakui secara hukum.

2. RUANG LINGKUP & PERSETUJUAN
2.1 Persetujuan Syarat
Dengan membuat akun, mengakses, atau menggunakan Layanan Platform (baik Aplikasi Pelanggan maupun Konsol Admin), Anda menyatakan bahwa:
• Anda telah membaca dan memahami Syarat & Ketentuan ini
• Anda menyetujui untuk terikat pada seluruh ketentuan dalam dokumen ini
• Anda telah membaca dan menyetujui Kebijakan Privasi kami
• Jika Anda mewakili suatu entitas/perusahaan, Anda memiliki wewenang yang sah untuk mengikat entitas tersebut

2.2 Penerimaan Elektronik
Persetujuan Anda terhadap Syarat ini dapat dilakukan melalui:
• Mencentang kotak persetujuan (checkbox) saat registrasi
• Mengklik tombol "Setuju" atau "Daftar"
• Menggunakan Layanan Platform secara berkelanjutan
Penerimaan elektronik ini memiliki kekuatan hukum yang setara dengan tanda tangan manual sesuai UU No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE) sebagaimana telah diubah dengan UU No. 19 Tahun 2016.

3. KELAYAKAN & AKUN
3.1 Kelayakan Pengguna
• Pengguna Akhir harus berusia minimal 18 tahun atau 17 tahun dengan persetujuan orang tua/wali yang sah
• Pengguna Admin harus berusia minimal 18 tahun dan memiliki kewenangan hukum untuk mewakili Mitra
• Pengguna harus merupakan warga negara Indonesia atau warga negara asing yang secara sah berada di Indonesia

3.2 Verifikasi Identitas
Kami berhak meminta dokumen identitas (KTP, Paspor, atau dokumen sah lainnya) untuk tujuan:
• Verifikasi akun
• Pencegahan penipuan
• Kepatuhan terhadap peraturan Anti Pencucian Uang (APU) dan Pencegahan Pendanaan Terorisme (PPT)

3.3 Tanggung Jawab Akun
Anda bertanggung jawab untuk:
• Menjaga kerahasiaan username, password, dan kredensial akun lainnya
• Semua aktivitas yang terjadi di bawah akun Anda
• Memberikan informasi yang akurat, lengkap, dan terkini
• Memperbarui informasi akun jika terjadi perubahan

4. HUBUNGAN PARA PIHAK & MODEL BISNIS
4.1 Status Reserva sebagai Platform
Reserva adalah penyedia platform teknologi yang memfasilitasi hubungan antara Pengguna Akhir dengan Mitra. Reserva BUKAN:
• Penyedia layanan kesehatan, kecantikan, atau layanan lain yang ditawarkan Mitra
• Agen, karyawan, atau mitra usaha dari Mitra
• Pihak dalam kontrak penyediaan layanan antara Pengguna Akhir dan Mitra

4.2 Tanggung Jawab Mitra
Mitra bertanggung jawab penuh atas:
• Legalitas operasional: Kepemilikan izin usaha, izin praktik, dan perizinan lain yang diwajibkan oleh peraturan perundang-undangan
• Kualitas layanan: Standar profesional, kompetensi staf, kebersihan, keamanan, dan kesesuaian layanan dengan deskripsi
• Penetapan harga: Akurasi harga, pajak, dan biaya tambahan
• Kepatuhan hukum: Perlindungan konsumen, standar industri, regulasi kesehatan (jika berlaku), dan peraturan ketenagakerjaan

[Dokumen lengkap tersedia untuk dilihat...]

Untuk informasi lebih lanjut, hubungi kami di reservaofficialig@gmail.com

Terakhir diperbarui: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`

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

              {/* Continuation Notice */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <p className="text-sm text-purple-900 leading-relaxed">
                  <strong>Dokumen Lengkap:</strong> Ini adalah ringkasan dari ketentuan utama. Dokumen lengkap tersedia untuk dilihat dan mencakup pasal-pasal tambahan tentang pemesanan, pembayaran, pembatalan, tanggung jawab, keamanan data, dan ketentuan hukum lainnya.
                </p>
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
