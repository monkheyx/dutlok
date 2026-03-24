"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PLOT_POSITIONS, PORTAL_POSITION } from "./neighborhood-client";

interface PlotAssignment {
  id: number;
  mapId: number;
  plotId: number;
  shardIndex: number;
  characterId: number | null;
  characterName: string;
  status: string;
  rankedChoice: number;
  note: string | null;
}

interface Props {
  faction: string;
  mapId: number;
  plots: PlotAssignment[];
  activePlot: number | null;
  onPlotClick: (plotId: number) => void;
  approvedFirstChoicePlots: Map<number, PlotAssignment>;
}

const IMG_WIDTH = 3921;
const IMG_HEIGHT = 2615;

const CLASS_COLORS: Record<string, string> = {
  Warrior: "#C79C6E", Paladin: "#F58CBA", Hunter: "#ABD473", Rogue: "#FFF569",
  Priest: "#FFFFFF", "Death Knight": "#C41F3B", Shaman: "#0070DE", Mage: "#69CCF0",
  Warlock: "#9482C9", Monk: "#00FF96", Druid: "#FF7D0A", "Demon Hunter": "#A330C9",
  Evoker: "#33937F",
};

export default function NeighborhoodMap({
  faction,
  mapId,
  plots,
  activePlot,
  onPlotClick,
  approvedFirstChoicePlots,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{
    plotIcons: L.LayerGroup;
    plotNumbers: L.LayerGroup;
    occupants: L.LayerGroup;
  } | null>(null);

  const [showPlotIcons, setShowPlotIcons] = useState(true);
  const [showPlotNumbers, setShowPlotNumbers] = useState(true);
  const [showOccupants, setShowOccupants] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const bounds = L.latLngBounds(
      L.latLng(0, 0),
      L.latLng(IMG_HEIGHT, IMG_WIDTH)
    );

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 2,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      maxBounds: bounds.pad(0.1),
      attributionControl: false,
    });

    map.fitBounds(bounds);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update layers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old layers
    if (markersRef.current) {
      markersRef.current.plotIcons.clearLayers();
      markersRef.current.plotNumbers.clearLayers();
      markersRef.current.occupants.clearLayers();
      map.removeLayer(markersRef.current.plotIcons);
      map.removeLayer(markersRef.current.plotNumbers);
      map.removeLayer(markersRef.current.occupants);
    }

    // Remove old image overlay
    map.eachLayer((layer) => {
      if (layer instanceof L.ImageOverlay) map.removeLayer(layer);
    });

    // Add image overlay
    const imgUrl = `https://data.wowaudit.com/img/housing/neighborhood-${mapId}.jpg`;
    const imgBounds = L.latLngBounds(
      L.latLng(0, 0),
      L.latLng(IMG_HEIGHT, IMG_WIDTH)
    );
    L.imageOverlay(imgUrl, imgBounds).addTo(map);

    // Create layer groups
    const plotIcons = L.layerGroup();
    const plotNumbers = L.layerGroup();
    const occupants = L.layerGroup();

    // Add plot markers
    PLOT_POSITIONS.forEach((pos, i) => {
      const latLng = L.latLng(IMG_HEIGHT - pos.y, pos.x);
      const occupant = approvedFirstChoicePlots.get(i);
      const isOccupied = !!occupant;
      const isActive = activePlot === i;

      // Plot icon (house marker)
      const houseIcon = L.divIcon({
        className: "",
        html: `<div style="
          width: 28px; height: 28px;
          background: ${isOccupied ? "#399652" : "#555"};
          border: 2px solid ${isActive ? "#fff" : isOccupied ? "#4ade80" : "#777"};
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: ${isActive ? "0 0 8px rgba(74,222,128,0.6)" : "0 1px 3px rgba(0,0,0,0.5)"};
          transition: all 0.15s;
          ${!isOccupied ? "filter: grayscale(0.7); opacity: 0.6;" : ""}
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const houseMarker = L.marker(latLng, { icon: houseIcon });
      houseMarker.on("click", () => onPlotClick(i));
      plotIcons.addLayer(houseMarker);

      // Plot number label
      const numIcon = L.divIcon({
        className: "",
        html: `<div style="
          background: rgba(0,0,0,0.75);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 8px;
          white-space: nowrap;
          text-align: center;
          pointer-events: none;
        ">${i}</div>`,
        iconSize: [24, 16],
        iconAnchor: [12, -8],
      });
      L.marker(latLng, { icon: numIcon, interactive: false }).addTo(plotNumbers);

      // Occupant label
      if (isOccupied && occupant) {
        const occIcon = L.divIcon({
          className: "",
          html: `<div style="
            color: #4ade80;
            font-size: 10px;
            font-weight: 600;
            white-space: nowrap;
            text-align: center;
            pointer-events: none;
            text-shadow: 0 1px 3px rgba(0,0,0,0.9);
          ">
            <span style="font-size: 8px;">&#9829;</span> ${occupant.characterName}
          </div>`,
          iconSize: [100, 16],
          iconAnchor: [50, -20],
        });
        L.marker(latLng, { icon: occIcon, interactive: false }).addTo(occupants);
      }
    });

    // Portal marker
    const portalLatLng = L.latLng(IMG_HEIGHT - PORTAL_POSITION.y, PORTAL_POSITION.x);
    const portalIcon = L.divIcon({
      className: "",
      html: `<div style="
        width: 32px; height: 32px;
        background: rgba(0,100,255,0.3);
        border: 2px solid #4488ff;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 12px rgba(68,136,255,0.4);
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6699ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    L.marker(portalLatLng, { icon: portalIcon, interactive: false }).addTo(plotIcons);

    // Add layers to map
    plotIcons.addTo(map);
    plotNumbers.addTo(map);
    occupants.addTo(map);

    markersRef.current = { plotIcons, plotNumbers, occupants };
  }, [faction, mapId, plots, activePlot, onPlotClick, approvedFirstChoicePlots]);

  // Toggle layer visibility
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;
    const map = mapRef.current;
    const { plotIcons, plotNumbers, occupants: occLayer } = markersRef.current;

    if (showPlotIcons) { if (!map.hasLayer(plotIcons)) map.addLayer(plotIcons); }
    else { map.removeLayer(plotIcons); }

    if (showPlotNumbers) { if (!map.hasLayer(plotNumbers)) map.addLayer(plotNumbers); }
    else { map.removeLayer(plotNumbers); }

    if (showOccupants) { if (!map.hasLayer(occLayer)) map.addLayer(occLayer); }
    else { map.removeLayer(occLayer); }
  }, [showPlotIcons, showPlotNumbers, showOccupants]);

  // Pan to active plot
  useEffect(() => {
    if (activePlot === null || !mapRef.current) return;
    const pos = PLOT_POSITIONS[activePlot];
    if (!pos) return;
    mapRef.current.panTo(L.latLng(IMG_HEIGHT - pos.y, pos.x), { animate: true });
  }, [activePlot]);

  return (
    <div className="relative w-full" style={{ aspectRatio: "3/2", minHeight: "400px" }}>
      <div
        ref={containerRef}
        className="w-full h-full rounded-l-lg"
        style={{ backgroundColor: "#000" }}
      />
      {/* Layer toggles */}
      <div className="absolute top-3 right-3 z-[1000] bg-card/90 border border-border rounded-lg p-2 space-y-1 backdrop-blur-sm">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={showPlotIcons}
            onChange={(e) => setShowPlotIcons(e.target.checked)}
            className="rounded"
          />
          <span className="text-foreground">Plot icons</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={showPlotNumbers}
            onChange={(e) => setShowPlotNumbers(e.target.checked)}
            className="rounded"
          />
          <span className="text-foreground">Plot numbers</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={showOccupants}
            onChange={(e) => setShowOccupants(e.target.checked)}
            className="rounded"
          />
          <span className="text-foreground">Occupants</span>
        </label>
      </div>
      {/* Attribution */}
      <div className="absolute bottom-1 right-2 z-[1000] text-[10px] text-muted-foreground/50">
        Map by WowDB
      </div>
    </div>
  );
}
