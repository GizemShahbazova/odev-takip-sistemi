# Ödev Takip Sistemi

Öğretmen sınıfları, öğrencileri, ödevleri ve tamamlanma durumlarını yönetir. Veliler yalnızca kendilerine bağlı öğrencileri takip eder.

- Veli: altı haneli kod ve şifre. İlk girişte veya şifre unutulunca öğretmenin verdiği geçici anahtarla yeni şifre belirleme.
- Öğretmen: **E-posta ile giriş** bölümünden mevcut hesabıyla giriş.
- Materyaller: kelime ve okuma oyunları; puanları hesaba kaydedilmez.
- Sınıf, öğrenci ve ödev düzenleme/silme özellikleri korunur. Silme kayıtları arşivler.

Firebase Authentication ve Cloud Firestore kullanılır. Cloud Functions gerekmez. Veli hesap yönetimi öğretmenin bilgisayarındaki ayrı uygulamada yapılır; hizmet hesabı anahtarı web dosyalarına konulmaz.

`firestore.rules` dosyasını GitHub'a koymak kuralları etkinleştirmez; Firebase Console üzerinden ayrıca yayımlamak gerekir. Otomatik e-posta ve arka planda bildirim gönderimi bu sürüme dahil değildir.
