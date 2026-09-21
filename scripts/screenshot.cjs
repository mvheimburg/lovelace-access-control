const { chromium } = require("playwright");
const { readFileSync, mkdirSync } = require("node:fs");
const { resolve } = require("node:path");

const root = resolve(__dirname, "..");
const light = `--primary-text-color: #1b1b1a; --secondary-text-color: #5b5a55; --card-background-color: #fff; --secondary-background-color: #f3f2ee; --primary-color: #1d4ed8; background: #eeede9;`;
const dark = `--primary-text-color: #eceef1; --secondary-text-color: #9aa0aa; --card-background-color: #1a1c20; --secondary-background-color: #22252a; --primary-color: #8ab4f8; --success-color: #6fd39a; --warning-color: #f5c451; --orange-color: #ff9a6b; --bubble-main-background-color: #1a1c20; --bubble-secondary-background-color: #22252a; --bubble-border-radius: 32px; background: #121316;`;

/** Simulated Home Assistant state; no live instance is involved. */
function hass(variant) {
  const e = (entity_id, state, attributes = {}) => ({
    entity_id,
    state,
    attributes,
  });
  const states = {
    "lock.front": e("lock.front", "locked", { friendly_name: "Inngangsdør" }),
    "binary_sensor.front_contact": e("binary_sensor.front_contact", "off", {
      device_class: "door",
    }),
    "lock.terrace": e(
      "lock.terrace",
      variant === "evening" ? "unlocked" : "locked",
      { friendly_name: "Terrassedør" },
    ),
    "lock.garage": e("lock.garage", "locked", {
      friendly_name: "Garasjedør",
      code_format: "^\\d{4}$",
    }),
    "cover.gate": e("cover.gate", variant === "evening" ? "open" : "closed", {
      friendly_name: "Innkjørselsport",
      device_class: "gate",
      supported_features: 11,
    }),
    "event.doorbell_door_access": e(
      "event.doorbell_door_access",
      new Date(Date.now() - 25 * 60000).toISOString(),
      {
        event_type: "unlock",
        target: "door",
        door: "front",
        user_name: "Kari",
        access_level: "resident",
      },
    ),
  };
  return {
    states,
    entities: {
      "lock.front": {
        entity_id: "lock.front",
        device_id: "d1",
        area_id: "gang",
      },
      "binary_sensor.front_contact": {
        entity_id: "binary_sensor.front_contact",
        device_id: "d1",
      },
      "lock.terrace": { entity_id: "lock.terrace", area_id: "stue" },
    },
    devices: {},
    areas: {
      gang: { area_id: "gang", name: "Gang" },
      stue: { area_id: "stue", name: "Stue" },
    },
    language: "nb",
    locale: { language: "nb" },
  };
}

async function shot(browser, errors, { file, theme, cards }) {
  const page = await browser.newPage({
    viewport: { width: 1000, height: 760 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(
    `<style>body{margin:0;padding:28px;font:15px system-ui,sans-serif;${theme}} main{display:flex;gap:28px;align-items:flex-start} main>*{flex:0 0 440px}</style><main></main>`,
  );
  await page.addScriptTag({
    type: "module",
    content: readFileSync(resolve(root, "dist/access-control-card.js"), "utf8"),
  });
  await page.evaluate(async (cards) => {
    await customElements.whenDefined("access-control-card");
    for (const { hass, appearance, click } of cards) {
      const card = document.createElement("access-control-card");
      card.setConfig({
        appearance,
        doors: ["lock.front", "lock.terrace", "lock.garage"],
        gates: ["cover.gate"],
        access_event: "event.doorbell_door_access",
        confirm_unlock: true,
      });
      card.hass = { ...hass, callService: () => new Promise(() => {}) };
      document.querySelector("main").append(card);
      await card.updateComplete;
      if (click) {
        card.shadowRoot.querySelector(click).click();
        await card.updateComplete;
      }
    }
  }, cards);
  await page.screenshot({ path: resolve(root, "docs", file), fullPage: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const errors = [];
    mkdirSync(resolve(root, "docs"), { recursive: true });
    await shot(browser, errors, {
      file: "access-control-dark.png",
      theme: dark,
      cards: [
        { hass: hass("night"), appearance: "bubble" },
        { hass: hass("evening"), appearance: "bubble" },
      ],
    });
    await shot(browser, errors, {
      file: "access-control-light.png",
      theme: light,
      cards: [
        { hass: hass("evening"), appearance: "default" },
        {
          hass: hass("night"),
          appearance: "default",
          click: '[data-entity="lock.front"] [data-action="unlock"]',
        },
      ],
    });
    if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
    console.log(
      "Wrote docs/access-control-dark.png and docs/access-control-light.png with simulated Home Assistant data.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
