# Transkrip Pengembangan Website NihonGo!
**Tanggal:** Januari 2026
**Proyek:** Aplikasi Belajar Bahasa Jepang (NihonGo!)
**Pengembang:** Dina Amalina
**Asisten:** AI Assistant (Antigravity)


### Sesi 1: Inisialisasi Proyek (Pembuatan Awal)

**User:**
"Buat sebuah aplikasi web belajar Bahasa Jepang yang dimulai dari penulisan huruf Hiragana dan Katakana, pelafalan dengan audio, serta pemahaman kosakata dan kalimat dasar, lalu berkembang ke materi tingkat lanjutan seperti Kanji, tata bahasa, membaca teks, dan pemahaman konteks percakapan. Aplikasi menyediakan latihan menulis, mendengar, membaca, dan kuis interaktif, dilengkapi progres belajar bertahap, umpan balik langsung, serta tampilan yang sederhana, edukatif, dan responsif untuk pemula hingga tingkat lanjut."

**AI Assistant:**
"Baik, saya akan menjawab permintaan Anda dan segera membuatkan website belajar Bahasa Jepang sesuai perintah dengan spesifikasi berikut:

1.  **Struktur Data (JSON)**: Menyiapkan database hirarkis untuk Hiragana, Katakana, Vocabulary, Kanji (N5), Latihan dan  progres pengguna
2.  **Dashboard Utama**: Menu akses cepat ke materi Hiragana, Katakana, Kanji N5, Kosakata, Percakapan, dan Latihan Menulis.
3.  **Navigasi Pembelajaran**:
    *   Menu 'Pelajaran' diarahkan langsung ke materi Kosakata.
    *   Menu 'Latihan' khusus memuat fitur Kuis Interaktif.
4.  **UI Dasar**: Tampilan edukatif dengan warna dominan  pink bunga sakura juga biru putih dan fitur audio pelafalan."

### Sesi 2: Perubahan Fokus - Mengenal Huruf

**User:**
"Saya ingin mengubah fokus fitur pembelajaran. Hapus fitur 'Latihan Menulis' karena kurang efektif di web. Ganti menjadi 'Mengenal Huruf' yang fokus pada identifikasi visual."

**AI Assistant:**
"Baik, saya telah memodifikasi modul pembelajaran Kana:
1.  **Hapus Canvas**: Menghilangkan fitur canvas/drawing pad untuk menulis.
2.  **Fitur Mengenal Huruf**: Menggantinya dengan penjelasan dari apa itu katakana, hiragana dsn kanji
3.  **UI Update**: Menyederhanakan tampilan agar pengguna dapat memahami materi dengan lebih mudah."

### Sesi 3: Perombakan Menu Latihan (Kuis, Listening, & Kanji)

**User:**
"Saya ingin merombak menu Latihan agar lebih komprehensif. Update fitur Kuis Interaktif menjadi 3 tingkatan (Dasar, Menengah, Lanjut) dengan tampilan bar menu yang baru. Selain itu, buat game 'Listening Quest', fitur 'Ujian Kanji' level JLPT, dan sistem pengacakan soal. Tambahkan penulisan Bahasa Jepang 'Konnichiwa' pada header dashboard."

**AI Assistant:**
"Menu Latihan dan tampilan Dashboard telah diperbarui:
1.  **UI Updates**: 
    *   Memperbarui tampilan bar pada Menu Latihan agar lebih navigatif.
    *   Menambahkan teks Jepang (こんにちは) di bawah sapaan 'Kon'nichiwa' pada Dashboard.
2.  **Kuis Bertingkat**: Membagi materi kuis kosakata/tata bahasa menjadi Level Dasar, Menengah, dan Lanjut.
3.  **Listening Quest**: Menambahkan mode permainan tebak audio/suara.
4.  **Ujian Kanji JLPT**: Integrasi materi Kanji N5-N1 ke dalam mode ujian khusus.
5.  **Sistem Pengacakan**: Implementasi algoritma shuffle untuk soal dan jawaban."

### Sesi 4: Navigasi & Keamanan Latihan (Exit Feature)

