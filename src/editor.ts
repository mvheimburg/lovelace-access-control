import { colorSchemeSelector } from "./color-schemes";
import { LitElement, css, html, nothing } from "lit";
import { localize, type MessageKey } from "./localize";
import { candidates, itemEntity } from "./model";
import type { HomeAssistant, Item } from "./types";

type EditorConfig = Record<string, unknown>;

/** Card-only choices: which doors and gates, the access event, title, look and confirmations. */
export class AccessControlCardEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    fieldset {
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 12px;
      margin: 0 0 16px;
      padding: 8px 12px 12px;
    }
    legend {
      font-weight: 600;
      padding: 0 4px;
    }
    label {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 40px;
    }
    label.field {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    select,
    input[type="text"] {
      font: inherit;
      min-height: 44px;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #1b1b1a);
    }
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
    }
    small {
      color: var(--secondary-text-color, #5b5a55);
    }
  `;
  private config: EditorConfig = {};
  private ha?: HomeAssistant;

  set hass(value: HomeAssistant) {
    this.ha = value;
    this.requestUpdate();
  }
  setConfig(config: EditorConfig) {
    this.config = { ...config };
    this.requestUpdate();
  }
  private t(key: MessageKey) {
    return localize(this.ha, key);
  }
  private emit(config: EditorConfig) {
    this.config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
    this.requestUpdate();
  }
  private set(key: string, value: unknown) {
    const config = { ...this.config };
    if (value === "" || value === undefined) delete config[key];
    else config[key] = value;
    this.emit(config);
  }
  /** Toggle one entity, keeping any YAML object entry (name, contact) intact. */
  private toggle(key: "doors" | "gates", entity: string, on: boolean) {
    const items = ((this.config[key] as Item[] | undefined) ?? []).filter(
      (item) => itemEntity(item) !== entity,
    );
    const existing = ((this.config[key] as Item[] | undefined) ?? []).find(
      (item) => itemEntity(item) === entity,
    );
    this.set(key, on ? [...items, existing ?? entity] : items);
  }
  private list(
    key: "doors" | "gates",
    domain: "lock" | "cover",
    label: MessageKey,
  ) {
    const states = this.ha?.states ?? {};
    const chosen = ((this.config[key] as Item[] | undefined) ?? []).map(
      itemEntity,
    );
    const options = [
      ...new Set([...chosen, ...candidates(this.ha ?? { states }, domain)]),
    ];
    const name = (id: string) => {
      const value = states[id]?.attributes.friendly_name;
      return typeof value === "string" && value ? value : id;
    };
    return html`<fieldset data-list=${key}>
      <legend>${this.t(label)}</legend>
      ${
        options.length
          ? options.map(
              (id) =>
                html`<label>
                  <input
                    type="checkbox"
                    value=${id}
                    .checked=${chosen.includes(id)}
                    @change=${(event: Event) =>
                      this.toggle(
                        key,
                        id,
                        (event.target as HTMLInputElement).checked,
                      )}
                  />
                  <span>${name(id)} <small>${id}</small></span>
                </label>`,
            )
          : html`<small>—</small>`
      }
    </fieldset>`;
  }
  render() {
    const states = this.ha?.states ?? {};
    const events = Object.keys(states)
      .filter((id) => id.startsWith("event."))
      .sort();
    const event = String(this.config.access_event ?? "");
    const check = (key: string, label: MessageKey) =>
      html`<label>
        <input
          type="checkbox"
          data-field=${key}
          .checked=${this.config[key] === true}
          @change=${(e: Event) => this.set(key, (e.target as HTMLInputElement).checked)}
        />
        ${this.t(label)}
      </label>`;
    return html`
      ${colorSchemeSelector(this.ha, this.config.color_scheme, (scheme) => this.set("color_scheme", scheme))}
      <label class="field">
        ${this.t("cardTitle")}
        <input
          type="text"
          data-field="title"
          .value=${String(this.config.title ?? "")}
          placeholder=${this.t("title")}
          @change=${(e: Event) => this.set("title", (e.target as HTMLInputElement).value)}
        />
      </label>
      ${this.list("doors", "lock", "doorsLabel")}
      ${this.list("gates", "cover", "gatesLabel")}
      <label class="field">
        ${this.t("accessEvent")}
        <select
          data-field="access_event"
          @change=${(e: Event) => this.set("access_event", (e.target as HTMLSelectElement).value)}
        >
          <option value="" ?selected=${!event}>—</option>
          ${[...new Set([...(event ? [event] : []), ...events])].map(
            (id) =>
              html`<option value=${id} ?selected=${id === event}>
                ${id}
              </option>`,
          )}
        </select>
      </label>
      ${check("confirm_unlock", "confirmUnlockLabel")}
      ${check("confirm_gate", "confirmGateLabel")}
      <label class="field">
        ${this.t("appearance")}
        <select
          data-field="appearance"
          @change=${(e: Event) => this.set("appearance", (e.target as HTMLSelectElement).value)}
        >
          ${(["default", "bubble"] as const).map(
            (value) =>
              html`<option
                value=${value}
                ?selected=${(this.config.appearance ?? "default") === value}
              >
                ${this.t(value)}
              </option>`,
          )}
        </select>
      </label>
      ${nothing}
    `;
  }
}

customElements.define("access-control-card-editor", AccessControlCardEditor);
