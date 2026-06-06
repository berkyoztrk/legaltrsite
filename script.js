const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1512829512738537573/V6KHVJ8bmYuRKHkgaTpTCqbiUt2OeHEuTQEWNFjT_hQdm79MyWjOKqeOdiIvM3BTVxuL";
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";

const API_PERSONEL = "/api/personel";
const API_GALERI = "/api/galeri";

function isAdminLoggedIn() {
    return sessionStorage.getItem("lspd_admin") === "true";
}

// 1. GİRİŞ KONTROLÜ
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (document.getElementById('username').value === ADMIN_USER && document.getElementById('password').value === ADMIN_PASS) {
            sessionStorage.setItem("lspd_admin", "true");
            alert("Giriş Başarılı!");
            window.location.href = "index.html";
        } else {
            alert("Hatalı Giriş!");
        }
    });
}

// 2. PERSONEL SİSTEMİ
const personelPanel = document.getElementById('admin-personel-panel');
const personelForm = document.getElementById('personel-form');
const personelListesi = document.getElementById('personel-listesi');

if (personelListesi) {
    if (isAdminLoggedIn() && personelPanel) personelPanel.classList.remove('hidden');

    async function personelleriListele() {
        try {
            const res = await fetch(API_PERSONEL);
            if(!res.ok) throw new Error();
            const personeller = await res.json();
            personelListesi.innerHTML = personeller.length === 0 ? "<p>Kayıt yok.</p>" : "";
            personeller.forEach(p => {
                const kart = document.createElement('div');
                kart.className = 'personel-card';
                kart.innerHTML = `<img src="${p.foto}"><h4 style="padding:10px;">${p.isim}</h4>${isAdminLoggedIn() ? `<button class="btn-delete" onclick="personelSil(${p.id})">Sil</button>` : ''}`;
                personelListesi.appendChild(kart);
            });
        } catch { personelListesi.innerHTML = "<p>Veritabanı bağlantı hatası. Lütfen Vercel Storage alanından projenizi bağlayın.</p>"; }
    }

    if (personelForm) {
        personelForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const res = await fetch(API_PERSONEL);
            let personeller = await res.json();
            personeller.push({ id: Date.now(), isim: document.getElementById('p-isim').value, foto: document.getElementById('p-foto').value });
            await fetch(API_PERSONEL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personeller }) });
            personelForm.reset(); personelleriListele();
        });
    }

    window.personelSil = async function(id) {
        if (confirm("Silinsin mi?")) {
            const res = await fetch(API_PERSONEL);
            let personeller = await res.json();
            personeller = personeller.filter(p => p.id !== id);
            await fetch(API_PERSONEL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personeller }) });
            personelleriListele();
        }
    };
    personelleriListele();
}

// 3. GALERİ SİSTEMİ
const galeriPanel = document.getElementById('admin-galeri-panel');
const galeriForm = document.getElementById('galeri-form');
const galeriListesi = document.getElementById('galeri-listesi');

if (galeriListesi) {
    if (isAdminLoggedIn() && galeriPanel) galeriPanel.classList.remove('hidden');

    async function galeriyiListele() {
        try {
            const res = await fetch(API_GALERI);
            const galeri = await res.json();
            galeriListesi.innerHTML = galeri.length === 0 ? "<p>Medya yok.</p>" : "";
            galeri.forEach(m => {
                const item = document.createElement('div'); item.className = 'galeri-item';
                let el = m.tip === "foto" ? `<img src="${m.url}">` : `<iframe src="${m.url.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen></iframe>`;
                item.innerHTML = `${el}${isAdminLoggedIn() ? `<button class="btn-delete" onclick="medyaSil(${m.id})">Sil</button>` : ''}`;
                galeriListesi.appendChild(item);
            });
        } catch { galeriListesi.innerHTML = "<p>Veritabanı bağlantı hatası.</p>"; }
    }

    if (galeriForm) {
        galeriForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const res = await fetch(API_GALERI);
            let galeri = await res.json();
            galeri.push({ id: Date.now(), tip: document.getElementById('medya-tipi').value, url: document.getElementById('medya-url').value });
            await fetch(API_GALERI, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ galeri }) });
            galeriForm.reset(); galeriyiListele();
        });
    }

    window.medyaSil = async function(id) {
        if (confirm("Silinsin mi?")) {
            const res = await fetch(API_GALERI);
            let galeri = await res.json();
            galeri = galeri.filter(m => m.id !== id);
            await fetch(API_GALERI, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ galeri }) });
            galeriyiListele();
        }
    };
    galeriyiListele();
}

// 4. BAŞVURU FORMU GÖNDERİMİ
const basvuruFormu = document.getElementById('lspd-basvuru-formu');
if (basvuruFormu) {
    basvuruFormu.addEventListener('submit', function(e) {
        e.preventDefault();
        const discordVerisi = {
            embeds: [{
                title: "🚨 YENİ LSPD BAŞVURUSU 🚨",
                color: 1920984,
                fields: [
                    { name: "--- OOC ---", value: `**Ad/Yaş:** ${document.getElementById('ooc-ad').value}/${document.getElementById('ooc-yas').value}\n**DC:** ${document.getElementById('ooc-dc').value}\n**Geçmiş:** ${document.getElementById('ooc-gecmis').value}` },
                    { name: "--- IC ---", value: `**Karakter:** ${document.getElementById('ic-ad').value}\n**Sabıka:** ${document.getElementById('ic-sabika').value}` },
                    { name: "FTO Nedir?", value: document.getElementById('ic-fto').value },
                    { name: "Pit & Ram?", value: document.getElementById('ic-pit').value },
                    { name: "Pullover?", value: document.getElementById('ic-pullover').value },
                    { name: "Senaryo Yaklaşımı", value: document.getElementById('ic-senaryo').value },
                    { name: "Farkı Nedir?", value: document.getElementById('ic-fark').value }
                ],
                timestamp: new Date()
            }]
        };
        fetch(DISCORD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(discordVerisi) })
        .then(() => { alert("Başvuru başarıyla gönderildi!"); basvuruFormu.reset(); });
    });
}

// ÇIKIŞ İŞLEMLERİ
const lp = document.getElementById('btn-logout-personel'); if(lp) lp.addEventListener('click', () => { sessionStorage.clear(); window.location.reload(); });
const lg = document.getElementById('btn-logout-galeri'); if(lg) lg.addEventListener('click', () => { sessionStorage.clear(); window.location.reload(); });