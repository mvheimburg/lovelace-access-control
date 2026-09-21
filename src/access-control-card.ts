import { applyColorScheme } from "./color-schemes";
import { LitElement, html, nothing } from "lit";
import { validateConfig } from "./config";
import { icon } from "./icons";
import {
  band,
  loadHistory,
  RANGES,
  stateAt,
  type Band,
  type Lane,
  type LaneKind,
  type Range,
} from "./history";
import { formatLocale, localize, type MessageKey } from "./localize";
import { candidates, overall, resolve } from "./model";
import { styles } from "./styles";
import { timeAt, timeline } from "./timeline";
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
const DOOR_STATE: Record<string, MessageKey> = {
  locked: "locked",
  unlocked: "unlocked",
  locking: "locking",
  unlocking: "unlocking",
  jammed: "jammed",
  open: "lockOpen",
  opening: "lockOpening",
};
const GATE_STATE: Record<string, MessageKey> = {
  open: "gateOpen",
  closed: "gateClosed",
  opening: "gateOpening",
  closing: "gateClosing",
};
const KEY: Record<Band, MessageKey> = {
  ok: "keyOk",
  attention: "keyAttention",
  open: "keyOpen",
  opening: "keyOpening",
  closing: "keyClosing",
  problem: "keyProblem",
  unknown: "keyGap",
  gap: "keyGap",
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
  /** History dialog: the door or gate, range, loaded lanes and hovered time. */
  private historyItem?: Resolved;
  private range: Range = 24;
  private lanes?: Lane[];
  private window?: [number, number];
  private historyLoading = false;
  private historyError = "";
  private hover?: number;
  private historyTicket = 0;
  private plotWidth = 600;
  private resize?: ResizeObserver;

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
    const next = validateConfig(config);
    applyColorScheme(this, config.color_scheme, this.ha);
    this.config = next;
    this.confirming = undefined;
    this.failures.clear();
    this.closeHistory();
    this.historyItem = undefined;
    this.requestUpdate();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.resize?.disconnect();
    this.resize = undefined;
  }
  protected updated() {
    const plot = this.shadowRoot?.querySelector(".history-plot");
    if (!plot || this.resize) return;
    this.resize = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      // Redraw next frame, outside the observer's own layout pass.
      if (width > 0 && Math.abs(width - this.plotWidth) > 4)
        requestAnimationFrame(() => {
          this.plotWidth = width;
          this.requestUpdate();
        });
    });
    this.resize.observe(plot);
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
    void this.call(item.entity, action, item.name);
  }
  private call(entity: string, action: Action, name: string) {
    return this.run(entity, name, [[action, [entity]]]);
  }
  /** Sends each step's service call; `key` marks what is pending ("*" for Lock all). */
  private async run(
    key: string,
    name: string,
    steps: Array<[Action, string[]]>,
  ) {
    if (this.pending.has(key)) return;
    this.confirming = undefined;
    this.pending.add(key);
    this.failures.delete(key);
    for (const [, entities] of steps)
      for (const entity of entities) this.failures.delete(entity);
    this.requestUpdate();
    // Home Assistant reports the outcome in the entities' states.
    const results = await Promise.allSettled(
      steps.map(async ([action, entities]) => {
        if (!this.ha?.callService)
          throw new Error("Home Assistant service API unavailable");
        const [domain, service] = SERVICE[action];
        return this.ha.callService(
          domain,
          service,
          {},
          { entity_id: entities.length === 1 ? entities[0] : entities },
          false,
        );
      }),
    );
    const index = results.findIndex((r) => r.status === "rejected");
    if (index >= 0) {
      const error = (results[index] as PromiseRejectedResult).reason;
      const reason =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error && "message" in error
            ? String(error.message)
            : String(error);
      const action = this.t(steps[index][0]).toLocaleLowerCase(
        formatLocale(this.ha),
      );
      this.failures.set(
        key,
        `${this.t("failed", { name, action })}: ${reason}`,
      );
    }
    this.pending.delete(key);
    this.requestUpdate();
  }

  private stateLabel(item: Resolved): string {
    if (!item.available) return this.t("unavailable");
    return this.laneState(item.kind === "door" ? "lock" : "gate", item.state);
  }
  /** A lane's state in words; unknown values stay recognizable. */
  private laneState(kind: LaneKind, state: string | undefined): string {
    if (state === undefined) return "—";
    if (band(kind, state) === "gap") return this.t("unavailable");
    const key =
      kind === "contact"
        ? { on: "contactOpen", off: "contactClosed" }[state]
        : (kind === "lock" ? DOOR_STATE : GATE_STATE)[state];
    return key ? this.t(key as MessageKey) : state;
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
    const label = busy ? this.t("sending") : this.stateLabel(item);
    const rest = `${contact ? ` · ${contact}` : ""}${item.area ? ` · ${item.area}` : ""}`;
    const status = `${label}${rest}`;
    return html`<div class="row sev-${item.tone}" data-entity=${item.entity}>
        <div class="who">
          <button class="info" @click=${() => this.moreInfo(item.entity)}>
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
            <span class="name">${item.name}</span>
          </button>
          <button
            class="state"
            data-history
            aria-label=${`${status}. ${this.t("historyOf", { name: item.name })}`}
            title=${this.t("history")}
            @click=${() => void this.openHistory(item)}
          >
            <strong>${label}</strong>${rest}${icon("history", "h")}
          </button>
        </div>
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
  /** The entities drawn for a door or gate: its lock or cover, then its contact. */
  private sources(item: Resolved): Array<{ kind: LaneKind; entityId: string }> {
    return [
      { kind: item.kind === "door" ? "lock" : "gate", entityId: item.entity },
      ...(item.contact
        ? [{ kind: "contact" as const, entityId: item.contact }]
        : []),
    ];
  }
  private async openHistory(item: Resolved) {
    this.historyItem = item;
    this.lanes = this.window = undefined;
    this.requestUpdate();
    await this.updateComplete;
    const dialog =
      this.shadowRoot?.querySelector<HTMLDialogElement>("#history");
    if (dialog && !dialog.open) dialog.showModal();
    void this.loadHistory();
  }
  private closeHistory() {
    this.historyTicket++;
    this.lanes = this.window = this.hover = undefined;
    this.historyLoading = false;
    this.historyError = "";
    this.shadowRoot?.querySelector<HTMLDialogElement>("#history")?.close();
  }
  private async loadHistory(range: Range = this.range) {
    const item = this.historyItem;
    if (!this.ha || !item) return;
    const ticket = ++this.historyTicket;
    this.range = range;
    this.historyLoading = true;
    this.historyError = "";
    this.hover = undefined;
    this.requestUpdate();
    const end = Date.now();
    try {
      const lanes = await loadHistory(this.ha, this.sources(item), range, end);
      if (ticket !== this.historyTicket) return;
      this.lanes = lanes;
      this.window = [end - range * 3_600_000, end];
    } catch (error) {
      if (ticket !== this.historyTicket) return;
      this.lanes = this.window = undefined;
      this.historyError = `${this.t("historyFailed")}: ${
        error instanceof Error
          ? error.message
          : typeof error === "object" && error && "message" in error
            ? String(error.message)
            : String(error)
      }`;
    }
    this.historyLoading = false;
    this.requestUpdate();
  }
  private laneLabel(item: Resolved, kind: LaneKind): string {
    if (kind === "lock") return this.t("laneLock");
    if (kind === "gate") return this.t("laneGate");
    return this.t(item.kind === "door" ? "laneDoor" : "laneContact");
  }
  private historyDialog() {
    const item = this.historyItem;
    const locale = formatLocale(this.ha);
    const hour12 =
      this.ha?.locale?.time_format === "12"
        ? true
        : this.ha?.locale?.time_format === "24"
          ? false
          : undefined;
    const time = (ms: number, withDay: boolean) =>
      new Intl.DateTimeFormat(
        locale,
        withDay
          ? { weekday: "short", day: "numeric" }
          : { hour: "2-digit", minute: "2-digit", hour12 },
      ).format(ms);
    const detailed = (ms: number) =>
      new Intl.DateTimeFormat(locale, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12,
      }).format(ms);
    const span = (hours: number) =>
      new Intl.NumberFormat(locale, {
        style: "unit",
        unit: hours < 48 ? "hour" : "day",
        unitDisplay: "short",
      }).format(hours < 48 ? hours : hours / 24);
    const lanes = this.lanes;
    const window = this.window;
    const at = this.hover;
    const title = item ? this.t("historyTitle", { name: item.name }) : "";
    const keys: Band[] =
      item?.kind === "gate"
        ? ["ok", "opening", "open", "closing", "gap"]
        : ["ok", "attention", "open", "problem", "gap"];
    return html`<dialog
      id="history"
      class=${this.config?.appearance === "bubble" ? "bubble" : ""}
      aria-labelledby="history-title"
      @close=${() => {
        this.historyTicket++;
        this.hover = undefined;
      }}
    >
      <div class="history-head">
        <h2 id="history-title">${title}</h2>
        <button
          class="close"
          data-close
          aria-label=${this.t("closeDialog")}
          title=${this.t("closeDialog")}
          @click=${() => this.closeHistory()}
        >
          ×
        </button>
      </div>
      <div class="ranges" role="group" aria-label=${this.t("history")}>
        ${RANGES.map(
          (hours) =>
            html`<button
              data-range=${hours}
              aria-pressed=${String(this.range === hours)}
              @click=${() => void this.loadHistory(hours)}
            >
              ${span(hours)}
            </button>`,
        )}
      </div>
      <div
        class="history-plot"
        aria-busy=${String(this.historyLoading)}
        @pointermove=${(e: PointerEvent) => {
          const svg = (e.currentTarget as HTMLElement).querySelector("svg");
          if (!svg || !window) return;
          this.hover = timeAt(e, svg, window[0], window[1]);
          this.requestUpdate();
        }}
        @pointerleave=${() => {
          this.hover = undefined;
          this.requestUpdate();
        }}
      >
        ${
          this.historyError
            ? html`<p class="note sev-problem" role="alert">
                ${icon("warning", "s")}${this.historyError}
              </p>`
            : !lanes || !window || !item
              ? html`<p class="hint" role="status">${this.t("loading")}</p>`
              : lanes.every((l) => !l.marks.length)
                ? html`<p class="hint">${this.t("noHistory")}</p>`
                : timeline(
                    lanes,
                    window[0],
                    window[1],
                    at,
                    {
                      time,
                      lane: (lane) => this.laneLabel(item, lane.kind),
                      label: title,
                    },
                    Math.max(280, this.plotWidth),
                  )
        }
      </div>
      <p class="when" aria-live="polite">
        ${at === undefined ? this.t("now") : detailed(at)}
      </p>
      <div class="lanes">
        ${(item && lanes ? lanes : []).map((lane) => {
          const state =
            at === undefined
              ? lane.marks[lane.marks.length - 1]?.[1]
              : stateAt(lane, at);
          const tone = state === undefined ? "none" : band(lane.kind, state);
          return html`<button
            class="lane-item"
            data-lane=${lane.kind}
            @click=${() => {
              this.closeHistory();
              this.moreInfo(lane.entityId);
            }}
          >
            <span class=${`swatch b-${tone}`}></span>
            <span class="lane-name">${this.laneLabel(item!, lane.kind)}</span>
            <strong>${this.laneState(lane.kind, state)}</strong>
          </button>`;
        })}
      </div>
      <ul class="key">
        ${keys.map(
          (key) =>
            html`<li>
              <span class=${`swatch b-${key}`}></span>${this.t(
                key === "ok" && item?.kind === "gate" ? "keyClosed" : KEY[key],
              )}
            </li>`,
        )}
      </ul>
    </dialog>`;
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
          @click=${() => void this.call(item.entity, this.confirming!.action, item.name)}
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
    const closable = gates.filter(
      (g) => g.available && !["closed", "closing"].includes(g.state),
    );
    const secureCount = lockable.length + closable.length;
    const secureLabel = this.t(
      !closable.length
        ? "lockAll"
        : !lockable.length
          ? "closeAll"
          : "secureAll",
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
        secureCount > 1
          ? html`<button
              class="lock-all"
              data-lock-all
              ?disabled=${this.pending.size > 0}
              @click=${() =>
                this.run(
                  "*",
                  secureLabel,
                  [
                    ["lock", lockable.map((d) => d.entity)] as [
                      Action,
                      string[],
                    ],
                    ["close", closable.map((g) => g.entity)] as [
                      Action,
                      string[],
                    ],
                  ].filter(([, entities]) => entities.length),
                )}
            >
              ${icon(this.pending.has("*") ? "spinner" : "locked", this.pending.has("*") ? "spin" : "")}
              ${secureLabel} (${secureCount})
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
      ${this.historyDialog()}
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
