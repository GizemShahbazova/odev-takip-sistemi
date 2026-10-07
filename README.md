# Ödev Takip Sistemi — Öğretmen durum yönetimi (v0.7)

İş akışı değişti: ödev durumunu yalnızca öğretmen belirler. Veli kendi çocuğunun ödevlerini, durumlarını ve site içindeki güncel bildirimleri görür; durum değiştiremez.

## Bu pakette çalışanlar

- Öğretmen: Sınıflarım → 5-A → Takip tablosu. Her öğrenci/ödev hücresinde Beklemede, Tamamlandı, Yapılmadı seçimi bulunur. Seçim sunucuda kaydedilir, toplamlar güncellenir.
- Veli: durum değiştirme düğmeleri kaldırıldı. Firebase kuralları da veliye tamamlanma yazma izni vermez.
- Veli ekranındaki Güncel bildirimler bölümü, öğretmenin kaydettiği güncel durumları ve son teslim tarihine üç gün veya daha az kalan tamamlanmamış ödevleri gösterir.
- Bu site içi bildirimler sayfa açılınca veya Yenile/F5 ile hesaplanır. Telefonun sistem bildirimleri veya e-posta değildir. Bildirim geçmişi ve okunma durumu tutulmaz.
- Üç günlük hesap Bakü takvim gününe (Asia/Baku) göre yapılır. Son teslim bugün de hatırlatma gösterilir. Tamamlanan ödevler için teslim hatırlatması gösterilmez.
- Önceki sınıf, öğrenci, ödev ve veli bağlantıları korunur. Eski boolean tamamlanma kayıtları okunmaya devam eder; Gizem bunları öğretmen tablosundan değiştirebilir.

## Henüz etkin olmayan e-postalar

Bu pakette otomatik e-posta gönderilmez. GitHub Pages üzerinde sayfa kapalıyken çalışan bir zamanlayıcı yoktur. E-posta otomasyonunun sunucuda kurulması gerekir.

Kullanıcının seçtiği tetikleyici: öğretmen Yapılmadı seçince ilgili veliye e-posta. Teslim tarihi geçti diye kendiliğinden Yapılmadı durumuna geçilmez.

Sonraki sunucu kurulumu için somut davranış:

1. Durum değişikliğinde öğrenciye bağlı velilerin hesapları bulunur. Güncel durum bildirimleri ilgili velilerin site içi bildirim kaydına eklenir.
2. Yeni durum Yapılmadı ise ilgili velilerin e-posta adreslerine bilgilendirme gönderilir. Aynı olay yeniden işlendiğinde tekrar gönderilmesini önleyen olay kimliği kullanılır.
3. Her gün Bakü saatiyle 09.00’da, son teslim tarihi tam üç gün sonra olan ödevler incelenir. Tamamlanmış öğrencilere hatırlatma gönderilmez. Aynı ödev/öğrenci/veli/teslim tarihi için hatırlatma bir kez oluşturulur.
4. E-postalar sunucudaki güvenilir kodun oluşturduğu kuyruğa alınır. Alıcılar kullanıcıların kendileri değil, mevcut yetkili veli bağlantılarıyla belirlenir. Tarayıcıya gönderim şifresi veya servis anahtarı konmaz.
5. Test önce deneme veli hesabıyla yapılır; gönderim ve hata kayıtları kontrol edilir. Yeniden deneme mekanizması ve e-posta hizmeti ayarları kurulur.

Firebase’in yerleşik Cloud Functions ve zamanlanmış iş yoluyla kurulumunda Blaze planı ve faturalandırma gerekir. Ayrıca SMTP/e-posta gönderim hizmeti gerekir. Spark planı bu frontend güncellemesi için yeterlidir; bu paket billing ayarı değiştirmez. E-posta ve telefon bildirimi kurulumunun tamamlandığı varsayılmamalıdır.

## Yükleme

1. ZIP’i ayıklayın.
2. firestore.rules dosyasının tamamını Firebase Console → Firestore Database → Rules bölümünde mevcut metnin tamamıyla değiştirin, Publish’e basın. Bu adım eski veli yazma yetkisini kapatır.
3. GitHub → GizemShahbazova/odev-takip-sistemi → Add file → Upload files: beş dosyayı mevcut dosyaların bulunduğu köke yükleyin ve Commit changes yapın. ZIP/klasör yüklemeyin.
4. Pages yayını tamamlandıktan sonra https://gizemshahbazova.github.io/odev-takip-sistemi/ adresini Ctrl+F5 ile yenileyin.

GitHub’a firestore.rules dosyası yüklemek Firebase kurallarını kendiliğinden yayımlamaz. Eski uygulamada açık kalan veli düğmesi yeni kurallar yayımlanınca yazamaz; Ctrl+F5 ile yeni arayüz yüklenir.

## Canlı doğrulama

