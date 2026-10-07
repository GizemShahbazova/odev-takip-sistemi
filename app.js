/* İlk sürüm yalnızca giriş yapar ve users/{UID} kaydını okur.
   Erişim yetkileri Firestore Security Rules tarafından uygulanır. */
(() => {
  const el = (id) => document.getElementById(id);
  const form = el('login-form');
  const loginButton = el('login-button');
  let auth, db, api, fs;
  let profileRequest = 0;
  function status(message, kind = '') {
    el('status').textContent = message;
    el('status').className = kind;
  }
  function errorText(error) {
    const code = error?.code || '';
    if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code)) return 'E-posta veya şifre hatalı. Bilgilerinizi kontrol edin.';
    if (code === 'auth/too-many-requests') return 'Çok fazla giriş denemesi yapıldı. Bir süre sonra yeniden deneyin.';
    if (code === 'auth/user-disabled') return 'Bu hesap devre dışı. Proje yöneticisiyle iletişime geçin.';
    if (code === 'auth/operation-not-allowed') return 'E-posta ve şifreyle giriş henüz etkin değil. Firebase Authentication ayarını kontrol edin.';
    if (code === 'auth/unauthorized-domain') return 'Bu sitenin adresini Firebase Authentication → Settings → Authorized domains listesine ekleyin.';
    if (code === 'permission-denied') return 'Kullanıcı kaydı okunamadı. Firestore Rules bölümündeki kuralı ve belgenin UID’sini kontrol edin.';
    if (code === 'auth/network-request-failed' || code === 'unavailable') return 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.';
    return 'İşlem tamamlanamadı. Yeniden deneyin.' + (code ? ' Hata kodu: ' + code : '');
  }
  el('toggle-password').addEventListener('click', () => {
    const show = el('password').type === 'password';
    el('password').type = show ? 'text' : 'password';
    el('toggle-password').textContent = show ? 'Gizle' : 'Göster';
    el('toggle-password').setAttribute('aria-label', show ? 'Şifreyi gizle' : 'Şifreyi göster');
    el('toggle-password').setAttribute('aria-pressed', String(show));
  });
  el('reload-button').addEventListener('click', () => window.location.reload());
  async function loadProfile(user) {
    const request = ++profileRequest;
    el('profile-details').hidden = true;
    el('retry-profile').hidden = true;
    el('welcome').textContent = 'Hesap kontrol ediliyor…';
    status('Kullanıcı kaydınız okunuyor…');
    try {
      const record = await fs.getDocFromServer(fs.doc(db, 'users', user.uid));
      if (request !== profileRequest || auth.currentUser?.uid !== user.uid) return;
      if (!record.exists()) throw {code: 'profile/missing'};
      const profile = record.data();
      if (!['teacher', 'parent'].includes(profile.role)) throw {code: 'profile/invalid-role'};
      const name = typeof profile.name === 'string' && profile.name.trim() ? profile.name.trim() : 'Kullanıcı';
      el('welcome').textContent = 'Merhaba ' + name + '.';
      el('role').textContent = profile.role === 'teacher' ? 'Öğretmen' : 'Veli';
      el('profile-details').hidden = false;
      status('Hesabınız hazır.', 'success');
    } catch (error) {
      if (request !== profileRequest || auth.currentUser?.uid !== user.uid) return;
      el('welcome').textContent = 'Giriş yapıldı; profil okunamadı.';
      el('retry-profile').hidden = false;
      const message = error.code === 'profile/missing' ? 'Bu hesap için kullanıcı kaydı bulunamadı. Firestore’da users koleksiyonu altında, belge kimliği hesabınızın UID’si olacak şekilde kayıt oluşturun.' : error.code === 'profile/invalid-role' ? 'Kullanıcı rolü tanınmadı. Gizem’in kaydındaki role alanı teacher olmalı.' : errorText(error);
      status(message, 'error');
    }
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!auth || loginButton.disabled) return;
    loginButton.disabled = true;
    loginButton.textContent = 'Giriş yapılıyor…';
    status('Hesabınız kontrol ediliyor…');
    const password = el('password').value;
    try {
      await api.signInWithEmailAndPassword(auth, el('email').value.trim(), password);
      el('password').value = '';
    } catch (error) {
      status(errorText(error), 'error');
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Giriş yap';
    }
  });
  el('logout-button').addEventListener('click', async () => {
    el('logout-button').disabled = true;
    try { await api.signOut(auth); } catch (error) { status(errorText(error), 'error'); }
    finally { el('logout-button').disabled = false; }
  });
  el('retry-profile').addEventListener('click', () => { if (auth?.currentUser) loadProfile(auth.currentUser); });
  async function start() {
    try {
      const [appModule, authModule, firestoreModule] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
      ]);
      api = authModule;
      fs = firestoreModule;
      const app = appModule.initializeApp({
        apiKey: 'AIzaSyCq-uHWYiFswYmQ92NUwmLgWINKZtBSz8w',
        authDomain: 'odev-takip-sistemi-6652a.firebaseapp.com',
        projectId: 'odev-takip-sistemi-6652a',
        storageBucket: 'odev-takip-sistemi-6652a.firebasestorage.app',
        messagingSenderId: '907905242882',
        appId: '1:907905242882:web:a04d2e9b7aad894fd7941b'
      });
      auth = api.getAuth(app);
      db = fs.getFirestore(app);
      await api.setPersistence(auth, api.browserSessionPersistence);
      api.onAuthStateChanged(auth, (user) => {
        ++profileRequest;
        el('login-view').hidden = Boolean(user);
        el('account-view').hidden = !user;
        el('profile-details').hidden = true;
        el('password').value = '';
        el('password').type = 'password';
        el('toggle-password').textContent = 'Göster';
        el('toggle-password').setAttribute('aria-label', 'Şifreyi göster');
        el('toggle-password').setAttribute('aria-pressed', 'false');
        el('welcome').textContent = '';
        el('role').textContent = '';
        el('account-email').textContent = user?.email || '';
        if (user) loadProfile(user);
        else status('Giriş yapabilirsiniz.');
      }, (error) => status(errorText(error), 'error'));
      loginButton.disabled = false;
      loginButton.textContent = 'Giriş yap';
    } catch (error) {
      loginButton.disabled = true;
      loginButton.textContent = 'Bağlantı kurulamadı';
      status('Firebase başlatılamadı. İnternet bağlantınızı kontrol edin. Sayfayı GitHub Pages adresinden veya yerel bir web sunucusundan açın.', 'error');
      el('reload-button').hidden = false;
    }
  }
  start();
})();
