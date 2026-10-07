# Ödev Takip Sistemi — İlk giriş (v0.1)

Bu sürüm, e-posta/şifreyle Firebase Authentication girişi yapar, Firestore’daki users/{UID} belgesini sunucudan okur ve adı/rolü gösterir. Çıkış yapma, yanlış şifre ve profil okuma hataları için mesajlar içerir. Oturum aynı tarayıcı sekmesinin oturumu boyunca korunur. Sınıf, ödev ve veli-öğrenci eşleştirmesi sonraki aşamadır.

## GitHub Pages üzerinden açma

1. Gizem’in GitHub hesabında yeni bir depo oluşturun: `odev-takip-sistemi`.
2. ZIP dosyasını bilgisayarda çıkarın.
3. GitHub’da Add file → Upload files seçin. Klasörün içindeki index.html, style.css ve app.js dosyalarını birlikte yükleyin. index.html deponun kökünde olmalı. ZIP dosyasını yüklemek siteyi açmaz.
4. Commit changes ile kaydedin.
5. Settings → Pages → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save.
6. GitHub’ın verdiği HTTPS site adresini açın. Gizem’in Firebase Authentication’da oluşturduğunuz e-posta adresi ve site şifresiyle giriş yapın.
7. Başarılı sonuç: Merhaba Gizem. / Öğretmen / Kullanıcı kaydınız okundu.

Bu adımlar GitHub arayüzündeki seçeneklere göre küçük farklılıklar gösterebilir. Sonraki ekranlarda birlikte ilerleyin.

## Firebase’de hazırlanan ayarlar

- Proje: odev-takip-sistemi-6652a; Firestore Standard, (default), Frankfurt.
- Authentication → Email/Password etkin.
- users/qD30Waxms3Nc0UtpUVTGzFaJPmE3 → name: Gizem (string), role: teacher (string).
- firestore.rules dosyasındaki başlangıç kuralı Firebase Console → Firestore → Rules üzerinden yayınlanmış olmalı.
- GitHub’a firestore.rules yüklemek Firebase’deki kuralları değiştirmez.
- auth/unauthorized-domain hatası çıkarsa Firebase Authentication → Settings → Authorized domains altında GitHub Pages alan adınızı ekleyin (örneğin kullanici.github.io; https veya /depo-adi olmadan).

## Dosyalar

- index.html: giriş ekranı
- style.css: telefon ve bilgisayar görünümü
- app.js: Firebase bağlantısı, giriş, profil okuma ve çıkış
- firestore.rules: başlangıç erişim kuralının kopyası

Firebase web config değerleri uygulamaya gömülüdür; bunlar giriş şifresi değildir. Hiçbir kullanıcı şifresi dosyalarda bulunmaz. Kullanıcı rolleri site üzerinden değiştirilemez. Site kodundaki rol gösterimi bir yetki kontrolü değildir; gerçek veri erişimini Firestore kuralları belirler.

## İlk deneme

1. Yanlış şifre deneyin: açıklayıcı hata mesajı görünmeli.
2. Doğru şifreyle giriş yapın: Gizem’in adı ve Öğretmen rolü görünmeli.
3. Sayfayı yenileyin: aynı sekmede oturum devam etmeli.
4. Çıkış yapın: giriş formu dönmeli, profil görünmemeli.
5. Telefonda siteyi açın: form ekran genişliğine sığmalı.

Geliştirme sırasında JavaScript sözdizimi ve dosya bağlantıları kontrol edilmiştir. Gerçek hesapla giriş ve cihaz görünümü kullanıcı tarafında henüz doğrulanmamıştır.

Referanslar: https://firebase.google.com/docs/auth/web/password-auth ve https://firebase.google.com/docs/firestore/query-data/get-data
