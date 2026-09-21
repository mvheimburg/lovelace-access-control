import { html, svg, type SVGTemplateResult } from "lit";

const paths: Record<string, SVGTemplateResult> = {
  locked: svg`<rect x="4" y="10.5" width="16" height="10.5" rx="2.5"></rect><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"></path>`,
  unlocked: svg`<rect x="4" y="10.5" width="16" height="10.5" rx="2.5"></rect><path d="M8 10.5V7a4 4 0 0 1 7.7-1.5"></path>`,
  door: svg`<path d="M5 21V4a1 1 0 0 1 1-1h9l4 2v16"></path><path d="M3 21h18"></path><circle cx="12.5" cy="12" r=".9"></circle>`,
  gate: svg`<path d="M3 21V6M21 21V6"></path><path d="M3 9h18M3 15h18"></path><path d="M8 9v6M12 9v6M16 9v6"></path>`,
  shield: svg`<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"></path><path d="M8.5 12l2.5 2.5 4.5-5"></path>`,
  warning: svg`<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><path d="M12 9v4M12 17h.01"></path>`,
  unknown: svg`<circle cx="12" cy="12" r="9"></circle><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2M12 17h.01"></path>`,
  person: svg`<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>`,
  up: svg`<path d="m6 15 6-6 6 6"></path>`,
  down: svg`<path d="m6 9 6 6 6-6"></path>`,
  stop: svg`<rect x="7" y="7" width="10" height="10" rx="1.5"></rect>`,
  spinner: svg`<path d="M21 12a9 9 0 1 1-6.2-8.56"></path>`,
};

// No whitespace inside <svg>: it would leak into a button's textContent.
// prettier-ignore
export const icon = (name: string, extra = "") =>
  html`<svg class="i ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
