"""
Anadolu Seyahatnamesi - Kapsamlı Test ve Doğrulama Paketi
"""

import json
import subprocess
import sys
from pathlib import Path
import pytest

from travel_core import (
    SeyyahEngine,
    PROVINCES_DATA,
    REGIONS_INFO,
    turkish_sort_key,
    normalize_turkish,
)
from map_generator import MapGenerator


@pytest.fixture
def engine():
    return SeyyahEngine()


def test_total_provinces_count(engine):
    """Türkiye'nin 81 ilinin tamamının veritabanında olduğunu doğrular."""
    assert len(PROVINCES_DATA) == 81
    assert len(engine.provinces) == 81


def test_unique_plates_1_to_81():
    """Plaka kodlarının 1'den 81'e eksiksiz ve benzersiz olduğunu doğrular."""
    plates = sorted(p["plate"] for p in PROVINCES_DATA.values())
    assert plates == list(range(1, 82))


def test_seven_geographical_regions():
    """Türkiye'nin 7 coğrafi bölgesinin tanımlı olduğunu doğrular."""
    assert len(REGIONS_INFO) == 7
    expected_regions = [
        "01_Marmara", "02_Ege", "03_Akdeniz", "04_IcAnadolu",
        "05_Karadeniz", "06_DoguAnadolu", "07_GuneydoguAnadolu"
    ]
    for reg in expected_regions:
        assert reg in REGIONS_INFO


def test_provinces_coordinates_within_turkey_bounds():
    """Tüm il koordinatlarının Türkiye sınırları içerisinde olduğunu doğrular."""
    for _, p in PROVINCES_DATA.items():
        lat = p["lat"]
        lng = p["lng"]
        assert 35.5 <= lat <= 42.5, f"{p['name']} enlemi hatalı: {lat}"
        assert 25.5 <= lng <= 45.0, f"{p['name']} boylamı hatalı: {lng}"
        assert 1 <= p["plate"] <= 81, f"{p['name']} plaka kodu hatalı: {p['plate']}"


def test_turkish_sorting_and_normalization():
    """Türkçe alfabetik sıralama ve karakter normalizasyonunun doğru çalıştığını doğrular."""
    cities = ["İzmir", "Çanakkale", "Adana", "Şanlıurfa", "Iğdır", "Bursa", "Ödemiş", "Ünye"]
    sorted_cities = sorted(cities, key=turkish_sort_key)
    assert sorted_cities.index("Adana") < sorted_cities.index("Bursa")
    assert sorted_cities.index("Bursa") < sorted_cities.index("Çanakkale")
    assert sorted_cities.index("Iğdır") < sorted_cities.index("İzmir")
    assert normalize_turkish("İstanbul") == "istanbul"
    assert normalize_turkish("ŞANLIURFA") == "sanliurfa"
    assert normalize_turkish("Iğdır") == "igdir"


def test_visited_cities_detection(engine):
    """Ziyaret edilen şehirlerin ve dinamik bölge/mesai istatistiklerinin doğruluğunu test eder."""
    assert engine.stats["visited_cities"] >= 30
    assert 0 < engine.stats["progress_pct"] <= 100
    assert engine.stats["estimated_km"] > 5000
    assert 1 <= engine.stats["visited_regions"] <= 7
    assert engine.stats["total_regions"] == 7
    assert engine.stats["days_on_road"] == engine.stats["visited_cities"] * 5
    assert engine.stats["library_hours"] == engine.stats["visited_cities"] * 20


def test_extracted_rich_city_content(engine):
    """Ziyaret edilen illerin Markdown dosyalarından tarih/tefekkür/alıntı ayıklandığını doğrular."""
    istanbul = engine.provinces["01_Marmara/Istanbul"]
    assert istanbul["visited"] is True
    assert istanbul.get("history")
    assert istanbul.get("reflection")
    assert len(istanbul.get("literary_quotes", [])) >= 1


