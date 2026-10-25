# Ödev Takip Sistemi — BTAL girişi ve Ayarlar

Öğretmen sınıfları, öğrencileri, ödevleri ve ödev durumlarını yönetir. Öğrenci/veli hesabı yalnız kendisine bağlı öğrencileri takip eder.

- Öğrenci/veli: **btal + altı rakam** biçiminde kullanıcı adı ve şifre; örnek `btal100001`.
- Yerel yönetim uygulaması başlangıç şifresi üretir. Kullanıcı giriş yaptıktan sonra **Ayarlar → Şifre değiştir** ile mevcut şifresini doğrulayıp kendi şifresini belirleyebilir.
- Unutulan öğrenci/veli şifresi aynı yerel yönetim uygulamasından sıfırlanır; kullanıcı adı ve çocuk bağlantıları korunur.
- Öğretmen mevcut e-posta/şifreyle giriş yapar. Ayarlar'dan kendi şifresini değiştirebilir.
- Önceki sayısal kullanıcı kodları ve tek kullanımlık şifre oluşturma anahtarları desteklenir.
- Düzenleme/arşivleme, öğretmenin tamamlandı/beklemede/yapılmadı durumları ve Materyaller korunur.

Firebase Authentication ve Cloud Firestore kullanılır; bu güncelleme Cloud Functions gerektirmez. Parola değişikliği Auth'ta yapılır. Yönetim anahtarı siteye veya GitHub'a konulmaz.

Firestore kuralları önceki sürümle aynıdır. Excel/toplu kayıt ve otomatik e-posta gönderimi bu sürüme dahil değildir. Oyun puanları hesaba kaydedilmez.
