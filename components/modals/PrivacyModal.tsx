"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Shield, X } from "lucide-react"

interface PrivacyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  const privacyContent = `Kebijakan Privasi — Reserva

1) Ruang Lingkup & Siapa Kami
Kebijakan ini menjelaskan cara kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi data pribadi saat Anda menggunakan:
• Aplikasi/Website Pelanggan untuk menjelajah, memesan, dan membayar layanan
• Konsol Admin yang digunakan Mitra (klinik/salon/spa) untuk mengelola outlet, staf, jadwal, produk/layanan, dan transaksi

Reserva menyediakan platform yang menghubungkan Pengguna Akhir (pelanggan) dengan Mitra (outlet). Kecuali dinyatakan lain, untuk operasi platform kami bertindak sebagai Pengendali Data. Untuk data yang diunggah/diinput Mitra tentang pelanggannya di Konsol Admin, Reserva umumnya bertindak sebagai Pemroses Data atas instruksi Mitra (sebagai Pengendali Data).

2) Data Pribadi yang Kami Kumpulkan

a) Data yang Anda berikan:
• Data akun: nama, email, nomor ponsel, kata sandi (hash), foto profil, jenis kelamin/tanggal lahir (opsional)
• Data pemesanan: layanan/outlet/staf yang dipilih, tanggal/waktu, catatan/alergi (opsional), berkas/formulir persetujuan (jika diaktifkan)
• Dukungan pelanggan: pesan, lampiran, umpan balik, skor kepuasan
• Pengguna admin: peran, jabatan, ID karyawan, bidang payroll (opsional), keahlian/sertifikasi, jadwal

b) Data yang dikumpulkan otomatis:
• Data perangkat & penggunaan: versi aplikasi, OS/peramban, pengenal perangkat, alamat IP, stempel waktu, log crash, metrik fitur
• Cookie/SDK: cookie sesi, analitik, preferensi; pengenal seluler untuk push notification
• Lokasi perkiraan: dari IP atau perizinan lokasi untuk fitur seperti outlet terdekat/peta

c) Data dari pihak ketiga:
• Penyedia pembayaran: status pembayaran/token, data kartu termasking, status VA, konfirmasi e‑wallet/QRIS (kami tidak menyimpan nomor kartu penuh)
• Penyedia identitas & pesan: status OTP/verifikasi, status pengiriman WhatsApp/SMS
• Mitra (Outlet): riwayat booking, paket/keanggotaan, invoice/struk, catatan perawatan (sesuai konfigurasi Mitra)

Data sensitif: Dalam konteks klinis/medis, Mitra dapat mencatat informasi yang diperlukan untuk layanan (mis. kontraindikasi). Mitra bertanggung jawab memperoleh persetujuan yang sah dan mematuhi hukum kesehatan/privasi. Reserva memproses data tersebut hanya atas instruksi Mitra.

3) Tujuan Pemrosesan & Dasar Hukum
Kami memproses data pribadi untuk tujuan berikut:
• Menyediakan layanan: pembuatan akun, autentikasi, pemesanan, pembayaran, pengingat/notifikasi
• Mengoperasikan Konsol Admin: set‑up outlet/staf/produk, kalender, pelaporan, audit log
• Komunikasi transaksional: konfirmasi, pengingat, struk melalui email/SMS/WhatsApp/push
• Dukungan & keamanan: pemecahan masalah, pencegahan penipuan/penyalahgunaan, penyelesaian sengketa
• Peningkatan produk & analitik: metrik penggunaan, A/B testing, crash, kualitas layanan
• Pemasaran dengan persetujuan: newsletter, promo, survei (Dapat memilih keluar)
• Kepatuhan: catatan pajak/keuangan, permintaan yang sah, ketentuan regulator

4) Cookie & Teknologi Serupa
Kami menggunakan cookie/SDK untuk mempertahankan sesi, mengingat preferensi, dan mengukur penggunaan. Jika diwajibkan, kami meminta persetujuan untuk cookie non‑esensial. Anda dapat mengelola cookie di pengaturan peramban/perangkat; pemblokiran cookie tertentu dapat memengaruhi fitur.

5) Berbagi & Pengungkapan
Kami dapat membagikan data pribadi dengan:
• Mitra (Outlet): untuk memenuhi pemesanan dan proses purna layanan
• Penyedia layanan: komputasi awan, analitik, pembayaran, komunikasi (email/SMS/WhatsApp), alat dukungan
• Afiliasi & penasihat profesional
• Penegak hukum/regulator: bila diwajibkan hukum atau untuk melindungi hak, keselamatan, dan properti
• Transfer bisnis: sehubungan dengan merger, akuisisi, atau penjualan aset dengan perlindungan yang berkelanjutan

Kami tidak menjual data pribadi Anda.

6) Transfer Internasional
Data Anda dapat diproses di negara lain selain tempat tinggal Anda. Kami menerapkan pengaman yang sesuai (mis. klausul kontraktual, kontrol akses, enkripsi) untuk melindungi data lintas batas.

7) Retensi
Kami menyimpan data pribadi hanya selama diperlukan untuk tujuan di atas, termasuk untuk memenuhi kewajiban hukum/akuntansi/pelaporan.

8) Keamanan
Kami menerapkan langkah administratif, teknis, dan organisasi yang sesuai risiko, termasuk enkripsi saat transit, kontrol akses berbasis peran, audit log, cadangan/DR, dan praktik pengembangan aman. Namun tidak ada metode transmisi/penyimpanan yang 100% aman.

9) Hak Anda
Tunduk pada hukum yang berlaku, Anda berhak untuk: mengakses, memperbaiki, menghapus dalam kondisi tertentu, membatasi/mengajukan keberatan atas pemrosesan, portabilitas data, menarik persetujuan, dan mengajukan keluhan ke regulator.

10) Cara Mengajukan Permintaan
Kirim permintaan ke kontak Pelindungan Data melalui email: reservaofficialig@gmail.com. Kami dapat meminta informasi tambahan untuk memverifikasi identitas. Target waktu respons 30 hari. Beberapa permintaan mungkin dibatasi oleh hukum atau peran kami sebagai pemroses data untuk Mitra (dalam hal ini kami dapat mengarahkan Anda ke Mitra terkait).

11) Anak‑Anak
Layanan tidak ditujukan untuk anak di bawah 18 tahun. Jika Anda meyakini anak mengirimkan data tanpa persetujuan yang semestinya, hubungi kami untuk penghapusan.

12) Tautan & Integrasi Pihak Ketiga
Aplikasi kami dapat berisi tautan atau integrasi pihak ketiga (mis. pembayaran). Praktik privasi mereka diatur oleh kebijakan masing‑masing.

13) WhatsApp/SMS & Komunikasi
Dengan memberikan nomor ponsel, Anda setuju kami dan/atau Mitra yang dipilih dapat mengirim pesan transaksional (konfirmasi, pengingat). Anda dapat mengatur preferensi pemasaran di aplikasi atau mengikuti instruksi opt‑out pada pesan.

14) Tanggung Jawab Mitra (Konsol Admin)
Sebagai pengendali data atas pelanggan mereka, Mitra wajib:
• memperoleh persetujuan/dasar hukum yang diperlukan
• mengonfigurasi retensi & kontrol akses
• menjaga keakuratan & legalitas konten
• merespons permintaan hak subjek data
• menandatangani Perjanjian Pemrosesan Data (DPA) dengan Reserva bila diperlukan

15) Perubahan Kebijakan
Kami dapat memperbarui Kebijakan ini dari waktu ke waktu. Perubahan akan diberitahukan melalui platform atau email.

Terakhir diperbarui: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-8 py-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white mb-1">
                Privacy Policy
              </DialogTitle>
              <DialogDescription className="text-white/90 text-sm">
                Kebijakan Privasi Platform Reserva
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
              {/* Commitment Notice */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong>Komitmen Kami:</strong> Reserva berkomitmen melindungi privasi dan keamanan data pribadi Anda sesuai dengan UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP).
                </p>
              </div>

              {/* Section 1: Ruang Lingkup & Siapa Kami */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-sm font-bold">1</span>
                  RUANG LINGKUP & SIAPA KAMI
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>Kebijakan ini menjelaskan cara kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi data pribadi saat Anda menggunakan:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Aplikasi/Website Pelanggan untuk menjelajah, memesan, dan membayar layanan</li>
                    <li>Konsol Admin yang digunakan Mitra (klinik/salon/spa) untuk mengelola outlet, staf, jadwal, produk/layanan, dan transaksi</li>
                  </ul>
                  <p className="pt-2">Reserva menyediakan platform yang menghubungkan Pengguna Akhir (pelanggan) dengan Mitra (outlet). Kecuali dinyatakan lain, untuk operasi platform kami bertindak sebagai Pengendali Data. Untuk data yang diunggah/diinput Mitra tentang pelanggannya di Konsol Admin, Reserva umumnya bertindak sebagai Pemroses Data atas instruksi Mitra (sebagai Pengendali Data).</p>
                </div>
              </div>

              {/* Section 2: Data Pribadi yang Kami Kumpulkan */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-sm font-bold">2</span>
                  DATA PRIBADI YANG KAMI KUMPULKAN
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">a) Data yang Anda berikan:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li><strong>Data akun:</strong> nama, email, nomor ponsel, kata sandi (hash), foto profil, jenis kelamin/tanggal lahir (opsional)</li>
                      <li><strong>Data pemesanan:</strong> layanan/outlet/staf yang dipilih, tanggal/waktu, catatan/alergi (opsional), berkas/formulir persetujuan (jika diaktifkan)</li>
                      <li><strong>Dukungan pelanggan:</strong> pesan, lampiran, umpan balik, skor kepuasan</li>
                      <li><strong>Pengguna admin:</strong> peran, jabatan, ID karyawan, bidang payroll (opsional), keahlian/sertifikasi, jadwal</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">b) Data yang dikumpulkan otomatis:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li><strong>Data perangkat & penggunaan:</strong> versi aplikasi, OS/peramban, pengenal perangkat, alamat IP, stempel waktu, log crash, metrik fitur</li>
                      <li><strong>Cookie/SDK:</strong> cookie sesi, analitik, preferensi; pengenal seluler untuk push notification</li>
                      <li><strong>Lokasi perkiraan:</strong> dari IP atau perizinan lokasi untuk fitur seperti outlet terdekat/peta</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">c) Data dari pihak ketiga:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                      <li><strong>Penyedia pembayaran:</strong> status pembayaran/token, data kartu termasking, status VA, konfirmasi e‑wallet/QRIS (kami tidak menyimpan nomor kartu penuh)</li>
                      <li><strong>Penyedia identitas & pesan:</strong> status OTP/verifikasi, status pengiriman WhatsApp/SMS</li>
                      <li><strong>Mitra (Outlet):</strong> riwayat booking, paket/keanggotaan, invoice/struk, catatan perawatan (sesuai konfigurasi Mitra)</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
                    <p className="text-sm text-amber-900">
                      <strong>Data sensitif:</strong> Dalam konteks klinis/medis, Mitra dapat mencatat informasi yang diperlukan untuk layanan (mis. kontraindikasi). Mitra bertanggung jawab memperoleh persetujuan yang sah dan mematuhi hukum kesehatan/privasi. Reserva memproses data tersebut hanya atas instruksi Mitra.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Tujuan Pemrosesan & Dasar Hukum */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-sm font-bold">3</span>
                  TUJUAN PEMROSESAN & DASAR HUKUM
                </h3>
                <p className="text-sm text-gray-700 mb-3">Kami memproses data pribadi untuk tujuan berikut:</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="pl-4 border-l-2 border-blue-200 py-2">
                    <strong>Menyediakan layanan:</strong> pembuatan akun, autentikasi, pemesanan, pembayaran, pengingat/notifikasi
                  </div>
                  <div className="pl-4 border-l-2 border-blue-200 py-2">
                    <strong>Mengoperasikan Konsol Admin:</strong> set‑up outlet/staf/produk, kalender, pelaporan, audit log
                  </div>
                  <div className="pl-4 border-l-2 border-blue-200 py-2">
                    <strong>Komunikasi transaksional:</strong> konfirmasi, pengingat, struk melalui email/SMS/WhatsApp/push
                  </div>
                  <div className="pl-4 border-l-2 border-blue-200 py-2">
                    <strong>Dukungan & keamanan:</strong> pemecahan masalah, pencegahan penipuan/penyalahgunaan, penyelesaian sengketa
                  </div>
                  <div className="pl-4 border-l-2 border-blue-200 py-2">
                    <strong>Peningkatan produk & analitik:</strong> metrik penggunaan, A/B testing, crash, kualitas layanan
                  </div>
                  <div className="pl-4 border-l-2 border-blue-200 py-2">
                    <strong>Pemasaran dengan persetujuan:</strong> newsletter, promo, survei (Dapat memilih keluar)
                  </div>
                  <div className="pl-4 border-l-2 border-blue-200 py-2">
                    <strong>Kepatuhan:</strong> catatan pajak/keuangan, permintaan yang sah, ketentuan regulator
                  </div>
                </div>
              </div>

              {/* Section 4: Cookie & Teknologi Serupa */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-sm font-bold">4</span>
                  COOKIE & TEKNOLOGI SERUPA
                </h3>
                <p className="text-sm text-gray-700">Kami menggunakan cookie/SDK untuk mempertahankan sesi, mengingat preferensi, dan mengukur penggunaan. Jika diwajibkan, kami meminta persetujuan untuk cookie non‑esensial. Anda dapat mengelola cookie di pengaturan peramban/perangkat; pemblokiran cookie tertentu dapat memengaruhi fitur.</p>
              </div>

              {/* Section 5: Berbagi & Pengungkapan */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-sm font-bold">5</span>
                  BERBAGI & PENGUNGKAPAN
                </h3>
                <p className="text-sm text-gray-700 mb-3">Kami dapat membagikan data pribadi dengan:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                  <li>Mitra (Outlet): untuk memenuhi pemesanan dan proses purna layanan</li>
                  <li>Penyedia layanan: komputasi awan, analitik, pembayaran, komunikasi (email/SMS/WhatsApp), alat dukungan</li>
                  <li>Afiliasi & penasihat profesional</li>
                  <li>Penegak hukum/regulator: bila diwajibkan hukum atau untuk melindungi hak, keselamatan, dan properti</li>
                  <li>Transfer bisnis: sehubungan dengan merger, akuisisi, atau penjualan aset dengan perlindungan yang berkelanjutan</li>
                </ul>
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg mt-3">
                  <p className="text-sm text-green-900">
                    <strong>Jaminan Kami:</strong> Kami tidak menjual data pribadi Anda.
                  </p>
                </div>
              </div>

              {/* Section 6-9: Other Important Sections */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-700 text-xs font-bold">6</span>
                      Transfer Internasional
                    </h4>
                    <p className="text-sm text-gray-700">Data Anda dapat diproses di negara lain selain tempat tinggal Anda. Kami menerapkan pengaman yang sesuai (mis. klausul kontraktual, kontrol akses, enkripsi) untuk melindungi data lintas batas.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-700 text-xs font-bold">7</span>
                      Retensi
                    </h4>
                    <p className="text-sm text-gray-700">Kami menyimpan data pribadi hanya selama diperlukan untuk tujuan di atas, termasuk untuk memenuhi kewajiban hukum/akuntansi/pelaporan.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-700 text-xs font-bold">8</span>
                      Keamanan
                    </h4>
                    <p className="text-sm text-gray-700">Kami menerapkan langkah administratif, teknis, dan organisasi yang sesuai risiko, termasuk enkripsi saat transit, kontrol akses berbasis peran, audit log, cadangan/DR, dan praktik pengembangan aman. Namun tidak ada metode transmisi/penyimpanan yang 100% aman.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-700 text-xs font-bold">9</span>
                      Hak Anda
                    </h4>
                    <p className="text-sm text-gray-700">Tunduk pada hukum yang berlaku, Anda berhak untuk: mengakses, memperbaiki, menghapus dalam kondisi tertentu, membatasi/mengajukan keberatan atas pemrosesan, portabilitas data, menarik persetujuan, dan mengajukan keluhan ke regulator.</p>
                  </div>
                </div>
              </div>

              {/* Additional Important Sections */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <strong>Cara Mengajukan Permintaan:</strong> Kirim permintaan ke kontak Pelindungan Data melalui email: reservaofficialig@gmail.com. Kami dapat meminta informasi tambahan untuk memverifikasi identitas. Target waktu respons 30 hari.
                  </div>
                  <div>
                    <strong>Anak‑Anak:</strong> Layanan tidak ditujukan untuk anak di bawah 18 tahun. Jika Anda meyakini anak mengirimkan data tanpa persetujuan yang semestinya, hubungi kami untuk penghapusan.
                  </div>
                  <div>
                    <strong>WhatsApp/SMS & Komunikasi:</strong> Dengan memberikan nomor ponsel, Anda setuju kami dan/atau Mitra yang dipilih dapat mengirim pesan transaksional (konfirmasi, pengingat).
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Data Protection Officer</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Untuk pertanyaan terkait privasi atau penggunaan hak Anda, silakan hubungi:
                </p>
                <a
                  href="mailto:reservaofficialig@gmail.com"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
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
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
