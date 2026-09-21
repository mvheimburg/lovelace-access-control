import type { CardConfig, Item } from "./types";

function items(value: unknown, domain: "lock" | "cover", key: string): Item[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${key} must be a list`);
  return value.map((item) => {
    const entity = typeof item === "string" ? item : item?.entity;
    if (typeof entity !== "string" || !entity.startsWith(`${domain}.`))
      throw new Error(`${key} entries must be ${domain} entities`);
    if (typeof item === "string") return item;
    if (
      item.contact !== undefined &&
      !String(item.contact).startsWith("binary_sensor.")
    )
      throw new Error(`${key} contact must be a binary_sensor`);
    if (item.name !== undefined && typeof item.name !== "string")
      throw new Error(`${key} name must be text`);
    return { entity, contact: item.contact, name: item.name };
  });
}

export function validateConfig(input: Record<string, unknown>): CardConfig {
  if (!input || typeof input !== "object")
    throw new Error("Card configuration is required");
  const config = {
    appearance: "default",
    confirm_unlock: false,
    confirm_gate: false,
    ...input,
  } as Record<string, unknown>;
  if (!["default", "bubble"].includes(String(config.appearance)))
    throw new Error("appearance must be default or bubble");
  for (const key of ["confirm_unlock", "confirm_gate"])
    if (typeof config[key] !== "boolean")
      throw new Error(`${key} must be boolean`);
  if (config.title !== undefined && typeof config.title !== "string")
    throw new Error("title must be text");
  if (
    config.access_event !== undefined &&
    (typeof config.access_event !== "string" ||
      !config.access_event.startsWith("event."))
  )
    throw new Error("access_event must be an event entity");
  return {
    ...(config as unknown as CardConfig),
    doors: items(config.doors, "lock", "doors"),
    gates: items(config.gates, "cover", "gates"),
  };
}
