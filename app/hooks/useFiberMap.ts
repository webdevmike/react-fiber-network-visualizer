import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import type { FeatureCollection, Point, LineString } from "geojson";
import type {
  Status,
  FiberNodeType,
  FiberRouteType,
} from "~/types/types";

type FiberNodeProps = {
  id: string;
  type: FiberNodeType;
  status: Status;
};

type FiberRouteProps = {
  id: string;
  status: Status;
  type: FiberRouteType;
  capacity: string;
  fromNode: string;
  toNode: string;
};

type InfoWindowState = {
  position: google.maps.LatLngLiteral;
  rows: [string, string][];
};

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

function prop<T>(feature: google.maps.Data.Feature, key: string): T {
  return feature.getProperty(key) as T;
}

function makeRouteStyle(
  hiddenStatuses: Set<Status>,
  hiddenTypes: Set<FiberRouteType>,
) {
  return (feature: google.maps.Data.Feature): google.maps.Data.StyleOptions => {
    const status = prop<Status>(feature, "status");
    const type = prop<FiberRouteType>(feature, "type");
    return {
      visible: !hiddenStatuses.has(status) && !hiddenTypes.has(type),
      strokeColor: status === "outage" ? OUTAGE_COLOR : ROUTE_TYPE_COLORS[type],
      strokeWeight: 4,
      zIndex: 2,
    };
  };
}

function makeNodeStyle(
  hiddenStatuses: Set<Status>,
  hiddenTypes: Set<FiberNodeType>,
) {
  return (feature: google.maps.Data.Feature): google.maps.Data.StyleOptions => {
    const status = prop<Status>(feature, "status");
    const type = prop<FiberNodeType>(feature, "type");
    return {
      visible: !hiddenStatuses.has(status) && !hiddenTypes.has(type),
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: type === "pop" ? 10 : 7,
        fillColor: status === "outage" ? OUTAGE_COLOR : NODE_TYPE_COLORS[type],
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
      zIndex: 3,
    };
  };
}

export function useFiberMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const fiberRoutesLayerRef = useRef<google.maps.Data>(null);
  const fiberNodesLayerRef = useRef<google.maps.Data>(null);

  // Using refs here because toggling a filter only needs to call
  // data.setStyle() on the Google Maps layer — no React re-render required.
  // useState would trigger a re-render that produces identical JSX.
  const hiddenStatusesRef = useRef<Set<Status>>(new Set());
  const hiddenFiberNodesTypesRef = useRef<Set<FiberNodeType>>(new Set());
  const hiddenFiberRouteTypesRef = useRef<Set<FiberRouteType>>(new Set());

  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);

  const [activeInfo, setActiveInfo] = useState<InfoWindowState | null>(null);

  const applyLayerStyles = () => {
    fiberRoutesLayerRef.current?.setStyle(
      makeRouteStyle(
        hiddenStatusesRef.current,
        hiddenFiberRouteTypesRef.current,
      ),
    );
    fiberNodesLayerRef.current?.setStyle(
      makeNodeStyle(
        hiddenStatusesRef.current,
        hiddenFiberNodesTypesRef.current,
      ),
    );
  };

  useEffect(() => {
    return () => {
      listenersRef.current.forEach((l) => l.remove());
      listenersRef.current = [];
    };
  }, []);

  const handleMapLoad = (map: google.maps.Map) => {
    // Fiber routes
    fiberRoutesLayerRef.current = new google.maps.Data({ map });
    fetch("/data/fiberRoutes.json")
      .then(
        (r) =>
          r.json() as Promise<FeatureCollection<LineString, FiberRouteProps>>,
      )
      .then((data) => fiberRoutesLayerRef.current?.addGeoJson(data))
      .catch((error) => {
        // In a real app, we would handle this error
        console.error(error);
      });

    listenersRef.current.push(
      fiberRoutesLayerRef.current.addListener(
        "click",
        (e: google.maps.Data.MouseEvent) => {
          const f = e.feature;
          setActiveInfo({
            position: e.latLng!.toJSON(),
            rows: [
              ["ID", prop<string>(f, "id")],
              ["Status", prop<Status>(f, "status")],
              ["Type", prop<FiberRouteType>(f, "type")],
              ["Capacity", prop<string>(f, "capacity")],
            ],
          });
        },
      ),
    );

    // Fiber nodes
    fiberNodesLayerRef.current = new google.maps.Data({ map });
    fetch("/data/fiberNodes.json")
      .then(
        (r) => r.json() as Promise<FeatureCollection<Point, FiberNodeProps>>,
      )
      .then((data) => fiberNodesLayerRef.current?.addGeoJson(data))
      .catch((error) => {
        // In a real app, we would handle this error
        console.error(error);
      });

    listenersRef.current.push(
      fiberNodesLayerRef.current.addListener(
        "click",
        (e: google.maps.Data.MouseEvent) => {
          const f = e.feature;
          setActiveInfo({
            position: (f.getGeometry() as google.maps.Data.Point)
              .get()
              .toJSON(),
            rows: [
              ["ID", prop<string>(f, "id")],
              ["Type", prop<FiberNodeType>(f, "type")],
              ["Status", prop<Status>(f, "status")],
            ],
          });
        },
      ),
    );

    applyLayerStyles();
  };

  const toggleStatus = (status: Status, visible: boolean) => {
    if (visible) {
      hiddenStatusesRef.current.delete(status);
    } else {
      hiddenStatusesRef.current.add(status);
    }
    applyLayerStyles();
  };

  const toggleNodeType = (type: FiberNodeType, visible: boolean) => {
    if (visible) {
      hiddenFiberNodesTypesRef.current.delete(type);
    } else {
      hiddenFiberNodesTypesRef.current.add(type);
    }
    applyLayerStyles();
  };

  const toggleRouteType = (type: FiberRouteType, visible: boolean) => {
    if (visible) {
      hiddenFiberRouteTypesRef.current.delete(type);
    } else {
      hiddenFiberRouteTypesRef.current.add(type);
    }
    applyLayerStyles();
  };

  return {
    isLoaded,
    activeInfo,
    clearActiveInfo: () => setActiveInfo(null),
    handleMapLoad,
    toggleStatus,
    toggleNodeType,
    toggleRouteType,
  };
}
