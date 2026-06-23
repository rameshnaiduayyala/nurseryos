import logger from '../config/logger.js';

/**
 * Calculates straight line distance between two coordinates in kilometers using Haversine formula
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Solves Traveling Salesperson Problem (TSP) using Nearest Neighbor heuristic
 * to optimize stop ordering.
 * 
 * @param {Array} stops Array of stops, each containing latitude and longitude.
 * @param {Object} startPoint Starting coordinates (e.g., Exporter warehouse)
 * @returns {Array} Optimized stop list in sequential order.
 */
export const optimizeRoute = (stops, startPoint = { latitude: 45.0, longitude: -122.0 }) => {
  if (stops.length <= 1) return stops;

  const unvisited = [...stops];
  const optimized = [];
  let currentLoc = startPoint;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const stop = unvisited[i];
      const dist = calculateDistanceKm(
        currentLoc.latitude,
        currentLoc.longitude,
        stop.latitude,
        stop.longitude
      );

      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIndex = i;
      }
    }

    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nextStop);
    currentLoc = nextStop;
  }

  return optimized;
};

/**
 * Fetches real driving distance from OpenRouteService API if ORS_API_KEY env is set,
 * otherwise falls back to mathematical Haversine calculations.
 */
export const getDrivingRoute = async (coordinates) => {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    logger.info('No ORS_API_KEY found, using mathematical distance falls back.');
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += calculateDistanceKm(
        coordinates[i][1],
        coordinates[i][0],
        coordinates[i + 1][1],
        coordinates[i + 1][0]
      );
    }
    return {
      distanceKm: totalDistance,
      durationsMinutes: totalDistance * 1.2, // estimated driving time
      coordinates,
    };
  }

  try {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({
        coordinates,
      }),
    });

    if (!response.ok) {
      throw new Error(`ORS API returned status: ${response.status}`);
    }

    const data = await response.json();
    const route = data.routes[0];
    return {
      distanceKm: route.summary.distance / 1000,
      durationsMinutes: route.summary.duration / 60,
      geometry: route.geometry,
    };
  } catch (error) {
    logger.error('Failed fetching route from OpenRouteService API, falling back', error);
    // Fallback logic
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += calculateDistanceKm(
        coordinates[i][1],
        coordinates[i][0],
        coordinates[i + 1][1],
        coordinates[i + 1][0]
      );
    }
    return {
      distanceKm: totalDistance,
      durationsMinutes: totalDistance * 1.2,
      coordinates,
    };
  }
};
