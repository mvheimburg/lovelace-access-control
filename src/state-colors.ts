import type { HomeAssistant } from "./types";

const SILENT = new Set(["unavailable", "unknown", ""]);

/** Home Assistant's notion of an active state, which picks its active/inactive color. */
function active(domain: string, state: string): boolean {
  if (domain === "lock") return state !== "locked";
  if (domain === "cover") return state !== "closed";
  return state === "on";
}

/**
 * A state's color the way Home Assistant resolves it, as a CSS value: the most
 * specific theme variable that is set wins, e.g. for a locked lock
 * `--state-lock-locked-color`, then `--state-lock-inactive-color`, then
 * `--state-inactive-color`, and finally the card's own color. A theme that sets
 * any of these recolors the card.
 */
export function stateColor(
  hass: HomeAssistant,
  entityId: string,
  state: string,
  fallback: string,
): string {
  if (SILENT.has(state)) return `var(--state-unavailable-color, ${fallback})`;
  const domain = entityId.split(".")[0];
  const deviceClass = hass.states[entityId]?.attributes.device_class;
  const mode = active(domain, state) ? "active" : "inactive";
  const names = [
    ...(typeof deviceClass === "string" && deviceClass
      ? [`--state-${domain}-${deviceClass}-${state}-color`]
      : []),
    `--state-${domain}-${state}-color`,
    // Home Assistant colors a lock on its way somewhere as pending.
    ...(domain === "lock" && ["locking", "unlocking", "opening"].includes(state)
      ? ["--state-lock-pending-color"]
      : []),
    `--state-${domain}-${mode}-color`,
    `--state-${mode}-color`,
  ];
  return names.reduceRight((inner, name) => `var(${name}, ${inner})`, fallback);
}
