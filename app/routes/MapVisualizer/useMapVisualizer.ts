import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import type { FeatureCollection, Point, LineString } from "geojson";
import type {
  Status,
  FiberNodeType,
  FiberRouteType,
  FiberNodeProps,
  FiberRouteProps,
  InfoWindowState,
} from "./types";
import { OUTAGE_COLOR, NODE_TYPE_COLORS, ROUTE_TYPE_COLORS } from "./constants";

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

function prop<T>(feature: google.maps.Data.Feature, key: string): T {
  return feature.getProperty(key) as T;
}

export function useMapVisualizer() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const fiberRoutesLayerRef = useRef<google.maps.Data>(null);
  const fiberNodesLayerRef = useRef<google.maps.Data>(null);

  // Using refs here because toggling a filter only needs to call
  // setStyle() on the Google Maps layer — no React re-render required.
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
    fetch("data/fiberRoutes.json")
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
    fetch("data/fiberNodes.json")
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

  const toggle = <T>(set: Set<T>, value: T, visible: boolean) => {
    if (visible) {
      set.delete(value);
    } else {
      set.add(value);
    }
    applyLayerStyles();
  };

  return {
    isLoaded,
    activeInfo,
    clearActiveInfo: () => setActiveInfo(null),
    handleMapLoad,
    toggleStatus: (value: Status, visible: boolean) =>
      toggle(hiddenStatusesRef.current, value, visible),
    toggleNodeType: (value: FiberNodeType, visible: boolean) =>
      toggle(hiddenFiberNodesTypesRef.current, value, visible),
    toggleRouteType: (value: FiberRouteType, visible: boolean) =>
      toggle(hiddenFiberRouteTypesRef.current, value, visible),
  };
}
