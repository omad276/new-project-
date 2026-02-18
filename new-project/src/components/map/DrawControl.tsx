import { useControl } from 'react-map-gl/mapbox';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { ControlPosition } from 'react-map-gl/mapbox';
import type { Feature } from 'geojson';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

type DrawMode =
  | 'simple_select'
  | 'direct_select'
  | 'draw_polygon'
  | 'draw_point'
  | 'draw_line_string';

interface DrawCreateEvent {
  features: Feature[];
}

interface DrawUpdateEvent {
  features: Feature[];
  action: string;
}

interface DrawDeleteEvent {
  features: Feature[];
}

interface DrawModeChangeEvent {
  mode: DrawMode;
}

interface DrawControlProps {
  position?: ControlPosition;
  displayControlsDefault?: boolean;
  controls?: {
    point?: boolean;
    line_string?: boolean;
    polygon?: boolean;
    trash?: boolean;
    combine_features?: boolean;
    uncombine_features?: boolean;
  };
  defaultMode?: DrawMode;
  onCreate?: (evt: DrawCreateEvent) => void;
  onUpdate?: (evt: DrawUpdateEvent) => void;
  onDelete?: (evt: DrawDeleteEvent) => void;
  onModeChange?: (evt: DrawModeChangeEvent) => void;
  styles?: object[];
}

// Custom draw styles matching the app theme
const defaultDrawStyles = [
  // Polygon fill - active (being drawn)
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#C5A572',
      'fill-opacity': 0.2,
    },
  },
  // Polygon fill - inactive
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#C5A572',
      'fill-opacity': 0.15,
    },
  },
  // Polygon stroke - active
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'line-color': '#C5A572',
      'line-width': 3,
    },
  },
  // Polygon stroke - inactive
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
    paint: {
      'line-color': '#C5A572',
      'line-width': 2,
    },
  },
  // Line - active
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
    paint: {
      'line-color': '#C5A572',
      'line-width': 3,
    },
  },
  // Line - inactive
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString']],
    paint: {
      'line-color': '#C5A572',
      'line-width': 2,
    },
  },
  // Vertex points - active
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 6,
      'circle-color': '#C5A572',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
  // Midpoints
  {
    id: 'gl-draw-point-midpoint',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 4,
      'circle-color': '#C5A572',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
  },
  // Point features
  {
    id: 'gl-draw-point',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'feature'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 8,
      'circle-color': '#C5A572',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  },
];

export function DrawControl(props: DrawControlProps) {
  useControl<MapboxDraw>(
    () =>
      new MapboxDraw({
        displayControlsDefault: props.displayControlsDefault ?? false,
        controls: props.controls ?? {
          polygon: true,
          trash: true,
        },
        defaultMode: props.defaultMode ?? 'simple_select',
        styles: props.styles ?? defaultDrawStyles,
      }),
    ({ map }) => {
      if (props.onCreate) map.on('draw.create', props.onCreate);
      if (props.onUpdate) map.on('draw.update', props.onUpdate);
      if (props.onDelete) map.on('draw.delete', props.onDelete);
      if (props.onModeChange) map.on('draw.modechange', props.onModeChange);
    },
    ({ map }) => {
      if (props.onCreate) map.off('draw.create', props.onCreate);
      if (props.onUpdate) map.off('draw.update', props.onUpdate);
      if (props.onDelete) map.off('draw.delete', props.onDelete);
      if (props.onModeChange) map.off('draw.modechange', props.onModeChange);
    },
    { position: props.position ?? 'top-left' }
  );

  return null;
}

export type { DrawControlProps, DrawCreateEvent, DrawUpdateEvent, DrawDeleteEvent, DrawModeChangeEvent };
