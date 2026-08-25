import type { UiRegistrySection } from '../../ui/registry';

export const hakurakuRegistry: UiRegistrySection[] = [
  { id: 'haku-foundation', title: 'Hakuraku foundation', description: 'The compact dark data-tool language, ported into semantic Svelte contracts.', entries: [
    { id: 'haku-tokens', name: 'Hakuraku tokens', purpose: 'Scoped surface, border, accent, brand, radius, and density aliases.', states: ['dark', 'compact', 'mobile'], accessibility: 'Scoped colors preserve the host theme and readable contrast.', status: 'review' },
    { id: 'haku-upload', name: 'Race upload zone', purpose: 'Load race captures without coupling the control to parser state.', states: ['default', 'hover', 'dragging', 'accepted', 'error'], accessibility: 'A native labeled file input remains the source of interaction.', status: 'review' }
  ]},
  { id: 'haku-race-data', title: 'Race data', description: 'Dense, inspectable runner and race-state presentations.', entries: [
    { id: 'haku-runner-table', name: 'Runner table', purpose: 'Show runner identity, strategy, speed, stamina, and position.', states: ['desktop-table', 'mobile-row', 'selected'], accessibility: 'Table and row semantics retain every visual value in text.', status: 'review' },
    { id: 'haku-course-map', name: 'Course map', purpose: 'Provide lightweight course progress context for replay.', states: ['ready', 'compact', 'live'], accessibility: 'A textual progress label describes the decorative SVG.', status: 'review' }
  ]},
  { id: 'haku-replay', title: 'Race replay', description: 'Playback, visibility, timeline, speed, and phase controls.', entries: [
    { id: 'haku-replay-controls', name: 'Replay controls', purpose: 'Control replay position and runner visibility independently from transport state.', states: ['playing', 'paused', 'runner-hidden', 'mobile-wrap'], accessibility: 'Pressed states and labeled native range input expose every control.', status: 'review' },
    { id: 'haku-phase-state', name: 'Phase state', purpose: 'Identify race phases and current frame without decorative animation.', states: ['start', 'corner', 'last-spurt', 'finished'], accessibility: 'Phase and frame values remain textual.', status: 'review' }
  ]},
  { id: 'haku-analysis', title: 'Analysis and charts', description: 'Renderer-independent chart framing backed by Hakuraku’s modular ECharts stack.', entries: [
    { id: 'haku-race-chart', name: 'Race graph', purpose: 'Compare speed, HP, phases, and time with zoom and tooltips.', states: ['ready', 'zoomed', 'loading', 'empty', 'error'], accessibility: 'ARIA-enabled SVG rendering is paired with a concise text description.', status: 'review' },
    { id: 'haku-chart-port', name: 'ECharts renderer port', purpose: 'Keep feature components independent from the chosen chart implementation.', states: ['svg', 'responsive', 'disposed'], accessibility: 'The renderer receives a stable label and description contract.', status: 'review' }
  ]}
];

export const hakurakuComponentCount = hakurakuRegistry.reduce((total, section) => total + section.entries.length, 0);
