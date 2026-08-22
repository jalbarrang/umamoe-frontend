export interface UiRegistryEntry {
  id: string;
  name: string;
  purpose: string;
  states: string[];
  accessibility: string;
  status: 'draft' | 'review' | 'approved';
}

export interface UiRegistrySection {
  id: string;
  title: string;
  description: string;
  entries: UiRegistryEntry[];
}

const commonStates = ['default', 'hover', 'focus', 'active', 'disabled'];

export const uiRegistry: UiRegistrySection[] = [
  { id: 'tokens', title: 'Foundation', description: 'Colors, typography, spacing, radius, elevation, motion, breakpoints, layers, and density.', entries: [
    { id: 'tokens', name: 'Design tokens', purpose: 'Shared visual decisions represented as CSS custom properties.', states: ['dark', 'light', 'compact', 'comfortable', 'reduced-motion'], accessibility: 'System colors preserve readable contrast and user motion preferences.', status: 'review' },
    { id: 'layouts', name: 'Responsive layouts', purpose: 'Analytics-informed shell modes, medium and wide content wells, fixed page gutters, and ad-aware counter-balancing.', states: ['320', '360', '390', '412', '768', '1366', '1440', '1536', '1920', '2560', 'medium-page', 'wide-page', 'in-content-only', 'compact-right-rail', 'single-counter-rail', 'balanced-side-rails'], accessibility: 'Primary content stays first in DOM order; navigation and sponsored regions remain labeled landmarks.', status: 'review' }
  ]},
  { id: 'actions', title: 'Actions', description: 'Clear, fast controls with predictable hierarchy and 44px touch targets.', entries: [
    { id: 'button', name: 'Button', purpose: 'Primary, secondary, ghost, and destructive actions.', states: [...commonStates, 'loading'], accessibility: 'Native button, visible focus, busy and disabled states.', status: 'review' },
    { id: 'icon-button', name: 'Icon button', purpose: 'Compact labeled utility action.', states: [...commonStates, 'selected'], accessibility: 'Required accessible label and pressed state.', status: 'review' },
    { id: 'segments', name: 'Segmented control', purpose: 'Choose one of a small set of modes.', states: [...commonStates, 'selected'], accessibility: 'Radiogroup and radio semantics.', status: 'review' }
  ]},
  { id: 'inputs', title: 'Inputs', description: 'Lightweight fields with stable labels, validation, keyboard behavior, and mobile sizing.', entries: [
    { id: 'text-field', name: 'Text field', purpose: 'Text, search, email, and password entry.', states: [...commonStates, 'error'], accessibility: 'Real label, described-by help and error association.', status: 'review' },
    { id: 'select', name: 'Select and combobox', purpose: 'Choose or search a known option set.', states: [...commonStates, 'open', 'selected', 'empty'], accessibility: 'Combobox/listbox semantics, keyboard traversal, and labeled controls.', status: 'review' },
    { id: 'choice', name: 'Choice controls', purpose: 'Checkbox, radio, and switch preferences.', states: [...commonStates, 'selected', 'indeterminate'], accessibility: 'Native form controls retain keyboard and form behavior.', status: 'review' },
    { id: 'slider', name: 'Slider', purpose: 'Single-threshold and two-thumb interval filters with optional ticks and labels.', states: [...commonStates, 'single', 'range'], accessibility: 'Native range inputs retain keyboard, touch, and numeric value semantics.', status: 'review' },
    { id: 'file', name: 'File drop', purpose: 'Import structured user data.', states: [...commonStates, 'dragging', 'error'], accessibility: 'Always backed by a labeled native file input.', status: 'review' }
  ]},
  { id: 'navigation', title: 'Navigation', description: 'Adaptive site shell, local tabs, breadcrumbs, pagination, and launcher.', entries: [
    { id: 'shell', name: 'Adaptive shell', purpose: 'Expanded rail, compact rail, and mobile bottom bar.', states: ['320', '390', '768', '1024', '1536', '1920'], accessibility: 'Landmarks, current-page state, and labeled destinations.', status: 'review' },
    { id: 'subnavigation', name: 'Section navigation', purpose: 'Optional nested destinations in expanded, compact, and mobile navigation.', states: ['expanded', 'collapsed', 'compact-flyout', 'mobile-sheet'], accessibility: 'Disclosure state, current destination, and subsection relationships remain explicit.', status: 'review' },
    { id: 'tabs', name: 'Tabs and breadcrumbs', purpose: 'Local route context and view switching.', states: [...commonStates, 'selected'], accessibility: 'Tablist and breadcrumb navigation semantics.', status: 'review' },
    { id: 'pagination', name: 'Pagination', purpose: 'Bounded page navigation for server data.', states: [...commonStates, 'current'], accessibility: 'Navigation label and current-page state.', status: 'review' }
  ]},
  { id: 'feedback', title: 'Feedback', description: 'Calm status communication without pulsing or decorative animation.', entries: [
    { id: 'banner', name: 'Banner and inline error', purpose: 'Persistent page or field-level feedback.', states: ['info', 'success', 'warning', 'danger'], accessibility: 'Polite or assertive live behavior by severity.', status: 'review' },
    { id: 'progress', name: 'Progress and loading', purpose: 'Known and unknown wait states.', states: ['determinate', 'indeterminate', 'skeleton', 'spinner'], accessibility: 'Progressbar and status semantics.', status: 'review' },
    { id: 'empty', name: 'Empty state', purpose: 'Explain absence and offer the next valid action.', states: ['default', 'compact', 'error'], accessibility: 'Descriptive title and action, never visual-only.', status: 'review' }
  ]},
  { id: 'overlays', title: 'Overlays', description: 'Native dialog and lightweight disclosure patterns.', entries: [
    { id: 'dialog', name: 'Dialog and bottom sheet', purpose: 'Focused confirmation, forms, and mobile More navigation.', states: ['open', 'closed', 'danger', 'mobile-sheet'], accessibility: 'Native dialog focus trap, Escape, and labeled title.', status: 'review' },
    { id: 'menu', name: 'Menu and tooltip', purpose: 'Compact secondary actions and short hints.', states: [...commonStates, 'open'], accessibility: 'Menu roles and hover/focus tooltip visibility.', status: 'review' }
  ]},
  { id: 'data', title: 'Data patterns', description: 'Dense on desktop, touch-friendly on mobile, virtualized when large.', entries: [
    { id: 'cards', name: 'Cards and stats', purpose: 'Small related summaries and task entry points.', states: ['default', 'interactive', 'loading'], accessibility: 'Semantic article grouping and real links/actions.', status: 'review' },
    { id: 'table', name: 'Table and virtual list', purpose: 'Structured or very large result sets.', states: ['populated', 'empty', 'loading'], accessibility: 'Captioned table and list semantics with bounded DOM.', status: 'review' },
    { id: 'filters', name: 'Filters and sort', purpose: 'Expose query state directly and reversibly.', states: [...commonStates, 'selected'], accessibility: 'Pressed state and visible result counts.', status: 'review' },
    { id: 'filter-composition', name: 'Filter composition', purpose: 'Compose modes, presets, collapsible groups, counted options, selections, and a mobile filter sheet.', states: ['collapsed', 'expanded', 'basic', 'advanced', 'uql', 'mobile-sheet'], accessibility: 'Native disclosure, button, input, and dialog semantics preserve keyboard and touch operation.', status: 'review' }
  ]},
  { id: 'domain', title: 'Domain patterns', description: 'Reusable uma.moe vocabulary shared by every feature.', entries: [
    { id: 'artwork', name: 'Artwork, skills, and sparks', purpose: 'Character/card identity, raw skill icons, inheritance sparks, items, and status.', states: ['image', 'fallback', 'rarity', 'factor-type'], accessibility: 'Useful alt text with non-image fallback; decorative skill icons use empty alt text.', status: 'review' },
    { id: 'identity', name: 'Rank, aptitude, and stats', purpose: 'Consistent game rank, score, aptitude grade, stat, distance, and affinity vocabulary.', states: ['standard-rank', 'ultra-rank', 'grade', 'stat-tone', 'compact'], accessibility: 'Every color-coded value retains an explicit text label.', status: 'review' },
    { id: 'veteran-selector', name: 'Veteran selector', purpose: 'Search and select reusable Veterans from the active workspace anywhere on the site.', states: [...commonStates, 'open', 'searching', 'empty'], accessibility: 'Labeled combobox and listbox expose identity, rank, source, selection, and keyboard traversal.', status: 'review' },
    { id: 'veteran-summary', name: 'Veteran summary and list item', purpose: 'Reusable dense Veteran identity, sparks, affinity, aptitudes, parents, workspace, and row actions.', states: ['default', 'selected', 'compact', 'with-actions'], accessibility: 'Semantic summary and a separate labeled selection action avoid nested interactive controls.', status: 'review' },
    { id: 'lineage', name: 'Lineage and affinity', purpose: 'Responsive parent and grandparent relationships with selectable nodes and explicit affinity state.', states: ['full', 'mobile-stack', 'selected-node', 'empty-node'], accessibility: 'Each node is a labeled button and connectors remain decorative.', status: 'review' },
    { id: 'race-schedule', name: 'Race badges and schedule', purpose: 'Race grade, placement, affinity gain, selected races, and responsive training-year schedules.', states: ['G1', 'G2', 'G3', 'won', 'placed', 'selected', 'mobile-list'], accessibility: 'Race, grade, date, placement, and actions remain textually named.', status: 'review' },
    { id: 'connection', name: 'Workspace and connection', purpose: 'Make active data ownership and live client state explicit.', states: ['local', 'account', 'offline', 'connected', 'syncing', 'error'], accessibility: 'Text state never relies only on color.', status: 'review' }
  ]}
];

export const componentCount = uiRegistry.reduce((total, section) => total + section.entries.length, 0);
