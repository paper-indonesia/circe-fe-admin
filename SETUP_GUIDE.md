# 🚀 Reserva - Setup Guide untuk User Baru

## 📖 Apa itu Reserva?

**Reserva** adalah platform manajemen booking dan appointment yang dapat digunakan oleh **berbagai jenis bisnis berbasis layanan**:

- 💆 Beauty & Wellness Clinic
- 📚 Tutoring & Education Services
- 💼 Consulting Services
- 💪 Fitness & Training Centers
- 🏥 Healthcare Services
- 💇 Hair & Beauty Salons
- 🧖 Spa & Massage Centers
- ⚙️ Custom Business (tentukan sendiri!)

---

## 🎯 Panduan Setup untuk User Baru

### Step 1: Buat Akun Anda

1. Buka aplikasi Reserva
2. Klik **"Sign Up"** atau **"Create Account"**
3. Isi informasi:
   - **Email**: Email bisnis Anda
   - **Password**: Password yang aman
   - **Business Name**: Nama bisnis Anda (bisa diubah nanti)
4. Klik **"Create Account"**

### Step 2: Onboarding Wizard (Otomatis Muncul)

Setelah login pertama kali, wizard setup akan muncul otomatis:

#### 🏢 Screen 1: Pilih Jenis Bisnis

Pilih jenis bisnis yang paling sesuai:

| Jenis Bisnis | Contoh | Terminology |
|--------------|--------|-------------|
| **Beauty Clinic** 💆 | Klinik kecantikan, spa medis | Staff, Treatments, Clients, Appointments |
| **Education** 📚 | Les privat, bimbel, kursus | Teachers, Subjects, Students, Classes |
| **Consulting** 💼 | Konsultan bisnis, IT, legal | Consultants, Services, Clients, Meetings |
| **Fitness** 💪 | Gym, personal training | Trainers, Programs, Members, Sessions |
| **Healthcare** 🏥 | Klinik medis, terapi | Doctors, Services, Patients, Appointments |
| **Salon** 💇 | Salon rambut, barbershop | Stylists, Services, Clients, Appointments |
| **Spa** 🧖 | Spa, pijat, relaksasi | Therapists, Treatments, Guests, Appointments |
| **Custom** ⚙️ | Bisnis lainnya | Tentukan sendiri! |

**Contoh untuk Tutoring Service:**
```
✅ Pilih: "Education & Tutoring"
✅ System akan suggest:
   - Team → Teachers
   - Services → Subjects
   - Customers → Students
   - Reservations → Classes
```

#### ✏️ Screen 2: Customize Terminology (Opsional)

Jika terminology yang disarankan tidak pas, Anda bisa customize:

```
Contoh untuk Fitness Gym:
- Team Members: Trainers ✓
- Services: Programs ✓
- Customers: Members ✓
- Reservations: Sessions ✓
```

**Tips:** Gunakan bentuk **plural** (jamak):
- ✅ Teachers, Students, Classes
- ❌ Teacher, Student, Class

#### 📂 Screen 3: Tambah Categories

Tambahkan kategori untuk services Anda:

**Contoh untuk Education:**
```
✓ Mathematics
✓ Science
✓ English
✓ Programming
✓ Languages
✓ Arts
```

**Contoh untuk Beauty Clinic:**
```
✓ Facial
✓ Laser
✓ Injectable
✓ Body Treatment
✓ Massage
```

#### ✅ Screen 4: Review & Complete

Review semua settings Anda, lalu klik **"Complete Setup"**

---

## 🎨 Setelah Setup Selesai

Dashboard Anda akan menggunakan terminology yang sudah Anda pilih!

### Untuk Beauty Clinic:
```
📊 Dashboard
📅 Calendar
👥 Clients        ← (bukan Students!)
👨‍⚕️ Staff
🚶 Walk-in
⭐ Treatments    ← (bukan Subjects!)
💰 Withdrawal
⚙️ Settings
```

### Untuk Education Service:
```
📊 Dashboard
📅 Calendar
👥 Students      ← (bukan Clients!)
👨‍🏫 Teachers
🚶 Walk-in
⭐ Subjects      ← (bukan Treatments!)
💰 Withdrawal
⚙️ Settings
```

---

## 📝 Langkah Selanjutnya

Setelah onboarding selesai, mulai isi data Anda:

### 1. Tambah Team Members (Staff/Teachers/Trainers)

```
Navigate to: [Staff/Teachers/Trainers]
Click: "Add [Staff/Teacher/Trainer]"

Isi data:
- Name
- Role
- Email
- Phone
- Photo URL (opsional)
- Skills/Specialization
- Working Schedule
- Assigned Services
```

### 2. Tambah Services (Treatments/Subjects/Programs)

```
Navigate to: [Treatments/Subjects/Programs]
Click: "Add [Treatment/Subject/Program]"

Isi data:
- Service Name
- Category
- Duration (minutes)
- Price
- Photo URL (opsional)
- Description
- Assign Staff
```

### 3. Tambah Customers (Clients/Students/Members)

```
Navigate to: [Clients/Students/Members]
Click: "Add [Client/Student/Member]"

Isi data:
- Name
- Phone
- Email
- Notes (opsional)
```

### 4. Buat Booking/Appointment

```
Navigate to: Calendar or Walk-in
Select: Date & Time
Choose: Customer, Service, Staff
Confirm: Payment & Status
```

