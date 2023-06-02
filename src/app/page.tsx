"use client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

mapboxgl.accessToken =
	process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN != null
		? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
		: "UNDEFINED";

const getData = async (key: string) => {
	const res = await fetch(key);
	return res.json();
};

const lerp = (start: any, end: any, t: any) => {
	return start * (1 - t) + end * t;
};

const Simulation = () => {
	const { data, error, isLoading } = useSWR(
		"http://127.0.0.1:8000/lane-points",
		getData
	);

	const animationEnabled = false;

	const mapContainer = useRef(null);
	const map: any = useRef(null);

	const [lng, setLng] = useState(42.300546);
	const [lat, setLat] = useState(-83.698301);
	const [zoom, setZoom] = useState(17);

	// const [activePointIndex, setActivePointIndex] = useState(0);

	// const animateCircle = () => {
	// 	if (!map.current || !map_coordinates) return;

	// 	setActivePointIndex((prevIndex): any => {
	// 		const nextIndex = (prevIndex + 1) % map_coordinates.length;
	// 		const startCoordinates = map_coordinates[prevIndex].geometry.coordinates;
	// 		const endCoordinates = map_coordinates[nextIndex].geometry.coordinates;

	// 		const startTime = performance.now();

	// 		const duration = 100; // Time in milliseconds for the transition between points

	// 		const updatePosition = (timestamp: any) => {
	// 			const elapsedTime = timestamp - startTime;
	// 			const t = Math.min(elapsedTime / duration, 1);

	// 			const interpolatedLng = lerp(startCoordinates[0], endCoordinates[0], t);
	// 			const interpolatedLat = lerp(startCoordinates[1], endCoordinates[1], t);

	// 			map.current.getSource("animatedPoint").setData({
	// 				type: "Point",
	// 				coordinates: [interpolatedLng, interpolatedLat],
	// 			});

	// 			if (t < 1) {
	// 				requestAnimationFrame(updatePosition);
	// 			} else {
	// 				setActivePointIndex(nextIndex);
	// 				setTimeout(() => {
	// 					requestAnimationFrame(animateCircle);
	// 				}, 10);
	// 			}
	// 		};

	// 		requestAnimationFrame(updatePosition);
	// 	});
	// };

	const map_coordinates = data
		? Object.entries(data)
				// .filter(([key, value]: any) => {
				// 	return value.point_id == 2;
				// })
				.map(([key, value]: any) => ({
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [
							parseFloat(value.latitude),
							parseFloat(value.longitude),
						],
					},
					properties: {
						id: key,
					},
				}))
		: null;

	useEffect(() => {
		if (map.current || !mapContainer.current) return;

		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: "mapbox://styles/mapbox/satellite-v9",
			center: [lat, lng],
			zoom: zoom,
		});
	}, []);

	useEffect(() => {
		if (!map.current || !mapContainer.current || !data) return;

		map.current.on("load", () => {
			// Remove the existing 'points' source and layer if they exist
			if (map.current.getLayer("points")) {
				map.current.removeLayer("points");
			}
			if (map.current.getSource("points")) {
				map.current.removeSource("points");
			}

			map.current.on("click", (e: any) => {
				console.log(`Latitude: ${e.lngLat.lat}, Longitude: ${e.lngLat.lng}`);
			});

			// Add a new source and layer for the points
			map.current.addSource("points", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: map_coordinates,
				},
			});

			map.current.addLayer({
				id: "points",
				type: "circle",
				source: "points",
				paint: {
					"circle-radius": 3, // You can adjust the circle size here
					"circle-color": "#B42222",
				},
			});

			// if (animationEnabled) {
			// 	map.current.addSource("animatedPoint", {
			// 		type: "geojson",
			// 		data: {
			// 			type: "Point",
			// 			coordinates: [0, 0], // Initial coordinates
			// 		},
			// 	});

			// 	map.current.addLayer({
			// 		id: "animatedPoint",
			// 		type: "circle",
			// 		source: "animatedPoint",
			// 		paint: {
			// 			"circle-radius": 10, // Larger circle size
			// 			"circle-color": "blue", // Blue color
			// 		},
			// 	});

			// 	// animateCircle();
			// }
		});

		// If the map is already loaded, call the 'load' event handler manually
		if (map.current.loaded()) {
			map.current.fire("load");
		}

		console.log(data);
	}, [data]);

	return (
		<main className="w-screen h-screen">
			<div ref={mapContainer} className="w-full h-full mapboxgl-canvas" />
		</main>
	);
};

export default Simulation;
