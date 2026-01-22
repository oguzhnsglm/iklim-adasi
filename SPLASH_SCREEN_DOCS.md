# 🌍 Modern Giriş Ekranı - Dokümantasyon

## Genel Bakış

Uygulamanın ilk açılışında görünen modern, iOS 26 tarzında tasarlanmış giriş ekranı. Çevre ve doğa temasına uyumlu, glassmorphism efektleri ve animasyonlarla süslenmiş.

## 📁 Dosya Yapısı

```
src/
├── components/
│   ├── ModernSplashScreen.js         # Ana giriş ekranı component'i
│   ├── SplashScreenWithTreePlanting.js # Ağaç dikme özellikli giriş ekranı
│   ├── TreePlantingCard.js            # Ağaç dikme kartı component'i
│   └── ModernUIComponents.js          # Glassmorphism ve styling helper'lar
├── screens/
│   └── SplashScreenWithTreePlanting.js # Ekran seviyesi bileşen
├── config/
│   └── SplashConfig.js               # Giriş ekranı yapılandırması
├── TreePlantingContext.js            # Ağaç dikme state management
├── theme.js                          # iOS 26 modern renk paleti
└── App.js                            # Ana uygulamada entegrasyon
```

## 🎨 Özellikler

### 1. **Glassmorphism Tasarım**
- Şeffaf, yumuşak cam görünümlü kartlar
- Blur efektleri ile iOS 26 tarzında tasarım
- Modern, premium hissiyat

### 2. **Doğa Temalı Arka Plan**
- Gradient arka plan (açık yeşil tonları)
- Dekoratif floating emoji'ler (yaprak, çiçek, kuş)
- Yumuşak renk geçişleri

### 3. **Ağaç Dikme Sistemi**
- 4 aşamalı animasyon: Toprak 🌍 → Filiz 🌱 → Fidan 🌿 → Ağaç 🌳
- Dikilen ağaçlar AsyncStorage'da kaydediliyor
- Toplam dikilen ağaç sayısı gösteriliyor
- Yumuşak ışık parlamaları (glow efekti)

### 4. **Animasyonlar**
- **Giriş Animasyonu**: Fade-in + Slide-up + Scale (800ms)
- **Kart Animasyonu**: Slide-up (400ms delay ile)
- **Buton Animasyonu**: Scale efekti
- **Ağaç Büyütme**: 4 aşama x (400ms + 600ms bekleme)
- **Çıkış Animasyonu**: Fade-out + Slide-up

### 5. **Ses Efektleri**
- Ağaç dikme sırasında "tap" sesi
- SoundManager entegrasyonu

## 🔧 Kullanım

### Giriş Ekranını Aktif Etme (App.js)

```javascript
import { TreePlantingProvider } from "./src/TreePlantingContext";
import SplashScreenWithTreePlanting from "./src/screens/SplashScreenWithTreePlanting";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProgressProvider>
      <TreePlantingProvider>
        {showSplash ? (
          <SplashScreenWithTreePlanting 
            onStartGame={() => setShowSplash(false)}
            onClose={() => setShowSplash(false)}
          />
        ) : (
          <YourMainApp />
        )}
      </TreePlantingProvider>
    </ThemeProgressProvider>
  );
}
```

### Ağaç Dikme Hook'unu Kullanma

```javascript
import { useTreePlanting } from "../TreePlantingContext";

function MyComponent() {
  const {
    trees,                  // Tüm dikilen ağaçlar
    totalTreesPlanted,      // Toplam sayı
    loading,                // Yükleme durumu
    plantTree,              // Ağaç dik fonksiyonu
    updateTreeStage,        // Ağaç aşamasını güncelle
    clearAllTrees,          // Tüm ağaçları sil
    getLastPlantedTree,     // Son dikilen ağacı al
  } = useTreePlanting();

  const handlePlantTree = async () => {
    const newTree = await plantTree({
      emoji: "🌱",
      name: "Benim Ağacım",
    });
  };

  return (
    <View>
      <Text>Toplam: {totalTreesPlanted}</Text>
    </View>
  );
}
```

### Giriş Ekranı Yapılandırması

