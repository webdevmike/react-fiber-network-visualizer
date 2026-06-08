import type { Status, FiberNodeType, FiberRouteType } from "./types";

export const STATUS: Status[] = ["active", "planned", "outage"];

export const FIBER_NODE_TYPES: FiberNodeType[] = [
  "pop",
  "splice",
  "cabinet",
  "manhole",
];

export const FIBER_ROUTE_TYPES: FiberRouteType[] = ["backbone", "distribution"];

export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#d8d8d8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c0c0c0" }, { weight: 0.2 }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#d8d8d8" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#d0d0d0" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }, { lightness: 21 }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#dedede" }, { lightness: 21 }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ saturation: 36 }, { color: "#333333" }, { lightness: 40 }],
  },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#f2f2f2" }, { lightness: 19 }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#fefefe" }, { lightness: 20 }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#fefefe" }, { lightness: 17 }, { weight: 1.2 }],
  },
];

export const OUTAGE_COLOR = "#ef4444";

export const NODE_TYPE_COLORS: Record<FiberNodeType, string> = {
  pop: "#6b7280",
  splice: "#3b82f6",
  cabinet: "#22c55e",
  manhole: "#f97316",
};

export const ROUTE_TYPE_COLORS: Record<FiberRouteType, string> = {
  backbone: "#8b5cf6",
  distribution: "#eab308",
};
