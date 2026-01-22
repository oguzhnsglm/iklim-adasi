# 🚀 Modern Giriş Ekranı - Entegrasyon Rehberi

## Hızlı Başlangıç (5 dakika)

### 1️⃣ İmportlar Kontrol Etme
App.js'de aşağıdaki importlar olduğundan emin ol:

```javascript
import { TreePlantingProvider } from "./src/TreePlantingContext";
import SplashScreenWithTreePlanting from "./src/screens/SplashScreenWithTreePlanting";
```

### 2️⃣ Provider'ı Wrapping
```javascript
<ThemeProgressProvider>
  <ThemeWorldsProgressProvider>
    <ParentSettingsProvider>
      <MascotProvider>
        <TreePlantingProvider>    {/* ← EKLENDİ */}
          <AppInner />
        </TreePlantingProvider>
      </MascotProvider>
    </ParentSettingsProvider>
  </ThemeWorldsProgressProvider>
</ThemeProgressProvider>
```

### 3️⃣ Splash Screen Conditional Rendering
```javascript
const [showSplash, setShowSplash] = useState(true);

if (showSplash) {
  return (
    <SplashScreenWithTreePlanting 
      onStartGame={() => setShowSplash(false)}
      onClose={() => setShowSplash(false)}
    />
  );
}

// Normal app rendering
return <SafeAreaView>...</SafeAreaView>;
```

### 4️⃣ Uygulamayı Başlat ✅
```bash
npm start
# veya
expo start
```

---

## 📦 Bağımlılıklar (Gerekli Paketler)

Aşağıdaki paketlerin package.json'da olduğundan emin ol:

```json
{
  "expo": "^54.0.0",
  "expo-linear-gradient": "~13.0.2",
  "expo-blur": "~13.0.0",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "react-native": "0.81.5"
}
```

Eksik olanları yükle:
```bash
npm install expo-blur
npm install expo-linear-gradient
npm install @react-native-async-storage/async-storage
```

---

## 🎯 Özelleştirme Seçenekleri

### A) Başlık & Metin Değiştirme

[SplashScreenWithTreePlanting.js](src/screens/SplashScreenWithTreePlanting.js) içinde:

```javascript
// Satır ~280 civarında
<Text style={styles.titleMain}>Doğayı Koru</Text>
<Text style={styles.subtitleText}>Oyna, öğren, dünyayı iyileştir</Text>

// Değiştir:
<Text style={styles.titleMain}>Senin Başlığın</Text>
<Text style={styles.subtitleText}>Senin Alt Başlığın</Text>
```

### B) Renkler Değiştirme

[theme.js](src/theme.js) içinde `MODERN_THEME` objesi:

```javascript
// Gradyan renklerini değiştir
gradients: {
  soft: ["#E8F5E9", "#C8E6C9", "#A5D6A7"], // ← Değiştir
},

// Aksan rengi değiştir
accents: {
  primary: "#34C759",  // ← iOS yeşili, kendi rengine çevir
},
```

### C) Animasyon Hızı Değiştirme

[SplashScreenWithTreePlanting.js](src/screens/SplashScreenWithTreePlanting.js) içinde:

```javascript
// Giriş animasyonu süresi (ms)
duration: 800,  // ← 400 yaparsın daha hızlı olur

// Kart animasyonu gecikmesi
setTimeout(() => {
  Animated.timing(cardSlideAnim, {
    toValue: 0,
    duration: 600,  // ← Değiştir
```

### D) Ağaç Dikme Kartını Gizle

SplashScreenWithTreePlanting.js içinde:

```javascript
// TreePlantingCard render'ını kapat
{/* <Animated.View style={...}>
  <TreePlantingCard onTreePlanted={() => {}} />
</Animated.View> */}
```

### E) Dekoratif Elemanları Kontrol Et

FloatingDecorations component'ini gizle:

```javascript
// Yoruma al:
{/* <FloatingDecorations /> */}
```

---

## 🔌 Programatik Kontrol

### Ağaç Dikme Hook'u Kullanma

Herhangi bir component'te:

```javascript
import { useTreePlanting } from "../TreePlantingContext";

export default function MyComponent() {
  const {
    trees,
    totalTreesPlanted,
    loading,
    plantTree,
    updateTreeStage,
    clearAllTrees,
    getLastPlantedTree,
  } = useTreePlanting();

  // Ağaç dik
  const handlePlantTree = async () => {
    const tree = await plantTree({
      emoji: "🌳",
      name: "Benim Ağacım",
    });
    console.log("Ağaç dikildi:", tree);
  };

  // Tüm ağaçları göster
  useEffect(() => {
    console.log(`Total trees: ${totalTreesPlanted}`);
  }, [totalTreesPlanted]);

  return (
    <View>
      <Text>Ağaçlar: {totalTreesPlanted}</Text>
      <TouchableOpacity onPress={handlePlantTree}>
        <Text>Ağaç Dik</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Splash Screen'i Programatik Kapatma

```javascript
// App.js'de
const [showSplash, setShowSplash] = useState(true);

