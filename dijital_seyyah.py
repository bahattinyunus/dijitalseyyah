"""
Anadolu Seyahatnamesi - Dijital Seyyah CLI Aracı
Terminal Üzerinden Seyahat Yönetimi, 2-Opt Rota Optimizasyonu, Arama, Başarım ve Derleme
"""

import sys
import argparse
import random
from pathlib import Path

# Windows UTF-8 Terminal Desteği
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from travel_core import SeyyahEngine, TRAVEL_QUOTES, REGIONS_INFO, turkish_sort_key
from map_generator import MapGenerator

ASCII_LOGO = r"""
  ___  _  _   _   ___   ___  _    _   _   ___ _____   __ _   _  _   _   __  __ ___ ___ ___
 / _ \| \| | /_\ |   \ / _ \| |  | | | | / __| __\ \ / //_\ | || | /_\ |  \/  | __/ __|_ _|
| (_) | .` |/ _ \| |) | (_) | |__| |_| | \__ \ _| \ V // _ \| __ |/ _ \| |\/| | _|\__ \| |
 \___/|_|\_/_/ \_\___/ \___/|____|\___/  |___/___| |_|/_/ \_\_||_/_/ \_\_|  |_|___|___/___|
                  [ D I J I T A L   S E Y Y A H   C L I ]
"""


def print_banner():
    print(ASCII_LOGO)


def generate_book(engine: SeyyahEngine, out_path: Path = None) -> Path:
    """Tüm gezilen illeri tek bir Markdown külliyat kitabına derler."""
    visited = sorted(
        engine.visited_provinces.values(),
        key=lambda p: (p["region_code"], turkish_sort_key(p["name"]))
    )

    stats = engine.stats
    rank = engine.achievements.get("rank", {"icon": "🧭", "title": "Seyyah"})

    book_content = f"""# 🕌 ANADOLU SEYAHATNAMESİ: DİJİTAL SEYYAH KÜLLİYATI

> *"Biz yolların bitmediği, keşfin son bulmadığı bir alemde Hakikati ve Güzelliği arayan yolcularız."*

---

## 📊 Seyahatname Özeti
* **Seyyah Rütbesi:** {rank['icon']} {rank['title']}
* **Toplam Ziyaret Edilen İl:** {stats['visited_cities']} / {stats['total_cities']}
* **Keşif Oranı:** %{stats['progress_pct']}
* **Kat Edilen Tahmini Mesafe:** {stats['estimated_km']:,} km
* **Kapsanan Bölgeler:** {stats['visited_regions']} / {stats['total_regions']}
* **5 Gün Kuralı Yolculuk Süresi:** {stats['days_on_road']} gün ({stats['library_hours']} saat kütüphane mesaisi)

---

## 📑 İÇİNDEKİLER
"""
    for idx, p in enumerate(visited, 1):
        book_content += f"{idx}. [{p['name']} ({p['region']})](#{p['slug'].lower()})\n"

    book_content += "\n---\n\n"

    for p in visited:
        book_content += f"""## <a id="{p['slug'].lower()}"></a>📍 {p['name']} ({p['plate']:02d}) - {p['region']}

> *"{p.get('custom_quote', p.get('quote', ''))}"*
"""
        if p.get("history"):
            book_content += f"\n### 🌍 Tarihsel Arka Plan\n{p['history']}\n"

        if p.get("reflection"):
            book_content += f"\n### 🕊️ Tefekkür Notu\n{p['reflection']}\n"

        book_content += "\n### 🏛️ Öne Çıkan Miras & Duraklar\n"
        for lm in p.get("landmarks", []):
            book_content += f"- [x] {lm}\n"

        book_content += f"""
### 🍽️ Yöresel Tatlar
{', '.join(p.get('specialties', ['Yöresel lezzetler']))}

### 💻 Seyyahın Kütüphane Ofisi
{p.get('custom_library', p.get('library', 'İl Halk Kütüphanesi'))}

---
"""

    target = out_path or (engine.repo_root / "ANADOLU_SEYAHATNAMESI.md")
    target.write_text(book_content, encoding="utf-8")
    return target


