import { MOD } from './easy-regions.js';

// See foundry.js: Ruler._getSegmentLabel

function ruler_getSegmentLabel(wrapped, segment) {
  let label = wrapped(segment);
  if (segment.teleport) return label;
  if (segment.distance === segment.cost && (!segment.last || this.totalDistance === this.totalCost)) return label;

  const units = canvas.grid.units;
  label += ` / ${Math.round(segment.cost * 100) / 100}`;
  if ( units ) label += ` ${units}`;
  if (segment.last) {
    label += ` [${Math.round(this.totalCost * 100) / 100}`;
    if ( units ) label += ` ${units}`;
    label += "]";
  }
  return label;
}

export function initRulerDistance() {
  libWrapper.register(MOD.id,
    'CONFIG.Canvas.rulerClass.prototype._getSegmentLabel',
    ruler_getSegmentLabel,
    libWrapper.WRAPPER);
}