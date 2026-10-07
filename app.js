/* Giriş, kullanıcı profili ve öğretmene ait sınıflar ve sınıfa bağlı öğrenciler.
   Erişim yetkileri Firestore Security Rules tarafından uygulanır. */
(() => {
  const el = (id) => document.getElementById(id);
  const form = el('login-form');
  const loginButton = el('login-button');
  let auth, db, api, fs;
  let profileRequest = 0;
  let teacherUid = null;
  let listRequest = 0;
  let savingClass = false;
  let knownClasses = new Map();
  let selectedClass = null;
  let selectionVersion = 0;
  let studentListRequest = 0;
  let savingStudent = false;
  function studentStatus(message, kind = '') {
    el('students-status').textContent = message;
    el('students-status').className = kind;
  }
  function clearStudents() {
    selectedClass = null;
    ++selectionVersion;
    ++studentListRequest;
    savingStudent = false;
    el('students-view').hidden = true;
    el('students-title').textContent = 'Öğrenciler';
    el('students-list').replaceChildren();
    el('student-count').textContent = '—';
    el('students-empty').hidden = true;
    el('student-name').value = '';
    el('create-student').disabled = false;
    el('create-student').textContent = 'Öğrenci ekle';
    el('refresh-students').disabled = false;
    el('students-load-status').textContent = '';
    el('students-load-status').className = '';
    studentStatus('');
  }
  function sameClass(uid, session, classId, version) {
    return sameTeacher(uid, session) && selectedClass?.id === classId && version === selectionVersion;
  }
  async function openStudents(item) {
    if (!teacherUid || auth?.currentUser?.uid !== teacherUid || !knownClasses.has(item.id)) return;
    clearStudents();
    selectedClass = {id: item.id, name: item.name};
    el('classes-view').hidden = true;
    el('students-view').hidden = false;
    el('students-title').textContent = item.name + ' · Öğrenciler';
    el('students-title').setAttribute('tabindex', '-1');
    el('students-title').focus();
    await loadStudents();
  }
  function backToClasses() {
    clearStudents();
    if (teacherUid && auth?.currentUser?.uid === teacherUid) {
      el('classes-view').hidden = false;
      el('classes-title').setAttribute('tabindex', '-1');
      el('classes-title').focus();
    }
  }
  async function loadStudents() {
    const uid = teacherUid;
    const session = profileRequest;
    const classId = selectedClass?.id;
    const version = selectionVersion;
    if (!classId || !sameClass(uid, session, classId, version)) return;
    const request = ++studentListRequest;
    el('refresh-students').disabled = true;
    el('students-load-status').className = '';
    el('students-load-status').textContent = 'Öğrenciler yükleniyor…';
    try {
      const result = await fs.getDocsFromServer(fs.collection(db, 'classes', classId, 'students'));
      if (request !== studentListRequest || !sameClass(uid, session, classId, version)) return;
      const students = result.docs.map(record => ({...record.data(), id: record.id}));
      students.sort((a,b) => String(a.name).localeCompare(String(b.name), 'tr'));
      el('students-list').replaceChildren();
      students.forEach((student, index) => {
        const row = document.createElement('li');
        const position = document.createElement('span');
        position.className = 'class-symbol student-position';
        position.textContent = String(index + 1);
        position.setAttribute('aria-hidden', 'true');
        const label = document.createElement('div');
        label.className = 'class-label';
        const name = document.createElement('strong');
        name.textContent = student.name;
        label.append(name);
        row.append(position, label);
        el('students-list').append(row);
      });
      el('student-count').textContent = students.length + ' öğrenci';
      el('students-empty').hidden = students.length !== 0;
      el('students-load-status').textContent = '';
    } catch (error) {
      if (request !== studentListRequest || !sameClass(uid, session, classId, version)) return;
      el('students-load-status').textContent = error.code === 'permission-denied' ? 'Öğrenciler okunamadı. Yeni öğrenci erişim kurallarının yayımlandığını kontrol edin ve Yenile’ye basın.' : 'Öğrenciler yüklenemedi. Bağlantınızı kontrol edip Yenile’ye basın.';
      el('students-load-status').className = 'error';
    } finally {
      if (request === studentListRequest && sameClass(uid, session, classId, version)) el('refresh-students').disabled = false;
    }
  }
  el('back-to-classes').addEventListener('click', backToClasses);
  el('menu-home').addEventListener('click', (event) => {
    if (teacherUid && auth?.currentUser?.uid === teacherUid) {event.preventDefault(); backToClasses();}
  });
  el('refresh-students').addEventListener('click', loadStudents);
  el('student-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const uid = teacherUid;
    const session = profileRequest;
    const classId = selectedClass?.id;
    const version = selectionVersion;
    if (!classId || !sameClass(uid, session, classId, version) || savingStudent) return;
    const name = el('student-name').value.trim();
    if (!name || name.length > 100) {
      studentStatus('Öğrencinin adını ve soyadını 1–100 karakter arasında yazın.', 'error');
      el('student-name').focus();
      return;
    }
    savingStudent = true;
    el('create-student').disabled = true;
    el('create-student').textContent = 'Kaydediliyor…';
    studentStatus('Öğrenci kaydediliyor…');
    try {
      await fs.addDoc(fs.collection(db, 'classes', classId, 'students'), {name, createdAt: fs.serverTimestamp()});
      if (!sameClass(uid, session, classId, version)) return;
      el('student-name').value = '';
      studentStatus('“' + name + '” bu sınıfa eklendi.', 'success');
      await loadStudents();
    } catch (error) {
      if (!sameClass(uid, session, classId, version)) return;
      studentStatus(error.code === 'permission-denied' ? 'Öğrenci kaydedilemedi. Yeni öğrenci erişim kurallarının Firebase’de yayımlandığını kontrol edin.' : 'Öğrenci kaydedilemedi. Bağlantınızı kontrol edin; yeniden denemeden önce listeyi yenileyin.', 'error');
    } finally {
      if (sameClass(uid, session, classId, version)) {
        savingStudent = false;
        el('create-student').disabled = false;
        el('create-student').textContent = 'Öğrenci ekle';
      }
    }
  });
  function classStatus(message, kind = '') {
    el('classes-status').textContent = message;
    el('classes-status').className = kind;
  }
  function clearClasses() {
    clearStudents();
    knownClasses.clear();
    teacherUid = null;
    ++listRequest;
    savingClass = false;
    el('classes-view').hidden = true;
    el('intro-view').hidden = false;
    el('menu-home').textContent = 'Ana sayfa';
    el('classes-list').replaceChildren();
    el('class-count').textContent = '—';
    el('classes-empty').hidden = true;
    el('class-name').value = '';
    el('create-class').disabled = false;
    el('create-class').textContent = 'Sınıf oluştur';
    el('refresh-classes').disabled = false;
    el('classes-load-status').textContent = '';
    classStatus('');
  }
  function sameTeacher(uid, session) {
    return uid === teacherUid && auth?.currentUser?.uid === uid && session === profileRequest;
  }
  async function loadClasses() {
    const uid = teacherUid;
    const session = profileRequest;
    if (!uid || !sameTeacher(uid, session)) return;
    const request = ++listRequest;
    el('refresh-classes').disabled = true;
    el('classes-load-status').className = '';
    el('classes-load-status').textContent = 'Sınıflarınız yükleniyor…';
    try {
      const q = fs.query(fs.collection(db, 'classes'), fs.where('teacherId', '==', uid));
      const result = await fs.getDocsFromServer(q);
      if (request !== listRequest || !sameTeacher(uid, session)) return;
      const classes = result.docs.map(record => ({...record.data(), id: record.id}));
      knownClasses = new Map(classes.map(item => [item.id, item]));
      classes.sort((a, b) => String(a.name).localeCompare(String(b.name), 'tr', {numeric: true}));
      el('classes-list').replaceChildren();
      for (const item of classes) {
        const row = document.createElement('li');
        const symbol = document.createElement('span');
        symbol.className = 'class-symbol';
        symbol.textContent = 'S';
        symbol.setAttribute('aria-hidden', 'true');
        const label = document.createElement('div');
        label.className = 'class-label';
        const name = document.createElement('strong');
        name.textContent = item.name;
        const detail = document.createElement('p');
        const date = item.createdAt?.toDate?.();
        detail.textContent = date ? 'Oluşturuldu: ' + new Intl.DateTimeFormat('tr-TR').format(date) : 'Sınıf kaydı';
        label.append(name, detail);
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'class-open';
        open.textContent = 'Öğrenciler';
        open.setAttribute('aria-label', item.name + ' sınıfının öğrencileri');
        open.addEventListener('click', () => openStudents(item));
        row.append(symbol, label, open);
        el('classes-list').append(row);
      }
      el('class-count').textContent = classes.length + ' sınıf';
      el('classes-empty').hidden = classes.length !== 0;
      el('classes-load-status').textContent = '';
    } catch (error) {
      if (request !== listRequest || !sameTeacher(uid, session)) return;
      el('classes-load-status').textContent = error.code === 'permission-denied' ? 'Sınıflar okunamadı. Yeni sınıf erişim kurallarının yayımlandığını kontrol edin ve Yenile’ye basın.' : 'Sınıflar yüklenemedi. Bağlantınızı kontrol edip Yenile’ye basın.';
      el('classes-load-status').className = 'error';
    } finally {
      if (request === listRequest && sameTeacher(uid, session)) el('refresh-classes').disabled = false;
    }
  }
  el('refresh-classes').addEventListener('click', loadClasses);
  el('class-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const uid = teacherUid;
    const session = profileRequest;
    if (!uid || !sameTeacher(uid, session) || savingClass) return;
    const name = el('class-name').value.trim();
    if (!name || name.length > 60) {
      classStatus('Sınıf adını 1–60 karakter arasında yazın.', 'error');
      el('class-name').focus();
      return;
    }
    savingClass = true;
    el('create-class').disabled = true;
    el('create-class').textContent = 'Kaydediliyor…';
    classStatus('Sınıf kaydediliyor…');
    try {
      await fs.addDoc(fs.collection(db, 'classes'), {name, teacherId: uid, createdAt: fs.serverTimestamp()});
      if (!sameTeacher(uid, session)) return;
      el('class-name').value = '';
      classStatus('“' + name + '” sınıfı oluşturuldu.', 'success');
      await loadClasses();
    } catch (error) {
      if (!sameTeacher(uid, session)) return;
      classStatus(error.code === 'permission-denied' ? 'Sınıf kaydedilemedi. Yeni sınıf erişim kurallarının Firebase’de yayımlandığını kontrol edin.' : 'Sınıf kaydedilemedi. Bağlantınızı kontrol edin; yeniden denemeden önce listeyi yenileyin.', 'error');
    } finally {
      if (sameTeacher(uid, session)) {
        savingClass = false;
        el('create-class').disabled = false;
        el('create-class').textContent = 'Sınıf oluştur';
      }
    }
  });
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
    clearClasses();
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
      if (profile.role === 'teacher') {
        teacherUid = user.uid;
        el('intro-view').hidden = true;
        el('classes-view').hidden = false;
        el('menu-home').textContent = 'Sınıflarım';
        await loadClasses();
      }
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
        clearClasses();
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