def cmd_status(args):
    print_banner()
    engine = SeyyahEngine()
    stats = engine.stats
    ach = engine.achievements
    rank = ach["rank"]
    pct = stats["progress_pct"]
    visited = stats["visited_cities"]
    total = stats["total_cities"]

    filled = int((pct / 100) * 30)
    bar = "=" * filled + "-" * (30 - filled)

    print("=" * 74)
    print("                      SEYYAH GENEL DURUM PANELI")
    print("=" * 74)
    print(f" {rank['icon']} Seyyah Rutbesi:     {rank['title']}")
    if ach["next_rank"]:
        print(f"    Sonraki Mertebe:     {ach['next_rank']['icon']} {ach['next_rank']['title']} (+{ach['cities_to_next_rank']} il)")
    print(f" [OK] Kesif Ilerlemesi:  [{bar}] %{pct} ({visited}/{total} Il)")
    print(f" [KM] Tahmini Mesafe:    {stats['estimated_km']:,} km karayolu izi")
    print(f" [RG] Kapsanan Bolge:    {stats['visited_regions']} / {stats['total_regions']} bolge")
    print(f" [OF] Kutuphane Ofisi:   {visited} il ({stats['days_on_road']} gun / {stats['library_hours']} saat mesai)")
    print(f" [BD] Basarim Rozetleri: {ach['unlocked_count']} / {ach['total_badges']} acildi")
    print("-" * 74)
    print("                        BOLGESEL DAGILIM")
    print("-" * 74)

    for _, r in stats["regional_breakdown"].items():
        r_bar_filled = int((r["percentage"] / 100) * 15)
        r_bar = "#" * r_bar_filled + "." * (15 - r_bar_filled)
        print(f" {r['icon']} {r['name']:<26} [{r_bar}] %{r['percentage']:>5.1f} ({r['visited']:>2}/{r['total']:>2})")

    quote = random.choice(TRAVEL_QUOTES)
    print("-" * 74)
    print("                        GUNUN TEFEKKURU")
    print("-" * 74)
    print(f" 📜 \"{quote['quote']}\"")
    print(f"    — {quote['author']}\n")


def cmd_build(args):
    print_banner()
    print("🔨 [1/4] Veri tabanı ve web modülleri senkronize ediliyor...")
    engine = SeyyahEngine()
    json_path, js_path = engine.generate_web_data_json()
    print(f"  ✓ {json_path.name} ve {js_path.name} oluşturuldu.")

    print("🗺️ [2/4] İnteraktif Folium / Leaflet haritası derleniyor...")
    mg = MapGenerator()
    out_map = mg.generate()
    print(f"  ✓ {out_map.name} üretildi.")

    print("📄 [3/4] README.md istatistikleri ve rozetleri güncelleniyor...")
    if engine.update_readme_stats():
        print("  ✓ README.md başarıyla senkronize edildi.")
    else:
        print("  ! README.md bulunamadı.")

    print("📚 [4/4] ANADOLU_SEYAHATNAMESI.md külliyatı güncelleniyor...")
    book_file = generate_book(engine)
    print(f"  ✓ {book_file.name} senkronize edildi ({engine.stats['visited_cities']} İl).")

    print("\n✨ Derleme tamamlandı! Tüm seyahatname dosyaları güncel.\n")


def cmd_plan_route(args):
    print_banner()
    engine = SeyyahEngine()
    start_city = args.start or (list(engine.visited_provinces.values())[0]["name"] if engine.visited_provinces else "İstanbul")
    stops = args.stops or 7
    region = getattr(args, "region", None)
    optimize = not getattr(args, "no_optimize", False)

    region_label = f" [{REGIONS_INFO[region]['name']}]" if region and region in REGIONS_INFO else ""
    opt_label = "2-Opt Optimize" if optimize else "Greedy"
    print(f"🧭 '{start_city}' noktasından başlayarak {stops} duraklık ({opt_label}{region_label}) keşif rotası planlanıyor...\n")

    route = engine.plan_optimal_route(start_city, max_stops=stops, region_code=region, optimize=optimize)

    if not route or len(route) < 2:
        print("Seçilen kriterlere uygun ziyaret edilmemiş il bulunamadı veya rota hesaplanamadı!")
        return

    print("  DURAK  SEHIR               BOLGE              MESAFE     TOPLAM     ONE CIKAN DURAK")
    print("  " + "-" * 86)
    for idx, stop in enumerate(route):
        dist = stop.get("distance_from_prev_km", 0)
        cum = stop.get("cumulative_km", 0)
        landmark = stop.get("landmarks", ["Menzil"])[0] if stop.get("landmarks") else "Menzil"
        dist_str = f"+{dist} km" if idx > 0 else "BASLANGIC"
        cum_str = f"{cum:,} km" if idx > 0 else "-"
        print(f"  [{idx+1:02d}]   {stop['name']:<18} {stop['region']:<17} {dist_str:<10} {cum_str:<10} 📍 {landmark}")

    total_km = route[-1].get("cumulative_km", 0)
    est_hours = round(total_km / 80.0, 1)
    sefer_days = (len(route) - 1) * 5
    print("  " + "-" * 86)
    print(f"  🛣️ Toplam Planlanan Yolculuk: {total_km:,} km (~{est_hours} saat sürüş)")
    print(f"  ⛺ 5 Gün Kuralı Sefer Süresi: {sefer_days} gün ({len(route) - 1} yeni menzil)\n")


def cmd_export_book(args):
    print_banner()
    print("📚 'ANADOLU_SEYAHATNAMESI.md' derleniyor...")
    engine = SeyyahEngine()
    out_file = generate_book(engine)
    print(f"✓ Külliyat başarıyla '{out_file.name}' dosyasına aktarıldı ({engine.stats['visited_cities']} İl).\n")


