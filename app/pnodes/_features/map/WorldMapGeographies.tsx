"use client";

import {
	Geographies,
	Geography,
	// @ts-expect-error - react-simple-maps lacks type declarations
} from "react-simple-maps";

const GEO_URL =
	"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function WorldMapGeographies() {
	return (
		<Geographies geography={GEO_URL}>
			{({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
				geographies.map((geo: { rsmKey: string }) => (
					<Geography
						key={geo.rsmKey}
						geography={geo}
						fill="#1e293b"
						stroke="#334155"
						strokeWidth={0.5}
						style={{
							default: { outline: "none" },
							hover: { fill: "#334155", outline: "none" },
							pressed: { outline: "none" },
						}}
					/>
				))
			}
		</Geographies>
	);
}
