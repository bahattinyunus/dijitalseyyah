"""
Anadolu Seyahatnamesi - İnteraktif Folium / Leaflet Harita Üreteci
Pulsing Glowing Markerlar, Çoklu Harita Katmanları, Katlanabilir Glassmorphism Panel ve Zengin Popup Kartları
"""

import html
import json
from pathlib import Path
import folium
from travel_core import SeyyahEngine, turkish_sort_key, normalize_turkish


class MapGenerator:
    def __init__(self, repo_root="."):
        self.engine = SeyyahEngine(repo_root)
        self.output_file = Path(repo_root) / "travel_map.html"

    def generate(self):
        # Türkiye merkezli Folium Haritası (Çoklu Katman Desteği)
        m = folium.Map(
            location=[39.0, 35.3],
            zoom_start=6,
            tiles=None,
            control_scale=True,
            prefer_canvas=True
        )

        # Harita Temaları (100% Ücretsiz, API Anahtarsız Esri ArcGIS & OpenTopoMap Katmanları)
        folium.TileLayer(
            tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
            attr="Esri — World Topographic Map",
            name="🌑 Gece Teması (Obsidian Dark)",
            class_name="seyyah-dark-tiles",
            show=True,
        ).add_to(m)
        folium.TileLayer(
            tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
            attr="Esri — World Topographic Map",
            name="☀️ Gündüz Teması (Topoğrafik)",
            show=False,
        ).add_to(m)
        folium.TileLayer(
            tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            attr="Esri — World Imagery (Uydu)",
            name="🛰️ Uydu Görünümü (Satellite)",
            show=False,
        ).add_to(m)
        folium.TileLayer(
            tiles="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
            attr="OpenTopoMap (CC-BY-SA)",
            name="🏔️ Fiziki Kabartma Harita",
            show=False,
        ).add_to(m)

        stats = self.engine.stats
        pct = stats["progress_pct"]
        visited_count = stats["visited_cities"]
        total_cities = stats["total_cities"]
        visited_regions = stats["visited_regions"]
        total_regions = stats["total_regions"]
        rank = self.engine.achievements.get("rank", {"icon": "🧭", "title": "Seyyah"})

        # Özel CSS Stilleri
        css_style = """
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        .leaflet-container {
            background: #070d19 !important;
        }
        .seyyah-dark-tiles {
            filter: invert(100%) hue-rotate(185deg) brightness(95%) contrast(92%) saturate(115%);
        }

        .map-title-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(15, 23, 42, 0.90);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 16px;
            padding: 18px 20px;
            color: #f8fafc;
            font-family: 'Plus Jakarta Sans', sans-serif;
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
            max-width: 340px;
            width: calc(100vw - 80px);
            pointer-events: auto;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .map-title-panel:hover {
            border-color: rgba(0, 242, 254, 0.35);
            box-shadow: 0 25px 50px -12px rgba(0, 242, 254, 0.2);
        }
        .panel-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .panel-toggle-btn {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.14);
            color: #cbd5e1;
            border-radius: 8px;
            width: 28px;
            height: 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            flex-shrink: 0;
            transition: all 0.2s ease;
        }
        .panel-toggle-btn:hover {
            border-color: #00f2fe;
            color: #00f2fe;
        }
        .map-title-panel.collapsed .panel-collapsible {
            display: none;
        }
        .map-title-panel h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 17px;
            font-weight: 800;
            margin: 0;
            background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 0.4px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .map-title-panel .subtitle {
            font-size: 11.5px;
            color: #94a3b8;
            margin: 6px 0 12px 0;
            line-height: 1.45;
        }
        .rank-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(245, 158, 11, 0.14);
            border: 1px solid rgba(245, 158, 11, 0.35);
            color: #fcd34d;
            border-radius: 999px;
            padding: 3px 10px;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .progress-container {
            background: rgba(30, 41, 59, 0.7);
            border-radius: 10px;
            padding: 10px 12px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            margin-bottom: 12px;
        }
        .progress-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #e2e8f0;
        }
        .progress-info .pct {
            color: #00f2fe;
            font-weight: 700;
        }
        .progress-bar-bg {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 999px;
            height: 7px;
            overflow: hidden;
        }
        .progress-bar-fill {
            background: linear-gradient(90deg, #10b981 0%, #00f2fe 100%);
            height: 100%;
            border-radius: 999px;
            transition: width 1s ease-in-out;
            box-shadow: 0 0 10px rgba(0, 242, 254, 0.5);
        }
        .stats-pills {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 12px;
        }
        .stat-pill {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 6px 10px;
            text-align: center;
        }
        .stat-pill .num {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 14px;
            color: #38bdf8;
        }
        .stat-pill .lbl {
            font-size: 10px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .visited-cities-list {
            margin-top: 10px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 10px;
            max-height: 110px;
            overflow-y: auto;
        }
        .visited-cities-list h3 {
            font-family: 'Outfit', sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: #10b981;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .visited-cities-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        .city-badge {
            background: rgba(16, 185, 129, 0.15);
            color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .city-badge:hover {
            background: rgba(0, 242, 254, 0.22);
            border-color: rgba(0, 242, 254, 0.6);
            color: #f8fafc;
        }
        .panel-controls-box {
            margin: 10px 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .quick-search-row {
            display: flex;
            gap: 6px;
        }
        .map-quick-search-input {
            flex: 1;
            background: rgba(30, 41, 59, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 8px;
            padding: 7px 10px;
            color: #f8fafc;
            font-size: 11.5px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .map-quick-search-input:focus {
            border-color: #00f2fe;
            box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.18);
        }
        .map-quick-jump-btn {
            background: rgba(0, 242, 254, 0.16);
            border: 1px solid rgba(0, 242, 254, 0.4);
            color: #00f2fe;
            border-radius: 8px;
            padding: 0 11px;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .map-quick-jump-btn:hover {
            background: #00f2fe;
            color: #04121d;
        }
        .expedition-focus-btn {
            width: 100%;
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(0, 242, 254, 0.18) 100%);
            border: 1px solid rgba(245, 158, 11, 0.45);
            color: #fcd34d;
            border-radius: 8px;
            padding: 7px 10px;
            font-size: 11.5px;
            font-weight: 700;
            font-family: 'Outfit', sans-serif;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s ease;
        }
        .expedition-focus-btn:hover {
            border-color: #00f2fe;
            color: #ffffff;
            box-shadow: 0 0 14px rgba(245, 158, 11, 0.35);
            transform: translateY(-1px);
        }
        .expedition-stop-marker {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f59e0b 0%, #00f2fe 100%);
            color: #04121d;
            font-family: 'Outfit', sans-serif;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 0 12px rgba(245, 158, 11, 0.85), 0 0 6px rgba(0, 242, 254, 0.8);
            cursor: pointer;
        }
        .panel-quote {
            margin: 12px 0 0 0;
            font-size: 11px;
            color: #cbd5e1;
            font-style: italic;
            text-align: center;
            border-top: 1px dashed rgba(255, 255, 255, 0.1);
            padding-top: 8px;
        }

        /* Pulsing Glow Marker */
        .pulsing-marker {
            position: relative;
            width: 18px;
            height: 18px;
        }
        .pulsing-marker .dot {
            width: 14px;
            height: 14px;
            background: linear-gradient(135deg, #10b981 0%, #00f2fe 100%);
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            box-shadow: 0 0 12px rgba(0, 242, 254, 0.8), 0 0 0 2px rgba(255, 255, 255, 0.8);
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .pulsing-marker:hover .dot {
            transform: scale(1.35);
        }
        .pulsing-marker .pulse {
            width: 32px;
            height: 32px;
            background: rgba(0, 242, 254, 0.4);
            border-radius: 50%;
            position: absolute;
            top: -7px;
            left: -7px;
            animation: pulse-ring 2.2s infinite ease-out;
            pointer-events: none;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.4); opacity: 1; }
            100% { transform: scale(1.6); opacity: 0; }
        }

        /* Tooltip & Popups */
        .leaflet-popup-content-wrapper {
            background: rgba(15, 23, 42, 0.95) !important;
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 16px !important;
            color: #f8fafc !important;
            padding: 0 !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75) !important;
            overflow: hidden !important;
        }
        .leaflet-popup-content {
            margin: 0 !important;
            line-height: 1.4 !important;
        }
        .leaflet-popup-tip {
            background: rgba(15, 23, 42, 0.95) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
        }
        .custom-popup-card {
            font-family: 'Plus Jakarta Sans', sans-serif;
            width: 285px;
        }
        .popup-image-header {
            position: relative;
            height: 115px;
            background-size: cover;
            background-position: center;
            border-radius: 16px 16px 0 0;
            display: flex;
            align-items: flex-end;
            padding: 12px 14px;
        }
        .popup-image-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.92) 100%);
            border-radius: 16px 16px 0 0;
        }
        .popup-city-title {
            position: relative;
            z-index: 2;
            font-family: 'Outfit', sans-serif;
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.6);
        }
        .popup-body-content {
            padding: 14px;
        }
        .popup-quote {
            font-size: 11px;
            color: #94a3b8;
            font-style: italic;
            margin: 0 0 10px 0;
            border-left: 2px solid #00f2fe;
            padding-left: 8px;
            line-height: 1.4;
        }
        .popup-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-bottom: 12px;
        }
        .popup-tag {
            font-size: 10px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 4px;
            padding: 2px 6px;
            color: #cbd5e1;
        }
        .popup-action-btn {
            display: block;
            text-align: center;
            background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
            color: #04121d !important;
            font-weight: 700;
            font-size: 12px;
            padding: 8px 12px;
            border-radius: 8px;
            text-decoration: none !important;
            transition: all 0.2s ease;
        }
        .popup-action-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 242, 254, 0.4);
        }
        @media (max-width: 640px) {
            .map-title-panel {
                top: 10px;
                left: 10px;
                padding: 12px 14px;
                max-width: 280px;
            }
        }
        """

        m.get_root().header.add_child(folium.Element(f"<style>{css_style}</style>"))

        # Ziyaret Edilen İllerin Badgeleri (Türkçe Alfabetik Sıra)
        visited_badges_html = ""
        for _, p in sorted(self.engine.visited_provinces.items(), key=lambda x: turkish_sort_key(x[1]["name"])):
            esc_name = html.escape(p["name"])
            visited_badges_html += (
                f'<span class="city-badge" title="{esc_name} konumuna odaklan" '
                f'onclick="window.seyyahJumpToCity(\'{esc_name}\')">{esc_name}</span>'
            )

        # 81 İl için datalist seçenekleri ve kompakt JS arama sözlüğü
        datalist_options_html = ""
        city_lookup = {}
        for _, p in sorted(self.engine.provinces.items(), key=lambda x: turkish_sort_key(x[1]["name"])):
            esc_name = html.escape(p["name"])
            plate_str = f"{p['plate']:02d}"
            datalist_options_html += f'<option value="{esc_name}">{plate_str} - {esc_name} ({html.escape(p["region"])})</option>'
            entry = {"name": p["name"], "plate": p["plate"], "lat": p["lat"], "lng": p["lng"]}
            city_lookup[normalize_turkish(p["name"])] = entry
            city_lookup[normalize_turkish(p["slug"])] = entry
            city_lookup[str(p["plate"])] = entry
            city_lookup[plate_str] = entry

        # Aktif Sefer Rotası (Ankara ➔ Edirne)
        custom_expedition = self.engine.build_custom_route()
        expedition_coords = [[stop["lat"], stop["lng"]] for stop in custom_expedition]
        map_var_name = m.get_name()

        # Katlanabilir Floating Panel HTML
        title_panel_html = f"""
        <div class="map-title-panel" id="seyyah-map-panel">
            <div class="panel-header-row">
                <h1>🕌 ANADOLU SEYAHATNAMESİ</h1>
                <button class="panel-toggle-btn" id="seyyah-panel-toggle" title="Paneli Daralt / Genişlet" onclick="
                    var p = document.getElementById('seyyah-map-panel');
                    p.classList.toggle('collapsed');
                    this.textContent = p.classList.contains('collapsed') ? '➕' : '➖';
                ">➖</button>
            </div>
            <div class="panel-collapsible">
                <p class="subtitle">Bir seyyahın adımladığı kadim topraklar, kütüphaneler ve tefekkür günlüğü.</p>
                <div class="rank-pill">{html.escape(rank['icon'])} Rütbe: {html.escape(rank['title'])}</div>

                <div class="progress-container">
                    <div class="progress-info">
                        <span>Keşif İlerlemesi</span>
                        <span class="pct">%{pct} ({visited_count}/{total_cities})</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: {pct}%"></div>
                    </div>
                </div>

                <div class="stats-pills">
                    <div class="stat-pill">
                        <div class="num">{stats['estimated_km']:,} km</div>
                        <div class="lbl">Menzil İzi</div>
                    </div>
                    <div class="stat-pill">
                        <div class="num">{visited_regions} / {total_regions}</div>
                        <div class="lbl">Kapsanan Bölge</div>
                    </div>
                </div>

                <div class="panel-controls-box">
                    <div class="quick-search-row">
                        <input
                            type="text"
                            id="map-quick-city-search"
                            class="map-quick-search-input"
                            list="seyyah-map-cities-list"
                            placeholder="🔍 İl adı veya plaka ara (örn: 42, Konya)..."
                            onkeydown="if(event.key==='Enter'){{window.seyyahQuickSearchJump();}}"
                            onchange="window.seyyahQuickSearchJump();"
                        />
                        <button type="button" class="map-quick-jump-btn" onclick="window.seyyahQuickSearchJump()" title="Şehre Odaklan">Git</button>
                    </div>
                    <datalist id="seyyah-map-cities-list">{datalist_options_html}</datalist>
                    <button type="button" class="expedition-focus-btn" id="seyyah-focus-expedition-btn" onclick="window.seyyahFocusExpeditionRoute()">
                        🎯 Aktif Sefer Rotasına Odaklan
                    </button>
                </div>

                <div class="visited-cities-list">
                    <h3>Ziyaret Edilen İller ({visited_count})</h3>
                    <div class="visited-cities-grid">
                        {visited_badges_html}
                    </div>
                </div>

                <p class="panel-quote">"İyi bir gezginin sabit planları ve varmak gibi bir amacı yoktur."</p>
            </div>
        </div>
        <script>
        (function() {{
            var CITY_LOOKUP = {json.dumps(city_lookup, ensure_ascii=False)};
            var EXPEDITION_COORDS = {json.dumps(expedition_coords)};
            function normTr(s) {{
                if (!s) return "";
                return String(s).trim()
                    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
                    .replace(/Ç/g, "c").replace(/ç/g, "c")
                    .replace(/Ğ/g, "g").replace(/ğ/g, "g")
                    .replace(/Ö/g, "o").replace(/ö/g, "o")
                    .replace(/Ş/g, "s").replace(/ş/g, "s")
                    .replace(/Ü/g, "u").replace(/ü/g, "u")
                    .toLowerCase();
            }}
            function getLeafletMap() {{
                if (typeof {map_var_name} !== "undefined" && {map_var_name} && {map_var_name}.setView) {{
                    return {map_var_name};
                }}
                for (var k in window) {{
                    if (k.indexOf("map_") === 0 && window[k] && typeof window[k].setView === "function") {{
                        return window[k];
                    }}
                }}
                return null;
            }}
            window.seyyahJumpToCity = function(query) {{
                var q = normTr(query);
                if (!q) return false;
                var target = CITY_LOOKUP[q];
                if (!target) {{
                    for (var key in CITY_LOOKUP) {{
                        if (key.indexOf(q) !== -1) {{
                            target = CITY_LOOKUP[key];
                            break;
                        }}
                    }}
                }}
                var mapObj = getLeafletMap();
                if (target && mapObj) {{
                    mapObj.flyTo([target.lat, target.lng], 9, {{ duration: 1.1 }});
                    return true;
                }}
                return false;
            }};
            window.seyyahQuickSearchJump = function() {{
                var inp = document.getElementById("map-quick-city-search");
                if (inp && inp.value) {{
                    window.seyyahJumpToCity(inp.value);
                }}
            }};
            window.seyyahFocusExpeditionRoute = function() {{
                var mapObj = getLeafletMap();
                if (mapObj && EXPEDITION_COORDS.length > 1) {{
                    mapObj.flyToBounds(EXPEDITION_COORDS, {{ padding: [45, 45], duration: 1.2 }});
                }}
            }};
        }})();
        </script>
        """
        m.get_root().html.add_child(folium.Element(title_panel_html))

        # Katman Grupları
        expedition_group = folium.FeatureGroup(name="🎯 Aktif Sefer Rotası (Ankara ➔ Edirne)", show=True)
        route_group = folium.FeatureGroup(name="🛣️ Seyyah Rota İzi", show=True)
        visited_group = folium.FeatureGroup(name=f"✅ Ziyaret Edilen İller ({visited_count})", show=True)
        unvisited_group = folium.FeatureGroup(name=f"⏳ Bekleyen İller ({stats['unvisited_cities']})", show=True)

        # Aktif Sefer Rotası (Ankara ➔ Edirne) Parlayan Çizgi ve Durak İşaretçileri
        if len(expedition_coords) > 1:
            total_exp_km = custom_expedition[-1].get("cumulative_km", 0)
            folium.PolyLine(
                locations=expedition_coords,
                color="#f59e0b",
                weight=7,
                opacity=0.35,
                tooltip=f"🎯 Aktif Sefer Rotası (Ankara ➔ Edirne | {total_exp_km:,} km)"
            ).add_to(expedition_group)
            folium.PolyLine(
                locations=expedition_coords,
                color="#00f2fe",
                weight=3.5,
                opacity=0.95,
                dash_array="8, 6",
                tooltip=f"🎯 Aktif Sefer Rotası (Ankara ➔ Edirne | {total_exp_km:,} km)"
            ).add_to(expedition_group)

            for idx, stop in enumerate(custom_expedition, 1):
                stop_name = html.escape(stop["name"])
                leg_km = stop.get("distance_from_prev_km", 0)
                cum_km = stop.get("cumulative_km", 0)
                leg_info = "Başlangıç Menzili" if idx == 1 else f"+{leg_km} km | Toplam: {cum_km:,} km"
                stop_icon_html = f'<div class="expedition-stop-marker">{idx}</div>'
                folium.Marker(
                    location=[stop["lat"], stop["lng"]],
                    tooltip=folium.Tooltip(f"🎯 Sefer #{idx:02d}: {stop_name} ({stop['plate']:02d}) — {leg_info}"),
                    icon=folium.DivIcon(
                        html=stop_icon_html,
                        class_name="custom-expedition-stop-icon",
                        icon_size=(22, 22),
                        icon_anchor=(11, 11),
                    ),
                ).add_to(expedition_group)

        # Seyahat İzi Çizgisi (Polyline)
        visited_coords = [
            [p["lat"], p["lng"]]
            for p in sorted(self.engine.visited_provinces.values(), key=lambda c: (c["lng"], c["lat"]))
        ]

        if len(visited_coords) > 1:
            folium.PolyLine(
                locations=visited_coords,
                color="#00f2fe",
                weight=2,
                opacity=0.38,
                dash_array="6, 8",
                tooltip="Seyyah Rota İzi"
            ).add_to(route_group)

        # Ziyaret Edilen İlleri Marker Olarak Ekle
        for _, p in self.engine.visited_provinces.items():
            quote_text = html.escape(p.get("custom_quote", p.get("quote", "Anadolu'nun kadim menzili.")))
            banner_img = html.escape(p.get("banner_rel", "assets/banner.jpg"))
            readme_url = html.escape(p.get("readme_rel", "#"))
            city_name = html.escape(p["name"])
            region_name = html.escape(p["region"])

            landmarks_tags = "".join([
                f'<span class="popup-tag">📍 {html.escape(lm)}</span>'
                for lm in p.get("landmarks", [])[:2]
            ])
            specialty_tag = (
                f'<span class="popup-tag">🍽️ {html.escape(p["specialties"][0])}</span>'
                if p.get("specialties") else ""
            )

            popup_html = f"""
            <div class="custom-popup-card">
                <div class="popup-image-header" style="background-image: url('{banner_img}')">
                    <div class="popup-image-overlay"></div>
                    <h3 class="popup-city-title">📍 {city_name} ({p['plate']:02d})</h3>
                </div>
                <div class="popup-body-content">
                    <p class="popup-quote">"{quote_text}"</p>
                    <div class="popup-tags">
                        <span class="popup-tag">🗺️ {region_name}</span>
                        {landmarks_tags}
                        {specialty_tag}
                    </div>
                    <a href="{readme_url}" target="_blank" class="popup-action-btn">Gezi Günlüğünü Aç ➔</a>
                </div>
            </div>
            """

            marker_html = """
            <div class="pulsing-marker">
                <div class="pulse"></div>
                <div class="dot"></div>
            </div>
            """

            folium.Marker(
                location=[p["lat"], p["lng"]],
                popup=folium.Popup(popup_html, max_width=305),
                tooltip=folium.Tooltip(f"✅ {city_name} ({p['plate']:02d}) - {region_name}"),
                icon=folium.DivIcon(
                    html=marker_html,
                    class_name="custom-pulsing-icon",
                    icon_size=(18, 18),
                    icon_anchor=(9, 9)
                )
            ).add_to(visited_group)

        # Henüz Ziyaret Edilmemiş İller (Küçük nokta markerlar + bilgi popup)
        for _, p in self.engine.unvisited_provinces.items():
            city_name = html.escape(p["name"])
            region_name = html.escape(p["region"])
            quote_text = html.escape(p.get("quote", "Keşfedilmeyi bekleyen menzil."))
            first_lm = html.escape(p["landmarks"][0]) if p.get("landmarks") else "Tarihi Merkez"

            unvisited_popup = f"""
            <div class="custom-popup-card">
                <div class="popup-body-content">
                    <h3 style="font-family:'Outfit',sans-serif;font-size:15px;margin:0 0 6px 0;color:#fcd34d;">
                        ⏳ {city_name} ({p['plate']:02d})
                    </h3>
                    <p class="popup-quote">"{quote_text}"</p>
                    <div class="popup-tags">
                        <span class="popup-tag">🗺️ {region_name}</span>
                        <span class="popup-tag">📍 {first_lm}</span>
                    </div>
                </div>
            </div>
            """
            folium.CircleMarker(
                location=[p["lat"], p["lng"]],
                radius=4.5,
                color="#94a3b8",
                fill=True,
                fill_color="#1e293b",
                fill_opacity=0.8,
                weight=1.5,
                popup=folium.Popup(unvisited_popup, max_width=280),
                tooltip=folium.Tooltip(f"⏳ {city_name} ({p['plate']:02d}) - Keşfedilmeyi Bekliyor"),
            ).add_to(unvisited_group)

        expedition_group.add_to(m)
        route_group.add_to(m)
        visited_group.add_to(m)
        unvisited_group.add_to(m)

        folium.LayerControl(position="topright", collapsed=True).add_to(m)

        m.save(str(self.output_file))
        return self.output_file


if __name__ == "__main__":
    mg = MapGenerator()
    out = mg.generate()
    print(f"İnteraktif Harita başarıyla oluşturuldu: {out}")
