"""
Anadolu Seyahatnamesi - Dijital Seyyah CLI Aracı
Terminal Üzerinden Seyahat Yönetimi, 2-Opt Rota Optimizasyonu, Arama, Başarım ve Derleme
"""

import sys
import json
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
    print(f"  ⛺ 5 Gün Kuralı Sefer Süresi: {sefer_days} gün ({len(route) - 1} yeni menzil)")

    gpx_file = getattr(args, "gpx", None)
    if gpx_file:
        gpx_path = Path(gpx_file)
        gpx_xml = engine.export_gpx_route(route)
        gpx_path.write_text(gpx_xml, encoding="utf-8")
        print(f"  📡 GPX 1.1 Rotası Dışa Aktarıldı: {gpx_path}")
    print()


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


def cmd_compare(args):
    print_banner()
    engine = SeyyahEngine()
    comp = engine.compare_provinces(args.city_a, args.city_b)
    if not comp:
        print(f"✗ '{args.city_a}' veya '{args.city_b}' adına/plaka koduna sahip il bulunamadı.\n")
        return

    ca = comp["city_a"]
    cb = comp["city_b"]
    st_a = "✅ Ziyaret Edildi" if ca["visited"] else "⏳ Bekliyor"
    st_b = "✅ Ziyaret Edildi" if cb["visited"] else "⏳ Bekliyor"
    same_reg_str = "Evet (Aynı Bölge)" if comp["same_region"] else "Hayır (Farklı Bölgeler)"

    print("=" * 84)
    print(f" ⚖️  İL KARŞILAŞTIRMA ANALİZİ: {ca['name'].upper()} ({ca['plate']:02d})  ↔  {cb['name'].upper()} ({cb['plate']:02d})")
    print("=" * 84)
    print(f" {'KRİTER':<22} | {ca['name']:<26} | {cb['name']:<26}")
    print("-" * 84)
    print(f" {'Plaka Kodu':<22} | {ca['plate']:02d}{'':<24} | {cb['plate']:02d}")
    print(f" {'Coğrafi Bölge':<22} | {ca['region']:<26} | {cb['region']:<26}")
    print(f" {'Ziyaret Durumu':<22} | {st_a:<25} | {st_b:<25}")
    print(f" {'Miras Sayısı':<22} | {comp['landmarks_a_count']} durak{'':<19} | {comp['landmarks_b_count']} durak")
    print(f" {'Yöresel Lezzet Sayısı':<22} | {comp['specialties_a_count']} lezzet{'':<18} | {comp['specialties_b_count']} lezzet")
    print("-" * 84)
    print(f" ✈️  Kuş Uçuşu Mesafe   : {comp['air_distance_km']} km")
    print(f" 🛣️  Tahmini Karayolu   : {comp['road_distance_km']} km (~{comp['est_drive_hours']} saat sürüş)")
    print(f" 🗺️  Bölge Ortaklığı    : {same_reg_str}")
    print("-" * 84)
    print(f" 🏛️  {ca['name']} Mirasları : {', '.join(ca.get('landmarks', []))}")
    print(f" 🏛️  {cb['name']} Mirasları : {', '.join(cb.get('landmarks', []))}")
    print(f" 🍽️  {ca['name']} Lezzetleri: {', '.join(ca.get('specialties', []))}")
    print(f" 🍽️  {cb['name']} Lezzetleri: {', '.join(cb.get('specialties', []))}")
    print(f" 📖 {ca['name']} Kütüphane : {ca.get('custom_library', ca.get('library', ''))}")
    print(f" 📖 {cb['name']} Kütüphane : {cb.get('custom_library', cb.get('library', ''))}")
    print("=" * 84 + "\n")


def cmd_region(args):
    print_banner()
    engine = SeyyahEngine()
    summary = engine.get_region_summary(args.region)
    if not summary:
        print(f"✗ '{args.region}' koduna veya adına sahip coğrafi bölge bulunamadı.\n")
        return

    print("=" * 82)
    print(f" {summary['icon']} {summary['name'].upper()} KEŞİF DOSYASI ({summary['region_code']})")
    print("=" * 82)
    print(f" 📜 {summary['desc']}")
    print("-" * 82)
    print(f" 📊 Keşif Oranı         : %{summary['percentage']} ({summary['visited']} / {summary['total']} İl Ziyaret Edildi, {summary['unvisited']} Bekleyen)")
    print(f" 🏛️  Toplam Miras Durağı : {summary['total_landmarks']} tarihi ve doğal miras")
    print(f" 🍽️  Yöresel Lezzetler   : {summary['total_specialties']} tescilli/yöresel tat")
    print("-" * 82)

    visited_names = [f"{p['name']} ({p['plate']:02d})" for p in summary["visited_provinces"]]
    unvisited_names = [f"{p['name']} ({p['plate']:02d})" for p in summary["unvisited_provinces"]]
    print(f" ✅ Ziyaret Edilen İller ({summary['visited']}):")
    print(f"    {', '.join(visited_names) if visited_names else 'Henüz ziyaret edilen il yok.'}\n")
    print(f" ⏳ Keşfedilmeyi Bekleyen İller ({summary['unvisited']}):")
    print(f"    {', '.join(unvisited_names) if unvisited_names else 'Bölgedeki tüm iller tamamlandı!'}")

    corridor = summary.get("optimal_corridor", [])
    if len(corridor) >= 2:
        corridor_names = " ➔ ".join(f"{s['name']}" for s in corridor)
        total_km = corridor[-1].get("cumulative_km", 0)
        print("-" * 82)
        print(f" 🧭 Önerilen Bölgesel Keşif Koridoru ({total_km:,} km):")
        print(f"    {corridor_names}")
    print("=" * 82 + "\n")


