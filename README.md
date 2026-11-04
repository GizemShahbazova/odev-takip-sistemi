# Ödev Takip Sistemi

GitHub Pages üzerinde çalışan, Firebase Authentication ve Cloud Firestore kullanan öğretmen ve öğrenci uygulaması.

- Yönetici sınıf oluşturur, öğretmen atar, hazır öğrenci hesaplarını sınıfa ekler ve ödev durumlarını yönetir.
- Öğretmen kendisine atanan sınıflarda ödev ekleyebilir ve silebilir.
- Her BTAL kodu ayrı bir öğrenci hesabıdır. Bir öğrenci yalnız kendisine bağlı sınıf kaydının ödevlerine erişir.
- Öğrenciler sitede yalnız kullanıcı koduyla görünür. Sınıf ve takip ekranlarında yalnız hazır ve sınıfa bağlı hesaplar listelenir. Ayarlar’dan şifre değiştirilebilir.
- Windows yönetim aracı giriş hesaplarını topluca açar ve şifre sıfırlar. Yönetici sitede ilgili sınıfın **Öğrenciler → Hesapları getir** bölümünden kodları seçip sınıfa bağlar.
- Materyaller bölümünde iki oyun ve sitede pilot uygulama anketi vardır. Bildirimler site yenilendiğinde görünen durumlar ve yaklaşan teslim tarihleridir.

## Yayın

`firestore.rules` dosyasının içeriğini Firebase Console → Firestore Database → Rules bölümünden yayımlayın. Site dosyalarını doğrudan GitHub Pages kaynak dizinine yükleyin. Yönetim aracı, hesap Excel'i ve hizmet hesabı anahtarı GitHub'a yüklenmez.