---

## 🔒 Keamanan Data Anda

### Data Isolation 100%

Setiap user/bisnis memiliki data yang **TERPISAH SEMPURNA**:

```
User A (Beauty Clinic)        User B (Tutoring)
- 10 Staff                     - 5 Teachers
- 50 Clients                   - 30 Students
- 100 Appointments             - 80 Classes
✓ TIDAK BISA melihat data B    ✓ TIDAK BISA melihat data A
```

### Bagaimana Kami Menjamin Keamanan?

1. **Authentication**: Setiap request diverifikasi dengan JWT token
2. **Authorization**: Setiap query filtered by `ownerId` (user ID Anda)
3. **Database Indexes**: Optimized untuk performa & keamanan
4. **No Cross-Access**: Mustahil melihat data user lain

```typescript
// Contoh: Setiap query SELALU include ownerId
const staff = await Staff.find({ ownerId: YOUR_USER_ID })
const bookings = await Booking.find({ ownerId: YOUR_USER_ID })
```

---

## 💡 Tips & Best Practices

### 1. Terminology yang Tepat

Pilih terminology yang **familiar** untuk team Anda:
- ✅ Jika bisnis education → gunakan "Teachers" & "Students"
- ✅ Jika bisnis fitness → gunakan "Trainers" & "Members"
- ❌ Jangan gunakan istilah yang membingungkan team

### 2. Categories yang Jelas

Buat categories yang **spesifik** dan **mudah dimengerti**:
- ✅ "Basic Math", "Advanced Math", "Calculus"
- ❌ "Math 1", "Math 2", "Math 3" (kurang deskriptif)

### 3. Consistent Naming

Gunakan naming yang **konsisten**:
- ✅ "Deep Cleansing Facial", "Anti-Aging Facial"
- ❌ "Facial Deep Cleansing", "Anti Aging Facial" (format berbeda)

### 4. Staff Assignment

Assign staff ke services yang **sesuai expertise** mereka:
- ✅ Math Teacher → Math Subjects only
- ✅ Facial Specialist → Facial Treatments only
- ❌ Assign semua staff ke semua services (inefficient)

### 5. Pricing Strategy

Set harga yang **realistic** dan **consistent**:
- ✅ Basic: Rp 150,000 | Standard: Rp 250,000 | Premium: Rp 500,000
- ❌ Random pricing tanpa pattern

---

## 🔄 Mengubah Settings

Jika ingin mengubah terminology atau categories:

```
1. Navigate to: Settings
2. Find: Business Settings / Terminology
3. Update: Terminology, Categories, Business Info
4. Save: Changes will apply immediately
```

---

## 📊 Contoh Real-World

### Case 1: "Glow Aesthetics" - Beauty Clinic

```yaml
Business Type: Beauty & Wellness Clinic
Team: 8 Beauty Therapists
Services: 25 Treatments (Facial, Laser, Injectable)
Clients: 500+ active clients
Daily Bookings: 40-50 appointments

Terminology:
  - Staff: "Beauty Therapists"
  - Services: "Treatments"
  - Customers: "Clients"
  - Reservations: "Appointments"
```

### Case 2: "Smart Kids Academy" - Tutoring Service

```yaml
Business Type: Education & Tutoring
Team: 12 Teachers
Services: 30 Subjects (Math, English, Science, etc)
Students: 200+ active students
Daily Classes: 60-70 sessions

Terminology:
  - Staff: "Teachers"
  - Services: "Subjects"
  - Customers: "Students"
  - Reservations: "Classes"
```

### Case 3: "Iron Paradise" - Fitness Gym

```yaml
Business Type: Fitness & Training
Team: 6 Personal Trainers
Programs: 15 Programs (Weight Loss, Muscle Building, etc)
Members: 350+ active members
Daily Sessions: 45-55 sessions

Terminology:
  - Staff: "Personal Trainers"
  - Services: "Programs"
  - Customers: "Members"
  - Reservations: "Training Sessions"
```

**Semua menggunakan Reserva, data 100% terpisah!**

---

## 🆘 Troubleshooting

### Issue: Onboarding wizard tidak muncul

**Solution:**
1. Logout dan login kembali
2. Clear browser cache
3. Atau navigate manual ke: `/settings` dan setup dari sana

### Issue: Terminology tidak berubah

**Solution:**
1. Refresh halaman (F5)
2. Clear browser cache
3. Verify di Settings bahwa onboarding sudah completed

### Issue: Data tidak muncul

**Solution:**
1. Verify Anda sudah add data (staff, services, clients)
2. Check internet connection
3. Logout dan login kembali

---

## 📞 Support

Butuh bantuan? Hubungi kami:

- **Email**: support@reserva.app
- **Dokumentasi**: https://docs.reserva.app
- **Community**: https://community.reserva.app

---

## 🎉 Selamat!

Anda sudah siap menggunakan Reserva untuk bisnis Anda!

**Next Steps:**
1. ✅ Selesaikan onboarding wizard
2. ✅ Tambah team members pertama
3. ✅ Tambah services/programs
4. ✅ Tambah customers pertama
5. ✅ Buat booking pertama!

---

**Happy Managing with Reserva! 🚀**

*Version 2.0.0 - Multi-Tenant Release*
*Last Updated: January 2025*