def test_extract_spiritual_figures_and_five_day_plan(engine):
    """Manevi Mimarlar ve 5 Günlük Keşif Planı bölümlerinin hem gezilen hem bekleyen illerden ayıklandığını doğrular."""
    sample_md = """# 📍 Örnek Şehir
## 📜 Şehrin Ruhu
> "Örnek şehir alıntısı."

### 🌍 Şehrin Dokusu ve Tarihsel Arka Planı
Kadim bir Anadolu menzilidir.

### 🕌 Manevi Mimarlar ve İrfan İzleri
- **Şeyh Edebali:** Kurucu hikmetin mimarı.
- **Yunus Emre:** Gönül dilinin şairi.

### 🧭 5 Günlük Seyahatsever Keşif Planı
- **1. Gün:** Tarihi merkez ve Ulu Cami ziyareti.
- **2. Gün:** İl Halk Kütüphanesi mesaisi ve kale yürüyüşü.

### 🕊️ Gezginin Not Defterinden (Manevi Boyut ve Tefekkür)
Sükunet içinde derin bir tefekkür durağı.
"""
    dummy = {}
    engine._extract_city_details(dummy, sample_md)
    assert dummy["custom_quote"] == "Örnek şehir alıntısı."
    assert "Kadim bir Anadolu menzilidir." in dummy["history"]
    assert len(dummy["spiritual_figures"]) == 2
    assert "Şeyh Edebali" in dummy["spiritual_figures"][0]
    assert len(dummy["five_day_plan"]) == 2
    assert "1. Gün" in dummy["five_day_plan"][0]
    assert "tefekkür" in dummy["reflection"]


def test_gallery_fields_and_photo_stats(engine):
    """Her ilde has_gallery, gallery_rel, images alanlarının ve istatistiklerde total_photos bilgisinin doğruluğunu test eder."""
    expected_total = 0
    expected_two = 0
    for key, p in engine.provinces.items():
        assert "has_banner" in p
        assert "has_gallery" in p
        assert "gallery_rel" in p
        assert isinstance(p.get("images"), list)
        count = int(p["has_banner"]) + int(p["has_gallery"])
        assert len(p["images"]) == count
        if p["has_gallery"]:
            assert p["gallery_rel"] == f"{key}/gallery.jpg"
        else:
            assert p["gallery_rel"] is None
        expected_total += count
        if p["has_banner"] and p["has_gallery"]:
            expected_two += 1

    assert engine.stats["total_photos"] == expected_total
    assert engine.stats["provinces_with_two_photos"] == expected_two


def test_all_81_provinces_have_banner_and_gallery(engine):
    """81 ilin tamamında hem banner.jpg hem gallery.jpg (toplam 162 görsel) bulunduğunu doğrular."""
    missing_banner = [k for k, p in engine.provinces.items() if not p["has_banner"]]
    missing_gallery = [k for k, p in engine.provinces.items() if not p["has_gallery"]]
    assert not missing_banner, f"banner.jpg eksik iller: {missing_banner}"
    assert not missing_gallery, f"gallery.jpg eksik iller: {missing_gallery}"
    assert engine.stats["total_photos"] == 162
    assert engine.stats["provinces_with_two_photos"] == 81


def test_achievements_and_rank_calculation(engine):
    """Seyyah rütbe ve başarım rozetlerinin tutarlı hesaplandığını doğrular."""
    ach = engine.achievements
    assert "rank" in ach
    assert "badges" in ach
    assert ach["total_badges"] == len(ach["badges"])
    assert ach["unlocked_count"] == sum(1 for b in ach["badges"] if b["unlocked"])
    assert ach["unlocked_count"] >= 3


def test_haversine_distance_calculation(engine):
    """Ankara - İstanbul arası mesafenin yaklaşık 300-400 km (kuş uçuşu) olduğunu doğrular."""
    ankara = PROVINCES_DATA["04_IcAnadolu/Ankara"]
    istanbul = PROVINCES_DATA["01_Marmara/Istanbul"]
    dist = engine.calculate_distance_km(ankara["lat"], ankara["lng"], istanbul["lat"], istanbul["lng"])
    assert 300 <= dist <= 400


