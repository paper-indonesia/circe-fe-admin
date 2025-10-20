"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-5xl mx-auto p-6 py-12">
        {/* Header */}
        <div className={`mb-8 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
          <Link href="/signup">
            <Button variant="ghost" className="mb-6 gap-2 hover:gap-3 transition-all">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign Up
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600 mt-1">Kebijakan Privasi Platform Reserva</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Effective Date: January 2025</span>
            <span>•</span>
            <span>Version 1.0</span>
          </div>
        </div>

        {/* Content Card */}
        <Card className={`border-0 shadow-xl ${mounted ? 'animate-fadeIn' : 'opacity-0'} animate-delay-100`}>
          <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-2xl">Kebijakan Privasi</CardTitle>
            <CardDescription>
              Kebijakan ini menjelaskan cara kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi data pribadi saat Anda menggunakan Platform Reserva.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] overflow-y-auto px-6 py-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-justify">
                  {privacyContent}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className={`mt-8 text-center ${mounted ? 'animate-fadeIn' : 'opacity-0'} animate-delay-200`}>
          <p className="text-sm text-gray-600 mb-4">
            Jika ada pertanyaan terkait Kebijakan Privasi ini, silakan hubungi kami:
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <a href="mailto:reservaofficialig@gmail.com" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
              <Mail className="h-4 w-4" />
              reservaofficialig@gmail.com
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`mt-8 flex items-center justify-center gap-4 ${mounted ? 'animate-fadeIn' : 'opacity-0'} animate-delay-300`}>
          <Link href="/signin">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
              I Accept - Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