**User:**
"Tambahkan fitur navigasi yang aman. Saya ingin ada tombol 'Kembali' di setiap halaman menu. Khusus untuk halaman yang sedang aktif (seperti Kuis, Listening Quest, dan Ujian Kanji), tambahkan tombol 'Keluar' yang memunculkan konfirmasi peringatan sebelum meninggalkan sesi latihan."

**AI Assistant:**
"Permintaan UI/UX dan fitur navigasi telah diselesaikan:
1.  **Tombol Kembali (Back Button)**: Navigasi standar untuk halaman informasi materi dan menu.
2.  **Fitur Keluar (Exit Quiz)**: Menambahkan tombol 'Keluar' dengan ikon panah kiri pada header Kuis, Listening Quest, dan Ujian Kanji.
3.  **Konfirmasi Keamanan**: Saat tombol 'Keluar' ditekan di tengah latihan, muncul pesan konfirmasi (*'Keluar dari kuis? Progres tidak akan disimpan'*) untuk mencegah ketidaksengajaan.
4.  **Halaman Tentang & Fix Progres**: Implementasi halaman About dan perbaikan logika hitung progres."

### Sesi 5: Ekspansi Konten (Kosakata & Percakapan)

**User:**
"Konten saat ini masih terlalu sedikit. Tolong tambahkan ratusan kosakata baru (Kata Benda, Kerja, Sifat) dan skenario percakapan sehari-hari agar materi belajar lebih bervariasi."

**AI Assistant:**
"Database materi telah diperluas secara signifikan:
1.  **Kosakata (Vocab)**: Menambahkan 100+ kata baru meliputi kategori Keluarga, Makanan, Alam, Sekolah, dan Profesi.
2.  **Percakapan (Conversation)**: Menambahkan skenario dialog baru seperti 'Perkenalan Diri', 'Memesan Makanan', dan 'Menanyakan Jalan' yang dilengkapi audio.
3.  **Struktur Data**: Menggabungkan berbagai tipe kata benda menjadi kategori tunggal 'Meishi' untuk efisiensi."

### Sesi 6: Implementasi Sistem Login, Fitur Checklist & Detail Progres

**User:**
"Terakhir, saya ingin menambahkan fitur Login agar pengguna bisa menyimpan progres belajar mereka secara permanen. Selain itu, tambahkan tombol centang manual pada setiap kartu pelajaran. Update juga tampilan halaman Progres di dashboard agar lebih lengkap, mencakup: Kalender Streak Harian, Tabel Riwayat Belajar, Total Dikudai, Rata-rata Nilai, Total Latihan yang diselesaikan, dan Grafik Distribusi Penguasaan."

**AI Assistant:**
"Sistem autentikasi dan pelacakan progres komprehensif telah ditambahkan:
1.  **Fitur Checklist Kartu**: Menambahkan ikon centang pada pojok setiap kartu materi. Klik untuk menandai sebagai 'Learned' (Dikuasai).
2.  **Manajemen Sesi**: Progres centang ini akan tersimpan permanen di akun pengguna jika sudah Login.
3.  **Dashboard Progres Lanjutan**:
    *   **Kalender Streak**: Visualisasi keaktifan harian (hijau = aktif).
    *   **Analisis Statistik**: Menampilkan metrik 'Total Dikuasai', 'Rata-rata Nilai', dan 'Total Latihan'.
    *   **Distribusi Penguasaan**: Grafik Donat untuk melihat proporsi materi yang sudah vs belum dipelajari.
    *   **Riwayat Belajar**: Tabel log aktivitas yang mencatat kapan dan apa yang dipelajari pengguna."

---

### Sesi 7: Finalisasi Informasi Kontak

**User:**
"Update halaman 'Tentang'. Masukkan nomor WhatsApp saya, dan ganti link Facebook jadi GitHub (akun: dynakom) serta Instagram dan YouTube saya."

**AI Assistant:**
"Informasi kontak telah diperbarui:
-   **WhatsApp**: Terhubung langsung ke API WA.
-   **GitHub**: Ikon dan tautan telah diganti ke profil `dynakom`.
-   **Social Media**: Instagram dan YouTube telah disesuaikan.
Aplikasi siap digunakan."

---
*Transkrip ini dibuat otomatis sebagai dokumentasi pengembangan perangkat lunak.*
