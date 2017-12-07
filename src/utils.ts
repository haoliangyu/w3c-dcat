import { MultiPolygon } from 'geojson';
import { Geometry } from 'wkx';

export function bboxToGeoJSON(bboxString: string): MultiPolygon {
  if (!bboxString) {
    return;
  }

  const coords = bboxString.split(',').map((value) => +value);

  return {
    type: 'MultiPolygon',
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

export function wktToGeoJSON(polygon) {
  if (!polygon || !polygon.startsWith('POLYGON')) {
    return null;
  }

  const multi: any = Geometry.parse(polygon).toGeoJSON();
  multi.type = 'MultiPolygon';
  multi.coordinates = [multi.coordinates];

  return multi;
}

export function ensureMultiPolygon(geometry) {
  if (!geometry || geometry.type !== 'Polygon' || geometry.type !== 'MultiPolygon') {
    return null;
  }

  if (geometry.type !== 'MultiPolygon') {
    geometry.type = 'MultiPolygon';
    geometry.coordinates = [geometry.coordinates];
  }

  return geometry;
}