def cmd_doctor(args):
    print_banner()
    engine = SeyyahEngine()
    report = engine.audit_integrity()

    print("=" * 78)
    print("               DİJİTAL SEYYAH SAĞLIK & BÜTÜNLÜK DENETİMİ (DOCTOR)")
    print("=" * 78)
    print(f" 📸 İl Görselleri (81x2)    : {report['province_photos']} / 162")
    print(f" 🏛️  Anıt & Miras Görselleri : {report['monument_photos_found']} / {report['monument_photos_expected']}")
    print(f" 🧩 index.html Kırık Bağlantı: {len(report['missing_html_assets'])}")
    print(f" 📱 PWA Manifest / SW       : {'✅ OK' if report['manifest_ok'] else '❌ HATA'} / {'✅ OK' if report['sw_ok'] else '❌ HATA'}")
    print("-" * 78)

    if report["missing_province_banners"]:
        print(f" ✗ Eksik banner.jpg  : {', '.join(report['missing_province_banners'])}")
    if report["missing_province_galleries"]:
        print(f" ✗ Eksik gallery.jpg : {', '.join(report['missing_province_galleries'])}")
    if report["missing_monuments"]:
        print(f" ✗ Eksik anıt görseli: {', '.join(report['missing_monuments'])}")
    if report["missing_html_assets"]:
        print(f" ✗ Eksik HTML dosyası: {', '.join(report['missing_html_assets'])}")

    if report["healthy"]:
        print(" ✅ SONUÇ: Tüm 81 il, anıt arşivleri, SPA varlıkları ve PWA katmanı %100 sağlıklı!\n")
    else:
        print(" ⚠️  SONUÇ: Yukarıdaki eksik varlıklar tespit edildi.\n")
        sys.exit(1)


def cmd_export_geojson(args):
    print_banner()
    engine = SeyyahEngine()
    visited_only = getattr(args, "visited", False)
    fc = engine.export_geojson(visited_only=visited_only)
    out_path = Path(args.output)
    out_path.write_text(json.dumps(fc, ensure_ascii=False, indent=2), encoding="utf-8")
    scope = "ziyaret edilen" if visited_only else "tüm 81"
    print(f"🗺️  GeoJSON (RFC 7946) dışa aktarıldı: {out_path} ({len(fc['features'])} {scope} il)\n")


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
    p_route.add_argument("--gpx", help="Planlanan rotayı GPX 1.1 (.gpx) dosyasına dışa aktar")
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

    # compare
    p_compare = subparsers.add_parser("compare", help="İki ili mesafe, bölge, miras ve lezzet açısından karşılaştır")
    p_compare.add_argument("city_a", help="Birinci il adı veya plaka kodu (örn: Ankara, 06)")
    p_compare.add_argument("city_b", help="İkinci il adı veya plaka kodu (örn: Konya, 42)")
    p_compare.set_defaults(func=cmd_compare)

    # region
    p_region = subparsers.add_parser("region", help="Belirli bir coğrafi bölgenin detaylı keşif dosyasını göster")
    p_region.add_argument("region", help="Bölge kodu veya adı (örn: 01_Marmara, Marmara, Karadeniz)")
    p_region.set_defaults(func=cmd_region)

    # doctor
    p_doctor = subparsers.add_parser("doctor", help="81 il, 86 anıt görseli, HTML varlıkları ve PWA bütünlüğünü denetle")
    p_doctor.set_defaults(func=cmd_doctor)

    # export-geojson
    p_geojson = subparsers.add_parser("export-geojson", help="İlleri RFC 7946 uyumlu GeoJSON olarak dışa aktar")
    p_geojson.add_argument("--visited", action="store_true", help="Yalnızca ziyaret edilen illeri dışa aktar")
    p_geojson.add_argument("--output", default="anadolu_seyahatnamesi.geojson", help="Çıktı GeoJSON dosya yolu")
    p_geojson.set_defaults(func=cmd_export_geojson)

    args = parser.parse_args()
    if args.command and hasattr(args, "func"):
        args.func(args)
    else:
        cmd_status(args)


if __name__ == "__main__":
    main()