1. Gizem hesabıyla 5-A → Takip tablosu açın. Öğrenci A → Ödev 1 için Beklemede seçin. Kaydedildi mesajından sonra F5 yapın; durum korunmalı.
2. Aynı hücreyi Tamamlandı yapın. Ardından deneme veli hesabına geçin. Öğrenci A’nın ödevi Tamamlandı görünmeli, durum değiştirme düğmesi bulunmamalı.
3. Gizem’e dönün, Yapılmadı seçin. Veli ekranını Yenile ile açın; kart ve Güncel bildirimler bölümü Yapılmadı göstermeli. Bu aşamada e-posta beklemeyin; gönderim hizmeti henüz kurulmadı.
4. Veli Öğrenci B’yi görmemeli. Öğretmen tablosunda Öğrenci B’nin durumu bağımsız kalmalı.
5. İsterseniz Beklemede’ye dönün. F5 ile kontrol edin.
6. Deneme hatırlatması için üç gün sonrasına teslim tarihli bir ödev ekleyin. Veli ekranında tamamlanmamış ödev için üç gün kaldı hatırlatması görünmeli. İki gün veya bir gün kaldığında site içi hatırlatma devam eder.
7. Telefon görünümünü kontrol edin; geniş öğretmen tablosu yatay kaydırılabilir.

## Durum kaydı ve erişim

Yol: classes/{classId}/students/{studentId}/completions/{assignmentId}

Yeni kayıt alanları:
- status: string — pending, completed veya missing.
- completed: boolean — status completed ise true, diğerlerinde false. Eski sürümle uyum için korunur.
- updatedBy: giriş yapan öğretmenin UID’si.
- updatedAt: serverTimestamp.

Yeni alanlar dışında alan kabul edilmez. Öğretmen yalnızca kendi sınıfındaki mevcut öğrenci ve mevcut ödev için durum kaydını oluşturabilir/güncelleyebilir. completed ile status tutarlı olmalıdır. updatedBy giriş yapan UID ve updatedAt sunucu istek zamanı olmalıdır. Silme kapalıdır.

Veli yalnızca bağlı öğrencisinin kayıtlarını okur; oluşturma/güncelleme/silme kapalıdır. Profil, rol ve çocuk bağlantısı değiştirmek site üzerinden kapalı kalır. E-posta kuyruğu veya sunucu bildirim koleksiyonu için istemci yazma izni bu pakette açılmaz.

Bir sonuç okuması başarısızsa tablo başarıyla yüklenmiş gibi gösterilmez. Kayıt başarısızsa önceki durum ve seçim korunur; hata mesajı gösterilir. Aynı hücrede tekrar tıklama ve kayıt sürerken Yenile engellenir. Açılmış kayıt işlemi gezinmeden sonra sunucuda tamamlanabilir; gecikmiş yanıt yeni oturumun ekranını değiştirmez.

İki öğretmen aynı hesapla farklı tarayıcılardan aynı durumu değiştirirse son sunucu kaydı geçerlidir. Değişiklik geçmişi bu sürümde yoktur.

## Yetki testleri

Canlı olumlu yazmayı öğretmen hesabıyla yapın. Rules Playground ile veli UID’siyle tamamlanma oluşturma/güncelleme isteği reddedilmelidir. Başka öğretmenin sınıfına yazma da reddedilmelidir. Yanlış status, completed ile tutarsız status, yanlış updatedBy, fazladan alan veya var olmayan ödev/öğrenciye yazma reddedilmelidir. Oturumsuz okumalar/yazmalar reddedilmelidir.

## Yapılan kontroller

JavaScript sözdizimi, HTML kimlikleri/dosya bağlantıları, ZIP bütünlüğü kontrol edildi. Taklit Firebase SDK ile öğretmenin üç durum arasında kayıt yapması, doğru öğrenci/ödev yolu ve öğretmen UID’si, toplamların güncellenmesi, hata halinde geri dönme, tekrar işlem/yenileme engeli, eski kayıt uyumu, velide işlem düğmesi olmaması, güncel bildirimler, Bakü takviminde üç gün sınırı, gecikmiş öğretmen yanıtlarının veli ekranını etkilememesi, yükleme hataları ve çıkışta temizleme test edildi. Önceki öğretmen sınıf/öğrenci/ödev işlemleri geçti.

Bu kontroller gerçek Firebase Security Rules motorunun testleri değildir. Firebase Emulator burada hazır değil; otomatik emülatör yetki testi yapılmadı. Canlı yetki, kalıcılık ve telefon görünümü yüklemeden sonra doğrulanmalıdır. E-posta gönderim testi yapılmadı; otomasyon bu pakette bulunmaz.

Kaynaklar:
- https://firebase.google.com/docs/functions/schedule-functions
- https://firebase.google.com/docs/functions/get-started
- https://firebase.google.com/docs/extensions/official/firestore-send-email
- https://firebase.google.com/docs/firestore/security/rules-fields
