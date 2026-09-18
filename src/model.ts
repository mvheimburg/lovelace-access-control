import type { HomeAssistant, Item, Resolved, Tone } from "./types";

const CONTACT_CLASSES = new Set(["door", "garage_door", "opening", "window"]);
const COVER_STOP = 8; // CoverEntityFeature.STOP

export const itemEntity = (item: Item) =>
  typeof item === "string" ? item : item.entity;

/**
 * A door contact on the same device as the lock or gate, if Home Assistant's
 * registry shows exactly one; an explicit `contact` in the config wins.
 */
export function pairedContact(
  hass: HomeAssistant,
  entity: string,
): string | undefined {
  const device = hass.entities?.[entity]?.device_id;
  if (!device) return undefined;
  const matches = Object.values(hass.entities ?? {}).filter(
    (entry) =>
      entry.device_id === device &&
      entry.entity_id.startsWith("binary_sensor.") &&
      CONTACT_CLASSES.has(
        String(hass.states[entry.entity_id]?.attributes.device_class ?? ""),
      ),
  );
  return matches.length === 1 ? matches[0].entity_id : undefined;
}

function areaName(hass: HomeAssistant, entity: string): string | undefined {
  const entry = hass.entities?.[entity];
  const areaId =
    entry?.area_id ??
    (entry?.device_id ? hass.devices?.[entry.device_id]?.area_id : undefined);
  return areaId ? hass.areas?.[areaId]?.name : undefined;
}

function friendly(hass: HomeAssistant, entity: string): string {
  const name = hass.states[entity]?.attributes.friendly_name;
  return typeof name === "string" && name.trim() ? name : entity;
}

const MISSING = new Set(["unavailable", "unknown", ""]);

export function resolve(
  hass: HomeAssistant,
  item: Item,
  kind: "door" | "gate",
): Resolved {
  const entity = itemEntity(item);
  const explicit = typeof item === "string" ? undefined : item;
  const contact = explicit?.contact ?? pairedContact(hass, entity);
  const state = hass.states[entity];
  const value = state?.state ?? "";
  const contactState = contact ? hass.states[contact]?.state : undefined;
  const opened =
    contactState === "on" ? true : contactState === "off" ? false : undefined;
  const available = !MISSING.has(value);
  let tone: Tone;
  if (!available) tone = "unknown";
  else if (value === "jammed") tone = "problem";
  else if (
    opened ||
    (kind === "gate" && value !== "closed") ||
    value === "open" ||
    value === "opening"
  )
    tone = "open";
  else if (kind === "door" && value !== "locked") tone = "attention";
  else tone = "ok";
  return {
    kind,
    entity,
    contact,
    name: explicit?.name ?? friendly(hass, entity),
    area: areaName(hass, entity),
    state: value,
    opened,
    available,
    tone,
    needsCode:
      kind === "door" &&
      typeof state?.attributes.code_format === "string" &&
      state.attributes.code_format !== "",
    canStop:
      kind === "gate" &&
      ((Number(state?.attributes.supported_features) || 0) & COVER_STOP) !== 0,
  };
}

const RANK: Record<Tone, number> = {
  problem: 0,
  unknown: 1,
  open: 2,
  attention: 3,
  ok: 4,
};

/** The card's overall tone: the most urgent of its doors and gates. */
export function overall(items: Resolved[]): Tone {
  return items.reduce<Tone>(
    (worst, item) => (RANK[item.tone] < RANK[worst] ? item.tone : worst),
    "ok",
  );
}

/** Lock and gate entities the editor offers. */
export function candidates(hass: HomeAssistant, domain: "lock" | "cover") {
  return Object.keys(hass.states)
    .filter(
      (id) =>
        id.startsWith(`${domain}.`) &&
        (domain === "lock" ||
          ["gate", "garage"].includes(
            String(hass.states[id].attributes.device_class ?? ""),
          )),
    )
    .sort();
}
