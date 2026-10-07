# Ödev Takip Sistemi — Tamamlanma ve sınıf tablosu (v0.6)

Veli kendi çocuğunun her ödevini tamamlandı olarak işaretler ve yanlış işareti geri alabilir. Gizem sınıfın Takip tablosunda öğrencileri satırlarda, ödevleri sütunlarda ve tamamlanan sayısını görür. Önceki sınıf, öğrenci, ödev ve veli bağlantıları korunur; veri taşıma gerekmez.

## Yükleme

1. ZIP’i ayıklayın.
2. firestore.rules dosyasının tamamını Firebase Console → Firestore Database → Rules bölümüne yapıştırın; mevcut metni tamamen değiştirin, Publish’e basın.
3. GitHub → GizemShahbazova/odev-takip-sistemi → Add file → Upload files: paketteki beş dosyayı mevcut dosyaların bulunduğu köke yükleyin ve Commit changes ile kaydedin. ZIP veya ayrı klasör yüklemeyin.
4. Yayın tamamlanınca https://gizemshahbazova.github.io/odev-takip-sistemi/ adresini Ctrl+F5 ile yenileyin.

GitHub’a kuralların dosyasını yüklemek Firebase kurallarını yayımlamaz. Yeni completions koleksiyonu ilk işaretlemede kendiliğinden oluşur; elle açmak gerekmez.

## Canlı test — adım adım

1. Deneme veli hesabıyla giriş yapın. Öğrenci A → Ödev 1 kartında Bekliyor görünmeli. Öğrenci B görünmemeli.
2. Tamamlandı olarak işaretle düğmesine basın. Kaydedildi mesajını bekleyin; durum Tamamlandı olmalı.
3. F5 yapın; Tamamlandı durumu geri gelmeli.
4. Veli hesabından çıkın, Gizem hesabıyla giriş yapın. Sınıflarım → 5-A → Takip tablosu açın.
5. Öğrenci A’nın Ödev 1 hücresi Tamamlandı, Öğrenci B’ninki Bekliyor olmalı. İki öğrenci ve tek ödev varsa genel toplam 1 / 2 tamamlanan olmalı.
6. Veliye dönün, İşareti geri al düğmesine basın. F5 sonrasında Bekliyor kalmalı. Gizem’in takip tablosunu Yenile düğmesiyle yeniden yükleyince Öğrenci A da Bekliyor görünmeli.
7. İsterseniz yeniden Tamamlandı olarak işaretleyin. Yeni ödev eklenirse tüm öğrenciler için başlangıç durumu Bekliyor’dur.
8. Önceki öğrenci listesi, ödev listesi ve sınıf oluşturma işlemlerini kontrol edin. Telefonda veli düğmelerini ve takip tablosunu deneyin; geniş tablo yatay kaydırılır.

Tablo veli bildirimini gösterir; öğretmenin ödevi değerlendirip onayladığı anlamına gelmez. Bekliyor, bildirim yapılmamış veya işaret geri alınmış demektir; öğrencinin kesinlikle çalışmadığını göstermez. Yeni veriler otomatik abonelikle gelmez: Yenile veya F5 kullanılır.

## Veri modeli

- users/{UID}: name ve role (teacher veya parent). Kullanıcı yalnızca kendi profilini okuyabilir, rolünü değiştiremez.
- users/{veliUID}/children/{classId}: studentIds array. Her öğe o sınıftaki öğrencinin belge kimliği olan string’dir. Bu bağlantılar Firebase Console üzerinden yönetilir.
- classes/{classId}: name, teacherId, createdAt.
- classes/{classId}/students/{studentId}: name, createdAt.
- classes/{classId}/assignments/{assignmentId}: title, description, dueDate (YYYY-MM-DD), createdAt.
- classes/{classId}/students/{studentId}/completions/{assignmentId}: completed (boolean), updatedBy (veli UID’si), updatedAt (serverTimestamp).

Tamamlanma belgesinin kimliği ödev kimliğidir. Aynı düğmeye tekrar basmak yeni kayıt üretmez; mevcut durum güncellenir. completed false işareti geri alır; belge silinmez. Kayıt yoksa Bekliyor kabul edilir. Bir çocuğa iki veli bağlıysa ortak durumu güncellerler; son sunucuya ulaşan kayıt geçerlidir. updatedAt son değişikliğin zamanıdır; ilk tamamlanma zamanı ve değişiklik geçmişi tutulmaz.

Öğretmen tablosu mevcut öğrenci ve ödevleri okur, her öğrencinin completions koleksiyonunu sorgular. Sınıf toplamı yalnızca mevcut ödev sütunlarını sayar. Başka ödeve ait eski kayıtlar sayılmaz. Başlangıç sürümünde veri sunucudan her yenilemede yeniden okunur; öğrenci sayısı arttıkça bu okumalar da artar.

