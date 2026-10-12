# Ödev Takip Sistemi — Düzenleme ve silme (v0.8)

Öğretmen sınıf ve öğrenci adını, ödev başlığını/açıklamasını/teslim tarihini düzenler. Her kayıtta Düzenle ve Sil düğmeleri vardır. Veli yalnızca okur; öğretmen Beklemede, Tamamlandı, Yapılmadı durumlarını yönetmeye devam eder.

## Yükleme

1. ZIP’i ayıklayın.
2. firestore.rules dosyasının tamamını Firebase Console → Firestore Database → Rules bölümünde mevcut metnin tamamıyla değiştirin; Publish’e basın.
3. GitHub → GizemShahbazova/odev-takip-sistemi → Add file → Upload files: paketteki beş dosyayı deponun köküne mevcut dosyaların üzerine yükleyin, Commit changes yapın. ZIP veya klasör yüklemeyin.
4. Yayın tamamlanınca https://gizemshahbazova.github.io/odev-takip-sistemi/ adresini Ctrl+F5 ile yenileyin.

GitHub’a kuralları yüklemek Firebase kurallarını yayımlamaz. Veri taşıma gerekmez; eski belgeler ve veli bağlantıları uyumludur.

## Kullanım

- Sınıflarım: sınıf satırında Düzenle ile adı değişir, Sil ile sınıf listeden kaldırılır.
- Öğrenciler: öğrenci satırında Düzenle ile adı değişir, Sil ile öğrenci kaldırılır.
- Ödevler: ödev kartında Düzenle ile başlık, açıklama ve teslim tarihi değişir, Sil ile ödev kaldırılır.
- Sil düğmesi onay penceresi açar. Vazgeç işlemi kayıt yapmaz. Kaydet/Sil sırasında düğmeler kilitlenir.
- Düzenleme kimliği değiştirmez; ödev sonuçları ve veli bağlantıları korunur.
- Sınıf adı 1–60, öğrenci adı 1–100, başlık 1–120 karakter; açıklama en fazla 2000 karakter. Tarih 2000–2099 arası geçerli takvim günüdür.

## Silmenin anlamı

Silme, ilgili belgeye deleted: true ekleyerek kaydı etkin listelerden kaldırır. Veritabanından kalıcı veri temizleme değildir. Sınıf silinince onun öğrencileri, ödevleri ve sonuç tablosu site içinde görünmez. Öğrenci silinince veli o öğrenciyi görmez; ödev silinince öğretmen/veli listeleri, takip tablosu ve hatırlatmalardan çıkar.

Bağlı geçmiş sonuçları, veli bağlantıları ve alt koleksiyonlar veritabanında korunur. Böylece kalıcı silmenin alt koleksiyonları kendiliğinden silmemesinden kaynaklanabilecek yarım temizleme sorunları önlenir. Yeniden aynı isimle eklenen kayıt yeni kimlik alır; eski sonuçlar otomatik aktarılmaz. Geri alma ekranı yoktur; gerekiyorsa yönetici Firebase Console’da deleted alanını false yapabilir. Gerçek kişisel veri temizliği gerekiyorsa bu işlemden ayrı, kapsamı belirlenmiş kalıcı temizleme gerekir.

Arşivleme veri erişimini tümüyle geri alma mekanizması değildir: bağlı veli kendi sınıf/öğrenci belgesinin silinme işaretini okuyabilir, aktif sınıfın ödev sorgusu silinmiş ödev belgelerini de döndürür; site bu kayıtları filtreler. Silinmiş sınıfın alt kayıtlarını okumak veliye kapalıdır, silinmiş öğrencinin tamamlanma kayıtlarını okumak da kapalıdır. Öğretmen etkin sınıfın geçmiş belgelerine sahiplik sınırı içinde erişebilir. Gizli veriler arşivleme ile kalıcı silinmiş sayılmaz.

