# Ödev Takip Sistemi

GitHub Pages üzerinde çalışan, Firebase Authentication ve Cloud Firestore kullanan öğretmen/öğrenci uygulaması.

- Öğretmen sınıf, kodlu öğrenci kaydı ve ödev oluşturur; durumları günceller.
- Her BTAL kodu ayrı öğrenci hesabıdır. Hesap bir öğrenci kaydıyla eşleştirilir; öğrenci ekranında seçim listesi yoktur.
- İsteğe bağlı öğrenci adı yalnız giriş yapılan cihazın tarayıcısında tutulur. student-device.js bu etiketi ağ isteğiyle göndermez. Diğer hesapta ve öğretmen ekranında gösterilmez; Ayarlar’dan kaldırılabilir.
- Firestore öğrenci name alanı yalnız BTAL kodu kabul eder. Kullanıcı koduyla öğrenci kodu uyuşmadığında okuma reddedilir.
- Hesaplar ve öğrenci eşleştirmeleri öğretmenin bilgisayarındaki özel yönetim aracıyla yapılır. Özel araç, Excel ve hizmet hesabı anahtarı bu depoya yüklenmez.
- Materyaller bölümündeki iki oyun korunur. Oyun sonuçları Firebase’e kaydedilmez.
- Bildirimler sayfa yenilendiğinde görünen durumlar ve yaklaşan teslim tarihleridir; otomatik e-posta/push gönderimi yoktur.

## Yayın

site klasörünün ana dosyaları doğrudan GitHub Pages kök dizininde olmalıdır. student-device.js, parent-auth.js ve app.js birlikte sunulmalıdır. firestore.rules dosyasının içeriği Firebase Console → Firestore Database → Rules bölümünden ayrıca yayınlanır.

## Yerel isim etiketi

Etiket hesap UID’si ve kullanıcı koduyla ayrılmış yerel tarayıcı kaydıdır. Şifreli depolama değildir; ortak cihazda baş harf tercih edin veya işiniz bitince kaldırın. Site verileri silinirse etiket kaybolur. Hesabın kendisi, şifresi ve ödevleri Firebase’de kalır. Gerçek öğrenci isimlerini kaynak koduna veya örnek verilere yazmayın.