def test_find_and_search_provinces(engine):
    """Plaka, isim ve Türkçe duyarsız arama fonksiyonlarını doğrular."""
    assert engine.find_province("34")["name"] == "İstanbul"
    assert engine.find_province("istanbul")["name"] == "İstanbul"
    assert engine.find_province("igdir")["name"] == "Iğdır"
    mevlana_hits = engine.search_provinces("Mevlana")
    assert any(p["name"] == "Konya" for p in mevlana_hits)
    se_hits = engine.search_provinces("", region_code="07_GuneydoguAnadolu")
    assert len(se_hits) == 9


def test_nearest_provinces_lookup(engine):
    """En yakın komşu illerin artan mesafeye göre döndüğünü doğrular."""
    neighbors = engine.get_nearest_provinces("Ankara", count=4)
    assert len(neighbors) == 4
    distances = [n["distance_km"] for n in neighbors]
    assert distances == sorted(distances)
    assert all(n["name"] != "Ankara" for n in neighbors)


def test_route_planner_greedy_and_two_opt(engine):
    """2-Opt optimize rotanın geçerli olduğunu ve greedy rotadan uzun olmadığını doğrular."""
    greedy = engine.plan_optimal_route(start_city_name="Ankara", max_stops=8, optimize=False)
    optimized = engine.plan_optimal_route(start_city_name="Ankara", max_stops=8, optimize=True)
    assert len(greedy) >= 2
    assert len(optimized) == len(greedy)
    assert optimized[0]["name"] == "Ankara"
    assert optimized[-1]["cumulative_km"] <= greedy[-1]["cumulative_km"]


def test_route_planner_region_filter(engine):
    """Bölge filtreli rota planlayıcının yalnızca ilgili bölgeden duraklar seçtiğini doğrular."""
    route = engine.plan_optimal_route(
        start_city_name="Ankara",
        max_stops=5,
        region_code="07_GuneydoguAnadolu",
        optimize=True
    )
    assert len(route) >= 2
    assert route[0]["name"] == "Ankara"
    for stop in route[1:]:
        assert stop["region_code"] == "07_GuneydoguAnadolu"


def test_web_data_json_generation(engine, tmp_path, monkeypatch):
    """travel_data.json ve web_data.js dosyalarının üretilip geçerli olduğunu doğrular."""
    monkeypatch.setattr(engine, "repo_root", tmp_path)
    json_path, js_path = engine.generate_web_data_json()
    assert json_path.exists()
    assert js_path.exists()

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        assert "stats" in data
        assert "achievements" in data
        assert "provinces" in data
        assert "regions" in data
        assert "quotes" in data
        assert len(data["provinces"]) == 81


def test_map_generator_produces_valid_html(tmp_path):
    """MapGenerator'ın katman kontrolü ve katlanabilir panel içeren HTML harita ürettiğini doğrular."""
    mg = MapGenerator()
    mg.output_file = tmp_path / "travel_map.html"
    out = mg.generate()
    assert out.exists()
    html_text = out.read_text(encoding="utf-8")
    assert "ANADOLU SEYAHATNAMESİ" in html_text
    assert "seyyah-panel-toggle" in html_text
    assert "map-quick-city-search" in html_text
    assert "Aktif Sefer Rotasına Odaklan" in html_text
    assert "leaflet" in html_text.lower()


def test_all_visited_city_readmes_exist(engine):
    """Ziyaret edilen tüm illerin README dosyalarının varlığını ve bütünlüğünü doğrular."""
    for _, p in engine.visited_provinces.items():
        readme_path = Path(p["readme_rel"])
        assert readme_path.exists(), f"README eksik: {readme_path}"
        content = readme_path.read_text(encoding="utf-8")
        assert len(content) > 500, f"README çok kısa: {readme_path}"


