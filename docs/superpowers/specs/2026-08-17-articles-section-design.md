# Makale Bölümü — Tasarım

**Tarih**: 2026-08-17
**Durum**: Onaylandı, uygulamaya hazır

## Amaç

Siteye SEO odaklı, teknik derinliği olan iki dilli bir makale bölümü eklemek. Tetikleyici,
dışarıdan gelen bir içerik yazarlığı teklifiydi; karar, hacimli genel içerik satın almak
yerine kendi ürün ve proje deneyimimizden az sayıda derin makale üretmek oldu.

Rekabet avantajı burada: DDOGreen ve SimIt gerçek, ölçülebilir mühendislik kararları içeren
projeler. Genel bir içerik yazarı bunları yazamaz.

## Bağlam: daha önce bir blog vardı

Sitede altı makalelik bir bölüm vardı ve `7725117` numaralı redesign commit'inde
silindi (`articles.html`, `articles/*.html` × 6, `js/homepage-articles.js`).
Silinmeyen kısımlar hâlâ repoda:

- `js/component-loader.js:19` — `/articles/` yol çözümlemesi
- `js/language-manager.js:137` — makale sayfası meta desteği
- `js/structured-data-manager.js:119` — `Blog` ve `Article` JSON-LD üreticileri
- `lang/en.json:340` ve `lang/tr.json` — altı eski makalenin kullanılmayan EN+TR çevirileri

Eski HTML'ler geri getirilmiyor: redesign stylesheet'i baştan yazdı, o işaretleme
mevcut tasarıma uymaz. Kullanılmayan çeviri blokları yeni içerikle değiştirilecek.

## Kararlar

### URL ve dosya yapısı

```
articles.html                                  liste sayfası, ?lang=en / ?lang=tr
articles/ddogreen-power-management.html        EN makale 1
articles/ocpp-16-integration-lessons.html      EN makale 2
articles/tr/ddogreen-guc-yonetimi.html         TR makale 1
articles/tr/ocpp-16-entegrasyon-dersleri.html  TR makale 2
```

**Makale gövdeleri HTML kaynağında, dil başına ayrı URL'de.** Gerekçe: JS çalıştırmayan
paylaşım botları (LinkedIn, X, Slack) içeriği görebilsin; her dil kendi URL'ini alıp
temiz hreflang çifti kurulabilsin; Türkçe slug Türkçe aramada eşleşsin.

Bu, CLAUDE.md'nin "her görünür metin `data-lang-key` taşır" kuralından bilinçli bir
sapmadır ve orada belgelenecek. Sapma yalnızca makale gövdelerini kapsar — header,
footer ve tüm paylaşılan arayüz `data-lang-key` kullanmaya devam eder.

Liste sayfası mevcut `?lang=` mekanizmasında kalır: içeriği yalnızca başlık ve özet,
yani zaten `lang/*.json`'da duran kısa metinler.

### Kapsam dışı (YAGNI)

Eski sistemin arama kutusu ve kategori filtresi geri gelmiyor. İki makale için gereksiz;
`lang/*.json`'daki `search` ve `filter` anahtarları silinecek.

## Düzeltilmesi zorunlu iki hata

Alt dizin desteği bugünkü hâliyle çalışmıyor. Bunlar tasarımın ön koşulu, isteğe bağlı
iyileştirme değil.

### 1. Yol çözümlemesi derinliği bilmiyor

`js/component-loader.js:19` ve `js/language-manager.js:48`, yolda `/articles/` görünce
sabit `'../'` döndürüyor. `articles/tr/x.html` iki seviye aşağıda olduğu için component
ve JSON fetch'leri 404 verir. Sabit string yerine gerçek derinlik hesabı:

```js
const depth = window.location.pathname.split('/').filter(Boolean).length - 1;
const prefix = '../'.repeat(Math.max(0, depth));
```

### 2. Dil yöneticisi makale sayfasının meta etiketlerini eziyor

- `js/language-manager.js:86` canonical'ı `meta.site.canonical`'dan yazıyor — makale
  sayfasında bu canonical'ı **ana sayfaya** işaret ettirir.
