import React, { useState, useEffect } from "react";
import {
  Plane,
  MapPin,
  Clock,
  DollarSign,
  Fuel,
  Users,
  Settings,
  Play,
  BarChart3,
} from "lucide-react";

const FlightRouteOptimizer = () => {
  const [airports, setAirports] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [optimizationCriteria, setOptimizationCriteria] = useState("cost");

  // Sample airport data with realistic coordinates and costs
  const sampleAirports = [
    {
      id: "JFK",
      name: "John F. Kennedy International",
      city: "New York",
      lat: 40.6413,
      lng: -73.7781,
      fees: 250,
    },
    {
      id: "LAX",
      name: "Los Angeles International",
      city: "Los Angeles",
      lat: 33.9425,
      lng: -118.4081,
      fees: 280,
    },
    {
      id: "ORD",
      name: "Chicago O'Hare International",
      city: "Chicago",
      lat: 41.9742,
      lng: -87.9073,
      fees: 220,
    },
    {
      id: "MIA",
      name: "Miami International",
      city: "Miami",
      lat: 25.7959,
      lng: -80.287,
      fees: 200,
    },
    {
      id: "DFW",
      name: "Dallas/Fort Worth International",
      city: "Dallas",
      lat: 32.8975,
      lng: -97.038,
      fees: 190,
    },
    {
      id: "SEA",
      name: "Seattle-Tacoma International",
      city: "Seattle",
      lat: 47.4502,
      lng: -122.3088,
      fees: 260,
    },
    {
      id: "ATL",
      name: "Hartsfield-Jackson Atlanta International",
      city: "Atlanta",
      lat: 33.6407,
      lng: -84.4277,
      fees: 180,
    },
    {
      id: "DEN",
      name: "Denver International",
      city: "Denver",
      lat: 39.8561,
      lng: -104.6737,
      fees: 210,
    },
  ];

  useEffect(() => {
    setAirports(sampleAirports);
    generateRoutes(sampleAirports);
  }, []);

  // Calculate distance between two airports using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Generate all possible routes between airports
  const generateRoutes = (airportList) => {
    const routeList = [];
    for (let i = 0; i < airportList.length; i++) {
      for (let j = 0; j < airportList.length; j++) {
        if (i !== j) {
          const origin = airportList[i];
          const destination = airportList[j];
          const distance = calculateDistance(
            origin.lat,
            origin.lng,
            destination.lat,
            destination.lng
          );
          const fuelCost = distance * 0.8; // $0.8 per mile fuel cost
          const totalCost = fuelCost + origin.fees + destination.fees;
          const flightTime = distance / 500; // Assume 500 mph average speed

          routeList.push({
            id: `${origin.id}-${destination.id}`,
            origin: origin.id,
            destination: destination.id,
            distance: Math.round(distance),
            fuelCost: Math.round(fuelCost),
            totalCost: Math.round(totalCost),
            flightTime: parseFloat(flightTime.toFixed(1)),
            originData: origin,
            destinationData: destination,
          });
        }
      }
    }
    setRoutes(routeList);
  };

  // Dijkstra's algorithm for shortest path
  const findOptimalRoute = (origin, destination, criteria) => {
    if (!origin || !destination || origin === destination) return null;

    const graph = {};

    // Build adjacency graph
    airports.forEach((airport) => {
      graph[airport.id] = {};
    });

    routes.forEach((route) => {
      let weight;
      switch (criteria) {
        case "distance":
          weight = route.distance;
          break;
        case "time":
          weight = route.flightTime;
          break;
        default:
          weight = route.totalCost;
      }
      graph[route.origin][route.destination] = { weight, route };
    });

    // Dijkstra's algorithm implementation
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    airports.forEach((airport) => {
      distances[airport.id] = airport.id === origin ? 0 : Infinity;
      unvisited.add(airport.id);
    });

    while (unvisited.size > 0) {
      const current = [...unvisited].reduce((min, node) =>
        distances[node] < distances[min] ? node : min
      );

      unvisited.delete(current);

      if (current === destination) break;

      Object.keys(graph[current]).forEach((neighbor) => {
        if (unvisited.has(neighbor)) {
          const alt = distances[current] + graph[current][neighbor].weight;
          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previous[neighbor] = {
              node: current,
              route: graph[current][neighbor].route,
            };
          }
        }
      });
    }

    // Reconstruct path
    const path = [];
    let current = destination;
    let totalDistance = 0;
    let totalCost = 0;
    let totalTime = 0;

    while (previous[current]) {
      const route = previous[current].route;
      path.unshift(route);
      totalDistance += route.distance;
      totalCost += route.totalCost;
      totalTime += route.flightTime;
      current = previous[current].node;
    }

    return {
      path,
      totalDistance,
      totalCost,
      totalTime: parseFloat(totalTime.toFixed(1)),
      stops: path.length - 1,
    };
  };

  const handleOptimize = () => {
    if (!selectedOrigin || !selectedDestination) return;

    setLoading(true);
    setTimeout(() => {
      const result = findOptimalRoute(
        selectedOrigin,
        selectedDestination,
        optimizationCriteria
      );
      setOptimization(result);
      setLoading(false);
    }, 1000);
  };

  const getAirportByCode = (code) => airports.find((a) => a.id === code);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Flight Route Optimizer
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Advanced algorithm-driven route optimization for maximum efficiency
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Route Configuration
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin Airport
                  </label>
                  <select
                    value={selectedOrigin}
                    onChange={(e) => setSelectedOrigin(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                  >
                    <option value="">Select origin...</option>
                    {airports.map((airport) => (
                      <option key={airport.id} value={airport.id}>
                        {airport.id} - {airport.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Airport
                  </label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                  >
                    <option value="">Select destination...</option>
                    {airports.map((airport) => (
                      <option key={airport.id} value={airport.id}>
                        {airport.id} - {airport.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Optimization Criteria
                  </label>
                  <select
                    value={optimizationCriteria}
                    onChange={(e) => setOptimizationCriteria(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                  >
                    <option value="cost">Minimize Cost</option>
                    <option value="distance">Minimize Distance</option>
                    <option value="time">Minimize Flight Time</option>
                  </select>
                </div>

                <button
                  onClick={handleOptimize}
                  disabled={!selectedOrigin || !selectedDestination || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Optimize Route
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Algorithm Info */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Algorithm Details
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Method:</strong> Dijkstra's Shortest Path
                </p>
                <p>
                  <strong>Complexity:</strong> O((V + E) log V)
                </p>
                <p>
                  <strong>Factors:</strong> Distance, fuel cost, airport fees
                </p>
                <p>
                  <strong>Real-time:</strong> Sub-second optimization
                </p>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {optimization ? (
              <div className="space-y-6">
                {/* Optimization Results */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Optimized Route Results
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          Distance
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-800">
                        {optimization.totalDistance.toLocaleString()}
                      </p>
                      <p className="text-sm text-blue-600">miles</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          Total Cost
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-800">
                        ${optimization.totalCost.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">USD</p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">
                          Flight Time
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-800">
                        {optimization.totalTime}
                      </p>
                      <p className="text-sm text-purple-600">hours</p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Plane className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600">
                          Stops
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-orange-800">
                        {optimization.stops}
                      </p>
                      <p className="text-sm text-orange-600">airports</p>
                    </div>
                  </div>

                  {/* Route Path */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Optimal Path
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {optimization.path.map((route, index) => {
                        const origin = getAirportByCode(route.origin);
                        const destination = getAirportByCode(route.destination);
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                              {origin?.id} ({origin?.city})
                            </div>
                            {index < optimization.path.length - 1 && (
                              <Plane className="w-4 h-4 text-gray-400" />
                            )}
                            {index === optimization.path.length - 1 && (
                              <>
                                <Plane className="w-4 h-4 text-gray-400" />
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                                  {destination?.id} ({destination?.city})
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Route Segment Breakdown
                  </h3>
                  <div className="space-y-3">
                    {optimization.path.map((route, index) => {
                      const origin = getAirportByCode(route.origin);
                      const destination = getAirportByCode(route.destination);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                              {origin?.id} → {destination?.id}
                            </div>
                            <span className="text-gray-600">
                              {origin?.city} to {destination?.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              {route.distance} mi
                            </span>
                            <span className="text-gray-600">
                              {route.flightTime}h
                            </span>
                            <span className="text-green-600 font-medium">
                              ${route.totalCost}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-12 text-center">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Ready for Optimization
                </h3>
                <p className="text-gray-600">
                  Select origin and destination airports, then click "Optimize
                  Route" to find the best path.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Airport Network Overview */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Available Airports Network
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {airports.map((airport) => (
              <div
                key={airport.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{airport.id}</p>
                  <p className="text-sm text-gray-600">{airport.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightRouteOptimizer;