def test_cli_commands_execute_cleanly():
    """CLI alt komutlarının hatasız çalıştığını doğrular."""
    for cmd in [
        [sys.executable, "dijital_seyyah.py", "status"],
        [sys.executable, "dijital_seyyah.py", "info", "42"],
        [sys.executable, "dijital_seyyah.py", "search", "Mevlana"],
        [sys.executable, "dijital_seyyah.py", "badges"],
        [sys.executable, "dijital_seyyah.py", "plan-route", "--start", "Ankara", "--stops", "4"],
    ]:
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        assert res.returncode == 0, f"CLI hatası ({cmd}): {res.stderr}"


def test_compare_provinces(engine):
    """İki ilin mesafe, bölge, miras ve lezzet açısından doğru karşılaştırıldığını test eder."""
    comp = engine.compare_provinces("Ankara", "42")
    assert comp is not None
    assert comp["city_a"]["name"] == "Ankara"
    assert comp["city_b"]["name"] == "Konya"
    assert comp["same_region"] is True
    assert comp["air_distance_km"] > 100
    assert comp["road_distance_km"] >= comp["air_distance_km"]
    assert comp["est_drive_hours"] > 0
    assert comp["landmarks_a_count"] >= 3
    assert comp["landmarks_b_count"] >= 3
    assert comp["specialties_a_count"] >= 2
    assert comp["specialties_b_count"] >= 2

    diff_reg = engine.compare_provinces("34", "06")
    assert diff_reg is not None
    assert diff_reg["same_region"] is False
    assert engine.compare_provinces("Ankara", "OlmayanSehir") is None


def test_get_region_summary(engine):
    """Bölgesel keşif özeti ve optimal koridor hesabının doğruluğunu test eder."""
    summary = engine.get_region_summary("01_Marmara")
    assert summary is not None
    assert summary["region_code"] == "01_Marmara"
    assert summary["name"] == "Marmara Bölgesi"
    assert summary["total"] == 11
    assert summary["visited"] + summary["unvisited"] == 11
    assert len(summary["visited_provinces"]) == summary["visited"]
    assert len(summary["unvisited_provinces"]) == summary["unvisited"]
    assert summary["total_landmarks"] > 20
    assert summary["total_specialties"] > 20
    assert isinstance(summary["optimal_corridor"], list)

    by_name = engine.get_region_summary("Karadeniz")
    assert by_name is not None
    assert by_name["region_code"] == "05_Karadeniz"
    assert by_name["total"] == 18
    assert engine.get_region_summary("GecersizBolge") is None


def test_export_gpx_route(engine):
    """GPX 1.1 rota dışa aktarımının geçerli XML, <wpt> ve <rte>/<rtept> düğümleri ürettiğini test eder."""
    import xml.etree.ElementTree as ET

    route = engine.build_custom_route()
    gpx_str = engine.export_gpx_route(route)
    assert '<gpx version="1.1"' in gpx_str
    assert "<wpt " in gpx_str
    assert "<rte>" in gpx_str
    assert "<rtept " in gpx_str

    root = ET.fromstring(gpx_str)
    assert root.tag.endswith("gpx")
    assert root.attrib.get("version") == "1.1"
    wpts = [el for el in root if el.tag.endswith("wpt")]
    assert len(wpts) == len(route)


def test_enriched_stats_landmarks_and_specialties(engine):
    """Zenginleştirilmiş self.stats alanlarının (total_landmarks, total_specialties, geographic_center) doğruluğunu test eder."""
    stats = engine.stats
    assert "total_landmarks" in stats
    assert "total_specialties" in stats
    assert "geographic_center" in stats
    assert stats["total_landmarks"] >= 250
    assert stats["total_specialties"] >= 200
    center = stats["geographic_center"]
    assert 35.5 <= center["lat"] <= 42.5
    assert 25.5 <= center["lng"] <= 45.0


