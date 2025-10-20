"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

2.3 Bahasa
Dokumen ini tersedia dalam Bahasa Indonesia. Jika terdapat versi terjemahan, versi Bahasa Indonesia yang berlaku sebagai acuan hukum.

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

[Konten lengkap Terms & Conditions tersedia dalam format lengkap...]

Untuk melihat Terms & Conditions lengkap, hubungi kami di reservaofficialig@gmail.com

Terakhir diperbarui: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
              <p className="text-gray-600 mt-1">Syarat & Ketentuan Penggunaan Platform Reserva</p>
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
          <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600" />
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-2xl">Syarat & Ketentuan Layanan</CardTitle>
            <CardDescription>
              Mohon baca dengan saksama sebelum menggunakan layanan kami. Dengan menggunakan Platform Reserva, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi dokumen ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] overflow-y-auto px-6 py-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-justify">
                  {termsContent}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className={`mt-8 text-center ${mounted ? 'animate-fadeIn' : 'opacity-0'} animate-delay-200`}>
          <p className="text-sm text-gray-600 mb-4">
            Jika ada pertanyaan terkait Terms & Conditions ini, silakan hubungi kami:
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <a href="mailto:reservaofficialig@gmail.com" className="text-purple-600 hover:text-purple-700 font-semibold">
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
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90">
              I Accept - Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
