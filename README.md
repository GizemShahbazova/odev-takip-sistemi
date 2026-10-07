# Ödev Takip Sistemi — Sınıflar (v0.2)

Öğretmen girişi, kendi kullanıcı profilini okuma, sınıf oluşturma ve kendi sınıflarını listeleme. METUClass’tan esinlenen, telefona uyumlu düzen. Öğrenci, ödev ve veli eşleştirmesi sonraki aşamada.

## Güncelleme sırası

1. Bu ZIP’i bilgisayarda ayıklayın.
2. `firestore.rules` dosyasını bir metin düzenleyicide açıp tamamını kopyalayın.
3. Firebase Console → `odev-takip-sistemi-6652a` → Firestore Database → Rules: mevcut metni bu dosyanın tamamıyla değiştirin ve Publish’e basın. Başarılı yayın olmadan sınıflar çalışmaz.
4. GitHub → `GizemShahbazova/odev-takip-sistemi` → Add file → Upload files: bu paketteki beş dosyayı deponun köküne yükleyin, Commit changes ile kaydedin. Aynı adlardaki dosyalar güncellenir; ayrı klasör veya ZIP yüklemeyin.
5. Pages yayını tamamlanınca https://gizemshahbazova.github.io/odev-takip-sistemi/ adresini açın. Eski ekran görünüyorsa Ctrl+F5 ile yenileyin.
6. Gizem’in mevcut hesabıyla giriş yapın. Sınıflarım ekranında örnek `5-A` sınıfını oluşturun, sayfayı yenileyerek kayıtlı kaldığını kontrol edin.

GitHub’a firestore.rules yüklemek Firebase’deki kuralları otomatik yayımlamaz. İlk adım olan Firebase Console yayını ayrıca gereklidir. Firestore’da classes koleksiyonunu elle açmak gerekmez; ilk sınıf kaydıyla oluşur.

## Veri ve yetkiler

- `users/{UID}`: mevcut `name` ve `role` kaydı. Kullanıcı yalnızca kendi profilini okur. Site üzerinden rol değiştirilemez.
- `classes/{otomatik kimlik}`: `name` (1–60 karakter metin), `teacherId` (öğretmen UID), `createdAt` (sunucu zamanı).
- Öğretmen rolü Firestore’daki kullanıcı belgesinden kontrol edilir. Öğretmen yalnızca kendi UID’siyle sınıf oluşturabilir ve kendi sınıflarını okuyabilir. Liste sorgusu teacherId filtresi içerir.
- Güncelleme ve silme bu aşamada kapalıdır; diğer koleksiyonlar için izin verilmez.
- Firebase web ayarları giriş şifresi değildir. Pakette kullanıcı şifresi veya yönetici anahtarı bulunmaz.

## Kontroller

JavaScript sözdizimi ve HTML dosya/eleman bağlantıları kontrol edildi. Firebase taklitleriyle öğretmen filtresi, sınıf kaydetme ve listeleme, boş ad, kayıt hatası, çıkışta temizleme, gecikmiş liste yanıtı ve veli arayüzü kontrolleri yapıldı. Bunlar canlı Firebase yetki testlerinin yerine geçmez. Yeni kuralların gerçek serviste yayımlanması, sınıf kayıtlarının kalıcılığı ve telefon görünümü kullanıcı ile doğrulanacak. Önceki v0.1 girişi, profil okuma, sayfa yenilemede oturumun korunması ve çıkış kullanıcı tarafından doğrulanmıştı.

Kaynaklar: https://firebase.google.com/docs/firestore/manage-data/add-data ve https://firebase.google.com/docs/firestore/security/rules-conditions
