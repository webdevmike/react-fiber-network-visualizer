export type Status = "active" | "planned" | "outage";

export type FiberNodeType = "pop" | "splice" | "cabinet" | "manhole";

export type FiberRouteType = "backbone" | "distribution";

export type FiberNodeProps = {
  id: string;
  type: FiberNodeType;
  status: Status;
};

export type FiberRouteProps = {
  id: string;
  status: Status;
  type: FiberRouteType;
  capacity: string;
  fromNode: string;
  toNode: string;
};

export type InfoWindowState = {
  position: google.maps.LatLngLiteral;
  rows: [string, string][];
};
