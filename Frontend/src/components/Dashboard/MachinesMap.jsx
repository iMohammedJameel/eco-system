import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mapPlate from '../../assets/map-plate.jpg';
import styles from './MachinesMap.module.css';

const STATUS_META = {
  active:     { label: 'تعمل',          color: '#0d6c3d' },
  nearlyFull: { label: 'شبه ممتلئة',    color: '#e8a13c' },
  offline:    { label: 'متوقفة',        color: '#c0473f' },
};

const CAIRO = [30.0444, 31.2357];

function pinIcon(color) {
  return L.divIcon({
    className: 'ecocycle-pin-wrap',
    html: `<div class="ecocycle-pin" style="background:${color}">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" fill="#fff"/>
        <circle cx="12" cy="10" r="2.6" fill="${color}"/>
      </svg>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
}

function FitBounds({ machines }) {
  const map = useMap();
  useEffect(() => {
    const pts = machines
      .map((m) => m.coordinates)
      .filter((c) => c && c.lat != null && c.lng != null);
    if (pts.length >= 2) {
      map.fitBounds(L.latLngBounds(pts.map((c) => [c.lat, c.lng])), { padding: [36, 36], maxZoom: 11 });
    } else if (pts.length === 1) {
      map.setView([pts[0].lat, pts[0].lng], 12);
    }
  }, [machines, map]);
  return null;
}

/** خريطة المراكز — خريطة حقيقية (Leaflet + OpenStreetMap) مع fallback للوحة الديزاين */
function MachinesMap({ machines = [] }) {
  const [tilesFailed, setTilesFailed] = useState(false);

  const withCoords = machines.filter(
    (m) => m.coordinates && m.coordinates.lat != null && m.coordinates.lng != null,
  );

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>خريطة المراكز</h3>
        <div className={styles.legend}>
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <span key={key} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: meta.color }} />
              {meta.label}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.mapBox}>
        {tilesFailed || withCoords.length === 0 ? (
          /* Fallback: لوحة الديزاين الثابتة */
          <>
            <img src={mapPlate} alt="خريطة المراكز" className={styles.staticPlate} />
            <span className={styles.fallbackNote}>عرض تقريبي — الإحداثيات غير متاحة</span>
          </>
        ) : (
          <MapContainer
            center={CAIRO}
            zoom={10}
            scrollWheelZoom={false}
            className={styles.leaflet}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              eventHandlers={{
                tileerror: () => setTilesFailed(true),
              }}
            />
            <FitBounds machines={withCoords} />
            {withCoords.map((m) => {
              const meta = STATUS_META[m.status] || STATUS_META.active;
              return (
                <Marker
                  key={m._id}
                  position={[m.coordinates.lat, m.coordinates.lng]}
                  icon={pinIcon(meta.color)}
                >
                  <Popup>
                    <div className={styles.popup}>
                      <strong>{m.name}</strong>
                      <span>{m.location} — {m.governorate}</span>
                      <span className={styles.popupStatus} style={{ color: meta.color }}>
                        {meta.label} · امتلاء {Math.round(m.fillPercentage ?? 0)}%
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default MachinesMap;
