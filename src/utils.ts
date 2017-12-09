import { MultiPolygon } from "geojson";
import { Geometry } from "wkx";
import { Dataset } from "./dcat/dataset";

import franc = require("franc-min");

export function bboxToGeoJSON(points: number[][]): MultiPolygon {
  if (!points) {
    return;
  }

  const coords = [...points[0], ...points[1]];

  return {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [coords[0], coords[1]],
          [coords[0], coords[3]],
          [coords[2], coords[3]],
          [coords[2], coords[1]],
          [coords[0], coords[1]]
        ]
      ]
    ]
  };
}

export function wktToGeoJSON(polygon): MultiPolygon {
  if (!polygon || !polygon.startsWith("POLYGON")) {
    return null;
  }

  const multi: any = Geometry.parse(polygon).toGeoJSON();
  multi.type = "MultiPolygon";
  multi.coordinates = [multi.coordinates];

  return multi;
}

export function ensureMultiPolygon(geometry): MultiPolygon {
  if (
    !geometry ||
    geometry.type !== "Polygon" ||
    geometry.type !== "MultiPolygon"
  ) {
    return null;
  }

  if (geometry.type !== "MultiPolygon") {
    geometry.type = "MultiPolygon";
    geometry.coordinates = [geometry.coordinates];
  }

  return geometry;
}

export function detectLanguage(dataset: Dataset): string {
  const text = [];

  if (dataset.title) {
    text.push(dataset.title);
  }

  if (dataset.description) {
    text.push(dataset.description);
  }

  if (dataset.keyword.length > 0) {
    text.push(...dataset.keyword);
  }

  if (dataset.theme.length > 0) {
    text.push(...dataset.theme);
  }

  if (text.length === 0) {
    return;
  }

  return franc(text.join(" "));
}
