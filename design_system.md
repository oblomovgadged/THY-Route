# 🎨 THY Route — Design System & Visual Guidelines

Bu belge, **THY Route** projesinin tüm görsel tasarım tokenlarını, CSS değişkenlerini, animasyon tariflerini ve komponent stillerini tanımlar. Premium, uçak-inspirasyonlu arayüzün tutarlılığını korumak için birincil referans kaynağıdır.

Son Güncelleme: Haziran 2026

---

## 1. Brand Tokens (CSS Değişkenleri)

Tüm renkler `css/style.css` dosyasındaki `:root` bloğundan yönetilir.

### Renk Paleti

| Token | Değer | Kullanım |
|---|---|---|
| `--thy-red` | `#B7312C` | Birincil marka rengi (Pantone 7620 C) |
| `--thy-red-light` | `#EF2E1F` | CTA butonları, uyarı rengi |
| `--thy-red-dark` | `#8E211D` | Hover/aktif durumlar |
| `--thy-blue` | `#0053A5` | French Blue (Pantone 2145 C) |
| `--thy-navy` | `#0A1628` | Ana arkaplan, header |
| `--thy-navy-light` | `#132237` | Kart yüzeyleri |
| `--thy-gold` | `#C5A059` | Premium özellikler, Miles&Smiles |
| `--thy-gold-light` | `#D9BE84` | Vurgu, hover rengi |
| `--panel-surface` | `#0F2244` | Side panel arka planı (açık katman) |
| `--panel-surface-2` | `#0B1A33` | Side panel arka planı (derin katman) |
| `--card-glass` | `rgba(255,255,255,0.045)` | Cam kart yüzeyi |
| `--card-glass-hover` | `rgba(255,255,255,0.075)` | Kart hover durumu |
| `--card-border` | `rgba(255,255,255,0.085)` | İnce cam kenarlık |
| `--card-border-hover` | `rgba(197,160,89,0.22)` | Hover altın kenarlık |

### Tipografi

| Aile | Ağırlıklar | Kullanım |
|---|---|---|
| `Outfit` | 300–900 | Birincil UI metni |
| `Montserrat` | 800 | Logo, panel başlıkları |
| `Inter` | 300–900 | Gövde metni, açıklamalar |
| `JetBrains Mono` | 400–600 | Uçuş kodları, koordinatlar, IATA |

**Boyut Skalası:**
- Hero başlık: `2.5rem` bold
- Panel başlık: `14px` 700
- Kart adı: `13px` 600  
- Etiket/chip: `9-10px` 800 uppercase
- IATA kodu: `18px` 800 monospace

---

## 2. Temel Komponent Stilleri

### Flight Board (Üst Başlık)

```css
/* Gradyan arka plan — derin karanlık, cam efekti */
background: linear-gradient(90deg, rgba(8,16,30,0.97), rgba(10,22,40,0.94), rgba(12,20,36,0.97));
height: calc(72px + env(safe-area-inset-top, 0px));  /* iOS notch desteği */
backdrop-filter: blur(16px);
```

Alt sınır: Animasyonlu THY kırmızı → altın → kırmızı gradyan çizgisi (`borderGlow` animasyonu).

### Side Panel

```css
/* Airy Premium: gradyan, derin gölge, cam kenarlık */
background: linear-gradient(170deg, #0F2244 0%, #0D1F3A 45%, #0B1A33 100%);
border-radius: 12px;
box-shadow: 0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset;
```

### Butonlar

**Primary (Kırmızı Pill):**
```css
background: linear-gradient(135deg, #C9201A 0%, #EF2E1F 50%, #D42218 100%);
border-radius: 22px;  /* Pill */
box-shadow: 0 3px 14px rgba(183,49,44,0.38), 0 1px 0 rgba(255,255,255,0.1) inset;
/* Hover üzerinde shimmer: ::after pseudo-element ile sweep animasyonu */
```

**Secondary (Cam/Glass):**
```css
background: rgba(255,255,255,0.055);
border: 1px solid rgba(255,255,255,0.12);
backdrop-filter: blur(4px);
/* Hover: altın kenarlık + text-color = gold-light */
```

**Gold (Business Class):**
```css
background: linear-gradient(135deg, #C5A059, #E8C97A, #C5A059, #A0813C);
background-size: 200% 100%;
/* Hover: background-position kayması ile parlama */
```

### Timeline Kart

```css
background: rgba(255,255,255,0.045);  /* cam */
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,0.085);
border-radius: 8px;
/* Hover: translateX(3px) + altın sol kenarlık gölgesi */
/* Active-tap: kırmızı sol kenarlık */
```

