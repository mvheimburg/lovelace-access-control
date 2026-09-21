import { afterEach, describe, expect, it } from "vitest";
import "../src/access-control-card";
import { AccessControlCard } from "../src/access-control-card";
import { CONFIG, fixture, settle, text } from "./fixtures";
import type { HomeAssistant } from "../src/types";

type Card = HTMLElement & {
  setConfig(config: Record<string, unknown>): void;
  hass: HomeAssistant;
};

afterEach(() => document.body.replaceChildren());

async function mount(
  hass: HomeAssistant,
  config: Record<string, unknown> = CONFIG,
) {
  const card = document.createElement("access-control-card") as Card;
  card.setConfig(config);
  card.hass = hass;
  document.body.append(card);
  await settle();
  return { card, root: card.shadowRoot! };
}
const row = (root: ShadowRoot, entity: string) =>
  root.querySelector<HTMLElement>(`[data-entity="${entity}"]`)!;
const press = (root: ShadowRoot, entity: string, action: string) =>
  row(root, entity)
    .querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!
    .click();

describe("status", () => {
  it("groups doors and gates and says all is locked, with the last panel event", async () => {
    const { root } = await mount(fixture());
    expect(text(root, ".headline")).toBe("All locked");
    expect(root.querySelector(".hero")!.className).toContain("sev-ok");
    const groups = [...root.querySelectorAll("section.group h3")].map(
      (h) => h.textContent,
    );
    expect(groups).toEqual(["Doors", "Gates"]);
    expect(text(root, "[data-event]")).toMatch(
      /^Kari \(guest\) unlocked · front · \d/,
    );
    expect(text(root, '[data-entity="lock.front"]')).toContain(
      "Front door Locked · door closed · Hall",
    );
    expect(text(root, '[data-entity="lock.back"]')).toContain(
      "Back door Locked · Garden",
    );
  });
  it("counts what is open, unlocked, jammed or silent, most urgent first", async () => {
    const hass = fixture();
    hass.states["lock.back"].state = "unlocked";
    hass.states["binary_sensor.front_contact"].state = "on";
    hass.states["cover.gate"].state = "open";
    hass.states["lock.shed"].state = "jammed";
    const { root } = await mount(hass);
    expect(text(root, ".headline")).toBe(
      "1 needs attention · 2 open · 1 unlocked",
    );
    expect(root.querySelector(".hero")!.className).toContain("sev-problem");
    hass.states["lock.shed"].state = "unavailable";
    const second = await mount({ ...hass });
    expect(text(second.root, ".headline")).toBe(
      "1 not responding · 2 open · 1 unlocked",
    );
  });
  it("speaks Bokmål and keeps user names", async () => {
    const hass = fixture();
    hass.language = "nb";
    hass.states["lock.back"].state = "unlocked";
    const { root } = await mount(hass);
    expect(text(root, ".title")).toBe("Dører og porter");
    expect(text(root, ".headline")).toBe("1 ulåst");
    expect(text(root, "[data-event]")).toMatch(/^Kari \(gjest\) låste opp/);
    expect(text(root, '[data-entity="lock.back"]')).toContain(
      "Back door Ulåst",
    );
    expect(
      row(root, "lock.back")
        .querySelector('[data-action="lock"]')
        ?.textContent?.trim(),
    ).toBe("Lås");
  });
  it("pairs only a single door contact on the same device, and honours an explicit one", async () => {
    const hass = fixture();
    hass.states["binary_sensor.extra"] = {
      entity_id: "binary_sensor.extra",
      state: "on",
      attributes: { device_class: "opening" },
    };
    hass.entities!["binary_sensor.extra"] = {
      entity_id: "binary_sensor.extra",
      device_id: "d-front",
    };
    const { card, root } = await mount(hass);
    expect(text(root, '[data-entity="lock.front"]')).not.toMatch(
      /door (open|closed)/,
    );
    card.setConfig({
      ...CONFIG,
      doors: [
        {
          entity: "lock.front",
          contact: "binary_sensor.extra",
          name: "Hovedinngang",
        },
      ],
    });
    await settle();
    expect(text(root, '[data-entity="lock.front"]')).toContain(
      "Hovedinngang Locked · door open",
    );
  });
});

