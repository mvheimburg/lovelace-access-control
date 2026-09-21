import { LitElement, html, nothing } from "lit";
import { validateConfig } from "./config";
import { icon } from "./icons";
import { formatLocale, localize, type MessageKey } from "./localize";
import { candidates, overall, resolve } from "./model";
import { styles } from "./styles";
import type { CardConfig, HomeAssistant, Resolved, Tone } from "./types";
import "./editor";

type Action = "lock" | "unlock" | "open" | "close" | "stop";
const SERVICE: Record<Action, [string, string]> = {
  lock: ["lock", "lock"],
  unlock: ["lock", "unlock"],
  open: ["cover", "open_cover"],
  close: ["cover", "close_cover"],
  stop: ["cover", "stop_cover"],
};
const HERO_ICON: Record<Tone, string> = {
  ok: "shield",
  attention: "unlocked",
  open: "door",
  problem: "warning",
  unknown: "unknown",
};

/**
 * The house's doors and gates in one card. Home Assistant's lock and cover
 * entities are the authority; the card only calls their services.
 */
export class AccessControlCard extends LitElement {
  static styles = styles;
  private config?: CardConfig;
  private ha?: HomeAssistant;
  /** Entity IDs with a request in flight; "*" is Lock all. */
  private pending = new Set<string>();
  private failures = new Map<string, string>();
  private confirming?: { entity: string; action: "unlock" | "open" };

  static getConfigElement() {
    return document.createElement("access-control-card-editor");
  }
  static getStubConfig(hass?: HomeAssistant) {
    return {
      doors: hass ? candidates(hass, "lock") : [],
      gates: hass ? candidates(hass, "cover") : [],
    };
  }
  setConfig(config: Record<string, unknown>) {
    this.config = validateConfig(config);
    this.confirming = undefined;
    this.failures.clear();
    this.requestUpdate();
  }
  set hass(value: HomeAssistant) {
    this.ha = value;
    this.requestUpdate();
  }
  get hass() {
    return this.ha!;
  }
  getCardSize() {
    return (
      2 + (this.config?.doors.length ?? 0) + (this.config?.gates.length ?? 0)
    );
  }

