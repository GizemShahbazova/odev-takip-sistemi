# Ödev Takip Sistemi — Öğrenciler (v0.3)

Öğretmen girişi, sınıf oluşturma, sınıfları listeleme, seçilen sınıfa öğrenci ekleme ve öğrenci listesini görüntüleme. Mevcut Firebase projesi ve sınıf kayıtlarıyla çalışır. Ödev ve veli bağlantısı sonraki aşamada.

## Güncelleme sırası

1. ZIP’i bilgisayarda ayıklayın.
2. `firestore.rules` dosyasının tamamını Not Defteri gibi bir metin düzenleyiciden kopyalayın.
3. Firebase Console → `odev-takip-sistemi-6652a` → Firestore Database → Rules: mevcut kural metninin tamamını yeni dosyayla değiştirin, Publish’e basın.
4. GitHub → `GizemShahbazova/odev-takip-sistemi` → Add file → Upload files: bu paketteki beş dosyayı deponun köküne yükleyin ve Commit changes ile kaydedin. Aynı adlı dosyalar güncellenir. ZIP veya ayrı klasör yüklemeyin.
5. Pages yayını tamamlanınca https://gizemshahbazova.github.io/odev-takip-sistemi/ adresini Ctrl+F5 ile yenileyin.
6. Gizem’in mevcut hesabıyla giriş yapın. `5-A` satırındaki Öğrenciler düğmesine tıklayın.
7. Deneme için `Örnek Öğrenci` adını yazıp Öğrenci ekle’ye basın. Listede göründüğünü kontrol edin.
8. F5 ile yenileyin, ardından tekrar `5-A → Öğrenciler` ekranını açın. Öğrenci listede kalmalı. Sayfa yenilendiğinde ilk ekran Sınıflarım olur.

Firebase kurallarını yayımlamak ve GitHub dosyalarını yüklemek iki ayrı işlemdir. GitHub’a firestore.rules yüklemek Firebase kurallarını otomatik değiştirmez. Öğrenci koleksiyonunu elle oluşturmak gerekmez.

## Veri modeli ve erişim

- `users/{UID}`: mevcut name ve role kaydı. Kullanıcı yalnızca kendi profilini okuyabilir; siteden rol değiştirilemez.
- `classes/{classId}`: name, teacherId ve createdAt. Öğretmen yalnızca kendi sınıflarını oluşturur ve okur.
- `classes/{classId}/students/{studentId}`: name (1–100 karakter metin) ve createdAt (sunucu zamanı).
- Öğrenciler için izin, üstteki sınıfın sahibinin UID’si ve kullanıcının teacher rolü kontrol edilerek verilir. Bir öğretmen başka öğretmenin sınıfına öğrenci ekleyemez veya öğrenci listesini okuyamaz.
- Güncelleme ve silme bu aşamada kapalıdır. Veli erişimi, ödevler ve diğer koleksiyonlar henüz açılmaz.
- Her kayıt ayrı kimlik alır; aynı isimli öğrenciler mümkün olduğundan ad benzersizliği zorunlu değildir. Ekle düğmesine tekrar basmak yeni bir kayıt oluşturur.
- Liste alfabetik sıralanır. Yanındaki sayı yalnızca sıra numarasıdır, okul numarası değildir.
- Kayıt sırasında başka ekrana geçilse de başlatılan kayıt seçilen sınıfta tamamlanabilir. Gecikmiş yanıtlar başka sınıfın ekranını değiştirmez.
- Firebase web ayarları kullanıcı şifresi değildir; dosyalarda kullanıcı şifresi veya yönetici anahtarı bulunmaz.

## Doğrulama

JavaScript sözdizimi, HTML eleman kimlikleri ve dosya bağlantıları kontrol edildi. Firebase taklitleriyle mevcut sınıf listesi, sınıfa bağlı öğrenci sorgusu/kaydı, boş/uzun ad reddi, kayıt hatasında formun korunması, sınıf değiştirme, gecikmiş yanıtlar, oturum değişimi, çıkışta temizleme ve veli arayüzü kontrolleri yapıldı. Bunlar gerçek Firebase yetki testlerinin yerine geçmez. Yeni öğrenci kurallarının canlı serviste yayımlanması, gerçek kayıt kalıcılığı ve telefon görünümü kullanıcı ile doğrulanacak.

Önceki sürümün giriş, çıkış, sınıf oluşturma ve sayfa yenilemede sınıf kalıcılığı kullanıcı tarafından doğrulanmıştı.

Kaynaklar: https://firebase.google.com/docs/firestore/security/rules-conditions ve https://firebase.google.com/docs/firestore/manage-data/add-data
