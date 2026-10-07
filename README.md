# Ödev Takip Sistemi — Veli ekranı (v0.5)

Öğretmenlerin sınıf, öğrenci ve ödev işlemleri korunur. Veli kendi hesabına bağlanan öğrencilerin adlarını, sınıflarını, sınıf ödevlerini, açıklamaları ve teslim tarihlerini görür. Bir veliye birden fazla sınıftan birden fazla çocuk bağlanabilir. Bu sürüm görüntüleme içindir; tamamlandı işareti ve öğretmenin sonuç tablosu sonraki adımdır.

## Yükleme

1. ZIP’i ayıklayın. İçindeki beş dosya: index.html, style.css, app.js, firestore.rules, README.md.
2. firestore.rules dosyasını Not Defteri ile açıp tamamını kopyalayın.
3. Firebase Console → Firestore Database → Rules: mevcut metnin tamamını yeni kurallarla değiştirin, Publish’e basın.
4. GitHub → GizemShahbazova/odev-takip-sistemi → Add file → Upload files: beş dosyayı mevcut dosyaların üstüne, deponun köküne yükleyin; Commit changes ile kaydedin. ZIP veya klasör yüklemeyin.
5. Pages yayını tamamlandıktan sonra https://gizemshahbazova.github.io/odev-takip-sistemi/ adresini Ctrl+F5 ile yenileyin.

GitHub’a firestore.rules yüklemek Firebase kurallarını yayımlamaz; iki işlem ayrıdır. Mevcut kullanıcı, sınıf, öğrenci ve ödev belgelerini silmek veya yeniden oluşturmak gerekmez.

## Veli bağlantısı

Firebase Authentication’daki veli hesabının UID’si ile Firestore’da kullanıcı belgesi oluşturulur:

- users/{veliUID}: name (string) ve role (string, parent).
- users/{veliUID}/children/{classId}: studentIds (array). Her öğe string türünde, o sınıfın öğrencisinin belge kimliğidir.
- children belgesinin kimliği sınıf adı değil, classes içindeki sınıfın belge kimliğidir.
- studentIds içindeki öğe öğrenci adı değil, sınıfın students alt koleksiyonundaki öğrenci belge kimliğidir.
- Aynı sınıftaki ikinci çocuk aynı dizide ikinci string olarak eklenir. Başka sınıftaki çocuk için children altında o sınıf kimliğiyle başka belge oluşturulur.
- Bu bağlantılar bu sürümde proje yöneticisi tarafından Firebase Console üzerinden yönetilir. Site üzerinden profil, rol veya bağlantı değiştirilemez.
- Gerçek kullanıcı e-postalarını veya şifrelerini GitHub dosyalarına eklemeyin. Pakette kullanıcı şifresi ve yönetici anahtarı yoktur.

## Canlı kontrol

1. Gizem hesabından çıkın, deneme veli hesabıyla giriş yapın.
2. Veli panelinde Öğrenci A, 5-A, Ödev 1, açıklaması ve 09.10.2026 teslim tarihi görünmeli.
3. Öğrenci B ve öğretmenin sınıf/öğrenci/ödev ekleme formları görünmemeli.
4. F5 ile yenileyin; veli profili, bağlı çocuk ve ödevler yeniden yüklenmeli.
5. Çıkış yapın; çocuk ve ödev kartları kaybolmalı. Gizem’in hesabına dönüp eski sınıf, öğrenciler ve ödev kaydını kontrol edin.
6. Telefonda metinleri, tarihleri ve Yenile düğmesini kontrol edin. Yeni ödevler için Yenile düğmesine basılır; otomatik canlı abonelik bu sürümde yoktur.

## Erişim kuralları

Veli yalnızca kendi users belgesini ve kendi children alt koleksiyonunu okur. Bağlandığı sınıfın belgesini ve sınıf ödevlerini okuyabilir. Öğrenci belgelerinin tekil okumalarında öğrenci kimliği studentIds dizisinde olmalıdır. Sınıfları veya sınıfın tüm öğrencilerini sorgulama veliye kapalıdır. Veliye hiçbir veri yazma izni verilmez. Öğretmenin erişimi sınıf sahipliğiyle sınırlı kalır.

Sınıf belgesinin tüm alanları yetkili veliye okunabilir; mevcut alanlar name, teacherId ve createdAt’tir. Gizli öğretmen notları veya iletişim bilgileri bu belgeye eklenmemelidir; ayrı erişim kurallı belge gerekir. Tüm sınıf ödevleri o sınıfa bağlı çocuklar için ortak kabul edilir.

Bağlantı kaldırılırsa sonraki sunucu okuması erişimi reddeder. Yenile veya F5 ekranı yeni bağlantılara göre yeniden yükler; önceden okunup ekranda duran veriler kendiliğinden geri alınmaz. Her yenileme önce eski veli kartlarını temizler. Bir sınıf bağlantısı bozuksa diğer geçerli sınıflar gösterilir ve hata mesajı görünür.

## Yetkiyi bağımsız doğrulama

Firebase Console → Rules → Rules Playground ile aşağıdaki tekil get istekleri ayrıca denenmelidir. Authenticated açık, UID deneme velisinin UID’si olmalıdır. Yollardaki classId ve studentId yerine gerçek belge kimlikleri kullanılır.

| İstek | Beklenen |
| --- | --- |
| users/{veliUID} | İzin |
| users/{veliUID}/children/{bağlıClassId} | İzin |
| classes/{bağlıClassId} | İzin |
| classes/{bağlıClassId}/students/{ÖğrenciAId} | İzin |
| classes/{bağlıClassId}/students/{ÖğrenciBId} | Ret |
| classes/{bağlıClassId}/assignments/{Ödev1Id} | İzin |
| users/{öğretmenUID} | Ret |
| users/{başkaVeliUID}/children/{classId} | Ret |

Authenticated kapalıyken aynı okuma istekleri reddedilmelidir. Veli UID’siyle users/{veliUID} üzerinde role alanını teacher olarak güncelleme veya kendi children belgesini değiştirme isteği reddedilmelidir. Rules Playground tekil simülasyonları sorgu testlerinin yerine geçmez; sınıf/öğrenci koleksiyonu sorgusu kurallarda öğretmen rolüyle sınırlanmıştır.

## Yapılan kontroller ve sınırları

JavaScript sözdizimi, HTML kimlikleri/bağlantıları ve ZIP bütünlüğü kontrol edildi. Taklit Firebase SDK ile bağlı öğrenci yolları, veli arayüzünün yazma yapmaması, tarih sıralaması, düz metin gösterimi, birden çok çocuk/sınıf, boş durum, yenilemede kaldırılan bağlantıların temizlenmesi, bozuk bağlantılar, yükleme hataları, oturum yenilenmesi ve gecikmiş yanıtların diğer oturumları etkilememesi test edildi. Önceki öğretmen sınıf/öğrenci/ödev kontrolleri geçti.

Bu testler Firebase Security Rules motorunu çalıştırmaz. Ortamda Firebase Emulator hazır olmadığından kurallar otomatik emülatör testinden geçirilmedi. Tarayıcı ve telefon görünümü de burada canlı doğrulanmadı. Yukarıdaki canlı giriş ve izin/ret kontrolleri yüklemeden sonra yapılmalıdır. Önceki sürümün giriş, sınıf, öğrenci ve ödev kalıcılığı kullanıcı tarafından doğrulanmıştı.

Kaynaklar:
- https://firebase.google.com/docs/firestore/security/rules-conditions
- https://firebase.google.com/docs/firestore/security/rules-query
- https://firebase.google.com/docs/rules/unit-tests