- `js/language-manager.js:193` hreflang'i `${baseUrl}?lang=xx` olarak yeniden üretiyor —
  elle yazdığımız EN↔TR makale çiftini siler.
- `js/language-manager.js:31` parametresiz URL'i koşulsuz `?lang=en`'e yönlendiriyor —
  Türkçe makalenin üstüne İngilizce header koyar.

Çözüm, sayfanın kendi dilini beyan etmesi: `<html lang="tr" data-page-lang="tr">`.

- `data-page-lang` varsa dil yöneticisi canonical, OG ve hreflang'e **dokunmaz**;
  yalnızca header/footer çevirisini uygular.
- Parametresiz yönlendirme sabit `en` yerine beyan edilen dile yapılır.
- Kullanıcı yine de karşı dili isterse (`articles/tr/x.html?lang=en`), sayfadaki
  `<link rel="alternate" hreflang="en">` adresine, yani kardeş makaleye yönlendirilir.

## Yapısal veri

Makale sayfaları `Article` JSON-LD'sini kendi HTML'inde statik taşır — JS'e bağımlı
olmaz, botlar kaynakta görür. `js/structured-data-manager.js:143`'teki
`generateArticleData()`, sayfada hazır `Article` şeması bulursa devreye girmez.
Liste sayfası `Blog` şemasını JS'ten üretmeye devam eder.

## CSS

Mevcut tokenlar ve BEM düzeni korunur, tek stylesheet kuralı bozulmaz. Yeni bloklar:
`.article`, `.article__header`, `.article__meta`, `.article__body`, `.article__nav`,
`.articles-grid`, `.article-card`. Mobile-first; 320 / 768 / 1024 kırılımları.
Gövde ölçüsü `max-width: 68ch`.

## Değişecek dosyalar

| Dosya | Değişiklik |
|---|---|
| `articles.html` | yeni — liste sayfası |
| `articles/*.html` (4) | yeni — makaleler, metin + JSON-LD gömülü |
| `js/component-loader.js` | derinlik hesabı |
| `js/language-manager.js` | `data-page-lang`, meta ezme koruması, kardeş dil yönlendirmesi |
| `js/structured-data-manager.js` | statik `Article` şeması varsa atla |
| `components/header.html` | nav'a Makaleler linki |
| `components/footer.html` | Company kolonuna Makaleler linki |
| `index.html` | Products ↔ Contact arasına "Son Yazılar" bölümü |
| `lang/en.json`, `lang/tr.json` | `articles` bloğu yeniden yazılır, `search`/`filter` silinir, nav/footer anahtarı |
| `css/styles.css` | makale ve kart blokları |
| `sitemap.xml` | liste + 4 makale, hreflang çiftleriyle |
| `CLAUDE.md` | makale gövdesi istisnası belgelenir |

## İçerik

Her makale 1200–1600 kelime. Türkçe metin çeviri değil, Türkçe arama diline göre
ayrı yazılır.

### Makale 1 — DDOGreen güç yönetimi

Kaynak: `~/Workspace/ddogreen`. Doğrulanmış malzeme:

- Çift eşikli histerezis: yük > `high_performance_threshold` → performans,
  yük < `power_save_threshold` → güç tasarrufu, arada mevcut mod korunur.
  README örneği 30 %–70 % bandını hızlı mod değişimini önleyen histerezis olarak
  açıklıyor (`README.md:161`).
- Eşikler çekirdek başına normalize edilmiş 1 dakikalık yük ortalamasından hesaplanır
  (`src/activity_monitor.cpp:101`).
- Varsayılan yok: `monitoring_frequency`, `high_performance_threshold` ve
  `power_save_threshold` zorunlu; `power_save_threshold < high_performance_threshold`
  çapraz doğrulaması var (`src/config.cpp:105`). Aralıklar: sırasıyla 1–300 s,
  0.1–1.0, 0.05–0.9.
- Linux tarafı `tlp ac` / `tlp bat` çağırır ve **çıkış kodlarına güvenmez**, çıktıyı
  ayrıştırır (`src/platform/linux/linux_power_manager.cpp:53`) — yazılacak iyi bir
  mühendislik ayrıntısı.