def test_cli_compare_and_region_commands(tmp_path):
    """CLI compare, region ve plan-route --gpx alt komutlarının hatasız çalıştığını doğrular."""
    gpx_out = tmp_path / "sefer_rotasi.gpx"
    for cmd in [
        [sys.executable, "dijital_seyyah.py", "compare", "Ankara", "Konya"],
        [sys.executable, "dijital_seyyah.py", "region", "01_Marmara"],
        [sys.executable, "dijital_seyyah.py", "region", "Karadeniz"],
        [sys.executable, "dijital_seyyah.py", "plan-route", "--start", "Ankara", "--stops", "4", "--gpx", str(gpx_out)],
    ]:
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        assert res.returncode == 0, f"CLI hatası ({cmd}): {res.stderr}"
    assert gpx_out.exists()
    assert '<gpx version="1.1"' in gpx_out.read_text(encoding="utf-8")


def test_full_repository_integrity_audit(engine):
    """81 il görseli (162), 86 anıt/miras fotoğrafı, index.html varlıkları ve PWA bütünlüğünü doğrular."""
    report = engine.audit_integrity()
    assert report["missing_province_banners"] == [], f"Eksik banner: {report['missing_province_banners']}"
    assert report["missing_province_galleries"] == [], f"Eksik gallery: {report['missing_province_galleries']}"
    assert report["missing_monuments"] == [], f"Eksik anıt görseli: {report['missing_monuments']}"
    assert report["missing_html_assets"] == [], f"index.html kırık bağlantı: {report['missing_html_assets']}"
    assert report["monument_photos_expected"] >= 86
    assert report["monument_photos_found"] == report["monument_photos_expected"]
    assert report["manifest_ok"] is True
    assert report["sw_ok"] is True
    assert report["healthy"] is True


def test_export_geojson_all_and_visited(engine):
    """RFC 7946 uyumlu GeoJSON dışa aktarımının 81 il ve ziyaret edilen iller için doğruluğunu test eder."""
    all_fc = engine.export_geojson(visited_only=False)
    visited_fc = engine.export_geojson(visited_only=True)

    assert all_fc["type"] == "FeatureCollection"
    assert len(all_fc["features"]) == 81
    assert len(visited_fc["features"]) == engine.stats["visited_cities"]
    assert all(f["properties"]["visited"] is True for f in visited_fc["features"])

    sample = all_fc["features"][0]
    assert sample["type"] == "Feature"
    assert sample["geometry"]["type"] == "Point"
    lng, lat = sample["geometry"]["coordinates"]
    assert 25.5 <= lng <= 45.0
    assert 35.5 <= lat <= 42.5


def test_pwa_manifest_shortcuts_and_sw_sync(engine):
    """manifest.json kısayollarını ve sw.js önbellek sürümünü doğrular."""
    manifest = json.loads((engine.repo_root / "manifest.json").read_text(encoding="utf-8"))
    assert "259+" in manifest["description"]
    assert len(manifest.get("shortcuts", [])) >= 4
    sw_text = (engine.repo_root / "sw.js").read_text(encoding="utf-8")
    assert "dijital-seyyah-v37" in sw_text
    assert "wave10-ux-polish.css" in sw_text
    catalog_text = (engine.repo_root / "js" / "monuments-catalog.js").read_text(encoding="utf-8")
    assert catalog_text.count('"assets/monuments/') == 86


def test_cli_doctor_and_export_geojson(tmp_path):
    """CLI doctor ve export-geojson alt komutlarının hatasız çalıştığını doğrular."""
    geo_out = tmp_path / "anadolu.geojson"
    res_doc = subprocess.run(
        [sys.executable, "dijital_seyyah.py", "doctor"],
        capture_output=True, text=True, encoding="utf-8"
    )
    assert res_doc.returncode == 0, f"doctor hatası: {res_doc.stderr}\n{res_doc.stdout}"
    assert "%100 sağlıklı" in res_doc.stdout

    res_geo = subprocess.run(
        [sys.executable, "dijital_seyyah.py", "export-geojson", "--visited", "--output", str(geo_out)],
        capture_output=True, text=True, encoding="utf-8"
    )
    assert res_geo.returncode == 0, f"export-geojson hatası: {res_geo.stderr}"
    assert geo_out.exists()
    parsed = json.loads(geo_out.read_text(encoding="utf-8"))
    assert parsed["type"] == "FeatureCollection"
    assert len(parsed["features"]) >= 30