Yeni durum kaydı silinmiş sınıf/öğrenci/ödev için oluşturulamaz. Yeni öğrenci/ödev silinmiş sınıfa eklenemez. Güncelleme ve arşivleme yalnızca sınıf sahibi teacher hesabına açıktır. Profil/rol/veli bağlantılarını değiştirme izni açılmaz.

## Canlı test

Önce mevcut gerçek kayıtlar yerine deneme kayıtları oluşturun:

1. Deneme Sınıfı oluşturun, adını Düzenle ile Deneme Sınıfı 2 yapın; F5 sonrasında kontrol edin.
2. Bu sınıfta Deneme Öğrenci ekleyin, adını değiştirin; F5 yapın.
3. Bir deneme ödevi oluşturun; başlığını, açıklamasını ve teslim tarihini değiştirin. F5 sonrasında alanların korunmasını kontrol edin.
4. Takip tablosunda öğrenci/ödev durumunu Tamamlandı yapın. Ödevin adını tekrar değiştirin; mevcut sonuç korunmalı.
5. Ödevde Sil → Vazgeç deneyin; ödev kalmalı. Ardından Sil ile onaylayın; liste ve takip tablosundan çıkmalı.
6. Deneme öğrencisini silin; öğrenci sayısı düşmeli. Son olarak deneme sınıfını silin; sınıf listeden çıkmalı.
7. Veli hesabında düzenleme/silme düğmesi olmamalı. Bağlı öğrencinin/sınıfın adı değişince Yenile/F5 ile yeni adı gelmeli; silinmiş kayıtlar görünmemeli.
8. Telefon üzerinde düzenleme penceresini ve düğmeleri deneyin.

Bu sürüm de yeni bilgileri Yenile/F5 ile okur. Önceden açık olan sayfa sunucu verisi değişince kendiliğinden temizlenmez.

## Teknik yetki sınırları

Sınıf güncellemesi yalnızca name/deleted, öğrenci güncellemesi yalnızca name/deleted, ödev güncellemesi yalnızca title/description/dueDate/deleted alanlarına açıktır. teacherId ve createdAt değiştirilemez. deleted alanı yoksa false kabul edilir. Kayıt silinmişse site üzerinden yeniden değiştirilemez. Doğrudan fiziksel belge silme kapalıdır.

Veli bağlantı modeli users/{veliUID}/children/{classId} altındaki studentIds dizisidir. Arşivlenmiş sınıf/öğrenci bağlantıları yeni arayüzde hata yerine aktif öğrenci yok durumuyla gösterilir. Başka öğretmenin kayıtlarına veya veli hesabıyla güncelleme isteklerine izin verilmemelidir; Firebase Rules Playground ile ayrıca kontrol edin.

## Yapılan kontroller ve sınırları

JavaScript sözdizimi, HTML kimlikleri/yerel dosya bağlantıları ve ZIP bütünlüğü kontrol edildi. Taklit Firebase SDK ile sınıf/öğrenci adı değişikliği, ödevin üç alanının düzenlenmesi, geçersiz tarih/boş ad, hata halinde formun korunması, iptal, onaylı arşivleme, veli ve sonuç tablosu filtreleri, bağlı geçmişin korunması ve gecikmiş kayıt yanıtlarının başka oturumu etkilememesi test edildi. Önceki öğretmen durum yönetimi ve sınıf/öğrenci/ödev işlemlerinin kontrolleri geçti.

Bu testler Firebase Security Rules motorunu çalıştırmaz. Firebase Emulator hazır olmadığından otomatik emülatör yetki testi yapılmadı. Tarayıcı/telefon görünümü ve gerçek Firebase kalıcılığı yüklemeden sonra kullanıcıyla doğrulanmalıdır.

Otomatik e-postalar henüz etkin değildir. Site içi güncel durumlar ve Bakü takvimine göre üç gün veya daha az kalan ödev hatırlatmaları korunur. E-posta otomasyonu ayrı sunucu/gönderim hizmeti kurulumu bekler.

Kaynaklar:
- https://firebase.google.com/docs/firestore/manage-data/delete-data
- https://firebase.google.com/docs/firestore/security/rules-fields