describe("actions", () => {
  it("confirms an unlock in the card, then calls lock.unlock once", async () => {
    const hass = fixture();
    const { root } = await mount(hass);
    press(root, "lock.front", "unlock");
    await settle();
    expect(text(root, "[data-confirm]")).toContain("Unlock Front door?");
    expect(hass.calls).toEqual([]);
    root.querySelector<HTMLButtonElement>("[data-cancel]")!.click();
    await settle();
    expect(root.querySelector("[data-confirm]")).toBeNull();
    expect(hass.calls).toEqual([]);
    press(root, "lock.front", "unlock");
    await settle();
    root.querySelector<HTMLButtonElement>("[data-confirm-action]")!.click();
    await settle();
    expect(hass.calls).toEqual([
      ["lock", "unlock", {}, { entity_id: "lock.front" }, false],
    ]);
  });
  it("locks at once, shows it pending and ignores a second press", async () => {
    let release!: () => void;
    const hass = fixture(() => new Promise<void>((done) => (release = done)));
    hass.states["lock.back"].state = "unlocked";
    const { root } = await mount(hass);
    press(root, "lock.back", "lock");
    await settle();
    const button = row(root, "lock.back").querySelector<HTMLButtonElement>(
      '[data-action="lock"]',
    )!;
    expect(button.disabled).toBe(true);
    expect(text(root, '[data-entity="lock.back"]')).toContain("Sending…");
    button.click();
    release();
    await settle();
    expect(hass.calls).toEqual([
      ["lock", "lock", {}, { entity_id: "lock.back" }, false],
    ]);
    expect(button.disabled).toBe(false);
  });
  it("shows a failed request by the door it concerns and keeps the real state", async () => {
    const hass = fixture(async () => {
      throw new Error("Lock is offline");
    });
    hass.states["lock.back"].state = "unlocked";
    const { root } = await mount(hass);
    press(root, "lock.back", "lock");
    await settle();
    expect(text(root, '[role="alert"]')).toBe(
      "Back door: could not lock: Lock is offline",
    );
    expect(text(root, '[data-entity="lock.back"]')).toContain("Unlocked");
  });
  it("opens a gate after confirmation, closes and stops it without", async () => {
    const hass = fixture();
    const { card, root } = await mount(hass);
    press(root, "cover.gate", "open");
    await settle();
    expect(text(root, "[data-confirm]")).toContain("Open Gate?");
    root.querySelector<HTMLButtonElement>("[data-confirm-action]")!.click();
    await settle();
    hass.states["cover.gate"].state = "opening";
    card.hass = { ...hass };
    await settle();
    press(root, "cover.gate", "stop");
    hass.states["cover.gate"].state = "open";
    card.hass = { ...hass };
    await settle();
    press(root, "cover.gate", "close");
    await settle();
    expect(hass.calls.map((c) => c.slice(0, 2))).toEqual([
      ["cover", "open_cover"],
      ["cover", "stop_cover"],
      ["cover", "close_cover"],
    ]);
  });
  it("skips confirmation when the card is told to", async () => {
    const hass = fixture();
    const { root } = await mount(hass, {
      ...CONFIG,
      confirm_unlock: false,
      confirm_gate: false,
    });
    press(root, "lock.front", "unlock");
    press(root, "cover.gate", "open");
    await settle();
    expect(hass.calls.length).toBe(2);
  });
  it("sends a lock with a code to Home Assistant's own dialog", async () => {
    const hass = fixture();
    const { card, root } = await mount(hass);
    let opened = "";
    card.addEventListener(
      "hass-more-info",
      (e) => (opened = (e as CustomEvent).detail.entityId),
    );
    press(root, "lock.shed", "code");
    expect(opened).toBe("lock.shed");
    expect(hass.calls).toEqual([]);
  });
  it("locks every unlocked door in one call, skipping locks that need a code", async () => {
    const hass = fixture();
    hass.states["lock.front"].state = "unlocked";
    hass.states["lock.back"].state = "unlocked";
    hass.states["lock.shed"].state = "unlocked";
    const { root } = await mount(hass);
    const all = root.querySelector<HTMLButtonElement>("[data-lock-all]")!;
    expect(all.textContent).toContain("Lock all (2)");
    all.click();
    await settle();
    expect(hass.calls).toEqual([
      ["lock", "lock", {}, { entity_id: ["lock.front", "lock.back"] }, false],
    ]);
  });
  it("disables actions on a door that is not responding", async () => {
    const hass = fixture();
    hass.states["lock.back"].state = "unavailable";
    const { root } = await mount(hass);
    expect(text(root, '[data-entity="lock.back"]')).toContain("Not responding");
    expect(
      row(root, "lock.back").querySelector<HTMLButtonElement>("[data-action]")!
        .disabled,
    ).toBe(true);
  });
});

describe("configuration and locale", () => {
  it("validates configuration and picks locks and gate covers for a new card", () => {
    const card = new AccessControlCard();
    expect(() => card.setConfig({ doors: ["cover.gate"] })).toThrow("lock");
    expect(() => card.setConfig({ gates: ["lock.front"] })).toThrow("cover");
    expect(() => card.setConfig({ access_event: "sensor.x" })).toThrow("event");
    expect(() => card.setConfig({ confirm_unlock: "yes" })).toThrow("boolean");
    expect(AccessControlCard.getStubConfig(fixture())).toEqual({
      doors: ["lock.back", "lock.front", "lock.shed"],
      gates: ["cover.gate"],
    });
  });
  it("keeps en-GB's 24-hour clock for the last event and asks for doors when empty", async () => {
    const hass = fixture();
    const at = new Date();
    at.setHours(14, 3, 0, 0);
    hass.states["event.doorbell_door_access"].state = at.toISOString();
    hass.locale = { language: "en-GB" };
    const { root } = await mount(hass);
    expect(text(root, "[data-event]")).toContain("14:03");
    const empty = await mount(fixture(), {});
    expect(text(empty.root, ".headline")).toBe(
      "Add doors and gates in the card editor.",
    );
  });
});

it("controls a gate with up, stop and down, disabling the direction it is already at", async () => {
  const hass = fixture();
  const { card, root } = await mount(hass);
  const arrows = () =>
    [
      ...row(root, "cover.gate").querySelectorAll<HTMLButtonElement>(".arrow"),
    ].map((b) => `${b.dataset.action}:${b.disabled ? "off" : "on"}`);
  expect(arrows()).toEqual(["open:on", "stop:on", "close:off"]);
  expect(
    row(root, "cover.gate")
      .querySelector('[data-action="open"]')
      ?.getAttribute("aria-label"),
  ).toBe("Open: Gate");
  hass.states["cover.gate"].state = "open";
  card.hass = { ...hass };
  await settle();
  expect(arrows()).toEqual(["open:off", "stop:on", "close:on"]);
  hass.states["cover.gate"].attributes.supported_features = 3;
  card.hass = { ...hass };
  await settle();
  expect(arrows()).toEqual(["open:off", "close:on"]);
});
