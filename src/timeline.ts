import { nothing, svg } from "lit";
import { band, type Lane } from "./history";

/** Room left and right of the bands, so edge time labels are not clipped. */
const SIDE = 22,
  TOP = 4,
  LABEL = 18,
  BAND = 24,
  GAP = 12,
  AXIS = 24;

export interface TimelineText {
  time: (ms: number, withDay: boolean) => string;
  lane: (lane: Lane) => string;
  label: string;
}

/** The hours between x-axis ticks for a window, fewer on a narrow chart. */
function every(hours: number, narrow: boolean) {
  if (hours <= 6) return narrow ? 2 : 1;
  if (hours <= 24) return narrow ? 6 : 4;
  return narrow ? 48 : 24;
}

/**
 * One lane per entity with a colored band per state, from `start` to `end`.
 * A silent (unavailable) spell is hatched; time before any record is empty.
 */
export function timeline(
  lanes: Lane[],
  start: number,
  end: number,
  hover: number | undefined,
  text: TimelineText,
  W = 600,
) {
  const RIGHT = W - SIDE;
  const H =
    TOP + lanes.length * (LABEL + BAND) + (lanes.length - 1) * GAP + AXIS;
  const bottom = H - AXIS;
  const x = (t: number) =>
    SIDE +
    ((Math.min(Math.max(t, start), end) - start) / (end - start)) *
      (RIGHT - SIDE);
  const step = every((end - start) / 3_600_000, W < 480);
  const ticks: number[] = [];
  const hour = new Date(start);
  hour.setMinutes(0, 0, 0);
  let midnights = 0;
  for (let t = hour.getTime(); t <= end; t += 3_600_000) {
    if (t < start) continue;
    const h = new Date(t).getHours();
    if (
      step >= 24 ? h === 0 && midnights++ % (step / 24) === 0 : h % step === 0
    )
      ticks.push(t);
  }
  const top = (i: number) => TOP + i * (LABEL + BAND + GAP);
  return svg`<svg class="timeline" viewBox="0 0 ${W} ${H}" role="img" aria-label=${text.label}>
    <title>${text.label}</title>
    <defs>
      <pattern id="ac-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect class="hatch-bg" width="6" height="6"></rect>
        <line class="hatch" x1="0" y1="0" x2="0" y2="6"></line>
      </pattern>
    </defs>
    ${ticks.map(
      (t) =>
        svg`<line class="grid" x1=${x(t)} x2=${x(t)} y1=${TOP} y2=${bottom}></line>
        <text class="axis" x=${x(t)} y=${bottom + 17} text-anchor="middle">${text.time(t, step >= 24)}</text>`,
    )}
    ${lanes.map((lane, i) => {
      const y = top(i) + LABEL;
      return svg`<g class="lane" data-lane=${lane.kind}>
        <text class="lane-label" x=${SIDE} y=${top(i) + 13}>${text.lane(lane)}</text>
        <rect class="track" x=${SIDE} y=${y} width=${RIGHT - SIDE} height=${BAND} rx="4"></rect>
        ${lane.marks.map(([t, state], j) => {
          const next = lane.marks[j + 1]?.[0] ?? end;
          const from = x(t),
            to = x(next);
          if (to - from <= 0) return nothing;
          const tone = band(lane.kind, state);
          return svg`<rect class=${`band b-${tone}`} data-state=${state} x=${from} y=${y} width=${to - from} height=${BAND}></rect>`;
        })}
      </g>`;
    })}
    ${
      hover === undefined
        ? nothing
        : svg`<line class="cursor" x1=${x(hover)} x2=${x(hover)} y1=${TOP} y2=${bottom}></line>`
    }
  </svg>`;
}

/** The time under a pointer over the timeline. */
export function timeAt(
  event: PointerEvent,
  element: Element,
  start: number,
  end: number,
): number {
  const box = element.getBoundingClientRect();
  const W = (element as SVGSVGElement).viewBox?.baseVal?.width || box.width;
  const px = ((event.clientX - box.left) / box.width) * W;
  const ratio = (px - SIDE) / (W - 2 * SIDE);
  return start + Math.min(1, Math.max(0, ratio)) * (end - start);
}
