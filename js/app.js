class NihonGoApp {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navbar = document.querySelector('.navbar');

        // Auth State
        this.users = JSON.parse(localStorage.getItem('nihongo_users')) || {};
        this.currentUser = JSON.parse(localStorage.getItem('nihongo_auth')) || null;

        // Initialize Progress for user
        this.currentQuizIndex = 0;
        this.score = 0;
        this.loadUserProgress();

        this.matchingState = {
            selectedLeft: null,
            matches: 0
        };

        this.init();
    }

    loadUserProgress() {
        if (this.currentUser && this.users[this.currentUser]) {
            this.progress = this.users[this.currentUser].progress;
        } else {
            // Load guest progress if exists, otherwise fresh start
            const guestData = JSON.parse(localStorage.getItem('nihongo_guest_progress'));
            this.progress = guestData || {
                learned: [],
                daily: [0, 0, 0, 0, 0, 0, 0]
            };
        }
    }

    saveProgress() {
        if (this.currentUser) {
            this.users[this.currentUser].progress = this.progress;
            localStorage.setItem('nihongo_users', JSON.stringify(this.users));
        } else {
            // Save to guest progress
            localStorage.setItem('nihongo_guest_progress', JSON.stringify(this.progress));
        }
    }

    toggleLearned(id, event) {
        if (event) event.stopPropagation();
        const index = this.progress.learned.indexOf(id);
        if (index > -1) {
            this.progress.learned.splice(index, 1);
        } else {
            this.progress.learned.push(id);

            // Log to History
            if (!this.progress.quizHistory) {
                this.progress.quizHistory = [];
            }

            let category = 'Materi';
            let title = id;
            if (id.startsWith('vocab-')) {
                category = 'Kosakata';
                title = id.replace('vocab-', '');
            } else if (id.startsWith('kanji-')) {
                category = 'Kanji';
                title = id.replace('kanji-', '');
            } else if (id.startsWith('kana-')) {
                category = 'Kana';
                title = id.replace('kana-', '').replace('hiragana-', '').replace('katakana-', '');
            }

            this.progress.quizHistory.push({
                date: new Date().toISOString(),
                type: 'learn',
                category: category,
                score: '-',
                total: 1,
                percentage: 100,
                title: title
            });
        }
        this.saveProgress();
        this.handleRouting(); // Re-render current page
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();
        this.setupNav();
    }

    setupNav() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const hash = link.getAttribute('href');
                this.updateNavLinks(hash);
            });
        });
    }

    updateNavLinks(activeHash) {
        this.navLinks.forEach(link => {
            if (link.getAttribute('href') === activeHash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    handleRouting() {
        const hash = window.location.hash || '#dashboard';

        // Update Nav visibility - ALWAYS show nav now
        if (this.navbar) {
            this.navbar.style.display = 'flex';
            this.updateNavLinks(hash);
        }

        // Update Auth Button Text
        const authBtn = document.getElementById('nav-auth-btn');
        if (authBtn) {
            authBtn.textContent = this.currentUser ? 'Keluar' : 'Masuk';
            authBtn.setAttribute('href', this.currentUser ? 'javascript:app.handleLogout()' : '#login');
        }

        if (hash === '#login') {
            this.renderLogin();
            return;
        }
        if (hash === '#signup') {
            this.renderSignup();
            return;
        }

        switch (hash) {
            case '#dashboard':
                this.renderDashboard();
                break;
            case '#lessons':
                this.renderLessons();
                break;
            case '#quiz':
                this.renderLevelMenu();
                break;
            case '#hiragana':
                this.renderKana('hiragana');
                break;
            case '#katakana':
                this.renderKana('katakana');
                break;
            case '#kanji':
                this.renderKanji();
                break;
            case '#conversation':
                this.renderConversation();
                break;
            case '#intro':
                this.renderAboutScripts();
                break;
            case '#profile':
                this.renderProfile();
                break;
            case '#about':
                this.renderAboutPlatform();
                break;
            default:
                this.renderDashboard();
        }

        lucide.createIcons();
    }

    renderLogin() {
        this.mainContent.innerHTML = `
            <div class="auth-container text-center">
                <span style="font-size: 3rem;">🎌</span>
                <h1 style="margin-top: 1rem;">Masuk NihonGo!</h1>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Simpan progres belajarmu sekarang.</p>
                
                <form onsubmit="app.handleLogin(event)">
                    <div class="auth-input-group">
                        <label>Nama Pengguna</label>
                        <input type="text" id="login-username" class="auth-input" placeholder="Masukkan nama..." required>
                    </div>
                    <div class="auth-input-group">
                        <label>Kata Sandi</label>
                        <div style="position: relative;">
                            <input type="password" id="login-password" class="auth-input" placeholder="********" required style="padding-right: 40px;">
                            <button type="button" onclick="app.togglePasswordVisibility('login-password')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted);">
                                <i data-lucide="eye" id="icon-login-password" style="width: 20px; height: 20px;"></i>
                            </button>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem;">Masuk Sekarang</button>
                </form>
                
                <div class="auth-switch">
                    Belum punya akun? <a onclick="location.hash='#signup'">Daftar Gratis</a>
                </div>
            </div>
        `;
    }

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById('icon-' + inputId);

        if (input.type === 'password') {
            input.type = 'text';
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = 'password';
            icon.setAttribute('data-lucide', 'eye');
        }
        lucide.createIcons();
    }

    renderSignup() {
        this.mainContent.innerHTML = `
            <div class="auth-container text-center">
                <span style="font-size: 3rem;">✨</span>
                <h1 style="margin-top: 1rem;">Daftar Akun</h1>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Mulai perjalanan belajarmu hari ini.</p>
                
                <form onsubmit="app.handleSignup(event)">
                    <div class="auth-input-group">
                        <label>Nama Lengkap</label>
                        <input type="text" id="signup-name" class="auth-input" placeholder="Nama Anda..." required>
                    </div>
                    <div class="auth-input-group">
                        <label>Nama Pengguna</label>
                        <input type="text" id="signup-username" class="auth-input" placeholder="Untuk login..." required>
                    </div>
                    <div class="auth-input-group">
                        <label>Kata Sandi</label>
                        <div style="position: relative;">
                            <input type="password" id="signup-password" class="auth-input" placeholder="Min. 6 karakter" required minlength="6" style="padding-right: 40px;">
                            <button type="button" onclick="app.togglePasswordVisibility('signup-password')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted);">
                                <i data-lucide="eye" id="icon-signup-password" style="width: 20px; height: 20px;"></i>
                            </button>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem;">Daftar & Belajar</button>
                </form>
                
                <div class="auth-switch">
                    Sudah punya akun? <a onclick="location.hash='#login'">Masuk di sini</a>
                </div>
            </div>
        `;
    }

    handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;

        if (this.users[user] && this.users[user].password === pass) {
            // Optional: Migrate guest progress to account if account has no progress
            const guestProgress = JSON.parse(localStorage.getItem('nihongo_guest_progress'));
            if (guestProgress && (!this.users[user].progress || this.users[user].progress.learned.length === 0)) {
                if (confirm("Apakah Anda ingin memindahkan progres tamu ke akun ini?")) {
                    this.users[user].progress = guestProgress;
                }
            }

            this.currentUser = user;
            localStorage.setItem('nihongo_auth', JSON.stringify(user));
            this.loadUserProgress();
            localStorage.removeItem('nihongo_guest_progress'); // Clear guest data after migration
            location.hash = '#dashboard';
            this.handleRouting();
        } else {
            alert('Nama pengguna atau kata sandi salah!');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const user = document.getElementById('signup-username').value;
        const pass = document.getElementById('signup-password').value;

        if (this.users[user]) {
            alert('Nama pengguna sudah terdaftar!');
            return;
        }

        // Check for guest progress to migrate automatically
        const guestProgress = JSON.parse(localStorage.getItem('nihongo_guest_progress'));
        let userProgress = {
            learned: [],
            daily: [0, 0, 0, 0, 0, 0, 0]
        };

        if (guestProgress) {
            userProgress = guestProgress;
        }

        this.users[user] = {
            name: name,
            password: pass,
            progress: userProgress
        };

        localStorage.setItem('nihongo_users', JSON.stringify(this.users));

        // Auto Login Logic
        this.currentUser = user;
        localStorage.setItem('nihongo_auth', JSON.stringify(user));
        this.loadUserProgress();

        // Clear guest progress if it was migrated
        if (guestProgress) {
            localStorage.removeItem('nihongo_guest_progress');
        }

        alert('Pendaftaran berhasil! Selamat datang, ' + name + '!');
        location.hash = '#dashboard';
        this.handleRouting();
    }

    handleLogout() {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            this.currentUser = null;
            localStorage.removeItem('nihongo_auth');
            this.loadUserProgress();
            location.hash = '#login';
            this.handleRouting();
        }
    }

    renderDashboard() {
        const hiraTotal = NIHONGO_DATA.kana.hiragana.length;
        const kataTotal = NIHONGO_DATA.kana.katakana.length;
        const vocabTotal = NIHONGO_DATA.vocab.length;
        const kanjiTotal = NIHONGO_DATA.kanji.length;

        const hiraLearned = this.progress.learned.filter(id => id.startsWith('kana-hiragana')).length;
        const kataLearned = this.progress.learned.filter(id => id.startsWith('kana-katakana')).length;
        const vocabLearned = this.progress.learned.filter(id => id.startsWith('vocab')).length;
        const kanjiLearned = this.progress.learned.filter(id => id.startsWith('kanji')).length;

        const hiraPercent = Math.round((hiraLearned / hiraTotal) * 100);
        const kataPercent = Math.round((kataLearned / kataTotal) * 100);
        const vocabPercent = Math.round((vocabLearned / vocabTotal) * 100);
        const kanjiPercent = Math.round((kanjiLearned / kanjiTotal) * 100);

        this.mainContent.innerHTML = `
            <div class="dashboard-header">
                <div class="welcome-card">
                    <div class="floating-shapes">
                        <div style="width:100px; height:100px; top:-20px; right:-20px;"></div>
                        <div style="width:60px; height:60px; bottom:20px; left:10%; opacity:0.1;"></div>
                    </div>
                    <h1>Kon'nichiwa! 👋</h1>
                    <div class="jp-font" style="font-size: 1.4rem; margin-top: -10px; margin-bottom: 10px; color: rgba(255,255,255,0.9);">こんにちは</div>
                    <p>Selamat datang di NihonGo! Mari mulai perjalananmu menguasai Bahasa Jepang hari ini. Fokuslah pada dasar-dasar sebelum melanjut ke tingkat mahir.</p>
                </div>

                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1.5rem; margin-bottom: 2rem; border-radius: 16px; color: #15803d; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 0.8rem; font-size: 1.1rem; color: #166534;">
                        <i data-lucide="info" style="width: 20px; height: 20px;"></i> Panduan Catat Progres
                    </h3>
                    <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.95rem; line-height: 1.6;">
                        <li>Pastikan kamu sudah <strong>Login</strong> agar data progres tersimpan permanen.</li>
                        <li>Klik <strong>ikon centang (✓)</strong> pada setiap kartu materi (Hiragana, Kosakata, dll) yang sudah kamu pelajari.</li>
                        <li>Progres bar di bawah ini akan otomatis bertambah seiring banyaknya materi yang dicentang.</li>
                    </ul>
                </div>

                <h2 style="margin-bottom: 1.5rem">Materi Populer</h2>
                <div class="section-grid">
                    <div class="lesson-card" onclick="location.hash='#intro'" style="border: 2px solid var(--primary); background: #FFF5F7;">
                        <div class="icon-wrapper" style="background: var(--primary); color: white;">💡</div>
                        <div class="card-title">Mengenal Huruf</div>
                        <div class="card-desc">Pelajari perbedaan Hiragana, Katakana, dan Kanji sebelum memulai.</div>
                        <div style="margin-top: auto; color: var(--primary); font-weight: 700;">Pelajari Dasar &rarr;</div>
                    </div>

                    <div class="lesson-card" onclick="location.hash='#hiragana'">
                        <div class="icon-wrapper" style="background: #EBF2FF; color: #4361EE;">あ</div>
                        <div class="card-title">Hiragana</div>
                        <div class="card-desc">Pelajari 46 karakter dasar Hiragana dengan audio dan cara tulis.</div>
                        <div class="progress-container">
                            <div class="progress-bar"><div class="progress-fill" style="width: ${hiraPercent}%"></div></div>
                            <small>${hiraPercent}% Selesai</small>
                        </div>
                    </div>

                    <div class="lesson-card" onclick="location.hash='#katakana'">
                        <div class="icon-wrapper" style="background: #FFF0F5; color: #FF477E;">ア</div>
                        <div class="card-title">Katakana</div>
                        <div class="card-desc">Pelajari huruf untuk kata serapan asing.</div>
                        <div class="progress-container">
                            <div class="progress-bar"><div class="progress-fill" style="width: ${kataPercent}%"></div></div>
                            <small>${kataPercent}% Selesai</small>
                        </div>
                    </div>

                    <div class="lesson-card" onclick="location.hash='#lessons'">
                        <div class="icon-wrapper" style="background: #E6FFFA; color: #06D6A0;">🗣️</div>
                        <div class="card-title">Kosakata Dasar</div>
                        <div class="card-desc">Sapaan, angka, dan kata benda sehari-hari.</div>
                        <div class="progress-container">
                            <div class="progress-bar"><div class="progress-fill" style="width: ${vocabPercent}%"></div></div>
                            <small>${vocabPercent}% Selesai</small>
                        </div>
                    </div>

                    <div class="lesson-card" onclick="location.hash='#kanji'">
                        <div class="icon-wrapper" style="background: #FFF9DB; color: #FAB005;">⛩️</div>
                        <div class="card-title">JLPT (Japanese Language Proficiency Test)</div>
                        <div class="card-desc">Pelajari karakter Kanji berdasarkan tingkat kemampuan standar internasional.</div>
                        <div class="progress-container">
                            <div class="progress-bar"><div class="progress-fill" style="width: ${kanjiPercent}%"></div></div>
                            <small>${kanjiPercent}% Selesai</small>
                        </div>
                    </div>

                    <div class="lesson-card" onclick="location.hash='#conversation'">
                        <div class="icon-wrapper" style="background: #F3F0FF; color: #7950F2;">💬</div>
                        <div class="card-title">Percakapan</div>
                        <div class="card-desc">Simulasi dialog interaktif dalam berbagai situasi nyata.</div>
                        <div style="margin-top: auto; border-top: 1px solid #f1f3f5; pt: 10px; margin-top: 10px; padding-top: 10px;">
                            <span style="font-size: 0.85rem; color: #7950F2; font-weight: 700;">${NIHONGO_DATA.conversations.length} Topik Tersedia</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAboutScripts() {
        this.mainContent.innerHTML = `
            <div class="dashboard-header" style="position: relative; padding-top: 3.5rem;">
                <button onclick="location.hash='#dashboard'" style="position: absolute; left: 0; top: 0; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 600;">
                    <i data-lucide="arrow-left-circle" style="width: 24px; height: 24px; color: var(--primary);"></i> Kembali
                </button>
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="background: var(--primary); color: white; width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📖</div>
                    <h1>Sistem Tulisan Jepang</h1>
                </div>
                <p style="font-size: 1.1rem; color: var(--text-main); max-width: 800px; line-height: 1.8;">
                    Bahasa Jepang memiliki salah satu sistem penulisan paling unik di dunia karena menggunakan <strong>tiga jenis huruf sekaligus</strong> dalam satu kalimat: Hiragana, Katakana, dan Kanji. Memahami perbedaan ketiganya adalah langkah awal yang paling krusial.
                </p>

                <div style="display: grid; gap: 2rem; margin-top: 3rem;">
                    <!-- Hiragana & Katakana Side by Side -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                        <!-- Hiragana -->
                        <div class="lesson-card" style="cursor: default; padding: 2rem; border-top: 4px solid #4361EE;">
                            <div style="display: flex; gap: 1.2rem; align-items: center; margin-bottom: 1.5rem;">
                                <div class="icon-wrapper" style="background: #EBF2FF; color: #4361EE; width: 60px; height: 60px; font-size: 1.8rem; border-radius: 16px;">あ</div>
                                <h2 style="margin: 0;">Hiragana (ひらがな)</h2>
                            </div>
                            <p style="color: var(--text-main); margin-bottom: 1.2rem;">Huruf pertama yang dipelajari. Memiliki bentuk melengkung dan luwes, terinspirasi dari gaya tulisan kursif China.</p>
                            <div style="background: #f8f9fa; padding: 1.2rem; border-radius: 12px;">
                                <h4 style="margin-bottom: 0.5rem; color: #4361EE;">Fungsi Utama:</h4>
                                <ul style="list-style: none; padding: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">
                                    <li>• Menulis kata-kata asli Jepang (misal: <i>Sushi</i>, <i>Sakura</i>).</li>
                                    <li>• Unsur tata bahasa (partikel dan konjugasi kata kerja).</li>
                                    <li>• <strong>Furigana:</strong> Petunjuk cara baca di atas huruf Kanji.</li>
                                    <li>• Terdiri dari 46 karakter dasar.</li>
                                </ul>
                            </div>
                        </div>

                        <!-- Katakana -->
                        <div class="lesson-card" style="cursor: default; padding: 2rem; border-top: 4px solid #FF477E;">
                            <div style="display: flex; gap: 1.2rem; align-items: center; margin-bottom: 1.5rem;">
                                <div class="icon-wrapper" style="background: #FFF0F5; color: #FF477E; width: 60px; height: 60px; font-size: 1.8rem; border-radius: 16px;">ア</div>
                                <h2 style="margin: 0;">Katakana (カタカナ)</h2>
                            </div>
                            <p style="color: var(--text-main); margin-bottom: 1.2rem;">Bentuknya kaku dan bersudut. Melambangkan bunyi yang sama dengan Hiragana namun digunakan dalam konteks berbeda.</p>
                            <div style="background: #f8f9fa; padding: 1.2rem; border-radius: 12px;">
                                <h4 style="margin-bottom: 0.5rem; color: #FF477E;">Fungsi Utama:</h4>
                                <ul style="list-style: none; padding: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">
                                    <li>• <strong>Gairaigo:</strong> Kata serapan asing (misal: <i>Kōhī</i> / Kopi).</li>
                                    <li>• Nama orang asing, negara luar, dan Onomatopoeia.</li>
                                    <li>• Memberikan penekanan pada kata tertentu (seperti huruf miring).</li>
                                    <li>• Terdiri dari 46 karakter dasar.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Kanji Breakdown Section -->
                    <div style="margin-top: 2rem;">
                        <h2 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                            <i data-lucide="award" style="color: #FAB005;"></i> Level Kemampuan Kanji (JLPT)
                        </h2>
                        <p style="margin-bottom: 2rem; color: var(--text-muted);">Kanji adalah logogram China yang mewakili makna. Standar internasional (JLPT) membaginya menjadi 5 tingkat:</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.2rem;">
                            <!-- N5 -->
                            <div style="background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e9ecef; position: relative; overflow: hidden;">
                                <div style="position: absolute; right: -10px; top: -10px; font-size: 4rem; opacity: 0.05; font-weight: 800;">N5</div>
                                <span style="display: inline-block; padding: 4px 12px; background: #EBF2FF; color: #4361EE; border-radius: 30px; font-size: 0.8rem; font-weight: 700; margin-bottom: 10px;">DASAR</span>
                                <h3 style="margin-bottom: 8px;">Level N5</h3>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">Sekitar <strong>100 Kanji</strong>. Fokus pada angka, hari, dan konsep dasar arah/posisi.</p>
                            </div>
                            <!-- N4 -->
                            <div style="background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e9ecef; position: relative; overflow: hidden;">
                                <div style="position: absolute; right: -10px; top: -10px; font-size: 4rem; opacity: 0.05; font-weight: 800;">N4</div>
                                <span style="display: inline-block; padding: 4px 12px; background: #E7F5FF; color: #228BE6; border-radius: 30px; font-size: 0.8rem; font-weight: 700; margin-bottom: 10px;">DASAR LANJUT</span>
                                <h3 style="margin-bottom: 8px;">Level N4</h3>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">Sekitar <strong>300 Kanji</strong>. Mencakup kosakata kehidupan sehari-hari dan topik umum.</p>
                            </div>
                            <!-- N3 -->
                            <div style="background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e9ecef; position: relative; overflow: hidden;">
                                <div style="position: absolute; right: -10px; top: -10px; font-size: 4rem; opacity: 0.05; font-weight: 800;">N3</div>
                                <span style="display: inline-block; padding: 4px 12px; background: #FFF9DB; color: #FAB005; border-radius: 30px; font-size: 0.8rem; font-weight: 700; margin-bottom: 10px;">MENENGAH</span>
                                <h3 style="margin-bottom: 8px;">Level N3</h3>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">Sekitar <strong>650 Kanji</strong>. Jembatan menuju pemahaman teks berita dan artikel sederhana.</p>
                            </div>
                            <!-- N2 -->
                            <div style="background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e9ecef; position: relative; overflow: hidden;">
                                <div style="position: absolute; right: -10px; top: -10px; font-size: 4rem; opacity: 0.05; font-weight: 800;">N2</div>
                                <span style="display: inline-block; padding: 4px 12px; background: #FFF0F6; color: #FF477E; border-radius: 30px; font-size: 0.8rem; font-weight: 700; margin-bottom: 10px;">MENENGAH ATAS</span>
                                <h3 style="margin-bottom: 8px;">Level N2</h3>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">Sekitar <strong>1.000 Kanji</strong>. Diperlukan untuk bekerja di lingkungan profesional Jepang.</p>
                            </div>
                            <!-- N1 -->
                            <div style="background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e9ecef; position: relative; overflow: hidden;">
                                <div style="position: absolute; right: -10px; top: -10px; font-size: 4rem; opacity: 0.05; font-weight: 800;">N1</div>
                                <span style="display: inline-block; padding: 4px 12px; background: #F3F0FF; color: #7950F2; border-radius: 30px; font-size: 0.8rem; font-weight: 700; margin-bottom: 10px;">MAHIR</span>
                                <h3 style="margin-bottom: 8px;">Level N1</h3>
                                <p style="font-size: 0.85rem; color: var(--text-muted);">Sekitar <strong>2.000+ Kanji</strong>. Memahami literatur kompleks dan topik abstrak bertingkat tinggi.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Shared Example -->
                <div style="margin-top: 3rem; background: var(--surface); padding: 2.5rem; border-radius: 24px; box-shadow: var(--card-shadow); border-left: 6px solid #FAB005;">
                    <h3 style="margin-bottom: 1rem;">Contoh Penggunaan Sinkron:</h3>
                    <p style="margin-bottom: 1.5rem; font-size: 1.8rem;" class="jp-font">
                        <span style="color: #4361EE;">わたし</span>は <span style="color: #FF477E;">パン</span>を <span style="color: #FAB005;">食</span>べます。
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; border-top: 1px solid #f1f3f5; pt: 1.5rem; margin-top: 1rem; padding-top: 1.5rem;">
                        <div>
                            <div style="color: #4361EE; font-weight: 700;">Watashi (Hiragana)</div>
                            <small style="color: var(--text-muted);">Kata ganti "Saya"</small>
                        </div>
                        <div>
                            <div style="color: #FF477E; font-weight: 700;">Pan (Katakana)</div>
                            <small style="color: var(--text-muted);">Serapan "Roti"</small>
                        </div>
                        <div>
                            <div style="color: #FAB005; font-weight: 700;">Ta[beru] (Kanji)</div>
                            <small style="color: var(--text-muted);">Kata kerja "Makan"</small>
                        </div>
                        <div style="background: #f8f9fa; padding: 0.5rem 1rem; border-radius: 8px;">
                            <div style="font-weight: 700;">Arti Kalimat:</div>
                            <div style="color: var(--primary);">"Saya makan roti."</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    renderAboutPlatform() {
        this.mainContent.innerHTML = `
            <div class="dashboard-header">
                <div class="welcome-card" style="background: linear-gradient(135deg, #4361EE, #7950F2); min-height: 200px;">
                    <h1 style="margin-bottom: 0.5rem;">Tentang NihonGo! 📖</h1>
                    <p>Platform pembelajaran Bahasa Jepang interaktif masa depan.</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem;">
                    <div class="lesson-card" style="cursor: default; padding: 2rem;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">Visi Kami</h3>
                        <p style="color: var(--text-main); line-height: 1.6;">Menghilangkan hambatan bahasa bagi setiap orang yang ingin mengenal budaya Jepang dengan menyediakan platform belajar yang menyenangkan, modern, dan mudah diakses di mana saja.</p>
                    </div>
                    <div class="lesson-card" style="cursor: default; padding: 2rem;">
                        <h3 style="color: var(--secondary); margin-bottom: 1rem;">Misi Kami</h3>
                        <p style="color: var(--text-main); line-height: 1.6;">Mengembangkan metode pembelajaran berbasis teknologi yang menggabungkan aspek visual, audio, dan praktik langsung (Latihan & Game) untuk mempercepat proses penguasaan bahasa.</p>
                    </div>
                </div>

                <h2 style="margin: 3rem 0 1.5rem;">Mengapa Memilih NihonGo!?</h2>
                <div class="section-grid">
                    <div class="lesson-card" style="cursor: default;">
                        <div class="icon-wrapper" style="background: #EBF2FF; color: #4361EE;">🎯</div>
                        <div class="card-title">Kurikulum Terstruktur</div>
                        <div class="card-desc">Materi disusun mulai dari dasar (Hiragana/Katakana) hingga persiapan ujian JLPT N5-N1.</div>
                    </div>
                    <div class="lesson-card" style="cursor: default;">
                        <div class="icon-wrapper" style="background: #FFF0F5; color: #FF477E;">🎮</div>
                        <div class="card-title">Belajar Sambil Bermain</div>
                        <div class="card-desc">Fitur Interactive Quiz dan Listening Quest membuat belajar tidak pernah membosankan.</div>
                    </div>
                    <div class="lesson-card" style="cursor: default;">
                        <div class="icon-wrapper" style="background: #FFF9DB; color: #FAB005;">📊</div>
                        <div class="card-title">Analisis Progres</div>
                        <div class="card-desc">Pantau perkembangan belajarmu secara mendetail melalui dashboard analisis pencapaian.</div>
                    </div>
                </div>

                <div style="margin-top: 3rem; background: var(--surface); padding: 3rem; border-radius: 24px; text-align: center; box-shadow: var(--card-shadow);">
                    <h2 style="margin-bottom: 1rem;">Mulai Petualanganmu Sekarang!</h2>
                    <p style="color: var(--text-muted); margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                        Bergabunglah dengan ribuan pelajar lainnya dan kuasai Bahasa Jepang dengan cara yang lebih cerdas.
                    </p>
                    <button class="btn-primary" onclick="location.hash='#dashboard'" style="padding: 1rem 2.5rem; font-size: 1.1rem; justify-content: center; margin: 0 auto;">
                        Mulai Belajar Sekarang
                    </button>
                </div>
                
                <div style="margin-top: 3rem; text-align: center;">
                    <h3 style="margin-bottom: 1.5rem;">Hubungi Pengembang</h3>
                    <div style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;">
                        <a href="https://wa.me/6285945708410" target="_blank" class="lesson-card" style="padding: 1rem; min-width: 60px; display: flex; align-items: center; justify-content: center; color: #25D366; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                            <i data-lucide="message-circle" style="width: 28px; height: 28px;"></i>
                        </a>
                        <a href="https://instagram.com/dinaxy3" target="_blank" class="lesson-card" style="padding: 1rem; min-width: 60px; display: flex; align-items: center; justify-content: center; color: #E4405F; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                            <i data-lucide="instagram" style="width: 28px; height: 28px;"></i>
                        </a>
                        <a href="https://github.com/dynakom" target="_blank" class="lesson-card" style="padding: 1rem; min-width: 60px; display: flex; align-items: center; justify-content: center; color: #181717; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                            <i data-lucide="github" style="width: 28px; height: 28px;"></i>
                        </a>
                        <a href="https://youtube.com/@DinaAmalina-xj8pu" target="_blank" class="lesson-card" style="padding: 1rem; min-width: 60px; display: flex; align-items: center; justify-content: center; color: #FF0000; transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                            <i data-lucide="youtube" style="width: 28px; height: 28px;"></i>
                        </a>
                    </div>
                </div>
                
                <p style="text-align: center; margin-top: 3rem; color: var(--text-muted); font-size: 0.9rem;">
                    &copy; 2024 NihonGo! Project. Created with ❤️ for Japanese Learners.
                </p>
            </div >
            `;
        lucide.createIcons();
    }


    renderKana(type) {
        const data = NIHONGO_DATA.kana[type];
        const title = type.charAt(0).toUpperCase() + type.slice(1);

        this.mainContent.innerHTML = `
            <div class="dashboard-header" style="position: relative; padding-top: 3.5rem;">
                <button onclick="location.hash='#dashboard'" style="position: absolute; left: 0; top: 0; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 600;">
                    <i data-lucide="arrow-left-circle" style="width: 24px; height: 24px; color: var(--primary);"></i> Kembali
                </button>
                <h1>Belajar ${title}</h1>
                <p>Klik pada karakter untuk mendengar pelafalan.</p>
                
                <div class="kana-grid">
                    ${data.map(k => {
            const id = `kana-${type}-${k.jp}`;
            const isLearned = this.progress.learned.includes(id);
            return `
                            <div class="kana-item ${isLearned ? 'learned' : ''}" onclick="app.speak('${k.jp}')">
                                <div class="learned-check" onclick="app.toggleLearned('${id}', event)">
                                    <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
                                </div>
                                <span class="jp">${k.jp}</span>
                                <span class="en">${k.en}</span>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    renderLessons(category = 'all') {
        const categories = [...new Set(NIHONGO_DATA.vocab.map(v => v.type))];
        const filteredVocab = category === 'all'
            ? NIHONGO_DATA.vocab
            : NIHONGO_DATA.vocab.filter(v => v.type === category);

        this.mainContent.innerHTML = `
            <div class="dashboard-header" style="position: relative; padding-top: 3.5rem;">
                <button onclick="location.hash='#dashboard'" style="position: absolute; left: 0; top: 0; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 600;">
                    <i data-lucide="arrow-left-circle" style="width: 24px; height: 24px; color: var(--primary);"></i> Kembali
                </button>
                <h1>Kosakata & Tata Bahasa</h1>
                <p>Pelajari kosakata berdasarkan jenis kata (Nomina, Doushi, dll).</p>

                <div class="filter-container" style="margin: 2rem 0; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="filter-btn ${category === 'all' ? 'active' : ''}" onclick="app.renderLessons('all')">Semua</button>
                    ${categories.map(cat => `
                        <button class="filter-btn ${category === cat ? 'active' : ''}" onclick="app.renderLessons('${cat}')">${cat}</button>
                    `).join('')}
                </div>

                <div class="section-grid">
                    ${filteredVocab.map(v => {
            const id = `vocab-${v.jp}`;
            const isLearned = this.progress.learned.includes(id);
            return `
                        <div class="lesson-card ${isLearned ? 'learned' : ''}" onclick="app.speak('${v.jp}')">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="card-title jp-font" style="font-size: 1.5rem">${v.jp}</span>
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <span class="type-badge">${v.type}</span>
                                    <div class="learned-check small" onclick="app.toggleLearned('${id}', event)">
                                        <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <small style="color:var(--primary); font-weight:700;">${v.romaji}</small>
                                <div class="card-desc">${v.en}</div>
                            </div>
                            <div style="margin-top: auto; display: flex; gap: 0.5rem; align-items: center; justify-content: space-between;">
                                <button onclick="event.stopPropagation(); app.translate('${v.jp}')" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: #E9ECEF; color: var(--text-main);">
                                    <i data-lucide="languages" style="width: 14px; height: 14px;"></i> Terjemah
                                </button>
                                <i data-lucide="volume-2" style="color: var(--primary)"></i>
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    renderKanji(level = 'all') {
        const filteredKanji = level === 'all'
            ? NIHONGO_DATA.kanji
            : NIHONGO_DATA.kanji.filter(k => k.level === level);

        this.mainContent.innerHTML = `
            <div class="dashboard-header" style="position: relative; padding-top: 3.5rem;">
                <button onclick="location.hash='#dashboard'" style="position: absolute; left: 0; top: 0; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 600;">
                    <i data-lucide="arrow-left-circle" style="width: 24px; height: 24px; color: var(--primary);"></i> Kembali
                </button>
                <h1>Katalog Kanji JLPT (Japanese Language Proficiency Test)</h1>
                <p>Materi Kanji JLPT dibagi berdasarkan tingkat kesulitan dari N5 hingga N1.</p>

                <div class="filter-container" style="margin: 2rem 0; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="filter-btn ${level === 'all' ? 'active' : ''}" onclick="app.renderKanji('all')">Semua</button>
                    <button class="filter-btn ${level === 'N5' ? 'active' : ''}" onclick="app.renderKanji('N5')">N5 (Dasar)</button>
                    <button class="filter-btn ${level === 'N4' ? 'active' : ''}" onclick="app.renderKanji('N4')">N4</button>
                    <button class="filter-btn ${level === 'N3' ? 'active' : ''}" onclick="app.renderKanji('N3')">N3</button>
                    <button class="filter-btn ${level === 'N2' ? 'active' : ''}" onclick="app.renderKanji('N2')">N2</button>
                    <button class="filter-btn ${level === 'N1' ? 'active' : ''}" onclick="app.renderKanji('N1')">N1 (Mahir)</button>
                </div>
                
                <div class="kanji-grid">
                    ${filteredKanji.map(k => {
            const id = `kanji-${k.char}`;
            const isLearned = this.progress.learned.includes(id);
            // Ambil bacaan Kunyomi pertama jika ada pilihan (misal: "hai / i")
            const kunReading = k.kun.split('/')[0].trim();
            return `
                        <div class="kanji-card ${isLearned ? 'learned' : ''}" onclick="app.speak('${kunReading}')">
                            <div class="kanji-furigana">Onyomi: ${k.on}</div>
                            <div class="learned-check small" onclick="app.toggleLearned('${id}', event)" style="position: absolute; top: 10px; right: 10px;">
                                <i data-lucide="check-circle" style="width: 16px; height: 16px; opacity: ${isLearned ? 1 : 0.3}; color: ${isLearned ? '#10B981' : ''}"></i>
                            </div>
                            <span class="kanji-char jp-font">${k.char}</span>
                            <div class="kanji-mean">${k.mean}</div>
                            <div style="font-size: 0.75rem; margin-top: 10px; color: var(--text-muted)">
                                <strong>Kunyomi:</strong> ${k.kun}
                            </div>
                            <div class="kanji-level-badge">${k.level}</div>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    renderConversation(index = null) {
        if (index === null) {
            this.mainContent.innerHTML = `
                <div class="dashboard-header" style="position: relative; padding-top: 3.5rem;">
                    <button onclick="location.hash='#dashboard'" style="position: absolute; left: 0; top: 0; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 600;">
                        <i data-lucide="arrow-left-circle" style="width: 24px; height: 24px; color: var(--primary);"></i> Kembali
                    </button>
                    <div class="welcome-card" style="background: linear-gradient(135deg, #7950F2, #4361EE); min-height: 180px; margin-bottom: 2.5rem;">
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div style="background: rgba(255,255,255,0.2); width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">🗣️</div>
                            <div>
                                <h1 style="margin: 0; color: white;">Latihan Percakapan</h1>
                                <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 1.1rem;">Ulas situasi kehidupan nyata melalui simulasi dialog interaktif.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
                        ${NIHONGO_DATA.conversations.map((c, idx) => {
                const difficulty = idx < 4 ? 'N5' : idx < 9 ? 'N4' : 'N3';
                const difficultyColor = difficulty === 'N5' ? '#06D6A0' : difficulty === 'N4' ? '#4361EE' : '#FAB005';

                return `
                            <div class="lesson-card" onclick="app.renderConversation(${idx})" style="flex-direction: row; align-items: center; padding: 1.5rem; gap: 1.5rem; border-left: 5px solid ${difficultyColor}; transition: all 0.3s ease;">
                                <div style="background: ${difficultyColor}15; color: ${difficultyColor}; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0;">
                                    ${difficulty}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; font-size: 1.2rem; margin-bottom: 6px; color: var(--text-main);">${c.title}</div>
                                    <div style="font-size: 0.9rem; color: var(--text-muted); display: flex; gap: 15px; align-items: center;">
                                        <span style="display: flex; align-items: center; gap: 6px;"><i data-lucide="message-square" style="width:16px;"></i> ${c.dialogs.length} Dialog</span>
                                        <span style="display: flex; align-items: center; gap: 6px;"><i data-lucide="mic" style="width:16px;"></i> Audio Ready</span>
                                    </div>
                                </div>
                                <div style="color: var(--text-muted); opacity: 0.3; transform: translateX(10px);">
                                    <i data-lucide="chevron-right" style="width: 24px; height: 24px;"></i>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        const conv = NIHONGO_DATA.conversations[index];
        this.mainContent.innerHTML = `
            <div class="dashboard-header" style="position: relative; padding-top: 4rem;">
                <button onclick="app.renderConversation()" class="btn-primary" style="position: absolute; left: 0; top: 0; background:#f1f3f5; color:var(--text-main); padding: 0.6rem 1.2rem; border-radius: 12px; display: flex; align-items: center; gap: 8px; font-weight: 600; border: none; cursor: pointer;">
                    <i data-lucide="arrow-left-circle" style="width: 20px; height: 20px; color: var(--primary);"></i> Kembali
                </button>
                <div style="text-align: center; margin-bottom: 3rem;">
                    <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem;">${conv.title}</h1>
                    <div style="display: flex; justify-content: center; gap: 1rem; color: var(--text-muted); font-size: 0.9rem;">
                        <span><i data-lucide="headphones" style="width: 14px; vertical-align: middle;"></i> Klik balon kata untuk audio</span>
                    </div>
                </div>
                
                <div class="chat-container">
                    ${conv.dialogs.map(d => `
                        <div class="chat-bubble ${d.role}" onclick="app.speak('${d.jp}')" style="cursor: pointer; transition: transform 0.2s;">
                            <div class="jp-font" style="font-size: 1.2rem; margin-bottom: 5px;">${d.jp}</div>
                            <div style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 8px; font-weight: 600; font-family: 'Outfit';">${d.ro}</div>
                            <div style="font-size: 0.9rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 5px; font-style: italic;">"${d.en}"</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            `;
        lucide.createIcons();
    }

    renderProfile() {
        const hiraTotal = NIHONGO_DATA.kana.hiragana.length;
        const kataTotal = NIHONGO_DATA.kana.katakana.length;
        const vocabTotal = NIHONGO_DATA.vocab.length;
        const kanjiTotal = NIHONGO_DATA.kanji.length;

        const hiraLearned = this.progress.learned.filter(id => id.startsWith('kana-hiragana')).length;
        const kataLearned = this.progress.learned.filter(id => id.startsWith('kana-katakana')).length;
        const vocabLearned = this.progress.learned.filter(id => id.startsWith('vocab')).length;
        const kanjiLearned = this.progress.learned.filter(id => id.startsWith('kanji')).length;

        const totalLearned = hiraLearned + kataLearned + vocabLearned + kanjiLearned;
        const totalItems = hiraTotal + kataTotal + vocabTotal + kanjiTotal;
        const history = this.progress.quizHistory || [];

        // Calculate Average Score
        const avgScore = history.length > 0
            ? Math.round(history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / history.length)
            : 0;

        this.mainContent.innerHTML = `
            <div class="dashboard-header">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h1 style="margin-bottom: 0.5rem;">Progres Belajar (学習進捗)</h1>
                        <p style="color: var(--text-muted);">Pantau pencapaian dan progres belajar bulananmu.</p>
                    </div>
                    ${this.currentUser ? `
                    <button class="btn-primary" style="background: #FFF5F5; color: #E03131; border: 1px solid #E03131;" onclick="app.handleLogout()">
                        <i data-lucide="log-out" style="width: 18px;"></i> Keluar
                    </button>
                    ` : ''}
                </div>

                <!-- Stats Summary Row -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
                    <div class="lesson-card" style="padding: 1.5rem; flex-direction: row; align-items: center; gap: 1rem; cursor: default;">
                        <div style="background: #EBF2FF; color: #4361EE; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="check-circle" style="width: 24px;"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: var(--text-muted);">Total Dikuasai</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-main);">${totalLearned} / ${totalItems}</div>
                        </div>
                    </div>
                    <div class="lesson-card" style="padding: 1.5rem; flex-direction: row; align-items: center; gap: 1rem; cursor: default;">
                        <div style="background: #FFF0F5; color: #FF477E; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="target" style="width: 24px;"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: var(--text-muted);">Rata-rata Nilai</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-main);">${avgScore}%</div>
                        </div>
                    </div>
                    <div class="lesson-card" onclick="app.toggleHistoryModal('exercises')" style="padding: 1.5rem; flex-direction: row; align-items: center; gap: 1rem; cursor: pointer; transition: transform 0.2s;">
                        <div style="background: #FFF9DB; color: #FAB005; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="trophy" style="width: 24px;"></i>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: var(--text-muted);">Total Latihan</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 5px;">
                                ${history.filter(h => h.type !== 'learn').length} Selesai <i data-lucide="chevron-down" style="width: 16px; opacity: 0.5;"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                    <!-- Visual Progress & Mastery -->
                    <div style="background: white; padding: 2.5rem; border-radius: 24px; box-shadow: var(--card-shadow);">
                        <h3 style="margin-bottom: 2rem;">Distribusi Penguasaan</h3>
                        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 2rem;">
                            <div style="position: relative; width: 200px; height: 200px;">
                                <canvas id="masteryDoughnut"></canvas>
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                    <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">${totalItems > 0 ? Math.round((totalLearned / totalItems) * 100) : 0}%</div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">Total</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                            ${this.renderProgressBar('Hiragana', hiraLearned, hiraTotal, '#4361EE')}
                            ${this.renderProgressBar('Katakana', kataLearned, kataTotal, '#FF477E')}
                            ${this.renderProgressBar('Kosakata', vocabLearned, vocabTotal, '#06D6A0')}
                            ${this.renderProgressBar('Kanji JLPT', kanjiLearned, kanjiTotal, '#FAB005')}
                        </div>
                    </div>

                    <!-- Monthly Contribution Calendar -->
                    <div style="background: white; padding: 2.5rem; border-radius: 24px; box-shadow: var(--card-shadow); display: flex; flex-direction: column;">
                        <h3 style="margin-bottom: 1.5rem;">Kalender Belajar</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">
                            Setiap kotak mewakili satu hari. <br>
                            <span style="color: #20c997; font-weight: bold;">● Hijau</span> = Target Tercapai (3+), 
                            <span style="color: #e67700; font-weight: bold;">● Kuning</span> = Progres Sebagian, 
                            <span style="color: #adb5bd; font-weight: bold;">● Abu-abu</span> = Belum Belajar.
                        </p>
                        
                        <div id="calendar-heatmap" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; max-width: 100%;">
                            <!-- Calendar will be injected here -->
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                            <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                        </div>
                    </div>
                </div>

                <!-- History Modal (Hidden by default) -->
                <div id="history-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <div id="history-modal-content" style="background: white; width: 90%; max-width: 600px; max-height: 80vh; border-radius: 24px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; animation: slideUp 0.3s ease-out;">
                        <!-- Content injected by renderHistoryTable -->
                    </div>
                </div>
                
                <div style="margin-top: 3rem; text-align: center;">
                    <button onclick="app.resetProgress()" style="color: #fa5252; background: none; border: 1px solid #fa5252; padding: 0.8rem 2rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        Hapus Semua Data & Mulai Ulang
                    </button>
                    <p style="margin-top: 10px; font-size: 0.9rem; color: var(--text-muted);">Tindakan ini tidak dapat dikembalikan.</p>
                </div>
            </div>
        `;

        this.initCharts({
            totalItems,
            totalLearned,
            history
        });
        lucide.createIcons();
    }

    renderProgressBar(label, learned, total, color) {
        const percent = total > 0 ? Math.round((learned / total) * 100) : 0;
        return `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9rem; font-weight: 600; color: var(--text-main);">
                    <span>${label}</span>
                    <span>${percent}%</span>
                </div>
                <div style="width: 100%; height: 8px; background: #f1f3f5; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: ${color}; border-radius: 10px; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `;
    }

    getScoreColor(percent) {
        if (percent >= 80) return '#06D6A0'; // Green
        if (percent >= 60) return '#FAB005'; // Yellow
        return '#fa5252'; // Red
    }

    initCharts(stats) {
        // Mastery Doughnut
        const ctxDoughnut = document.getElementById('masteryDoughnut');
        if (ctxDoughnut && typeof Chart !== 'undefined') {
            new Chart(ctxDoughnut, {
                type: 'doughnut',
                data: {
                    labels: ['Dikuasai', 'Belum'],
                    datasets: [{
                        data: [stats.totalLearned, stats.totalItems - stats.totalLearned],
                        backgroundColor: ['#4361EE', '#f1f3f5'],
                        borderWidth: 0,
                        cutout: '75%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            });
        }

        // Generate Calendar Heatmap
        this.renderCalendarHeatmap(stats.history);
    }

    renderCalendarHeatmap(history) {
        const container = document.getElementById('calendar-heatmap');
        if (!container) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

        // Gather daily counts
        const dailyCounts = {};
        if (history) {
            history.forEach(h => {
                const d = new Date(h.date);
                if (d.getFullYear() === year && d.getMonth() === month) {
                    const day = d.getDate();
                    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
                }
            });
        }

        const streak = this.getStreak();
        // Insert Streak Display before grid if not present
        const parent = container.parentElement;
        let streakDisplay = parent.querySelector('.streak-display');
        if (!streakDisplay) {
            streakDisplay = document.createElement('div');
            streakDisplay.className = 'streak-display';
            streakDisplay.style.marginBottom = '1.5rem';
            streakDisplay.style.padding = '0.8rem 1.2rem';
            streakDisplay.style.background = '#ebfbee';
            streakDisplay.style.borderRadius = '12px';
            streakDisplay.style.display = 'inline-flex';
            streakDisplay.style.alignItems = 'center';
            streakDisplay.style.gap = '8px';
            streakDisplay.style.color = '#2f9e44';
            streakDisplay.style.fontWeight = '700';
            streakDisplay.style.fontSize = '0.9rem';
            parent.insertBefore(streakDisplay, container);
        }

        streakDisplay.innerHTML = streak > 0
            ? `🔥 Belajar ${streak} hari berturut-turut! Lanjutkan!`
            : `👋 Ayo mulai streak belajarmu hari ini!`;


        let html = '';

        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            html += `<div style="aspect-ratio: 1; border-radius: 8px; background: transparent;"></div>`;
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const count = dailyCounts[i] || 0;
            let bg = '#f1f3f5'; // default gray (Partial/None)
            let color = 'var(--text-muted)';

            // Logic Colors:
            // 0: Gray (#f1f3f5)
            // 1-2: Yellow/Gold (Partial) -> #fff9db or #ffd43b? 
            // >= 3: Green (Target Met) -> #dbe4ff (Blueish?) or Green?
            // User asked: Green (target met), Yellow (partial), Gray (none)

            if (count > 0) {
                if (count >= 3) { // Target met (example threshold)
                    bg = '#20c997'; // Teal/Green
                    color = 'white';
                } else { // Partial
                    bg = '#ffec99'; // Yellow
                    color = '#e67700';
                }
            }

            html += `
                <div style="aspect-ratio: 1; border-radius: 8px; background: ${bg}; color: ${color}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: transform 0.2s;" 
                     title="${count} Aktivitas pada tanggal ${i}" 
                     onclick="app.toggleHistoryModal(${i})"
                     onmouseover="this.style.transform='scale(1.1)'" 
                     onmouseout="this.style.transform='scale(1)'">
                    ${i}
                </div>
            `;
        }

        container.innerHTML = html;
    }

    toggleHistoryModal(dateFilter = null) {
        const modal = document.getElementById('history-modal');
        const modalContent = document.getElementById('history-modal-content');

        if (modal && modalContent) {
            this.renderHistoryTable(modalContent, dateFilter);
            modal.style.display = 'flex';
        }
    }

    closeHistoryModal() {
        const modal = document.getElementById('history-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    getStreak() {
        if (!this.progress.quizHistory || this.progress.quizHistory.length === 0) return 0;

        const uniqueDates = [...new Set(this.progress.quizHistory.map(h => new Date(h.date).toDateString()))];
        uniqueDates.sort((a, b) => new Date(b) - new Date(a)); // Descending

        const today = new Date().toDateString();
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();

        let streak = 0;
        let currentCheck = uniqueDates.includes(today) ? today : (uniqueDates.includes(yesterday) ? yesterday : null);

        if (!currentCheck) return 0; // No activity today or yesterday

        // Count backwards
        for (let i = 0; i < uniqueDates.length; i++) {
            const date = new Date(currentCheck);
            date.setDate(date.getDate() - i);
            const checkStr = date.toDateString();

            if (uniqueDates.includes(checkStr)) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    renderHistoryTable(container, dateFilter) {
        let history = this.progress.quizHistory || [];
        let title = 'Riwayat Latihan Lengkap';

        if (dateFilter) {
            if (dateFilter === 'exercises') {
                history = history.filter(h => h.type !== 'learn'); // Only Quizzes and Quests
                title = 'Riwayat Kuis & Latihan';
            } else {
                // Helper to match dates
                history = history.filter(h => {
                    const d = new Date(h.date);
                    const now = new Date();
                    // Filter for current month/year if passing just day number,
                    // or match full string.
                    if (typeof dateFilter === 'number') {
                        return d.getDate() === dateFilter && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }
                    return false;
                });
                title = `Riwayat Tanggal ${dateFilter} ${new Date().toLocaleString('default', { month: 'long' })}`;
            }
        }

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #f1f3f5; padding-bottom: 1rem;">
                <h3 style="margin: 0; font-size: 1.5rem;">${title}</h3>
                <button onclick="app.closeHistoryModal()" style="background: none; border: none; cursor: pointer; color: var(--text-muted);">
                    <i data-lucide="x-circle" style="width: 24px; height: 24px;"></i>
                </button>
            </div>
            
            <div style="overflow-y: auto; flex: 1; padding-right: 5px;">
                ${history.length === 0 ? `
                    <div style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
                        <i data-lucide="clipboard-list" style="width: 48px; height: 48px; opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p>Tidak ada aktivitas pada periode ini.</p>
                    </div>
                ` : `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="position: sticky; top: 0; background: white; z-index: 1;">
                            <tr style="text-align: left; border-bottom: 2px solid #f1f3f5; color: var(--text-muted); font-size: 0.85rem;">
                                <th style="padding: 10px;">Waktu</th>
                                <th style="padding: 10px;">Kategori</th>
                                <th style="padding: 10px; text-align: right;">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${history.slice().reverse().map(h => {
            const isLearn = h.type === 'learn';
            const scoreColor = isLearn ? '#10B981' : this.getScoreColor(h.percentage);
            const scoreText = isLearn ? '<i data-lucide="check" style="width:16px;"></i>' : `${h.score}/${h.total} (${h.percentage}%)`;
            const catLabel = isLearn ? 'Belajar' : (h.type === 'quiz' ? 'Kuis' : 'Listening');

            return `
                                <tr style="border-bottom: 1px solid #f8f9fa;">
                                    <td style="padding: 12px 10px; font-weight: 600; font-size: 0.9rem;">
                                        ${new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style="padding: 12px 10px;">
                                        <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">${h.title || h.category}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${catLabel} • ${h.category}</div>
                                    </td>
                                    <td style="padding: 12px 10px; text-align: right; color: ${scoreColor}; font-weight: 700;">
                                        ${scoreText}
                                    </td>
                                </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                `}
            </div>
            
            <div style="margin-top: 1.5rem; text-align: right;">
                <button onclick="app.closeHistoryModal()" class="btn-primary" style="padding: 0.6rem 1.5rem; font-size: 0.9rem;">Tutup</button>
            </div>
        `;
        lucide.createIcons();
    }

    closeHistoryModal() {
        const modal = document.getElementById('history-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    resetProgress() {
        if (confirm('Apakah Anda yakin ingin menghapus semua progres belajar? Tindakan ini tidak dapat dibatalkan.')) {
            this.progress.learned = [];
            this.progress.daily = [0, 0, 0, 0, 0, 0, 0];
            this.progress.quizHistory = []; // Reset history

            if (this.currentUser && this.users[this.currentUser]) {
                this.users[this.currentUser].progress = this.progress;
                localStorage.setItem('nihongo_users', JSON.stringify(this.users));
            } else {
                localStorage.setItem('nihongo_guest_progress', JSON.stringify(this.progress));
            }

            alert('Data belajar berhasil dihapus.');
            this.renderProfile();
        }
    }

    renderLevelMenu() {
        this.mainContent.innerHTML = `
            <div class="dashboard-header text-center" >
                <div class="welcome-card" style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1528164344705-4754268799af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'); background-size: cover; background-position: center; min-height: 160px; margin-bottom: 2.5rem; display: flex; align-items: center; justify-content: center; border-radius: 20px; border: 3px solid #FF477E; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 5rem; color: rgba(255, 71, 126, 0.12); font-family: 'Noto Sans JP', sans-serif; pointer-events: none;">道</div>
                    <div style="text-align: center; z-index: 1; padding: 1rem;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 0.3rem;">
                            <span style="background: #FF477E; color: white; padding: 3px 12px; border-radius: 50px; font-weight: 900; font-size: 0.7rem; letter-spacing: 1.5px;">GAMIFICATION</span>
                        </div>
                        <h1 style="color: white; font-size: 2rem; margin-bottom: 0.3rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5); font-weight: 900;">
                            <span style="display: block; font-size: 1rem; opacity: 0.8; margin-bottom: 2px;">練習 ＆ ゲーム</span>
                            Pusat Latihan dan Game
                        </h1>
                        <p style="color: rgba(255,255,255,0.9); font-size: 1rem; max-width: 600px; margin: 0 auto; font-weight: 500;">Asah kemampuan bahasa Jepangmu dengan cara yang seru!</p>
                    </div>
                </div>
                
                <div id="quiz-selection-main" class="section-grid" style="margin-top: 1rem;">
                    <div class="lesson-card" onclick="app.showQuizCategories()" style="border-bottom: 5px solid #4361EE; transition: transform 0.3s ease;">
                        <div class="icon-wrapper" style="background: #EBF2FF; color: #4361EE; margin: 0 auto 1.5rem auto; width: 70px; height: 70px; font-size: 2rem;">
                            <i data-lucide="brain"></i>
                        </div>
                        <div class="card-title" style="font-size: 1.4rem;">Kuis Interaktif</div>
                        <div class="card-desc">Uji tata bahasa, kana, dan pemahaman dasar melalui sesi cepat 5 soal.</div>
                        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #eee; color: #4361EE; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Pilih Level <i data-lucide="chevron-right" style="width: 18px;"></i>
                        </div>
                    </div>
                    
                    <div class="lesson-card" onclick="app.showQuestSettings()" style="border-bottom: 5px solid #10B981; transition: transform 0.3s ease;">
                        <div class="icon-wrapper" style="background: #E9FBF0; color: #10B981; margin: 0 auto 1.5rem auto; width: 70px; height: 70px; font-size: 2rem;">
                            <i data-lucide="headphones"></i>
                        </div>
                        <div class="card-title" style="font-size: 1.4rem;">Listening Quest</div>
                        <div class="card-desc">Tantangan pendengaran interaktif untuk melatih telinga dalam memahami dialek Jepang.</div>
                        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #eee; color: #10B981; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Atur Sesi <i data-lucide="chevron-right" style="width: 18px;"></i>
                        </div>
                    </div>
                    
                    <div class="lesson-card" onclick="app.showKanjiExamLevels()" style="border-bottom: 5px solid #FAB005; transition: transform 0.3s ease;">
                        <div class="icon-wrapper" style="background: #FFF9DB; color: #FAB005; margin: 0 auto 1.5rem auto; width: 70px; height: 70px; font-size: 2rem;">
                            <i data-lucide="award"></i>
                        </div>
                        <div class="card-title" style="font-size: 1.4rem;">Ujian Kanji JLPT</div>
                        <div class="card-desc">Hadapi simulasi ujian Kanji berdasarkan standar level JLPT N5 hingga N1.</div>
                        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #eee; color: #FAB005; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Mulai Ujian <i data-lucide="chevron-right" style="width: 18px;"></i>
                        </div>
                    </div>
                </div>
                
                <!--Quest Settings (Single Card with Controls - Compact V2)-->
                <div id="quest-settings-sub" style="margin-top: 1.5rem; display: none; position: relative; padding-top: 1.5rem;">
                    <button onclick="app.renderLevelMenu()" style="position: absolute; left: 0; top: -10px; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 700; transition: 0.3s; font-size: 0.85rem;">
                        <i data-lucide="arrow-left-circle" style="width: 18px; height: 18px; color: var(--primary);"></i> Kembali
                    </button>
                    
                    <div style="max-width: 320px; margin: 0 auto; background: white; border-radius: 16px; padding: 1.5rem 1.2rem; box-shadow: var(--card-shadow); text-align: center; border-top: 5px solid #10B981;">
                        <div class="icon-wrapper" style="background: #E9FBF0; color: #10B981; margin: 0 auto 0.8rem auto; width: 50px; height: 50px; font-size: 1.5rem; border-radius: 14px;">
                            <i data-lucide="headphones"></i>
                        </div>
                        <h2 style="font-size: 1.2rem; margin-bottom: 0.3rem; color: var(--text-main);">Listening Quest</h2>
                        <p style="color: var(--text-muted); margin-bottom: 0.3rem; font-size: 0.85rem;">Atur jumlah soal latihan.</p>
                        <p style="color: var(--text-muted); margin-bottom: 1.2rem; font-size: 0.75rem; font-weight: 600;">(Min 2, Max 50)</p>
                        
                        <!-- Controls -->
                        <div style="background: #f8f9fa; border-radius: 14px; padding: 0.8rem; margin-bottom: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem;">
                             <button class="btn-primary" style="width: 36px; height: 36px; padding: 0; background: white; color: var(--text-main); border: 2px solid #e9ecef; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 5px rgba(0,0,0,0.02);" onclick="app.adjustQuestCount(-1)">
                                <i data-lucide="minus" style="width: 16px; height: 16px;"></i>
                            </button>
                            
                            <div style="text-align: center; min-width: 70px;">
                                 <input type="number" id="quest-count-input" value="10" min="2" max="50" style="width: 100%; text-align: center; font-size: 1.6rem; font-weight: 800; border: none; background: transparent; outline: none; color: #10B981;" onchange="app.validateQuestCount()">
                                 <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-top: -3px; text-transform: uppercase; letter-spacing: 0.5px;">Soal</div>
                            </div>
                            
                            <button class="btn-primary" style="width: 36px; height: 36px; padding: 0; background: white; color: var(--text-main); border: 2px solid #e9ecef; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 5px rgba(0,0,0,0.02);" onclick="app.adjustQuestCount(1)">
                                <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>

                        <button class="btn-primary" onclick="app.prepareListeningQuest()" style="width: 100%; justify-content: center; padding: 0.8rem; font-size: 0.95rem; background: #10B981; box-shadow: 0 6px 12px rgba(16, 185, 129, 0.2); border-radius: 10px;">
                            Mulai <i data-lucide="arrow-right" style="width: 16px;"></i>
                        </button>
                    </div>
                </div>

                <div id="quiz-categories-sub" class="section-grid" style="margin-top: 3rem; display: none; position: relative; padding-top: 2rem; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
                    <button onclick="app.renderLevelMenu()" style="position: absolute; left: 0; top: -10px; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 700; transition: 0.3s;">
                        <i data-lucide="arrow-left-circle" style="width: 22px; height: 22px; color: var(--primary);"></i> Kembali ke Menu Games
                    </button>
                    
                    <div class="lesson-card" onclick="app.startQuiz('dasar')" style="border-top: 6px solid #4361EE;">
                        <div style="display: flex; align-items: center; gap: 1.2rem;">
                            <div class="icon-wrapper" style="background: #EBF2FF; color: #4361EE; border-radius: 12px; min-width: 50px; height: 50px; font-size: 1.2rem;">🌱</div>
                            <div style="text-align: left;">
                                <div class="card-title">Tingkat Dasar</div>
                                <div class="card-desc">Hiragana & Kosakata Dasar (N5)</div>
                            </div>
                        </div>
                        <div style="margin-top: 1rem; font-size: 0.9rem; background: transparent; color: #6c757d; padding: 10px; border-radius: 12px; font-weight: 800; text-align: center; cursor: pointer; transition: 0.3s; border: 1px solid #dee2e6; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Mulai Test <i data-lucide="play" style="width: 14px;"></i>
                        </div>
                    </div>

                    <div class="lesson-card" onclick="app.startQuiz('menengah')" style="border-top: 6px solid #FAB005;">
                        <div style="display: flex; align-items: center; gap: 1.2rem;">
                            <div class="icon-wrapper" style="background: #FFF9DB; color: #FAB005; border-radius: 12px; min-width: 50px; height: 50px; font-size: 1.2rem;">🌿</div>
                            <div style="text-align: left;">
                                <div class="card-title">Tingkat Menengah</div>
                                <div class="card-desc">Kata Kerja & Kalimat (N4)</div>
                            </div>
                        </div>
                        <div style="margin-top: 1rem; font-size: 0.9rem; background: transparent; color: #6c757d; padding: 10px; border-radius: 12px; font-weight: 800; text-align: center; cursor: pointer; transition: 0.3s; border: 1px solid #dee2e6; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Mulai Test <i data-lucide="play" style="width: 14px;"></i>
                        </div>
                    </div>

                    <div class="lesson-card" onclick="app.startQuiz('lanjut')" style="border-top: 6px solid #FF477E;">
                        <div style="display: flex; align-items: center; gap: 1.2rem;">
                            <div class="icon-wrapper" style="background: #FFF0F6; color: #FF477E; border-radius: 12px; min-width: 50px; height: 50px; font-size: 1.2rem;">🌳</div>
                            <div style="text-align: left;">
                                <div class="card-title">Tingkat Lanjut</div>
                                <div class="card-desc">Kanji & Struktur Kompleks (N3)</div>
                            </div>
                        </div>
                        <div style="margin-top: 1rem; font-size: 0.9rem; background: transparent; color: #6c757d; padding: 10px; border-radius: 12px; font-weight: 800; text-align: center; cursor: pointer; transition: 0.3s; border: 1px solid #dee2e6; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Mulai Test <i data-lucide="play" style="width: 14px;"></i>
                        </div>
                    </div>
                </div>

                <div id="kanji-exam-levels-sub" class="section-grid" style="margin-top: 3rem; display: none; position: relative; padding-top: 2rem;">
                    <button onclick="app.renderLevelMenu()" style="position: absolute; left: 0; top: -10px; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 600;">
                        <i data-lucide="arrow-left-circle" style="width: 20px; height: 20px;"></i> Kembali
                    </button>
                    <div class="lesson-card" onclick="app.startKanjiExam('N5')">
                        <div class="icon-wrapper" style="background: #EBF2FF; color: #4361EE;">N5</div>
                        <div class="card-title">Ujian N5</div>
                        <div class="card-desc">Uji pemahaman Kanji dasar.</div>
                    </div>
                    <div class="lesson-card" onclick="app.startKanjiExam('N4')">
                        <div class="icon-wrapper" style="background: #E7F5FF; color: #228BE6;">N4</div>
                        <div class="card-title">Ujian N4</div>
                        <div class="card-desc">Uji pemahaman Kanji tingkat dasar-lanjut.</div>
                    </div>
                    <div class="lesson-card" onclick="app.startKanjiExam('N3')">
                        <div class="icon-wrapper" style="background: #FFF9DB; color: #FAB005;">N3</div>
                        <div class="card-title">Ujian N3</div>
                        <div class="card-desc">Uji pemahaman Kanji tingkat menengah.</div>
                    </div>
                    <div class="lesson-card" onclick="app.startKanjiExam('N2')">
                        <div class="icon-wrapper" style="background: #FFF0F6; color: #FF477E;">N2</div>
                        <div class="card-title">Ujian N2</div>
                        <div class="card-desc">Uji pemahaman Kanji tingkat menengah-atas.</div>
                    </div>
                    <div class="lesson-card" onclick="app.startKanjiExam('N1')">
                        <div class="icon-wrapper" style="background: #F3F0FF; color: #7950F2;">N1</div>
                        <div class="card-title">Ujian N1</div>
                        <div class="card-desc">Uji pemahaman Kanji tingkat mahir (profesional).</div>
                    </div>
                </div>
            </div >
            `;
        lucide.createIcons();
    }

    showQuizCategories() {
        document.getElementById('quiz-selection-main').style.display = 'none';
        document.getElementById('quiz-categories-sub').style.display = 'grid';
    }

    showQuestSettings() {
        document.getElementById('quiz-selection-main').style.display = 'none';
        document.getElementById('quest-settings-sub').style.display = 'block';
    }

    showKanjiExamLevels() {
        document.getElementById('quiz-selection-main').style.display = 'none';
        document.getElementById('kanji-exam-levels-sub').style.display = 'grid';
    }

    adjustQuestCount(delta) {
        const input = document.getElementById('quest-count-input');
        let val = parseInt(input.value) + delta;
        if (val < 2) val = 2;
        if (val > 50) val = 50;
        input.value = val;
    }

    validateQuestCount() {
        const input = document.getElementById('quest-count-input');
        if (input.value < 2) input.value = 2;
        if (input.value > 50) input.value = 50;
    }

    prepareListeningQuest() {
        const count = parseInt(document.getElementById('quest-count-input').value);
        this.startListeningQuest(count);
    }

    startKanjiExam(level) {
        this.currentMode = 'kanji-exam';
        this.currentCategory = `Kanji ${level} `;

        // Filter kanji for this level
        const levelPool = NIHONGO_DATA.kanji.filter(k => k.level === level);
        const allKanjiPool = NIHONGO_DATA.kanji;

        // Shuffle and pick 10
        const shuffled = [...levelPool].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 10);

        // Generate questions
        this.filteredQuizzes = selected.map(k => {
            const questionType = Math.random() > 0.5 ? 'mean' : 'reading';
            let question, correctAnswer, options;

            if (questionType === 'mean') {
                question = `Apa arti dari Kanji <span class="jp-font" style= "font-size:1.5rem" > ${k.char}</span >? `;
                correctAnswer = k.mean;
                // Get distractors from mean property
                const others = allKanjiPool.filter(item => item.mean !== k.mean).map(item => item.mean);
                options = this.generateOptions(correctAnswer, others);
            } else {
                question = `Bagaimana cara baca Kunyomi dari Kanji <span class="jp-font" style= "font-size:1.5rem" > ${k.char}</span >? `;
                correctAnswer = k.kun.split('/')[0].trim();
                // Get distractors from kun property
                const others = allKanjiPool.filter(item => item.kun !== k.kun && item.kun !== '-').map(item => item.kun.split('/')[0].trim());
                options = this.generateOptions(correctAnswer, others);
            }

            return {
                type: 'choice',
                question: question,
                options: options.shuffledOptions,
                answer: options.correctIndex
            };
        });

        this.currentQuizIndex = 0;
        this.score = 0;
        this.showQuestion();
    }

    generateOptions(correct, pool) {
        const distractors = [...new Set(pool)].sort(() => Math.random() - 0.5).slice(0, 3);
        const shuffledOptions = [correct, ...distractors].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(correct);
        return { shuffledOptions, correctIndex };
    }

    startQuiz(category) {
        this.currentMode = 'quiz';
        this.currentCategory = category;

        // Pick 5 random questions from the pool
        const pool = [...NIHONGO_DATA.quizzes[category]];
        const shuffled = pool.sort(() => Math.random() - 0.5);
        this.filteredQuizzes = shuffled.slice(0, 5);

        this.currentQuizIndex = 0;
        this.score = 0;
        this.showQuestion();
    }

    startListeningQuest(count = 7) {
        this.currentMode = 'quest';

        // Shuffle the entire pool first
        let pool = [...NIHONGO_DATA.listeningQuest].sort(() => Math.random() - 0.5);

        // If requested count > available, repeat some questions but shuffled
        const finalPool = [];
        while (finalPool.length < count) {
            const batch = [...pool].sort(() => Math.random() - 0.5);
            finalPool.push(...batch);
        }

        const selected = finalPool.slice(0, count);

        // Randomize options for each question
        this.filteredQuizzes = selected.map(q => {
            const originalOptions = [...q.options];
            const correctAnswer = originalOptions[q.answer];

            // Shuffle options
            const shuffledOptions = originalOptions.sort(() => Math.random() - 0.5);
            const newAnswerIndex = shuffledOptions.indexOf(correctAnswer);

            return {
                ...q,
                options: shuffledOptions,
                answer: newAnswerIndex
            };
        });

        this.currentQuizIndex = 0;
        this.score = 0;
        this.showQuestion();
    }

    showQuestion() {
        const q = this.filteredQuizzes[this.currentQuizIndex];
        if (!q) {
            this.showResult();
            return;
        }

        let headerText = '';
        if (this.currentMode === 'quest') {
            headerText = 'Listening Quest';
        } else if (this.currentMode === 'kanji-exam') {
            headerText = `Ujian ${this.currentCategory} `;
        } else {
            headerText = `Kuis ${this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1)} `;
        }

        const navHeader = `
            <div class="quiz-header">
                <button class="quiz-exit-btn" onclick="if(confirm('Keluar dari kuis? Progres kuis ini tidak akan disimpan.')) app.renderLevelMenu()">
                    <i data-lucide="arrow-left-circle" style="width: 18px; height: 18px;"></i> Keluar
                </button>
                <span class="quiz-title">${headerText} (${this.currentQuizIndex + 1}/${this.filteredQuizzes.length})</span>
            </div>
            `;

        if (q.type === 'matching') {
            this.renderMatchingQuestion(q, navHeader);
            return;
        }

        let questionHtml = `
            <div class="quiz-container" >
                ${navHeader}
        <div class="quiz-question">${q.question}</div>
        `;

        if (q.audioText) {
            questionHtml += `
            <div style= "text-align: center; margin-bottom: 2rem;" >
                    <button class="btn-primary" onclick="app.speak(\`${q.audioText}\`)" style="border-radius: 50%; width: 80px; height: 80px; justify-content: center; box-shadow: 0 10px 20px rgba(255, 71, 126, 0.2);">
                        <i data-lucide="volume-2" style="width: 32px; height: 32px;"></i>
                    </button>
                    <p style="margin-top: 10px; font-size: 0.9rem; color: var(--text-muted);">Klik untuk memutar suara</p>
                </div >
            `;
        }

        questionHtml += `
            <div class="options-grid" >
                ${q.options.map((opt, idx) => `
                        <button class="option-btn" onclick="app.checkAnswer(${idx})">${opt}</button>
                    `).join('')
            }
                </div >
            </div >
            `;

        this.mainContent.innerHTML = questionHtml;
        lucide.createIcons();
    }

    renderMatchingQuestion(q, navHeader) {
        this.matchingState = { selectedLeft: null, matches: 0 };

        // Shuffle right side to make it a challenge
        const leftItems = q.pairs.map(p => p.left);
        const rightItems = q.pairs.map(p => p.right).sort(() => Math.random() - 0.5);

        this.mainContent.innerHTML = `
            <div class="quiz-container" >
                ${navHeader}
                <div class="quiz-question">${q.question}</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                    <div id="matching-left" style="display: flex; flex-direction: column; gap: 1rem;">
                        ${leftItems.map((item, idx) => `
                            <button class="option-btn matching-btn" id="left-${idx}" onclick="app.selectMatchingLeft('${item}', 'left-${idx}')">${item}</button>
                        `).join('')}
                    </div>
                    <div id="matching-right" style="display: flex; flex-direction: column; gap: 1rem;">
                        ${rightItems.map((item, idx) => `
                            <button class="option-btn matching-btn" id="right-${idx}" onclick="app.selectMatchingRight('${item}', 'right-${idx}')">${item}</button>
                        `).join('')}
                    </div>
                </div>
            </div >
            `;
        lucide.createIcons();
    }

    selectMatchingLeft(val, id) {
        // Reset previous selection
        document.querySelectorAll('#matching-left .matching-btn').forEach(b => b.classList.remove('selected'));
        this.matchingState.selectedLeft = { val, id };
        document.getElementById(id).classList.add('selected');
    }

    selectMatchingRight(val, id) {
        if (!this.matchingState.selectedLeft) {
            alert('Pilih kata di sebelah kiri dahulu!');
            return;
        }

        const q = this.filteredQuizzes[this.currentQuizIndex];
        const pair = q.pairs.find(p => p.left === this.matchingState.selectedLeft.val);

        const leftBtn = document.getElementById(this.matchingState.selectedLeft.id);
        const rightBtn = document.getElementById(id);

        if (pair && pair.right === val) {
            // Correct match
            leftBtn.classList.add('correct');
            rightBtn.classList.add('correct');
            leftBtn.disabled = true;
            rightBtn.disabled = true;
            leftBtn.classList.remove('selected');

            this.matchingState.matches++;
            this.matchingState.selectedLeft = null;

            if (this.matchingState.matches === q.pairs.length) {
                this.score++;
                setTimeout(() => {
                    this.nextQuestion();
                }, 1000);
            }
        } else {
            // Wrong match
            rightBtn.classList.add('wrong');
            setTimeout(() => {
                rightBtn.classList.remove('wrong');
            }, 500);
        }
    }

    nextQuestion() {
        this.currentQuizIndex++;
        if (this.currentQuizIndex < this.filteredQuizzes.length) {
            this.showQuestion();
        } else {
            this.showResult();
        }
    }

    checkAnswer(idx) {
        const q = this.filteredQuizzes[this.currentQuizIndex];
        const buttons = document.querySelectorAll('.option-btn');

        if (idx === q.answer) {
            buttons[idx].classList.add('correct');
            this.score++;
        } else {
            buttons[idx].classList.add('wrong');
            buttons[q.answer].classList.add('correct');
        }

        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }

    showResult() {
        const percentage = Math.round((this.score / this.filteredQuizzes.length) * 100);
        const isQuiz = this.currentMode === 'quiz';
        const title = isQuiz ? `Kuis ${this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1)} ` : 'Listening Quest';

        // Save History
        const resultData = {
            date: new Date().toISOString(),
            type: isQuiz ? 'quiz' : 'listening',
            category: isQuiz ? this.currentCategory : 'Mixed',
            score: this.score,
            total: this.filteredQuizzes.length,
            percentage: percentage
        };

        if (!this.progress.quizHistory) {
            this.progress.quizHistory = [];
        }
        this.progress.quizHistory.push(resultData);

        // Persist Data
        if (this.currentUser && this.users[this.currentUser]) {
            this.users[this.currentUser].progress = this.progress;
            localStorage.setItem('nihongo_users', JSON.stringify(this.users));
        } else {
            localStorage.setItem('nihongo_guest_progress', JSON.stringify(this.progress));
        }

        this.mainContent.innerHTML = `
            <div class="quiz-container" style="text-align: center;">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">${percentage >= 70 ? '🎉' : '💪'}</h1>
                <h2>${title} Selesai!</h2>
                <p style="font-size: 1.2rem; margin: 1rem 0;">Skor kamu: <strong>${this.score} / ${this.filteredQuizzes.length}</strong> (${percentage}%)</p>
                <div style="margin: 1rem auto; max-width: 400px; background: #f8f9fa; padding: 1rem; border-radius: 12px; font-size: 0.9rem; color: var(--text-muted);">
                    Data hasil latihan ini telah disimpan ke profilmu.
                </div>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">
                    ${percentage >= 70 ? 'Luar biasa! Lanjutkan belajar materi lainnya.' : 'Jangan menyerah! Coba lagi untuk memperbaiki skormu.'}
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn-primary" onclick="${isQuiz ? `app.startQuiz('${this.currentCategory}')` : 'app.startListeningQuest()'}">Ulangi Tes</button>
                    <button class="btn-primary" style="background: #E9ECEF; color: var(--text-main);" onclick="app.renderLevelMenu()">Menu Utama Latihan</button>
                </div>
            </div >
            `;
    }

    speak(text) {
        if (!text) return;

        // Check support
        if (!('speechSynthesis' in window)) {
            console.warn('Text-to-speech not supported');
            return;
        }

        const synthesis = window.speechSynthesis;

        // Cancel previous
        synthesis.cancel();

        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'ja-JP';
        msg.rate = 0.8;
        msg.volume = 1.0;

        // Try to get voice
        let voices = synthesis.getVoices();

        // Helper to find Japanese voice
        const findVoice = (voiceList) => {
            return voiceList.find(v => v.lang === 'ja-JP') ||
                voiceList.find(v => v.lang.includes('ja'));
        };

        let jaVoice = findVoice(voices);

        if (jaVoice) {
            msg.voice = jaVoice;
            synthesis.speak(msg);
        } else {
            // Mobile Chrome/Safari often needs a moment or listener
            if (voices.length === 0) {
                synthesis.onvoiceschanged = () => {
                    voices = synthesis.getVoices();
                    jaVoice = findVoice(voices);
                    if (jaVoice) msg.voice = jaVoice;
                    synthesis.speak(msg);
                    synthesis.onvoiceschanged = null; // Clean up
                };
                // Attempt to speak anyway in case onvoiceschanged doesn't fire (some browsers default okay)
                synthesis.speak(msg);
            } else {
                // Voices loaded but no JP voice found, speak with default
                synthesis.speak(msg);
            }
        }
    }

    translate(text) {
        const url = `https://translate.google.com/?sl=ja&tl=id&text=${encodeURIComponent(text)}&op=translate`;
        window.open(url, '_blank');
    }
}

const app = new NihonGoApp();

