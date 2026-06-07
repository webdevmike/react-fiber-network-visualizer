export const STATUS = ["active", "planned", "outage"] as const;
export const FIBER_NODE_TYPES = [
  "pop",
  "splice",
  "cabinet",
  "manhole",
] as const;
export const FIBER_ROUTE_TYPES = ["backbone", "distribution"] as const;

export type Status = (typeof STATUS)[number];
export type FiberNodeType = (typeof FIBER_NODE_TYPES)[number];
export type FiberRouteType = (typeof FIBER_ROUTE_TYPES)[number];
