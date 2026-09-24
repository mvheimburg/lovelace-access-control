import { afterEach, describe, expect, it, vi } from "vitest";
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
  it("confirms an unlock in the card when asked to, then calls lock.unlock once", async () => {
    const hass = fixture();
    const { root } = await mount(hass, { ...CONFIG, confirm_unlock: true });
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
  it("opens a gate after confirmation when asked to, closes and stops it without", async () => {
    const hass = fixture();
    const { card, root } = await mount(hass, { ...CONFIG, confirm_gate: true });
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
  it("unlocks and opens at once by default", async () => {
    const hass = fixture();
    const { root } = await mount(hass);
    press(root, "lock.front", "unlock");
    press(root, "cover.gate", "open");
    await settle();
    expect(root.querySelector("[data-confirm]")).toBeNull();
    expect(hass.calls).toEqual([
      ["lock", "unlock", {}, { entity_id: "lock.front" }, false],
      ["cover", "open_cover", {}, { entity_id: "cover.gate" }, false],
    ]);
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
  it("locks the doors and closes the gates together, in Bokmål", async () => {
    const hass = fixture();
    hass.language = "nb";
    hass.states["lock.back"].state = "unlocked";
    hass.states["cover.gate"].state = "open";
    hass.states["cover.carport"] = {
      entity_id: "cover.carport",
      state: "closed",
      attributes: { device_class: "gate" },
    };
    const { root } = await mount(hass, {
      ...CONFIG,
      gates: ["cover.gate", "cover.carport"],
    });
    const all = root.querySelector<HTMLButtonElement>("[data-lock-all]")!;
    expect(all.textContent).toContain("Lås og lukk alle (2)");
    all.click();
    await settle();
    expect(hass.calls).toEqual([
      ["lock", "lock", {}, { entity_id: "lock.back" }, false],
      ["cover", "close_cover", {}, { entity_id: "cover.gate" }, false],
    ]);
  });
  it("closes all open gates when every door is locked, and reports a failure", async () => {
    const hass = fixture(async (domain) => {
      if (domain === "cover") throw new Error("Gate motor fault");
    });
    hass.states["cover.gate"].state = "open";
    hass.states["cover.side"] = {
      entity_id: "cover.side",
      state: "opening",
      attributes: { friendly_name: "Side gate", device_class: "gate" },
    };
    const { root } = await mount(hass, {
      ...CONFIG,
      gates: ["cover.gate", "cover.side"],
    });
    const all = root.querySelector<HTMLButtonElement>("[data-lock-all]")!;
    expect(all.textContent).toContain("Close all (2)");
    all.click();
    await settle();
    expect(hass.calls).toEqual([
      [
        "cover",
        "close_cover",
        {},
        { entity_id: ["cover.gate", "cover.side"] },
        false,
      ],
    ]);
    expect(text(root, '[role="alert"]')).toBe(
      "Close all: could not close: Gate motor fault",
    );
    expect(all.disabled).toBe(false);
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

describe("history", () => {
  const HOUR = 3_600_000;
  /** The fixture with recorder history for the front door and its contact. */
  function withHistory(now: number, fail?: Error) {
    const hass = fixture();
    const s = (ms: number) => ms / 1000;
    const rows: Record<string, unknown[]> = {
      "lock.front": [
        { s: "locked", lu: s(now - 20 * HOUR) },
        { s: "unavailable", lu: s(now - 12 * HOUR) },
        { s: "unlocked", lu: s(now - 8 * HOUR) },
      ],
      "binary_sensor.front_contact": [
        { s: "off", lu: s(now - 20 * HOUR) },
        { s: "on", lu: s(now - 7 * HOUR) },
        { s: "off", lu: s(now - 6 * HOUR) },
      ],
      "cover.gate": [{ s: "open", lu: s(now - 3 * HOUR) }],
    };
    const history = vi.fn(async (m: Record<string, unknown>) => {
      if (fail) throw fail;
      return Object.fromEntries(
        (m.entity_ids as string[]).map((id) => [id, rows[id] ?? []]),
      );
    });
    hass.callWS = history as HomeAssistant["callWS"];
    return { hass, history };
  }
  const lanes = (root: ShadowRoot) =>
    [...root.querySelectorAll("#history .lane-item")].map((i) =>
      i.textContent!.replace(/\s+/g, " ").trim(),
    );
  async function open(root: ShadowRoot, entity: string) {
    row(root, entity)
      .querySelector<HTMLButtonElement>("[data-history]")!
      .click();
    await vi.waitFor(() =>
      expect(root.querySelector(".timeline")).not.toBeNull(),
    );
  }
  /** Moves the pointer to `hoursAgo` on a 24-hour timeline. */
  function point(root: ShadowRoot, hoursAgo: number) {
    const svg = root.querySelector<SVGSVGElement>(".timeline")!;
    const box = svg.getBoundingClientRect();
    const width = svg.viewBox.baseVal.width;
    const x = 22 + ((24 - hoursAgo) / 24) * (width - 44);
    root.querySelector(".history-plot")!.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: box.left + (x / width) * box.width,
      }),
    );
  }

  it("opens a door's timeline of lock and contact from its state line", async () => {
    const now = Date.now();
    const { hass, history } = withHistory(now);
    const { card, root } = await mount(hass);
    const info: string[] = [];
    card.addEventListener("hass-more-info", (e) =>
      info.push((e as CustomEvent).detail.entityId),
    );
    // The name still opens Home Assistant's dialog, not the history.
    row(root, "lock.front").querySelector<HTMLButtonElement>(".info")!.click();
    expect(info).toEqual(["lock.front"]);
    expect(history).not.toHaveBeenCalled();
    const state = row(root, "lock.front").querySelector("[data-history]")!;
    expect(state.getAttribute("aria-label")).toBe(
      "Locked · door closed · Hall. History of Front door",
    );
    await open(root, "lock.front");
    const dialog = root.querySelector<HTMLDialogElement>("#history")!;
    expect(dialog.open).toBe(true);
    expect(text(root, "#history-title")).toBe("Front door: history");
    expect(history).toHaveBeenCalledTimes(1);
    const message = history.mock.calls[0][0];
    expect(message).toMatchObject({
      type: "history/history_during_period",
      entity_ids: ["lock.front", "binary_sensor.front_contact"],
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: false,
    });
    expect(Date.parse(String(message.start_time))).toBeCloseTo(
      now - 24 * HOUR,
      -4,
    );
    expect(
      [...root.querySelectorAll(".timeline .lane")].map(
        (l) => (l as SVGElement).dataset.lane,
      ),
    ).toEqual(["lock", "contact"]);
    // Each record is a band up to the next; the current state closes the last at "now".
    expect(
      [...root.querySelectorAll('.timeline [data-lane="lock"] .band')].map(
        (b) => b.getAttribute("class"),
      ),
    ).toEqual(["band b-ok", "band b-gap", "band b-attention"]);
    expect(lanes(root)).toEqual(["Lock Locked", "Door Closed"]);
    expect(text(root, ".when")).toBe("Now");
  });

  it("reads each lane's state under the pointer, with a gap while silent", async () => {
    const now = Date.now();
    const { hass } = withHistory(now);
    const { root } = await mount(hass);
    await open(root, "lock.front");
    const gap = root.querySelector<SVGRectElement>(".timeline .b-gap")!;
    expect(gap.dataset.state).toBe("unavailable");
    point(root, 16);
    await settle();
    expect(lanes(root)).toEqual(["Lock Locked", "Door Closed"]);
    expect(text(root, ".when")).toMatch(/\d/);
    expect(root.querySelector(".timeline .cursor")).not.toBeNull();
    point(root, 10);
    await settle();
    expect(lanes(root)).toEqual(["Lock Not responding", "Door Closed"]);
    point(root, 6.5);
    await settle();
    expect(lanes(root)).toEqual(["Lock Unlocked", "Door Open"]);
    root
      .querySelector(".history-plot")!
      .dispatchEvent(new PointerEvent("pointerleave"));
    await settle();
    expect(lanes(root)).toEqual(["Lock Locked", "Door Closed"]);
  });

  it("changes range and opens a lane's details, closing the history first", async () => {
    const now = Date.now();
    const { hass, history } = withHistory(now);
    const { card, root } = await mount(hass);
    await open(root, "lock.front");
    root.querySelector<HTMLButtonElement>('[data-range="6"]')!.click();
    await vi.waitFor(() => expect(history).toHaveBeenCalledTimes(2));
    expect(Date.parse(String(history.mock.calls[1][0].start_time))).toBeCloseTo(
      now - 6 * HOUR,
      -4,
    );
    await settle();
    expect(
      root.querySelector('[data-range="6"]')!.getAttribute("aria-pressed"),
    ).toBe("true");
    const info: string[] = [];
    card.addEventListener("hass-more-info", (e) =>
      info.push((e as CustomEvent).detail.entityId),
    );
    root
      .querySelector<HTMLButtonElement>('.lane-item[data-lane="contact"]')!
      .click();
    expect(info).toEqual(["binary_sensor.front_contact"]);
    expect(root.querySelector<HTMLDialogElement>("#history")!.open).toBe(false);
  });

  it("shows a gate's own lane through the connection when callWS is missing", async () => {
    const now = Date.now();
    const { hass, history } = withHistory(now);
    delete hass.callWS;
    hass.connection = {
      sendMessagePromise: history as never,
    };
    const { root } = await mount(hass);
    await open(root, "cover.gate");
    expect(history.mock.calls[0][0].entity_ids).toEqual(["cover.gate"]);
    expect(lanes(root)).toEqual(["Gate Closed"]);
    expect(
      [...root.querySelectorAll(".timeline .band")].map((b) =>
        b.getAttribute("class"),
      ),
    ).toEqual(["band b-open"]);
  });

  it("draws a gate opening and closing as their own states, with a gate key", async () => {
    const now = Date.now();
    const { hass, history } = withHistory(now);
    const s = (ms: number) => ms / 1000;
    history.mockImplementation(async () => ({
      "cover.gate": [
        { s: "closed", lu: s(now - 5 * HOUR) },
        { s: "opening", lu: s(now - 4 * HOUR) },
        { s: "open", lu: s(now - 3.9 * HOUR) },
        { s: "closing", lu: s(now - 2 * HOUR) },
        { s: "closed", lu: s(now - 1.9 * HOUR) },
      ],
    }));
    const { root } = await mount(hass);
    await open(root, "cover.gate");
    expect(
      [...root.querySelectorAll(".timeline .band")].map((b) =>
        b.getAttribute("class"),
      ),
    ).toEqual([
      "band b-ok",
      "band b-opening",
      "band b-open",
      "band b-closing",
      "band b-ok",
    ]);
    point(root, 2);
    await vi.waitFor(() => expect(lanes(root)).toEqual(["Gate Closing…"]));
    expect(
      [...root.querySelectorAll("#history .key li")].map((li) =>
        li.textContent!.trim(),
      ),
    ).toEqual(["Closed", "Opening", "Open", "Closing", "Not responding"]);
  });

  it("explains a failed history request in Bokmål", async () => {
    const { hass } = withHistory(Date.now(), new Error("Recorder is off"));
    hass.language = "nb";
    hass.locale = { language: "nb-NO" };
    const { root } = await mount(hass);
    row(root, "lock.front")
      .querySelector<HTMLButtonElement>("[data-history]")!
      .click();
    await vi.waitFor(() =>
      expect(text(root, "#history [role=alert]")).toBe(
        "Kunne ikke hente historikk: Recorder is off",
      ),
    );
    expect(
      [...root.querySelectorAll("[data-range]")].map((b) =>
        b.textContent!.trim(),
      ),
    ).toEqual(["6 t", "24 t", "7 d"]);
    expect(text(root, "#history-title")).toBe("Front door: historikk");
    // Only the history reports it; no door row shows a failure.
    expect(root.querySelectorAll("[role=alert]")).toHaveLength(1);
  });
});

describe("Home Assistant state colors", () => {
  const sev = (el: Element) =>
    getComputedStyle(el).getPropertyValue("--sev").trim();
  /** A theme that sets some of Home Assistant's state colors. */
  const theme = (card: HTMLElement) =>
    card.setAttribute(
      "style",
      [
        "--state-lock-locked-color: rgb(1, 1, 1)",
        "--state-lock-unlocked-color: rgb(2, 2, 2)",
        "--state-binary_sensor-door-on-color: rgb(3, 3, 3)",
        "--state-cover-closed-color: rgb(4, 4, 4)",
        "--state-cover-gate-closed-color: rgb(5, 5, 5)",
        "--state-inactive-color: rgb(6, 6, 6)",
        "--state-unavailable-color: rgb(7, 7, 7)",
      ].join(";"),
    );

  it("are off by default: the card's own colors apply", async () => {
    const { card, root } = await mount(fixture());
    theme(card);
    await settle();
    expect(row(root, "lock.front").getAttribute("style")).toBe("");
    expect(sev(row(root, "lock.front"))).not.toBe("rgb(1, 1, 1)");
  });

  it("follow the theme's most specific state color, per lock, contact and gate", async () => {
    const hass = fixture();
    hass.states["lock.back"].state = "unlocked";
    hass.states["lock.shed"].state = "unavailable";
    const { card, root } = await mount(hass, { ...CONFIG, state_colors: true });
    theme(card);
    await settle();
    expect(sev(row(root, "lock.front"))).toBe("rgb(1, 1, 1)");
    expect(sev(row(root, "lock.back"))).toBe("rgb(2, 2, 2)");
    expect(sev(row(root, "lock.shed"))).toBe("rgb(7, 7, 7)");
    // A gate's device class color wins over the domain's.
    expect(sev(row(root, "cover.gate"))).toBe("rgb(5, 5, 5)");
    // An open door takes its contact's color.
    hass.states["binary_sensor.front_contact"].state = "on";
    card.hass = { ...hass };
    await settle();
    expect(sev(row(root, "lock.front"))).toBe("rgb(3, 3, 3)");
    // The summary takes the color of what sets its tone: the silent lock.
    expect(sev(root.querySelector(".hero")!)).toBe("rgb(7, 7, 7)");
  });

  it("fall back to Home Assistant's general colors, then the card's", async () => {
    const hass = fixture();
    const { card, root } = await mount(hass, { ...CONFIG, state_colors: true });
    card.setAttribute("style", "--state-inactive-color: rgb(6, 6, 6)");
    await settle();
    expect(sev(row(root, "lock.front"))).toBe("rgb(6, 6, 6)");
    card.removeAttribute("style");
    await settle();
    // Nothing set by a theme: the card's own "ok" color (--success-color here).
    card.setAttribute("style", "--success-color: rgb(8, 8, 8)");
    await settle();
    expect(sev(row(root, "lock.front"))).toBe("rgb(8, 8, 8)");
  });

  it("color the history's bands, lanes and key", async () => {
    const now = Date.now();
    const hass = fixture();
    const s = (ms: number) => ms / 1000;
    hass.callWS = (async () => ({
      "lock.front": [{ s: "locked", lu: s(now - 20 * 3_600_000) }],
      "binary_sensor.front_contact": [
        { s: "off", lu: s(now - 20 * 3_600_000) },
      ],
    })) as unknown as HomeAssistant["callWS"];
    const { card, root } = await mount(hass, { ...CONFIG, state_colors: true });
    theme(card);
    row(root, "lock.front")
      .querySelector<HTMLButtonElement>("[data-history]")!
      .click();
    await vi.waitFor(() =>
      expect(root.querySelector(".timeline")).not.toBeNull(),
    );
    const band = (selector: string) =>
      getComputedStyle(root.querySelector(selector)!)
        .getPropertyValue("--band")
        .trim();
    expect(band('.band[data-state="locked"]')).toBe("rgb(1, 1, 1)");
    expect(band('.lane-item[data-lane="lock"] .swatch')).toBe("rgb(1, 1, 1)");
    expect(band(".key .b-attention")).toBe("rgb(2, 2, 2)");
    expect(band(".key .b-open")).toBe("rgb(3, 3, 3)");
  });

  it("must be true or false", () => {
    const card = new AccessControlCard();
    expect(() => card.setConfig({ ...CONFIG, state_colors: "yes" })).toThrow(
      "state_colors must be boolean",
    );
  });
});
