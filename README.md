# Ödev Takip Sistemi — Ödevler (v0.4)

Öğretmen girişi; sınıf oluşturma; öğrenci ekleme; sınıfa ödev ekleme ve ödevleri listeleme. Sınıf satırında Öğrenciler ve Ödevler düğmeleri bulunur. Açılan sınıf ekranında bu iki bölüm arasında geçiş yapılabilir.

## Güncelleme sırası

1. Bu ZIP’i bilgisayarda ayıklayın.
2. `firestore.rules` dosyasını Not Defteri ile açıp tamamını kopyalayın.
3. Firebase Console → `odev-takip-sistemi-6652a` → Firestore Database → Rules: mevcut kural metninin tamamını yeni dosyayla değiştirin ve Publish’e basın.
4. GitHub → `GizemShahbazova/odev-takip-sistemi` → Add file → Upload files: paketteki beş dosyayı deponun köküne yükleyin ve Commit changes ile kaydedin. Aynı adlı dosyalar güncellenir. ZIP veya ayrı klasör yüklemeyin.
5. Pages yayını tamamlanınca https://gizemshahbazova.github.io/odev-takip-sistemi/ adresini Ctrl+F5 ile yenileyin.
6. Gizem’in mevcut hesabıyla giriş yapın. `5-A → Ödevler` ekranını açın.
7. Örnek başlık: `Unit 1 kelime çalışması`. Açıklama: `İlk 10 kelimeyi deftere yazın.` Geçerli bir teslim günü seçip Ödev ekle’ye basın.
8. F5 ile yenileyin ve tekrar `5-A → Ödevler` ekranını açın. Ödev ve teslim tarihi listede kalmalı.
9. Öğrenciler bölümüne geçip önceki Öğrenci A ve Öğrenci B kayıtlarını da kontrol edin.

Firebase kurallarını yayımlamak ve GitHub dosyalarını yüklemek ayrı işlemlerdir. GitHub’a firestore.rules yüklemek Firebase’deki kuralları otomatik değiştirmez. Yeni ödev koleksiyonu ilk kayıtla oluşur; elle oluşturmak gerekmez.

## Ödev alanları

- Başlık: zorunlu, 1–120 karakter.
- Açıklama: isteğe bağlı, en fazla 2000 karakter. Satır sonları listede korunur.
- Son teslim tarihi: zorunlu, 2000–2099 arasında bir takvim günü.
- Ödevler en yakın teslim gününden başlayarak sıralanır; aynı gündekiler başlığa göre sıralanır.
- Teslim tarihi yalnızca gün içerir; saat veya saat dilimi dönüşümü uygulanmaz. Geçmiş tarihli kayıtlar da kabul edilir.
- Ödev eklemek bu aşamada sınıfın ödev listesine kayıt oluşturur. Veli erişimi ve öğrenciye göre tamamlanma takibi sonraki aşamadadır.

## Veri modeli ve erişim

- `users/{UID}`: name ve role. Kullanıcı yalnızca kendi profilini okuyabilir; site üzerinden rol değiştirilemez.
- `classes/{classId}`: name, teacherId ve createdAt. Öğretmen yalnızca kendi sınıflarını oluşturur ve okur.
- `classes/{classId}/students/{studentId}`: name ve createdAt.
- `classes/{classId}/assignments/{assignmentId}`: title, description, dueDate (`YYYY-MM-DD` metni), createdAt (sunucu zamanı).
- Öğrenci ve ödev erişimi, üstteki sınıfın sahibi ve kullanıcının teacher rolü kontrol edilerek verilir. Öğretmen başka öğretmenin sınıfına erişemez.
- Ödev kuralı izin verilen alanları, metin uzunluklarını, tarih biçimini ve sunucu kayıt zamanını kontrol eder. Arayüz gerçek takvim gününü de doğrular; örneğin 30 Şubat kabul edilmez.
- Güncelleme ve silme bu aşamada kapalıdır. Veli ve tamamlanma kayıtları için izin henüz verilmez.
- Her ekleme ayrı kimlik alır. Başlatılan kayıt işlemi ekran değişse de seçildiği sınıfta tamamlanabilir; gecikmiş yanıtlar yeni ekranı değiştirmez.
- Firebase web ayarları kullanıcı şifresi değildir. Pakette kullanıcı şifresi veya yönetici anahtarı bulunmaz.

## Doğrulama

JavaScript sözdizimi, HTML eleman kimlikleri, dosya bağlantıları ve ZIP bütünlüğü kontrol edildi. Firebase taklitleriyle sınıfa bağlı ödev kaydı/sorgusu, başlık ve açıklama sınırları, boş ve geçersiz tarihler, artık yıl, tarih sıralaması/gösterimi, hata durumunda formun korunması, bölüm ve sınıf değiştirme, gecikmiş yanıtlar, oturum yenilenmesi ve çıkışta temizleme kontrol edildi. Önceki öğrenci işlemlerinin kontrolleri de geçti.

Bu kontroller gerçek Firebase yetki testlerinin yerine geçmez. Yeni kuralların serviste yayımlanması, gerçek ödev kalıcılığı ve telefon görünümü kullanıcı ile doğrulanacak. Önceki sürümde giriş, çıkış, sınıf ve öğrenci kaydının yenilemeden sonra kaldığı kullanıcı tarafından doğrulanmıştı.

Kaynaklar: https://firebase.google.com/docs/firestore/security/rules-conditions ve https://firebase.google.com/docs/firestore/manage-data/add-data
