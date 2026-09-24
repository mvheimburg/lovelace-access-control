import { colorSchemeStyles } from "./color-schemes";
import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    color: var(--primary-text-color, #1b1b1a);
    font-family: var(--paper-font-body1_-_font-family, system-ui);
    --ac-text: var(--primary-text-color, #1b1b1a);
    --ac-muted: var(--secondary-text-color, #5b5a55);
    --ac-ok: var(--success-color, #2e7d32);
    --ac-attention: var(--warning-color, #f59e0b);
    --ac-open: var(--orange-color, #ea580c);
    --ac-problem: var(--error-color, #c62828);
    --ac-unknown: var(--disabled-text-color, #8a8984);
  }
  * {
    box-sizing: border-box;
  }
  ha-card,
  dialog {
    --ac-surface: var(--ha-card-background, var(--card-background-color, #fff));
    --ac-pill: var(--secondary-background-color, #f3f2ee);
    --ac-radius: 20px;
    --ac-tile: 16px;
  }
  ha-card.bubble {
    --ac-surface: var(
      --bubble-main-background-color,
      var(--ha-card-background, var(--card-background-color, #fff))
    );
    --ac-pill: var(
      --bubble-secondary-background-color,
      var(--secondary-background-color, #f3f2ee)
    );
    --ac-radius: var(--bubble-border-radius, 32px);
    --ac-tile: var(--bubble-sub-button-border-radius, 22px);
    border: var(--bubble-border, none);
    border-radius: var(--bubble-border-radius, 32px);
    box-shadow: var(--bubble-box-shadow, var(--ha-card-box-shadow));
  }
  ha-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--ac-surface);
    border-radius: var(--ha-card-border-radius, 16px);
  }
  .sev-ok {
    --sev: var(--ac-ok);
  }
  .sev-attention {
    --sev: var(--ac-attention);
  }
  .sev-open {
    --sev: var(--ac-open);
  }
  .sev-problem {
    --sev: var(--ac-problem);
  }
  .sev-unknown {
    --sev: var(--ac-unknown);
  }
  .i {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
  .i.s {
    width: 18px;
    height: 18px;
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spin {
      animation: none;
    }
  }
  .circ {
    flex: 0 0 44px;
    width: 44px;
    height: 44px;
    border-radius: var(--bubble-icon-border-radius, 50%);
    display: grid;
    place-items: center;
    color: color-mix(in srgb, var(--sev) 75%, var(--ac-text));
    background: color-mix(in srgb, var(--sev) 20%, transparent);
  }
  .circ.big {
    flex-basis: 52px;
    width: 52px;
    height: 52px;
  }
  .title {
    font-size: 17px;
    font-weight: 700;
    color: var(--ac-muted);
    padding: 0 8px;
  }
  .hero {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px;
    border-radius: var(--ac-radius);
    background: var(--ac-pill);
  }
  .hero-text {
    flex: 1;
    min-width: 0;
  }
  .headline {
    font-size: 28px;
    font-weight: 800;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }
  .event {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--ac-muted);
    overflow-wrap: anywhere;
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  h3 {
    margin: 4px 8px 2px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ac-muted);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 6px;
    border-radius: var(--ac-radius);
    background: var(--ac-pill);
  }
  .row.sev-open,
  .row.sev-problem {
    background: color-mix(in srgb, var(--sev) 14%, var(--ac-pill));
  }
  /*
   * The icon and name open Home Assistant's dialog; the state line on top of
   * them opens the history. Both share one grid, so the row looks as before.
   */
  .who {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    grid-template-rows: auto auto;
    align-content: center;
    column-gap: 12px;
    flex: 1 1 180px;
    min-width: 0;
    min-height: 56px;
  }
  .who > button {
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    padding: 0;
  }
  .info {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
    align-items: end;
    border-radius: calc(var(--ac-radius) - 4px);
  }
  .info .circ {
    grid-row: 1 / -1;
    align-self: center;
  }
  .name {
    grid-column: 2;
    grid-row: 1;
    font-weight: 700;
    overflow-wrap: anywhere;
  }
  .who > .state {
    grid-column: 2;
    grid-row: 2;
    justify-self: start;
    align-self: start;
    position: relative;
    z-index: 1;
    max-width: 100%;
    line-height: 20px;
    border-radius: 6px;
  }
  /* A 44px touch target without changing the line's look. */
  .who > .state::after {
    content: "";
    position: absolute;
    inset: -6px -8px -18px -8px;
  }
  .state {
    font-size: 13px;
    color: var(--ac-muted);
    overflow-wrap: anywhere;
  }
  .state strong {
    color: color-mix(in srgb, var(--sev) 60%, var(--ac-text));
  }
  .state .i.h {
    width: 14px;
    height: 14px;
    margin-left: 6px;
    vertical-align: -2px;
    opacity: 0.7;
  }
  .actions {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }
  button.act {
    min-height: 44px;
    min-width: 44px;
    padding: 0 16px;
    border: 0;
    border-radius: 22px;
    font: inherit;
    font-weight: 700;
    color: var(--ac-text);
    background: color-mix(in srgb, var(--ac-text) 8%, transparent);
    cursor: pointer;
  }
  button.act.arrow {
    width: 44px;
    padding: 0;
    display: grid;
    place-items: center;
  }
  button.act.primary {
    color: #fff;
    background: color-mix(in srgb, var(--ac-ok) 62%, #000);
  }
  button.act.risky {
    color: #fff;
    background: color-mix(in srgb, var(--ac-open) 62%, #000);
  }
  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  button:focus-visible {
    outline: 2px solid var(--primary-color, #0277bd);
    outline-offset: 2px;
  }
  .confirm {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: var(--ac-radius);
    background: color-mix(in srgb, var(--ac-open) 16%, var(--ac-pill));
    --sev: var(--ac-open);
  }
  .confirm p {
    margin: 0;
  }
  .confirm-title {
    font-size: 20px;
    font-weight: 800;
  }
  .confirm-actions {
    display: flex;
    gap: 8px;
  }
  .confirm-actions button {
    flex: 1;
  }
  .lock-all {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 52px;
    border: 0;
    border-radius: var(--ac-radius);
    font: inherit;
    font-weight: 700;
    color: #fff;
    background: color-mix(in srgb, var(--ac-ok) 62%, #000);
    cursor: pointer;
  }
  .note {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px 14px;
    border-radius: var(--ac-tile);
    font-size: 14px;
    background: color-mix(in srgb, var(--sev) 16%, var(--ac-pill));
  }
  /* History: a timeline of the lock or gate and its contact. */
  .b-ok {
    --band: var(--ac-ok);
  }
  .b-attention {
    --band: var(--ac-attention);
  }
  .b-open {
    --band: var(--ac-open);
  }
  /* A gate in motion: amber while opening, blue while closing. */
  .b-opening {
    --band: var(--ac-attention);
  }
  .b-closing {
    --band: var(--info-color, #0288d1);
  }
  .b-problem {
    --band: var(--ac-problem);
  }
  .b-unknown {
    --band: var(--ac-unknown);
  }
  :host {
    --history-text: var(--ac-text);
    --history-muted: var(--ac-muted);
    --history-surface: var(
      --ha-card-background,
      var(--card-background-color, #fff)
    );
    --history-pill: var(--secondary-background-color, #f3f2ee);
  }
  ha-card.bubble dialog#history {
    --history-surface-color: var(
      --bubble-main-background-color,
      var(--ha-card-background, var(--card-background-color, #fff))
    );
    --history-pill-color: var(
      --bubble-secondary-background-color,
      var(--secondary-background-color, #f3f2ee)
    );
    --history-radius: min(var(--bubble-border-radius, 32px), 28px);
  }
  .timeline {
    display: block;
    width: 100%;
    height: auto;
  }
  .timeline .grid {
    stroke: color-mix(in srgb, var(--ac-muted) 22%, transparent);
  }
  .timeline .axis {
    fill: var(--ac-muted);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .timeline .lane-label {
    fill: var(--ac-muted);
    font-size: 12px;
    font-weight: 700;
  }
  .timeline .track {
    fill: color-mix(in srgb, var(--ac-text) 5%, transparent);
  }
  .timeline .band {
    fill: color-mix(in srgb, var(--band) 78%, var(--ac-surface));
  }
  .timeline .band.b-gap {
    fill: url(#history-hatch);
  }
  .timeline .hatch-bg {
    fill: color-mix(in srgb, var(--ac-unknown) 14%, var(--ac-surface));
  }
  .timeline .hatch {
    stroke: color-mix(in srgb, var(--ac-unknown) 70%, transparent);
    stroke-width: 2;
  }
  .timeline .cursor {
    stroke: var(--ac-text);
    stroke-width: 1.5;
    stroke-dasharray: 3 3;
  }
  .history-plot .hint {
    margin: 24px 0;
    text-align: center;
    color: var(--ac-muted);
  }
  .history-when {
    margin: 4px 4px 6px;
    font-size: 13px;
    color: var(--ac-muted);
    font-variant-numeric: tabular-nums;
  }
  .lanes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 6px;
  }
  dialog#history .lane-item {
    border: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 2px 8px;
    min-height: 44px;
    padding: 8px 12px;
    border-radius: var(--ac-tile);
    background: var(--ac-pill);
    text-align: start;
  }
  .swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: color-mix(
      in srgb,
      var(--band, transparent) 78%,
      var(--ac-surface)
    );
  }
  .lane-item .swatch {
    grid-row: span 2;
  }
  .swatch.b-none {
    box-shadow: inset 0 0 0 1.5px var(--ac-muted);
  }
  .swatch.b-gap {
    background: repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--ac-unknown) 70%, transparent) 0 2px,
      color-mix(in srgb, var(--ac-unknown) 14%, var(--ac-surface)) 2px 4px
    );
  }
  .lane-name {
    font-size: 12px;
    color: var(--ac-muted);
  }
  .lane-item strong {
    font-size: 15px;
  }
  .key {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin: 12px 4px 0;
    padding: 0;
    list-style: none;
    font-size: 12px;
    color: var(--ac-muted);
  }
  .key li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .key .swatch {
    border-radius: 3px;
  }
  @media (max-width: 400px) {
    ha-card {
      padding: 12px;
    }
    .headline {
      font-size: 24px;
    }
  }
  ${colorSchemeStyles}
`;
