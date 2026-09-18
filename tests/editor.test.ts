import { afterEach, expect, it } from "vitest";
import "../src/editor";
import { fixture, settle } from "./fixtures";
import type { HomeAssistant } from "../src/types";

type Editor = HTMLElement & {
  setConfig(config: Record<string, unknown>): void;
  hass: HomeAssistant;
};

afterEach(() => document.body.replaceChildren());

async function mount(config: Record<string, unknown>, hass = fixture()) {
  const editor = document.createElement("access-control-card-editor") as Editor;
  editor.hass = hass;
  editor.setConfig(config);
  document.body.append(editor);
  await settle();
  const configs: Array<Record<string, unknown>> = [];
  editor.addEventListener("config-changed", (e) =>
    configs.push((e as CustomEvent).detail.config),
  );
  return { root: editor.shadowRoot!, configs };
}

it("offers locks and gate covers only, and keeps YAML entries when toggling others", async () => {
  const kept = { entity: "lock.front", name: "Hovedinngang" };
  const { root, configs } = await mount({ doors: [kept] });
  const doors = [
    ...root.querySelectorAll<HTMLInputElement>('[data-list="doors"] input'),
  ];
  const gates = [
    ...root.querySelectorAll<HTMLInputElement>('[data-list="gates"] input'),
  ];
  expect(doors.map((d) => d.value)).toEqual([
    "lock.front",
    "lock.back",
    "lock.shed",
  ]);
  expect(gates.map((g) => g.value)).toEqual(["cover.gate"]);
  doors[1].checked = true;
  doors[1].dispatchEvent(new Event("change"));
  expect(configs.at(-1)).toEqual({ doors: [kept, "lock.back"] });
  doors[0].checked = false;
  doors[0].dispatchEvent(new Event("change"));
  expect(configs.at(-1)).toEqual({ doors: ["lock.back"] });
});

it("sets the access event, confirmations and appearance, in Bokmål", async () => {
  const hass = fixture();
  hass.language = "nb";
  const { root, configs } = await mount({}, hass);
  expect(root.textContent).toContain("Bekreft før opplåsing");
  const event = root.querySelector<HTMLSelectElement>(
    '[data-field="access_event"]',
  )!;
  event.value = "event.doorbell_door_access";
  event.dispatchEvent(new Event("change"));
  const unlock = root.querySelector<HTMLInputElement>(
    '[data-field="confirm_unlock"]',
  )!;
  expect(unlock.checked).toBe(true);
  unlock.checked = false;
  unlock.dispatchEvent(new Event("change"));
  const look = root.querySelector<HTMLSelectElement>(
    '[data-field="appearance"]',
  )!;
  look.value = "bubble";
  look.dispatchEvent(new Event("change"));
  expect(configs.at(-1)).toEqual({
    access_event: "event.doorbell_door_access",
    confirm_unlock: false,
    appearance: "bubble",
  });
});
