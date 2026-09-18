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
    { id: 'layouts', name: 'Responsive layouts', purpose: 'Analytics-informed shell modes, normal and wide content wells, fixed page gutters, and ad-aware counter-balancing.', states: ['320', '360', '390', '412', '768', '1366', '1440', '1536', '1920', '2560', 'normal-page', 'wide-page', 'in-content-only', 'compact-right-rail', 'single-counter-rail', 'balanced-side-rails'], accessibility: 'Primary content stays first in DOM order; navigation and sponsored regions remain labeled landmarks.', status: 'review' }
  ]},
  { id: 'actions', title: 'Actions', description: 'Clear, fast controls with predictable hierarchy and 44px touch targets.', entries: [
    { id: 'button', name: 'Button', purpose: 'Primary, secondary, ghost, and destructive actions.', states: [...commonStates, 'loading'], accessibility: 'Native button, visible focus, busy and disabled states.', status: 'review' },
    { id: 'icon-button', name: 'Icon button', purpose: 'Compact labeled utility action.', states: [...commonStates, 'selected'], accessibility: 'Required accessible label and pressed state.', status: 'review' },
    { id: 'segments', name: 'Segmented control', purpose: 'Choose one of a small set of modes.', states: [...commonStates, 'selected'], accessibility: 'Radiogroup and radio semantics.', status: 'review' },
    { id: 'toggle-button', name: 'Toggle button', purpose: 'Expose an immediate binary result or display preference with an unmistakable switch state.', states: [...commonStates, 'pressed', 'with-count'], accessibility: 'Native pressed state, visible text, and a redundant switch indicator.', status: 'review' }
  ]},
  { id: 'inputs', title: 'Inputs', description: 'Lightweight fields with stable labels, validation, keyboard behavior, and mobile sizing.', entries: [
    { id: 'text-field', name: 'Text field', purpose: 'Text, search, email, password, and numeric entry with shared chevrons.', states: [...commonStates, 'error', 'readonly', 'min/max', 'decimal step'], accessibility: 'Real label and described-by help. Number buttons retain native stepping, limits, and arrow key entry.', status: 'review' },
    { id: 'select', name: 'Select and combobox', purpose: 'Choose or search a known option set.', states: [...commonStates, 'open', 'selected', 'empty'], accessibility: 'Combobox/listbox semantics, keyboard traversal, and labeled controls.', status: 'review' },
    { id: 'picker-button', name: 'Picker action', purpose: 'Launch a rich entity picker without presenting the action as an inline select.', states: [...commonStates, 'selected', 'with-image'], accessibility: 'A native labeled button exposes choose and change actions while the dialog owns selection semantics.', status: 'review' },
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
    { id: 'menu', name: 'Menu and tooltip', purpose: 'Compact secondary actions and short hints.', states: [...commonStates, 'open'], accessibility: 'Menu roles and hover/focus tooltip visibility.', status: 'review' },
    { id: 'inspect', name: 'Inspect popover', purpose: 'Show compact game-data details from click, keyboard, or touch.', states: ['closed', 'open', 'start-aligned', 'end-aligned'], accessibility: 'Disclosure state and a labeled dialog replace hover-only inspection.', status: 'review' },
    { id: 'tour', name: 'Guided tour callout', purpose: 'Optional anchored help for filters, planners, and import flows.', states: ['first', 'middle', 'last', 'dismissed'], accessibility: 'Explicit progress, navigation labels, and reduced-motion-safe state changes.', status: 'review' }
  ]},
  { id: 'data', title: 'Data patterns', description: 'Dense on desktop, touch-friendly on mobile, virtualized when large.', entries: [
    { id: 'cards', name: 'Cards and stats', purpose: 'Small related summaries and task entry points.', states: ['default', 'interactive', 'loading'], accessibility: 'Semantic article grouping and real links/actions.', status: 'review' },
    { id: 'circle-card', name: 'Circle card', purpose: 'Shared circle identity, rank, membership and fan totals on directory and profile pages.', states: ['row', 'summary', 'ranked', 'partial-data', 'mobile'], accessibility: 'Named circle link, labeled rank movement and game rank artwork.', status: 'review' },
    { id: 'disclosure', name: 'Collapsible section', purpose: 'An optional full-width section with inline details.', states: ['collapsed', 'expanded', 'mobile'], accessibility: 'Native details and summary support keyboard activation and expose expanded state.', status: 'review' },
    { id: 'metric-bar', name: 'Metric bar', purpose: 'Compact analytic rates and normalized values inside result rows and panels.', states: ['accent', 'success', 'warning', 'danger', 'compact'], accessibility: 'The numeric value and optional metric label remain textual and do not rely on bar length or color.', status: 'review' },
    { id: 'table', name: 'Table and virtual list', purpose: 'Structured or very large result sets.', states: ['populated', 'empty', 'loading'], accessibility: 'Captioned table and list semantics with bounded DOM.', status: 'review' },
    { id: 'filters', name: 'Filters and sort', purpose: 'Expose query state directly and reversibly.', states: [...commonStates, 'selected'], accessibility: 'Pressed state and visible result counts.', status: 'review' },
    { id: 'filter-composition', name: 'Filter composition', purpose: 'Compose modes, presets, collapsible groups, counted options, selections, and a mobile filter sheet.', states: ['collapsed', 'expanded', 'basic', 'advanced', 'uql', 'mobile-sheet'], accessibility: 'Native disclosure, button, input, and dialog semantics preserve keyboard and touch operation.', status: 'review' },
    { id: 'result-toolbar', name: 'Result toolbar', purpose: 'Keep result count, live state, sort, refresh, and view selection consistent.', states: ['default', 'filtered', 'live', 'mobile-wrap'], accessibility: 'Native select and pressed buttons expose the active result presentation.', status: 'review' },
    { id: 'query-editor', name: 'Query editor shell', purpose: 'Provide UQL input, validation, suggestions, examples, and an explicit run action.', states: ['empty', 'valid', 'invalid', 'suggestions-open'], accessibility: 'A labeled textarea, associated error, listbox suggestions, and keyboard actions remain explicit.', status: 'review' },
    { id: 'chart-frame', name: 'Chart frame', purpose: 'Standardize chart titles, descriptions, legends, loading, empty, error, and export behavior.', states: ['ready', 'loading', 'empty', 'error'], accessibility: 'Figure semantics, text legend, status descriptions, and renderer-owned chart labels preserve meaning.', status: 'review' },
    { id: 'statistics-ranking', name: 'Statistics ranking', purpose: 'Explore Uma, support, skill, and deck usage with searchable rankings and exact counts.', states: ['populated', 'search', 'sort', 'empty', 'show-more', 'character-drilldown'], accessibility: 'Named lists, labeled search and sort controls, textual percentages, and native character buttons.', status: 'review' },
    { id: 'statistics-deck-matrix', name: 'Deck composition matrix', purpose: 'Compare support slot counts and usage shares in a compact, color-coded table.', states: ['populated', 'empty'], accessibility: 'Named table, column headings, explicit slot counts and a text legend preserve meaning without color.', status: 'review' }
  ]},
  { id: 'domain', title: 'Domain patterns', description: 'Reusable uma.moe vocabulary shared by every feature.', entries: [
    { id: 'artwork', name: 'Artwork, skills, and sparks', purpose: 'Character/card identity, raw skill icons, inheritance sparks, items, and status.', states: ['image', 'fallback', 'rarity', 'factor-type'], accessibility: 'Useful alt text with non-image fallback; decorative skill icons use empty alt text.', status: 'review' },
    { id: 'identity', name: 'Rank, aptitude, and stats', purpose: 'Consistent game rank, score, aptitude grade, stat, distance, and affinity vocabulary.', states: ['standard-rank', 'ultra-rank', 'grade', 'stat-tone', 'compact'], accessibility: 'Every color-coded value retains an explicit text label.', status: 'review' },
    { id: 'veteran-selector', name: 'Veteran selector', purpose: 'Search and select reusable Veterans from the active workspace anywhere on the site.', states: [...commonStates, 'open', 'searching', 'empty'], accessibility: 'Labeled combobox and listbox expose identity, rank, source, selection, and keyboard traversal.', status: 'review' },
    { id: 'veteran-summary', name: 'Veteran summary and list item', purpose: 'Reusable dense Veteran identity, sparks, affinity, aptitudes, parents, workspace, and row actions.', states: ['default', 'selected', 'compact', 'with-actions'], accessibility: 'Semantic summary and a separate labeled selection action avoid nested interactive controls.', status: 'review' },
    { id: 'lineage', name: 'Lineage and affinity', purpose: 'Responsive parent and grandparent relationships with selectable nodes and explicit affinity state.', states: ['full', 'mobile-stack', 'selected-node', 'empty-node'], accessibility: 'Each node is a labeled button and connectors remain decorative.', status: 'review' },
    { id: 'race-schedule', name: 'Race badges and schedule', purpose: 'Race grade, placement, affinity gain, selected races, and responsive training-year schedules.', states: ['G1', 'G2', 'G3', 'won', 'placed', 'selected', 'mobile-list'], accessibility: 'Race, grade, date, placement, and actions remain textually named.', status: 'review' },
    { id: 'character-picker', name: 'Character picker', purpose: 'Search and select targets, includes, excludes, parents, and planner slots with optional affinity.', states: ['target', 'include', 'exclude', 'single', 'multi', 'empty'], accessibility: 'Radio or pressed-button semantics retain names, selection, disabled state, and affinity text.', status: 'review' },
    { id: 'affinity-picker', name: 'Target and legacy picker', purpose: 'Share target and legacy selection styling across Database and Veterans while callers own data and dialogs.', states: ['empty', 'target-selected', 'legacy-selected', 'shared-legacy', 'target-only', 'mobile-stack'], accessibility: 'Labeled choose, change and clear buttons; focus restoration after legacy selection.', status: 'review' },
    { id: 'support-picker', name: 'Support card picker', purpose: 'Search and filter support cards by type and rarity while retaining real card identity.', states: ['default', 'selected', 'filtered', 'empty'], accessibility: 'Labeled filters and radio semantics expose title, character, type, rarity, and selection.', status: 'review' },
    { id: 'distance-selector', name: 'Distance selector', purpose: 'Choose Sprint, Mile, Medium, Long, or Dirt in full and compact layouts.', states: ['full', 'compact', 'selected'], accessibility: 'Every colored distance mark retains a text label and pressed state.', status: 'review' },
    { id: 'spark-editor', name: 'Spark editor', purpose: 'Edit inheritance star levels without diverging from the approved spark display.', states: ['blue', 'pink', 'green', 'white', 'main', 'p2', 'disabled'], accessibility: 'A named star control and remove action expose the complete factor change.', status: 'review' },
    { id: 'timeline-card', name: 'Timeline event card', purpose: 'Present event type, schedule, banner, rewards, pickups, race context, and planner action.', states: ['media', 'no-media', 'rewards', 'pickups', 'planned', 'predicted'], accessibility: 'A named details action, semantic time, reward labels, pickup alt text, and pressed planner action expose all content.', status: 'review' },
    { id: 'leaderboard-row', name: 'Community ranking row', purpose: 'Share compact rank, trend, identity, club, and comparison stats across community routes.', states: ['podium', 'standard', 'trend-up', 'trend-down', 'mobile-stack'], accessibility: 'Rank and trend remain textual while the row action is separately named.', status: 'review' },
    { id: 'connection', name: 'Workspace and connection', purpose: 'Make active data ownership and live client state explicit.', states: ['local', 'account', 'offline', 'connected', 'syncing', 'error'], accessibility: 'Text state never relies only on color.', status: 'review' }
  ]}
];

export const componentCount = uiRegistry.reduce((total, section) => total + section.entries.length, 0);