## Erişim

- Veli kendi profilini ve children bağlantılarını okur.
- Bağlı sınıfın ödevlerini ve yalnızca bağlı öğrencinin belgesini ve completions alt koleksiyonunu okur.
- Tamamlanma kaydı oluşturma/güncelleme yalnızca ilgili öğrenciye bağlı veliye açıktır. Hem öğrenci hem ödev mevcut olmalıdır.
- Kayıt yalnızca completed, updatedBy, updatedAt alanlarını içerir. completed boolean olmalı, updatedBy giriş yapan UID ile aynı olmalı, updatedAt sunucu istek zamanı olmalıdır.
- Veli rolünü, çocuk bağlantısını, öğrenci veya ödev kaydını değiştiremez. Öğrenci/sınıf listesini sorgulayamaz.
- Öğretmen yalnızca kendisine ait sınıfın tamamlanma kayıtlarını okur; bu sürümde velinin bildirimini değiştiremez.
- Silme kapalıdır. Bağlantısı kaldırılan veli sonraki sunucu isteğinde erişimini kaybeder. Önceden okunmuş ekranı temizlemek için Yenile/F5 gerekir.

Tamamlanma okumalarından biri başarısız olursa öğretmen tablosu gösterilmez ve hata mesajı görünür; yüklenemeyen kayıtlar Bekliyor gibi gösterilmez. Veli ekranında da bir sınıfın gerekli okumaları başarısızsa o sınıfın kartları gösterilmez ve hata belirtilir. Kayıt sırasında düğme ve Yenile kilitlenir. Başlatılmış kayıt oturum değişse de sunucuda tamamlanabilir; gecikmiş yanıt başka oturumun ekranını değiştirmez.

## Yetki kontrolü

Canlı olumlu testleri yukarıdaki veli/öğretmen adımlarıyla yapın. Firebase Rules Playground ile ayrıca deneme veli UID’sini kullanarak:

- Öğrenci A’nın completions belgesini tekil get ile okumak: izin.
- Öğrenci B’nin completions belgesini okumak veya oluşturmak: ret.
- Başka veli profilini veya children belgesini okumak: ret.
- Kendi profile role: teacher yazmaya çalışmak: ret.
- Kendi children bağlantısını değiştirmek: ret.
- Tamamlanma belgesine completed: "true" (string), yanlış updatedBy veya fazladan alan yazmak: ret.
- Var olmayan bir ödev kimliğine tamamlanma yazmak: ret.
- Oturum kapalıyken okumak veya yazmak: ret.

Yer tutucu UID, classId, studentId, assignmentId değerlerini gerçek belge kimlikleriyle değiştirin. Doğru tamamlanma yazımı serverTimestamp kullanan canlı site üzerinden doğrulanır; elle girilen timestamp request.time ile aynı olmayabilir. Tekil simülasyon sorgu testinin yerine geçmez.

## Kontroller ve sınırları

JavaScript sözdizimi, HTML kimlikleri ve dosya bağlantıları, kuralların completions bloğunun doğru öğrenci yolunda bulunması ve ZIP bütünlüğü kontrol edildi. Taklit Firebase SDK ile işaretleme/geri alma, belirli belgeye yazma, sunucu zamanı alanı, yenileme ve yeni oturumda kalıcılık, hata halinde durumun korunması, tekrarlanan tıklama, kayıt sırasında yenileme engeli, gecikmiş kayıt/okuma yanıtları ve öğretmen tablosunun öğrenci/ödev toplamları test edildi. Önceki veli ve öğretmen işlemlerinin kontrolleri geçti.

Bu testler gerçek Firebase Security Rules motorunu çalıştırmaz. Firebase Emulator ortamda hazır değil; kurallar otomatik emülatör testinden geçirilmedi. Tarayıcı ve telefon görünümü burada canlı doğrulanmadı. Kullanıcı önceki sürümde veli hesabının Öğrenci A ve Ödev 1’i gördüğünü doğruladı; yeni tamamlanma kaydı ve izin/ret kontrolleri yüklemeden sonra birlikte doğrulanacak.

Pakette kullanıcı şifresi ve yönetici anahtarı yoktur. Firebase web ayarları uygulama kimliğidir; veri erişimi Security Rules ile sınırlandırılır.

Kaynaklar:
- https://firebase.google.com/docs/firestore/manage-data/add-data
- https://firebase.google.com/docs/firestore/security/rules-fields
- https://firebase.google.com/docs/firestore/security/rules-conditions
- https://firebase.google.com/docs/rules/unit-tests
