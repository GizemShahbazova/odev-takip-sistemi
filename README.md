# Ödev Takip Sistemi

Gizem’in Firebase Spark ve GitHub Pages üzerinde çalışan ödev takip sitesi.

Öğretmen sınıfları, kullanıcı koduyla kayıtlı öğrencileri, ödevleri ve tamamlanma durumlarını yönetir. Veliler BTAL kullanıcı adı ve şifreyle giriş yapar; yalnız hesaplarına bağlanan öğrencilerin ödevlerini okur. Kendi şifresini Ayarlar’dan değiştirebilir. Yönetici sıfırlama ve toplu hesap oluşturma, öğretmenin bilgisayarındaki özel yönetim uygulamasından yapılır.

## Öğrenci kimliği

Öğrenciler ad soyad yerine **btal100002** gibi kullanıcı koduyla gösterilir ve kaydedilir. Aynı kod veli hesabı için de kullanılır. Öğretmen ve veli kodun hangi öğrenciye ait olduğunu kendi kayıtlarından takip eder. Eski isimli kayıtlar ekranda **Kod atanmadı** olarak görünür; öğretmen aynı kayıt üzerinde kullanıcı kodunu düzenleyebilir. Kod düzenleme mevcut ödev sonuçlarını silmez.

Sınıf listesi, takip tablosu, veli kartı, bildirimler ve düzenleme/silme pencerelerinde eski öğrenci isimleri gösterilmez. Yeni Firestore öğrenci yazımları BTAL kod biçiminde olmalıdır. Yeni öğrenci bağlantısı oluşturulurken öğrenci ve veli kodlarının eşleşmesi denetlenir.

## Dosyalar

Depo ana dizinindeki **index.html**, **app.js**, **parent-auth.js** ve **style.css** web uygulamasıdır. **firestore.rules** Firebase Console’da Firestore Database → Rules bölümünden yayımlanır. Materyaller **materyaller/** altındadır.

Özel hizmet hesabı anahtarı, yerel yönetim programı veya başlangıç şifrelerini içeren Excel bu depoya yüklenmez. Erişim yetkileri Firestore Security Rules tarafından uygulanır. Otomatik e-posta veya push bildirimi eklenmedi; mevcut bildirimler site açıldığında veya yenilendiğinde gösterilir.
