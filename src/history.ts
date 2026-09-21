import type { HomeAssistant, Tone } from "./types";

/** What a lane shows: a lock, a gate (cover) or a door contact. */
export type LaneKind = "lock" | "gate" | "contact";
/** Time (ms) and the state from then on. */
export type Mark = [number, string];
export interface Lane {
  kind: LaneKind;
  entityId: string;
  marks: Mark[];
}
/**
 * A band's color: a severity tone, a gate in motion (opening, closing), or a
 * gap while the entity was silent.
 */
export type Band = Tone | "opening" | "closing" | "gap";

export const RANGES = [6, 24, 168] as const;
export type Range = (typeof RANGES)[number];

/** Home Assistant's compressed, minimal history row. */
interface Row {
  s: string;
  lu?: number;
  lc?: number;
}

const SILENT = new Set(["unavailable", "unknown", ""]);

/** Sends a websocket message through whichever API this Home Assistant offers. */
function send<T>(
  hass: HomeAssistant,
  message: Record<string, unknown>,
): Promise<T> {
  if (hass.callWS) return hass.callWS<T>(message);
  if (hass.connection?.sendMessagePromise)
    return hass.connection.sendMessagePromise<T>(message);
  return Promise.reject(new Error("Home Assistant history API unavailable"));
}

/**
 * Each lane's states over the last `hours` from Home Assistant's recorder,
 * ending with the current state at `now`.
 */
export async function loadHistory(
  hass: HomeAssistant,
  sources: Array<{ kind: LaneKind; entityId: string }>,
  hours: number,
  now = Date.now(),
): Promise<Lane[]> {
  const start = now - hours * 3_600_000;
  const reply = sources.length
    ? await send<Record<string, Row[]>>(hass, {
        type: "history/history_during_period",
        start_time: new Date(start).toISOString(),
        entity_ids: [...new Set(sources.map((s) => s.entityId))],
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      })
    : {};
  return sources.map(({ kind, entityId }) => {
    const marks: Mark[] = (reply?.[entityId] ?? []).map((row) => [
      Math.max(start, (row.lu ?? row.lc ?? 0) * 1000),
      row.s,
    ]);
    const current = hass.states[entityId];
    if (current) marks.push([now, current.state]);
    return { kind, entityId, marks };
  });
}

/** The state in force at `time`: the last mark at or before it; undefined before any. */
export function stateAt(lane: Lane, time: number): string | undefined {
  let state: string | undefined;
  for (const [t, s] of lane.marks) {
    if (t > time) break;
    state = s;
  }
  return state;
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