- Platform soyutlaması: `ipower_manager`, `isystem_monitor`, `iplatform_utils`,
  `isignal_handler` arayüzleri + factory; testler mock'larla çalışıyor
  (`tests/mocks/`).
- Test sayısı: **153** (`tests/*.cpp` içinde 11 dosya).

### Makale 2 — OCPP 1.6 entegrasyon dersleri

Kaynak: `~/Workspace/simit`. `src/v160.py` 1811 satırlık gerçek bir OCPP 1.6
implementasyonu. Yazılabilir doğrulanmış konular:

- OCPP 1.6'nın düz `connector_id`'si ile 2.0.1'in EVSE/konnektör hiyerarşisi
  arasındaki eşleme (`src/v160.py:216`).
- Şarj profili öncelik kuralları, OCPP §7.3.2 amaç bazlı öncelik (`src/v160.py:303`).
- Çevrimdışı yetkilendirme davranışı: `LocalPreAuthorize`, `LocalAuthListEnabled`,
  `AllowOfflineTxForUnknownId` üçlüsünün etkileşimi (`src/v160.py:372`).
- Zaman senkronizasyonu: OCPP zaman damgaları CSMS saatinden offset ile türetiliyor,
  yerel saate güvenilmiyor (`src/time_sync.py`).
- Yeniden bağlanma backoff sınıflandırması (`src/reconnect_backoff.py`) — aşağıdaki
  açık soruya bakınız.

## Açık sorular — içerik yazımını bloklar

Aşağıdaki üç madde çözülmeden ilgili bölümler yazılmayacak.

### 1. Sitedeki "%20–30 pil tasarrufu" iddiasının dayanağı yok

`ddogreen` reposunda bu iddiayı destekleyen hiçbir ölçüm, benchmark veya doküman yok.
README'deki 30 % ve 70 %, **CPU yük eşikleri** — pil tasarrufu değil. Site bunu
`products.ddogreen.card.excerpt` içinde ve CLAUDE.md'de bir ürün iddiası olarak
kullanıyor.

Bir makalede "%20–30 tasarrufu şöyle sağlıyoruz" yazmak, ölçüm göstermeden bu iddiayı
büyütmek olur — tam olarak reddettiğimiz içerik türü. Seçenekler: (a) ölçüm verisi
varsa paylaşılsın ve makalede metodolojiyle birlikte verilsin, (b) makale sayısal
iddia kullanmadan mekanizmayı anlatsın.

### 2. SimIt production olay kayıtları hassas

`src/reconnect_backoff.py` docstring'i iki gerçek olayı tarih ve sayılarla belgeliyor
(2026-08-10 ve 2026-08-16). Mühendislik anlatısı olarak birinci sınıf malzeme, ancak
üçüncü taraf bir CSMS'in davranışını, kendi altyapı ölçeğimizi ve yanlış yapılandırılmış
istasyonları ifşa ediyor. Yayınlanıp yayınlanmayacağı ve hangi ayrıntıların
anonimleştirileceği sahibinin kararı.

### 3. Sitedeki iki bilgi güncel değil

- **Test sayısı**: site ve CLAUDE.md 122 diyor, repoda 153 test var.
- **Platform desteği**: site "Linux/Windows" diyor, ancak `src/platform/macos/`
  altında dört dosya var ve `CMakeLists.txt:97` bunları derliyor. macOS desteğinin
  durumu (tam / deneysel / yayınlanmamış) netleşmeli.

## Doğrulama

Test altyapısı yok; elle doğrulama:

1. `python -m http.server 8000` — liste sayfası ve dört makale, iki dilde açılıyor.
2. `curl` ile ham HTML: makale metni, canonical, hreflang çifti ve `Article` JSON-LD
   JS çalışmadan kaynakta görünüyor.
3. Parametresiz URL yönlendirmesi: EN makale → `?lang=en`, TR makale → `?lang=tr`.
4. Karşı dil isteği kardeş makaleye gidiyor.
5. 320 px'de düzen bozulmuyor.
6. `sitemap.xml` geçerli, tüm yeni URL'ler ve hreflang girdileri mevcut.
