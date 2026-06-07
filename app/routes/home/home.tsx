import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import {
  STATUS,
  FIBER_NODE_TYPES,
  FIBER_ROUTE_TYPES,
} from "~/types/types";
import {
  useFiberMap,
  MAP_STYLES,
  NODE_TYPE_COLORS,
  ROUTE_TYPE_COLORS,
  OUTAGE_COLOR,
} from "~/hooks/useFiberMap";
import FilterCheckbox from "~/components/FilterCheckbox/FilterCheckbox";

import styles from "./home.module.css";

export default function Home() {
  const {
    isLoaded,
    activeInfo,
    clearActiveInfo,
    handleMapLoad,
    toggleStatus,
    toggleNodeType,
    toggleRouteType,
  } = useFiberMap();

  if (!isLoaded) {
    return (
      <div className={styles.loaderContainer}>
        <span className={styles.loader}></span>
      </div>
    );
  }

  return (
    <>
    <div className={styles.mobileMessage}>
      <p>Mobile view coming soon. For now, please use a device with a viewport wider than 800px.</p>
    </div>
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <header className={styles.header}>
          <h3>Layer Visibility</h3>
        </header>
        <div className={styles.sidebarContent}>
          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Route Type</h4>
            <ul className={styles.filterList}>
              {FIBER_ROUTE_TYPES.map((type) => (
                <li key={type}>
                  <FilterCheckbox
                    display={{ type: "bar", color: ROUTE_TYPE_COLORS[type] }}
                    onChange={(e) =>
                      toggleRouteType(type, e.target.checked)
                    }
                    label={type}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Node Type</h4>
            <ul className={styles.filterList}>
              {FIBER_NODE_TYPES.map((type) => (
                <li key={type}>
                  <FilterCheckbox
                    display={{ type: "circle", color: NODE_TYPE_COLORS[type] }}
                    onChange={(e) =>
                      toggleNodeType(type, e.target.checked)
                    }
                    label={type === "pop" ? "POP" : type}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Status</h4>
            <ul className={styles.filterList}>
              {STATUS.map((type) => (
                <li key={type}>
                  <FilterCheckbox
                    display={
                      type === "outage"
                        ? { type: "bar", color: OUTAGE_COLOR }
                        : undefined
                    }
                    onChange={(e) =>
                      toggleStatus(type, e.target.checked)
                    }
                    label={type}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <h1>Fiber Network Visualizer</h1>
        </header>

        <GoogleMap
          mapContainerClassName={styles.map}
          center={{ lat: 44.2655, lng: -88.396 }}
          zoom={14}
          options={{
            styles: MAP_STYLES,
            mapTypeControl: false,
            clickableIcons: false,
          }}
          onLoad={handleMapLoad}
        >
          {activeInfo && (
            <InfoWindow
              position={activeInfo.position}
              onCloseClick={clearActiveInfo}
            >
              <div className={styles.infoWindowContent}>
                <ul>
                  {activeInfo.rows.map(([label, value]) => (
                    <li key={label}>
                      {label}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
    </>
  );
}
