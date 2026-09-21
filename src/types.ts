import type { ColorScheme } from "./color-schemes";
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
}

export type HassStates = Record<string, HassEntity>;

/** Home Assistant's entity registry display entries (`hass.entities`). */
export interface EntityEntry {
  entity_id: string;
  device_id?: string | null;
  area_id?: string | null;
}
export interface DeviceEntry {
  id: string;
  area_id?: string | null;
}
export interface AreaEntry {
  area_id: string;
  name: string;
}

export interface HomeAssistant {
  states: HassStates;
  entities?: Record<string, EntityEntry>;
  devices?: Record<string, DeviceEntry>;
  areas?: Record<string, AreaEntry>;
  language?: string;
  locale?: { language?: string; time_format?: string };
  callService?(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: { entity_id: string | string[] },
    notifyOnError?: boolean,
  ): Promise<unknown>;
}

/** A door or gate as configured: an entity ID, or an object that overrides pairing. */
export type Item = string | { entity: string; contact?: string; name?: string };

export interface CardConfig {
  type?: string;
  title?: string;
  appearance: "default" | "bubble";
  color_scheme?: ColorScheme;
  doors: Item[];
  gates: Item[];
  access_event?: string;
  confirm_unlock: boolean;
  confirm_gate: boolean;
}

export type Tone = "ok" | "attention" | "open" | "problem" | "unknown";

/** One door or gate resolved against Home Assistant's current state. */
export interface Resolved {
  kind: "door" | "gate";
  entity: string;
  contact?: string;
  name: string;
  area?: string;
  /** lock: locked/unlocked/locking/unlocking/jammed/open/opening; cover: open/closed/opening/closing. */
  state: string;
  /** Contact sensor: true open, false closed, undefined unknown or none. */
  opened?: boolean;
  available: boolean;
  tone: Tone;
  /** A lock that needs a code is operated from Home Assistant's own dialog. */
  needsCode: boolean;
  canStop: boolean;
}
