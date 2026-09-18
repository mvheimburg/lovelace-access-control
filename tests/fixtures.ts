import type { HassEntity, HomeAssistant } from "../src/types";

const entity = (
  entity_id: string,
  state: string,
  attributes: Record<string, unknown> = {},
): HassEntity => ({ entity_id, state, attributes });

export function fixture(
  service: (...args: unknown[]) => Promise<unknown> = async () => {},
): HomeAssistant & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  return {
    calls,
    language: "en",
    locale: { language: "en", time_format: "language" },
    states: {
      "lock.front": entity("lock.front", "locked", {
        friendly_name: "Front door",
      }),
      "binary_sensor.front_contact": entity(
        "binary_sensor.front_contact",
        "off",
        {
          device_class: "door",
        },
      ),
      "binary_sensor.front_motion": entity(
        "binary_sensor.front_motion",
        "off",
        {
          device_class: "motion",
        },
      ),
      "lock.back": entity("lock.back", "locked", {
        friendly_name: "Back door",
      }),
      "lock.shed": entity("lock.shed", "locked", {
        friendly_name: "Shed",
        code_format: "^\\d{4}$",
      }),
      "cover.gate": entity("cover.gate", "closed", {
        friendly_name: "Gate",
        device_class: "gate",
        supported_features: 11,
      }),
      "cover.blind": entity("cover.blind", "open", { device_class: "blind" }),
      "event.doorbell_door_access": entity(
        "event.doorbell_door_access",
        new Date().toISOString(),
        {
          event_type: "unlock",
          target: "door",
          door: "front",
          user_name: "Kari",
          access_level: "guest",
        },
      ),
    },
    entities: {
      "lock.front": { entity_id: "lock.front", device_id: "d-front" },
      "binary_sensor.front_contact": {
        entity_id: "binary_sensor.front_contact",
        device_id: "d-front",
      },
      "binary_sensor.front_motion": {
        entity_id: "binary_sensor.front_motion",
        device_id: "d-front",
      },
      "lock.back": {
        entity_id: "lock.back",
        device_id: "d-back",
        area_id: "garden",
      },
    },
    devices: { "d-front": { id: "d-front", area_id: "hall" } },
    areas: {
      hall: { area_id: "hall", name: "Hall" },
      garden: { area_id: "garden", name: "Garden" },
    },
    callService: async (...args: unknown[]) => {
      calls.push(args);
      return service(...args);
    },
  };
}

export const CONFIG = {
  doors: ["lock.front", "lock.back", "lock.shed"],
  gates: ["cover.gate"],
  access_event: "event.doorbell_door_access",
};

export async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 20));
}

export function text(root: ParentNode, selector = "ha-card") {
  return (root.querySelector(selector)?.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim();
}
