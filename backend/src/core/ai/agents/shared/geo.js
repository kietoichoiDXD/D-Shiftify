const toRad = (d) => (d * Math.PI) / 180;

/** Haversine distance in km */
export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** 0–1 score: 1 = same location, 0 = beyond maxRadius km */
export const geoScore = (lat1, lng1, lat2, lng2, maxRadius = 10) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 0.5; // unknown → neutral
  const d = haversineKm(lat1, lng1, lat2, lng2);
  return d <= maxRadius ? 1 - d / maxRadius : 0;
};