// Zaman geçtikten sonra otomatik kapatma
useEffect(() => {
  const timer = setTimeout(() => {
    setShowSplash(false);
  }, 5000); // 5 saniye

  return () => clearTimeout(timer);
}, []);
```

### Ağaçları Temizle (Debug)

```javascript
import { useTreePlanting } from "../TreePlantingContext";

function DebugScreen() {
  const { clearAllTrees } = useTreePlanting();

  return (
    <TouchableOpacity onPress={clearAllTrees}>
      <Text>Tüm Ağaçları Sil (DEBUG)</Text>
    </TouchableOpacity>
  );
}
```

---

## 🎨 Tasarım Değişiklikleri

### Buton Stilini Değiştir

[SplashScreenWithTreePlanting.js](src/screens/SplashScreenWithTreePlanting.js):

```javascript
// Buton gradyent renglerini değiştir
<LinearGradient
  colors={[
    "rgba(255, 255, 255, 0.25)",  // ← Başlangıç
    "rgba(255, 255, 255, 0.1)",   // ← Son
  ]}
/>
```

### Kartın Şeffaflığını Değiştir

[TreePlantingCard.js](src/components/TreePlantingCard.js):

```javascript
glassCard: {
  backgroundColor: MODERN_THEME.glass.medium,  // ← Değiştir
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.3)",  // ← Border rengi
}
```

### Arka Plan Gradyanını Özelleştir

[SplashScreenWithTreePlanting.js](src/screens/SplashScreenWithTreePlanting.js):

```javascript
<LinearGradient
  colors={["#renkBir", "#renkİki", "#renkÜç"]}  // ← Kendi renklerin
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
/>
```

---

## 🔧 Troubleshooting

### Problem: "Module not found: TreePlantingContext"

**Çözüm:**
```bash
# File path kontrol et:
src/TreePlantingContext.js  (Doğru)
src/TreePlantin gContext.js (Yanlış - typo)

# Import kontrol et:
import { useTreePlanting } from "../TreePlantingContext";
```

### Problem: Ağaçlar kaydedilmiyor

**Çözüm:**
```javascript
// AsyncStorage permissions kontrol et
// app.json'da:
"android": {
  "permissions": ["READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
}

// iOS'da: NSDocumentUsageDescription
```

### Problem: Animasyonlar sarsıntılı

**Çözüm:**
```javascript
// useNativeDriver: true olduğundan emin ol
Animated.timing(anim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true  // ← ÖNEMLİ
}).start();
```

### Problem: "Blur" veya "LinearGradient" gösterilmiyor

**Çözüm:**
```bash
# Package'ları yeniden yükle
expo install expo-blur
expo install expo-linear-gradient

# Cache temizle
npm start -- --clear
```

---

## 📊 Dosya Yapısı (Final)

```
src/
├── TreePlantingContext.js              # 🌳 Ağaç dikme state
├── theme.js                            # 🎨 Modern renkler
├── App.js                              # ✏️ GÜNCELLENDI
├── components/
│   ├── TreePlantingCard.js             # 🌱 Ağaç dikme kartı
│   ├── ModernSplashScreen.js           # 📱 Alternatif splash
│   └── ModernUIComponents.js           # 🛠 UI utilities
├── screens/
│   └── SplashScreenWithTreePlanting.js  # 🎯 ANA SCREEN
├── config/
│   └── SplashConfig.js                 # ⚙️ Yapılandırma
├── constants/
│   └── EmojiIcons.js                   # 🎭 Emoji library
├── SPLASH_SCREEN_DOCS.md               # 📖 Detaylı dokümantasyon
├── CHANGELOG_SPLASH_SCREEN.txt         # 📋 Değişiklik özeti
└── TEST_CHECKLIST.js                   # ✅ Test listesi
```

---

## 🚀 Dağıtım Kontrol Listesi

- [ ] Tüm animasyonlar smooth
- [ ] Ağaçlar kaydediliyor
- [ ] Renkler doğru görünüyor
- [ ] Responsive design çalışıyor
- [ ] Ses efektleri oynatılıyor
- [ ] Performance 60fps
- [ ] Splash screen kapatılabiliyor
- [ ] Main app yüklenme hızı normal
- [ ] iOS'da test edildi
- [ ] Android'de test edildi

---

## 📞 Destek & İletişim

Sorular? Kontrol et:
- SPLASH_SCREEN_DOCS.md - Detaylı dokümantasyon
- TEST_CHECKLIST.js - Test rehberi
- CHANGELOG_SPLASH_SCREEN.txt - Değişiklik özeti

---

**🎉 Başarılı entegrasyon dilerim!**
