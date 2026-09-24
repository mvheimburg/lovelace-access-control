import { loadLanes, historyConnection } from "lovelace-card-history";
export { stateAt } from "lovelace-card-history";
import type { HomeAssistant, Tone } from "./types";
/** What a lane shows: a lock, a gate (cover) or a door contact. */
export type LaneKind = "lock" | "gate" | "contact";
export type { Lane } from "lovelace-card-history";
export type Band = Tone | "opening" | "closing" | "gap";
const SILENT = new Set(["unavailable", "unknown", ""]);
export async function loadHistory(
  hass: HomeAssistant,
  sources: Array<{ kind: LaneKind; entityId: string }>,
  hours: number,
  now = Date.now(),
) {
  const lanes = await loadLanes(
    historyConnection(hass),
    sources,
    hass.states,
    hours,
    { now },
  );
  return lanes.map((lane) => ({
    ...lane,
    marks: lane.marks.map(([time, state]): [number, string] => [
      time,
      state ?? "unavailable",
    ]),
  }));
}
/** The card's severity tones, applied to one lane's state. */
export function band(kind: LaneKind, state: string): Band {
  if (SILENT.has(state)) return "gap";
  if (kind === "contact")
    return state === "on" ? "open" : state === "off" ? "ok" : "unknown";
  if (kind === "gate")
    return state === "closed"
      ? "ok"
      : state === "open"
        ? "open"
        : state === "opening" || state === "closing"
          ? state
          : "unknown";
  if (state === "locked") return "ok";
  if (state === "jammed") return "problem";
  if (state === "open" || state === "opening") return "open";
  if (["unlocked", "locking", "unlocking"].includes(state)) return "attention";
  return "unknown";
}