  private t(key: MessageKey, values?: Record<string, string | number>) {
    return localize(this.ha, key, values);
  }
  private moreInfo(entityId: string) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }
  private ask(item: Resolved, action: Action) {
    if (this.pending.has(item.entity) || this.pending.has("*")) return;
    const confirm =
      (action === "unlock" && this.config!.confirm_unlock) ||
      (action === "open" && this.config!.confirm_gate);
    if (confirm) {
      this.confirming = {
        entity: item.entity,
        action: action as "unlock" | "open",
      };
      this.requestUpdate();
      return;
    }
    void this.call([item.entity], action, item.name);
  }
  private async call(entities: string[], action: Action, name: string) {
    const key = entities.length > 1 ? "*" : entities[0];
    if (this.pending.has(key)) return;
    this.confirming = undefined;
    this.pending.add(key);
    for (const entity of entities) this.failures.delete(entity);
    this.requestUpdate();
    const [domain, service] = SERVICE[action];
    try {
      if (!this.ha?.callService)
        throw new Error("Home Assistant service API unavailable");
      // Home Assistant reports the outcome in the entity's state.
      await this.ha.callService(
        domain,
        service,
        {},
        { entity_id: entities.length === 1 ? entities[0] : entities },
        false,
      );
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error && "message" in error
            ? String(error.message)
            : String(error);
      this.failures.set(
        key,
        `${this.t("failed", { name, action: this.t(action).toLocaleLowerCase(formatLocale(this.ha)) })}: ${reason}`,
      );
    } finally {
      this.pending.delete(key);
      this.requestUpdate();
    }
  }

  private stateLabel(item: Resolved): string {
    if (!item.available) return this.t("unavailable");
    const door: Record<string, MessageKey> = {
      locked: "locked",
      unlocked: "unlocked",
      locking: "locking",
      unlocking: "unlocking",
      jammed: "jammed",
      open: "lockOpen",
      opening: "lockOpening",
    };
    const gate: Record<string, MessageKey> = {
      open: "gateOpen",
      closed: "gateClosed",
      opening: "gateOpening",
      closing: "gateClosing",
    };
    const key = (item.kind === "door" ? door : gate)[item.state];
    return key ? this.t(key) : item.state;
  }
  private headline(items: Resolved[]): string {
    const count = (tone: Tone) => items.filter((i) => i.tone === tone).length;
    const part = (n: number, one: MessageKey, many: MessageKey) =>
      n === 0 ? [] : [n === 1 ? this.t(one) : this.t(many, { n })];
    const parts = [
      ...part(count("problem"), "problemOne", "problemCount"),
      ...part(count("unknown"), "unknownOne", "unknownCount"),
      ...part(count("open"), "openOne", "openCount"),
      ...part(count("attention"), "unlockedOne", "unlockedCount"),
    ];
    return parts.length ? parts.join(" · ") : this.t("allLocked");
  }
  private lastEvent() {
    const id = this.config?.access_event;
    const state = id ? this.ha?.states[id] : undefined;
    if (!state) return nothing;
    const a = state.attributes;
    const type = String(a.event_type ?? "");
    const at = new Date(state.state);
    if (
      !["unlock", "lock", "open", "close"].includes(type) ||
      Number.isNaN(at.getTime())
    )
      return nothing;
    const level = {
      guest: "level_guest",
      resident: "level_resident",
      user: "level_resident",
      admin: "level_admin",
    }[String(a.access_level ?? "")] as MessageKey | undefined;
    const name =
      typeof a.user_name === "string" && a.user_name
        ? a.user_name
        : this.t("someone");
    const who = level ? `${name} (${this.t(level)})` : name;
    const hour12 =
      this.ha?.locale?.time_format === "12"
        ? true
        : this.ha?.locale?.time_format === "24"
          ? false
          : undefined;
    const today = at.toDateString() === new Date().toDateString();
    const time = new Intl.DateTimeFormat(formatLocale(this.ha), {
      ...(today ? {} : { dateStyle: "medium" }),
      timeStyle: "short",
      hour12,
    }).format(at);
    const door = type === "unlock" || type === "lock" ? a.door : undefined;
    return html`<div class="event" data-event>
      ${icon("person", "s")}
      <span
        >${this.t(`ev_${type}` as MessageKey, { who })}${
          typeof door === "string" && door ? ` · ${door}` : ""
        }
        · ${time}</span
      >
    </div>`;
  }
  /** Up, stop, down like Home Assistant's cover controls; a direction already reached is disabled. */
  private gateArrows(item: Resolved, disabled: boolean) {
    const arrow = (action: Action, name: string, off: boolean) =>
      html`<button
        class="act arrow"
        data-action=${action}
        aria-label="${this.t(action)}: ${item.name}"
        title=${this.t(action)}
        ?disabled=${disabled || off}
        @click=${() => this.ask(item, action)}
      >
        ${icon(name)}
      </button>`;
    return html`${arrow("open", "up", ["open", "opening"].includes(item.state))}
    ${item.canStop ? arrow("stop", "stop", false) : nothing}
    ${arrow("close", "down", ["closed", "closing"].includes(item.state))}`;
  }
  private renderRow(item: Resolved) {
    const busy = this.pending.has(item.entity) || this.pending.has("*");
    const disabled = busy || !item.available;
    const contact =
      item.opened === undefined
        ? ""
        : this.t(item.opened ? "doorOpen" : "doorClosed");
    const button = (action: Action, cls = "") =>
      html`<button
        class="act ${cls}"
        data-action=${action}
        ?disabled=${disabled}
        @click=${() => this.ask(item, action)}
      >
        ${this.t(action)}
      </button>`;
    const actions =
      item.kind === "door"
        ? item.needsCode
          ? html`<button
              class="act"
              data-action="code"
              ?disabled=${!item.available}
              @click=${() => this.moreInfo(item.entity)}
            >
              ${this.t("withCode")}
            </button>`
          : ["locked", "locking"].includes(item.state)
            ? button("unlock")
            : button("lock", "primary")
        : this.gateArrows(item, disabled);
    const failure = this.failures.get(item.entity);
    return html`<div class="row sev-${item.tone}" data-entity=${item.entity}>
        <button class="who" @click=${() => this.moreInfo(item.entity)}>
          <span class="circ"
            >${
              busy
                ? icon("spinner", "spin")
                : icon(
                    item.kind === "gate"
                      ? "gate"
                      : item.state === "locked"
                        ? "locked"
                        : item.tone === "problem"
                          ? "warning"
                          : "unlocked",
                  )
            }</span
          >
          <span class="who-text">
            <span class="name">${item.name}</span>
            <span class="state"
              ><strong
                >${busy ? this.t("sending") : this.stateLabel(item)}</strong
              >${contact ? ` · ${contact}` : ""}${item.area ? ` · ${item.area}` : ""}</span
            >
          </span>
        </button>
        <div class="actions">${actions}</div>
      </div>
      ${
        failure
          ? html`<p class="note sev-problem" role="alert">
              ${icon("warning", "s")}${failure}
            </p>`
          : nothing
      }
      ${this.confirming?.entity === item.entity ? this.renderConfirm(item) : nothing}`;
  }
  private renderConfirm(item: Resolved) {
    const unlock = this.confirming!.action === "unlock";
    return html`<div
      class="confirm"
      role="alertdialog"
      aria-labelledby="confirm-title"
      data-confirm
    >
      <div id="confirm-title" class="confirm-title">
        ${this.t(unlock ? "confirmUnlock" : "confirmOpen", { name: item.name })}
      </div>
      <p>${this.t(unlock ? "confirmUnlockBody" : "confirmOpenBody")}</p>
      <div class="confirm-actions">
        <button
          class="act"
          data-cancel
          @click=${() => {
            this.confirming = undefined;
            this.requestUpdate();
          }}
        >
          ${this.t("cancel")}
        </button>
        <button
          class="act risky"
          data-confirm-action
          @click=${() => void this.call([item.entity], this.confirming!.action, item.name)}
        >
          ${this.t(unlock ? "unlock" : "open")}
        </button>
      </div>
    </div>`;
  }

  render() {
    if (!this.config || !this.ha) return nothing;
    const doors = this.config.doors.map((d) => resolve(this.ha!, d, "door"));
    const gates = this.config.gates.map((g) => resolve(this.ha!, g, "gate"));
    const all = [...doors, ...gates];
    const tone = all.length ? overall(all) : "unknown";
    const lockable = doors.filter(
      (d) => d.available && !d.needsCode && d.state === "unlocked",
    );
    const lockAllFailure = this.failures.get("*");
    return html`<ha-card class=${this.config.appearance}>
      <div class="title">${this.config.title ?? this.t("title")}</div>
      <div class="hero sev-${tone}">
        <span class="circ big">${icon(HERO_ICON[tone])}</span>
        <div class="hero-text">
          <div class="headline">
            ${all.length ? this.headline(all) : this.t("nothing")}
          </div>
          ${this.lastEvent()}
        </div>
      </div>
      ${
        doors.length
          ? html`<section class="group" aria-label=${this.t("doors")}>
              <h3>${this.t("doors")}</h3>
              ${doors.map((d) => this.renderRow(d))}
            </section>`
          : nothing
      }
      ${
        gates.length
          ? html`<section class="group" aria-label=${this.t("gates")}>
              <h3>${this.t("gates")}</h3>
              ${gates.map((g) => this.renderRow(g))}
            </section>`
          : nothing
      }
      ${
        lockable.length > 1
          ? html`<button
              class="lock-all"
              data-lock-all
              ?disabled=${this.pending.size > 0}
              @click=${() =>
                this.call(
                  lockable.map((d) => d.entity),
                  "lock",
                  this.t("lockAll"),
                )}
            >
              ${icon(this.pending.has("*") ? "spinner" : "locked", this.pending.has("*") ? "spin" : "")}
              ${this.t("lockAll")} (${lockable.length})
            </button>`
          : nothing
      }
      ${
        lockAllFailure
          ? html`<p class="note sev-problem" role="alert">
              ${icon("warning", "s")}${lockAllFailure}
            </p>`
          : nothing
      }
    </ha-card>`;
  }
}

customElements.define("access-control-card", AccessControlCard);

// Card-picker metadata has no hass context, so it stays English.
const registry = window as unknown as {
  customCards?: Array<Record<string, unknown>>;
};
registry.customCards ??= [];
registry.customCards.push({
  type: "access-control-card",
  name: "Access Control",
  description:
    "The house's doors and gates: status, lock, unlock and gate control",
  preview: true,
  documentationURL: "https://github.com/mvheimburg/lovelace-access-control",
});