```javascript
import { updateSplashConfig, SPLASH_CONFIG } from "../config/SplashConfig";

// Varsayılan ayarlar
const config = SPLASH_CONFIG;

// Ayarları güncelle
const newConfig = updateSplashConfig({
  title: "Özel Başlık",
  treePlanting: {
    enabled: false, // Ağaç dikme kartını gizle
  },
});
```

## 🎯 Renk Paleti (MODERN_THEME)

```javascript
// Arka planlar
backgrounds.primary: "#F0F7F4"     // Çok açık yeşil
backgrounds.secondary: "#E8F3F0"   // Hafif mavi-yeşil

// Glassmorphism
glass.light: "rgba(255, 255, 255, 0.2)"
glass.medium: "rgba(255, 255, 255, 0.25)"
glass.dark: "rgba(255, 255, 255, 0.15)"

// Aksan rengiler
accents.primary: "#34C759"         // iOS yeşil
accents.secondary: "#30B0C0"       // Mavi-yeşil
accents.tertiary: "#AF52DE"        // Mor

// Metinler
text.primary: "#0D3D0D"             // Çok koyu yeşil
text.secondary: "#1B5E20"           // Koyu yeşil
text.light: "#F1F8E9"               // Açık
```

## 📊 Veri Yapısı

### Ağaç Objesi
```javascript
{
  id: "1234567890",                    // Unique ID (timestamp)
  timestamp: "2024-01-22T10:30:00Z",  // Dikme tarihi
  stage: 0,                             // 0-3 arası (toprak, filiz, fidan, ağaç)
  emoji: "🌱",                          // Görsel
  name: "Ağaç #1",                     // İsim
  // ... custom fields
}
```

## 🔌 Provider Yapısı

```javascript
<ThemeProgressProvider>
  <ThemeWorldsProgressProvider>
    <ParentSettingsProvider>
      <MascotProvider>
        <TreePlantingProvider>
          {/* Uygulama */}
        </TreePlantingProvider>
      </MascotProvider>
    </ParentSettingsProvider>
  </ThemeWorldsProgressProvider>
</ThemeProgressProvider>
```

## ✨ Animasyon Detayları

### Glow Efekti
- Kart arka planında yumuşak ışık parlaması
- Ağaç büyütürken otomatik trigger
- Opacity: 0 → 1 → 0 (600ms)

### Parallax (Dekoratif Elemanlar)
- Floating emoji'ler yumuşak opacity animasyonları
- Position sabit, opacity değişiyor
- iOS 26 tarzında subtle

### Scale Animation
- Buton basıldığında 0.92x'e küçülüyor
- 100ms de geri orijinal boyuta geliyor
- Soft, natural hissiyat

## 🐛 Troubleshooting

### Ağaç dikme çalışmıyor
- TreePlantingProvider'ın App.js'de wraplı olduğunu kontrol et
- AsyncStorage'ın setup olduğunu verify et

### Animasyonlar sarsıntılı
- `useNativeDriver: true` kullandığından emin ol
- Layout animations disable et

### Tema renkleri uymuyor
- MODERN_THEME colors'ı theme.js'de kontrol et
- Gradient colors doğru formatta olup olmadığını check et

## 📱 iOS 26 Uyumluluğu

- **Safe Area**: SafeAreaView ile wraplı
- **Glassmorphism**: Blur + opacity kombinasyonu
- **Animasyonlar**: 60fps smooth performance
- **Renk Paleti**: iOS standart aksan renkleri

## 🚀 Performance İpuçları

1. **Animasyonları Optimize Etmek**
   - useNativeDriver: true kullan
   - Sadece gerekli properties animate et

2. **Memory Yönetimi**
   - Component unmount'da animasyonları stop et
   - useRef cleanup yapısını doğru implementle

3. **AsyncStorage Optimizasyonu**
   - Batch operations kullan
   - Cache'i yaşlı data için clear et

## 🎓 Konsept Uyumu

Giriş ekranı şu konseptlerle uyumludur:
- **Oyun Teması**: Çevre koruma ve doğa
- **UI Tarzı**: iOS 26 modern, minimal tasarım
- **Renkler**: Doğa temalı yeşil tonları
- **Animasyonlar**: Soft, premium hissiyat

## 📄 Lisans

Bu kod parçaları projeye özel olarak tasarlanmıştır.
