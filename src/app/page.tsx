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

const Simulation = () => {
	const [fetchString, setFetchString] = useState("http://127.0.0.1:8000/lanes");

	const { data, error, isLoading } = useSWR(fetchString, getData);

	const mapContainer = useRef(null);
	const map: any = useRef(null);

	const [lng, setLng] = useState(42.300546);
	const [lat, setLat] = useState(-83.698301);
	const [zoom, setZoom] = useState(17);

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
				console.log(e.lngLat.lat, e.lngLat.lng);
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
					"circle-color": "#FFFFFF",
					// #B42222
				},
			});
		});

		// If the map is already loaded, call the 'load' event handler manually
		if (map.current.loaded()) {
			map.current.fire("load");
		}
	}, [data]);

	return (
		<main className="w-screen h-screen">
			<div ref={mapContainer} className="w-full h-full mapboxgl-canvas" />
		</main>
	);
};

export default Simulation;