def cmd_info(args):
    print_banner()
    engine = SeyyahEngine()
    city = engine.find_province(args.city)
    if not city:
        print(f"✗ '{args.city}' adına veya plaka koduna sahip il bulunamadı.\n")
        return

    status_str = "✅ Ziyaret Edildi" if city["visited"] else "⏳ Keşfedilmeyi Bekliyor"
    print("=" * 74)
    print(f" 📍 {city['name'].upper()} ({city['plate']:02d}) — {city['region']} Bölgesi  [{status_str}]")
    print("=" * 74)
    print(f" 📜 \"{city.get('custom_quote', city.get('quote', ''))}\"\n")
    print(f" 🏛️  Miras & Duraklar : {', '.join(city.get('landmarks', []))}")
    print(f" 🍽️  Yöresel Tatlar   : {', '.join(city.get('specialties', []))}")
    print(f" 📖 Kütüphane Ofisi  : {city.get('custom_library', city.get('library', ''))}")
    print(f" 🗺️  Koordinatlar     : {city['lat']:.4f}° K, {city['lng']:.4f}° D")

    neighbors = engine.get_nearest_provinces(city["name"], count=4)
    if neighbors:
        print("\n 🧭 En Yakın Komşu Menziller:")
        for n in neighbors:
            icon = "✅" if n["visited"] else "⏳"
            print(f"    {icon} {n['name']:<16} ({n['region']:<17}) ~{n['distance_km']} km")
    print()


def cmd_search(args):
    print_banner()
    engine = SeyyahEngine()
    results = engine.search_provinces(args.query, region_code=args.region)
    print(f"🔍 '{args.query}' için {len(results)} sonuç bulundu:\n")
    if not results:
        print("  Eşleşen il, miras veya lezzet bulunamadı.\n")
        return

    for p in results:
        status = "✅" if p["visited"] else "⏳"
        lm = p["landmarks"][0] if p.get("landmarks") else ""
        sp = p["specialties"][0] if p.get("specialties") else ""
        print(f"  {status} [{p['plate']:02d}] {p['name']:<16} | {p['region']:<17} | 📍 {lm} | 🍽️ {sp}")
    print()


def cmd_badges(args):
    print_banner()
    engine = SeyyahEngine()
    ach = engine.achievements
    rank = ach["rank"]

    print("=" * 74)
    print(f" 🏆 SEYYAH RÜTBESİ: {rank['icon']} {rank['title']}")
    print(f"    {rank['desc']}")
    print("=" * 74)
    print(f" Başarım Rozetleri ({ach['unlocked_count']} / {ach['total_badges']} Açıldı):\n")

    for b in ach["badges"]:
        state = "✅ AÇIK " if b["unlocked"] else "🔒 KİLİTLİ"
        pct = int(round((b["current"] / b["target"]) * 100)) if b["target"] else 0
        print(f"  {b['icon']} {b['title']:<22} [{state}]  ({b['current']:,}/{b['target']:,} - %{pct})")
        print(f"     {b['desc']}")
    print()


def main():
    parser = argparse.ArgumentParser(description="Dijital Seyyah - Anadolu Seyahatnamesi CLI")
    subparsers = parser.add_subparsers(dest="command", help="Komutlar")

    # status
    p_status = subparsers.add_parser("status", help="Genel seyahat durumu ve istatistikleri")
    p_status.set_defaults(func=cmd_status)

    # build
    p_build = subparsers.add_parser("build", help="Tüm veri, harita, README ve külliyat çıktılarını derle")
    p_build.set_defaults(func=cmd_build)

    # plan-route
    p_route = subparsers.add_parser("plan-route", help="2-Opt ile en verimli keşif rotasını hesapla")
    p_route.add_argument("--start", help="Başlangıç şehri veya plaka kodu")
    p_route.add_argument("--stops", type=int, default=7, help="Durak sayısı")
    p_route.add_argument("--region", choices=list(REGIONS_INFO.keys()), help="Belirli bir bölgeye odaklan")
    p_route.add_argument("--no-optimize", action="store_true", help="2-Opt optimizasyonunu devre dışı bırak")
    p_route.set_defaults(func=cmd_plan_route)

    # export-book
    p_book = subparsers.add_parser("export-book", help="Tüm gezilen illeri tek bir Markdown kitabına derle")
    p_book.set_defaults(func=cmd_export_book)

    # info
    p_info = subparsers.add_parser("info", help="Belirli bir il hakkında detaylı bilgi göster")
    p_info.add_argument("city", help="İl adı, slug veya plaka kodu (örn: Konya, 42, Istanbul)")
    p_info.set_defaults(func=cmd_info)

    # search
    p_search = subparsers.add_parser("search", help="İl, miras, lezzet veya kütüphane ara")
    p_search.add_argument("query", help="Aranacak kelime (örn: Mevlana, Kebap, Şelale)")
    p_search.add_argument("--region", choices=list(REGIONS_INFO.keys()), help="Bölge filtresi")
    p_search.set_defaults(func=cmd_search)

    # badges
    p_badges = subparsers.add_parser("badges", help="Seyyah rütbesi ve başarım rozetlerini göster")
    p_badges.set_defaults(func=cmd_badges)

    args = parser.parse_args()
    if args.command and hasattr(args, "func"):
        args.func(args)
    else:
        cmd_status(args)


if __name__ == "__main__":
    main()