### İç Hat Uçuşu Kartı (Boarding Pass)

```css
background: linear-gradient(135deg, rgba(0,83,165,0.18), rgba(0,60,120,0.10));
border-color: rgba(0,83,165,0.35);
/* Animasyonlu uçak ikonu ✈ soldan sağa kayar (planeMove @keyframes) */
```

---

## 3. Animasyon Tarifleri

### Timeline İtem Girişi
```css
@keyframes timelineItemIn {
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0); }
}
/* Her item: animation-delay = index * 55ms */
```

### Rail Akışı (Parlayan Çizgi)
```css
@keyframes railFlow {
  0%   { top: -30%; opacity: 0; }
  15%  { opacity: 0.85; }
  85%  { opacity: 0.25; }
  100% { top: 115%; opacity: 0; }
}
```

### Buton Shimmer (Sweep)
```css
/* .btn::after pseudo-element */
/* Hover tetikler: left: -60% → 120%, skewX(-20deg), opacity 0→1→0 */
transition: left 0.55s ease, opacity 0.1s;
```

### Sınır Işıması (Border Glow)
```css
@keyframes borderGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
/* Flight Board alt çizgisinde: THY kırmızı → altın gradyan */
```

### İç Hat Uçak Hareketi
```css
@keyframes planeMove {
  0%, 100% { left: 20%; opacity: 0.6; }
  50%       { left: 80%; opacity: 1; }
}
```

---

## 4. Renk Skalası — "Airy Premium" Prensibi

THY Route, "ne saf siyah ne de saf beyaz" felsefesini benimser:

```
Derinlik Katmanı (Header/Map overlay) : #0A1628 → #050B14
Panel Katmanı (Side Panel)            : #0F2244 → #0B1A33  (gradient)
Yüzey Katmanı (Cards)                 : rgba(255,255,255,0.045) → cam
Etkileşim Katmanı (Hover)             : rgba(255,255,255,0.075)
Vurgu (Accent)                        : THY Kırmızısı + Altın
```

Kural: **Hiçbir zaman düz #000000 veya #FFFFFF kullanma.** Her renk ya bir geçiş ya de bir opaklık değeri içerir.

---

## 5. Responsive Breakpoints

| Breakpoint | Davranış |
|---|---|
| `max-width: 768px` | Panel alta kayar (mobile sheet), harita üstte kalır |
| `max-width: 480px` | Uçuş bilgi değerleri küçülür (font-size: 12px) |
| `min-width: 769px` | Panel sağda yüzer (380px genişlik) |

**iOS Safe Area:** `env(safe-area-inset-top)` ile Flight Board yüksekliği dinamik hesaplanır. Notch ve Dynamic Island için tam uyumluluk.

---

## 6. İkon & Görsel Varlıklar

| Dosya | Boyut | Kullanım |
|---|---|---|
| `icons/logo.png` | h=150px | Header logosu (beyaz varyant) |
| `icons/logo-badge.png` | 192x192 | App ikonu, dairesel rozet |
| `icons/favicon.png` | 128x128 | Tarayıcı sekmesi |
| `icons/splash.png` | 1024x558 | Yükleme ekranı (object-fit: contain) |
| `icons/AnaEkran.png` | 1024x558 | Landing page arkaplan |
| `icons/panorama.png` | — | Arama sonuçları dekoratif görsel |

---

## 7. Figma Bağlantısı & Plugin Kullanımı

Bağlı MCP sunucusu: **Figma MCP** (`mcp__438bc96d-...`)

Kullanılabilir araçlar:
- `get_design_context` — Seçili frame tasarım bilgisini çeker
- `get_screenshot` — Frame görselini alır
- `search_design_system` — Design system bileşenlerini arar
- `get_variable_defs` — Figma değişkenlerini (renk/tip/boyut) listeler
- `upload_assets` — Figma'ya varlık yükler

**Önerilen Figma Pluginleri:**
1. **Tokens Studio** — CSS değişkenlerini Figma token'larına eşle
2. **Stark** — Kontrast ve erişilebilirlik denetimi
3. **Unsplash** — Demo görsel içeriği
4. **Iconify** — SVG ikon kütüphanesi

---

## 8. Erişilebilirlik (A11y) Kuralları

- Tüm interaktif elementler `tabindex` ve `title` attribute içerir
- Renk kontrastı WCAG AA standardına uygun (4.5:1 metin, 3:1 büyük metin)
- Animasyonlar `prefers-reduced-motion` media query ile devre dışı bırakılabilir
- Touch hedefleri minimum 44x44px (iOS HIG / Android Material uyumlu)
