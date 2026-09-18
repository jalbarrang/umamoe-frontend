import type { UiRegistryEntry, UiRegistrySection } from '@/components/registry';

const contract = (id: string, name: string, purpose: string, states: string[]): UiRegistryEntry => ({
  id,
  name,
  purpose,
  states,
  accessibility: 'The Svelte port preserves native semantics, visible labels, keyboard access, and readable state text.',
  status: 'review'
});

export const hakurakuRegistry: UiRegistrySection[] = [
  {
    id: 'haku-foundation',
    title: 'Foundation and shared controls',
    description: 'The source navigation, Bootstrap-era controls, uploads, sharing, pagination, and page chrome.',
    entries: [
      contract('haku-site-nav', 'Site navigation', 'Compact brand navigation with active-route treatment.', ['desktop', 'mobile-wrap', 'active']),
      contract('haku-page-header', 'Page header and action bar', 'A restrained page title, subtitle, status, and local actions.', ['default', 'with-actions', 'mobile']),
      contract('haku-form-controls', 'Form controls', 'Text, search, number, select, checkbox, and switch controls.', ['default', 'focus', 'disabled', 'invalid']),
      contract('haku-tabs', 'Tab navigation', 'Bootstrap-shaped local page navigation with a clear active state.', ['default', 'active', 'overflow']),
      contract('haku-upload', 'RaceUploadZone', 'Drop or select multiple race JSON files.', ['default', 'hover', 'dragging', 'processing']),
      contract('haku-share-link', 'ShareLinkBox', 'Read-only share URL with a copy action.', ['ready', 'copied', 'error']),
      contract('haku-pagination', 'PaginationControls', 'Previous, numbered, and next page navigation.', ['first', 'middle', 'last', 'mobile']),
      contract('haku-feedback', 'Feedback states', 'Alerts, loading progress, empty states, and inline help.', ['info', 'success', 'warning', 'error', 'loading', 'empty'])
    ]
  },
  {
    id: 'haku-race-presenter',
    title: 'Race data presenter',
    description: 'RaceDataPresenter, CharaList, expandable runner dashboards, breakdown modal, labels, and graph framing.',
    entries: [
      contract('haku-race-presenter-shell', 'RaceDataPresenter', 'Upload state, action bar, summary, and result composition.', ['empty', 'loaded', 'loading']),
      contract('haku-chara-list', 'CharaList', 'Sortable dense runner table with expandable rows.', ['default', 'sorted', 'expanded', 'mobile']),
      contract('haku-chara-card', 'CharaCard', 'Transparent dashboard panels for one runner.', ['collapsed', 'expanded']),
      contract('haku-proper-labels', 'CharaProperLabels', 'Surface, distance, and strategy aptitude labels.', ['compact', 'complete']),
      contract('haku-skill-breakdown', 'SkillBreakdownModal', 'Skill activation and timing details.', ['open', 'filtering', 'empty']),
      contract('haku-race-graph', 'RaceGraph', 'Race-state chart with frame and runner context.', ['ready', 'zoomed', 'empty', 'error'])
    ]
  },
  {
    id: 'haku-replay',
    title: 'Race replay',
    description: 'The original replay toolbar, runner visibility, minimap, legend, toggles, timeline, tooltips, and clip maker.',
    entries: [
      contract('haku-race-replay', 'RaceReplay', 'Complete replay control and chart composition.', ['paused', 'playing', 'mobile']),
      contract('haku-runner-visibility', 'Runner visibility controls', 'Compact colored-dot buttons for showing runners.', ['shown', 'hidden', 'overflow']),
      contract('haku-course-minimap', 'CourseMinimap', 'Small straight/corner segment map over the chart.', ['start', 'corner', 'finish']),
      contract('haku-replay-toolbar', 'Replay toolbar', 'Track selector, viewport, navigation, and view controls.', ['default', 'wrapped']),
      contract('haku-toggle-defs', 'ToggleDefs', 'Auto-fit switches for chart overlays and race data.', ['on', 'off', 'disabled']),
      contract('haku-legend-item', 'LegendItem', 'Line and marker vocabulary for the replay chart.', ['line', 'marker', 'hidden']),
      contract('haku-replay-timeline', 'Replay timeline', 'Frame range, phase markers, and playback control.', ['scrubbing', 'playing', 'finished']),
      contract('haku-horse-tooltip', 'HorseTooltip', 'Frame-specific runner values in a compact tooltip.', ['visible', 'pinned']),
      contract('haku-info-hover', 'InfoHover', 'Small explanatory hover/focus disclosure.', ['rest', 'hover', 'focus']),
      contract('haku-clip-maker', 'ClipMaker', 'Start/end frame inputs and export action.', ['idle', 'editing', 'exporting'])
    ]
  },
  {
    id: 'haku-multi-race',
    title: 'Multi-Race analysis',
    description: 'Uploads, race management, selectors, HP/spurt tables, skill analysis, heatmaps, and distribution panels.',
    entries: [
      contract('haku-multi-upload', 'RaceUploadZone', 'Multi-file race ingestion control.', ['default', 'processing', 'error']),
      contract('haku-race-list', 'RaceListPanel', 'Loaded race list with metadata and removal.', ['populated', 'overflow', 'empty']),
      contract('haku-multi-stats', 'Summary statistics', 'Compact race, runner, and win-rate metric cards.', ['ready', 'loading']),
      contract('haku-portrait-select', 'PortraitSelect', 'Searchable character selector with portraits.', ['closed', 'open', 'selected']),
      contract('haku-team-sample-select', 'TeamSampleSelect', 'Team composition, style, win rate, and sample selector.', ['closed', 'open', 'selected']),
      contract('haku-synergy-select', 'SynergyEntitySelect', 'Entity selector for synergy analysis.', ['closed', 'open', 'selected']),
      contract('haku-analysis-table', 'Analysis table', 'Sortable win-rate rows with inline bars and placement.', ['sorted', 'expanded', 'empty']),
      contract('haku-hp-spurt', 'HpSpurtAnalysis', 'Survival and last-spurt analysis summary.', ['summary', 'filtered']),
      contract('haku-hp-spurt-detail', 'HpSpurtAnalysisDetail', 'Selected character HP/spurt breakdown.', ['ready', 'empty']),
      contract('haku-hp-spurt-table', 'HpSpurtTable', 'Dense per-character HP and spurt metrics.', ['sorted', 'filtered']),
      contract('haku-hp-distribution-modal', 'HpDistributionModal', 'Distribution detail table in an overlay.', ['open', 'sorted']),
      contract('haku-skill-analysis', 'SkillAnalysis', 'Skill search and expandable proc analysis.', ['searching', 'expanded', 'empty']),
      contract('haku-win-breakdown', 'WinBreakdownTable', 'Skill win breakdown by strategy.', ['ready', 'filtered']),
      contract('haku-serialized-breakdown', 'SerializedWinBreakdownTable', 'Compact serialized skill breakdown.', ['ready', 'compact']),
      contract('haku-double-proc', 'DoubleProcTable', 'Double-proc rate comparison.', ['ready', 'empty']),
      contract('haku-win-distributions', 'WinDistributionCharts', 'Character and strategy distribution dashboard.', ['overview', 'drilldown']),
      contract('haku-character-analysis', 'CharacterAnalysis', 'Character-level distribution composition.', ['overview', 'selected']),
      contract('haku-strategy-analysis', 'StrategyAnalysis', 'Strategy-level distribution composition.', ['overview', 'selected']),
      contract('haku-bubble-plot', 'BubblePlotPanel', 'Representation versus performance bubble plot.', ['ready', 'hover']),
      contract('haku-character-breakdown', 'CharacterBreakdownPanel', 'Character share and win breakdown.', ['ready', 'expanded']),
      contract('haku-saturation', 'SaturationPanel', 'Popularity saturation versus results.', ['ready', 'selected']),
      contract('haku-style-breakdown', 'StyleBreakdownPanel', 'Running-style representation and wins.', ['ready', 'selected']),
      contract('haku-style-reps', 'StyleRepsPanel', 'Representative characters for a strategy.', ['ready', 'selected']),
      contract('haku-style-team-composition', 'StyleTeamCompositionPanel', 'Team composition patterns for a strategy.', ['ready', 'selected']),
      contract('haku-support-card-panel', 'SupportCardPanel', 'Support-card usage and result comparison.', ['ready', 'sorted']),
      contract('haku-team-member-card', 'TeamMemberCard', 'Compact runner identity within team samples.', ['default', 'winner']),
      contract('haku-composition-section', 'CompositionSection', 'Grouped team-composition section.', ['default', 'collapsed']),
      contract('haku-representative-drilldown', 'RepresentativeDrilldown', 'Detailed sample exploration.', ['open', 'selected']),
      contract('haku-info-tooltip', 'InfoTooltip', 'Accessible explanation for analysis metrics.', ['hover', 'focus']),
      contract('haku-mobile-panel-dialog', 'MobilePanelExpandDialog', 'Full-screen mobile view for dense panels.', ['closed', 'open'])
    ]
  },
  {
    id: 'haku-uma-logs',
    title: 'UmaLogs',
    description: 'Overview panels, explorer and query tools, replay search, result rows, rankings, histograms, and detail modals.',
    entries: [
      contract('haku-umalogs-page', 'UmaLogsPage', 'Local tab shell and page-level analysis controls.', ['overview', 'explorer', 'queries', 'replays']),
      contract('haku-histogram', 'Histogram', 'SVG histogram with count/percent modes.', ['count', 'percent', 'empty']),
      contract('haku-fastest-uma', 'FastestUmaPanel', 'Fastest character comparison.', ['ready', 'empty']),
      contract('haku-true-skill', 'TrueSkillTeamPanel', 'Expandable TrueSkill team ranking.', ['collapsed', 'expanded']),
      contract('haku-explorer-selects', 'ExplorerSelects', 'Character, support, strategy, and threshold selectors.', ['default', 'searching', 'selected']),
      contract('haku-explorer-tab', 'ExplorerTab', 'Overview and drilldown table composition.', ['overview', 'drilldown']),
      contract('haku-query-tab', 'QueriesTab', 'UQL editor, actions, help, and output mode.', ['editing', 'running', 'error']),
      contract('haku-query-results', 'Query results', 'Typed result table and inline percentage bars.', ['table', 'json', 'empty']),
      contract('haku-replay-selects', 'ReplaySelects', 'Race and team search filters.', ['default', 'advanced']),
      contract('haku-replays-tab', 'ReplaysTab', 'Filter/result split view for saved replays.', ['results', 'loading', 'empty']),
      contract('haku-replay-result', 'ReplayResultDisplay', 'Winner, teams, ranks, time, and open action.', ['default', 'winner']),
      contract('haku-card-usage-modal', 'CardUsageModal', 'Support-card usage detail table.', ['open', 'sorted']),
      contract('haku-skills-strategy-modal', 'SkillsByStrategyModal', 'Skill usage grouped by running style.', ['open', 'filtered']),
      contract('haku-style-decks-modal', 'StyleDecksModal', 'Deck composition details by style.', ['open', 'filtered'])
    ]
  },
  {
    id: 'haku-veterans',
    title: 'Veterans',
    description: 'Filtering, Veteran cards, sorting, optimization, affinity selection, race planning, and spark probabilities.',
    entries: [
      contract('haku-veterans-page', 'VeteransPage', 'Upload, workspace tools, panels, and result-grid composition.', ['empty', 'loaded', 'filtered']),
      contract('haku-filter-toolbar', 'FilterToolbar', 'Search and factor-category filter controls.', ['default', 'active', 'mobile']),
      contract('haku-active-filters', 'ActiveFiltersList', 'Colored removable filter chips.', ['populated', 'empty']),
      contract('haku-veterans-sorter', 'VeteransSorter', 'Sort field and direction controls.', ['ascending', 'descending']),
      contract('haku-inline-filter', 'InlineFilterSelector', 'Searchable compact factor selector.', ['closed', 'open', 'selected']),
      contract('haku-veteran-card', 'VeteranCard', 'Portrait, rank, parents, factors, affinity, and races.', ['default', 'clickable', 'selected']),
      contract('haku-optimizer', 'OptimizerPanel', 'Parent-pair optimization inputs and results.', ['configuring', 'results', 'empty']),
      contract('haku-affinity-calculator', 'AffinityCalculatorPanel', 'Selectable lineage slots and affinity breakdown.', ['empty-slots', 'partial', 'complete']),
      contract('haku-race-planner', 'uma.moe RaceSchedule', 'Canonical responsive race schedule replacing the Hakuraku planner.', ['desktop-years', 'mobile-list', 'selected']),
      contract('haku-spark-proc', 'SparkProcModal', 'Spark probability cards and comparison modes.', ['open', 'base', 'boosted'])
    ]
  },
  {
    id: 'haku-page-patterns',
    title: 'Page patterns and overlays',
    description: 'The remaining Hakuraku pages plus its reusable modal, tooltip, table, and responsive layout vocabulary.',
    entries: [
      contract('haku-master-data', 'MasterDataPage', 'Dataset navigation, search, table, and JSON detail.', ['table', 'detail', 'empty']),
      contract('haku-inheritance-factors', 'InheritanceFactorsPage', 'Factor search, comparison, and reference table.', ['searching', 'results']),
      contract('haku-shop-refresh', 'ShopRefreshPage', 'Refresh outcome inputs and probability results.', ['editing', 'results']),
      contract('haku-notes', 'NotesPage', 'Saved notes list and editor.', ['empty', 'editing', 'saved']),
      contract('haku-auth', 'AuthPage', 'Sign-in form and validation.', ['default', 'submitting', 'error']),
      contract('haku-account', 'AccountPage', 'Account data, sessions, and actions.', ['ready', 'saving']),
      contract('haku-setup-guide', 'SetupGuidePage', 'Ordered setup instructions and status.', ['default', 'complete']),
      contract('haku-overlay-system', 'Modal and tooltip system', 'Source-shaped backdrop, dialog, close action, and tooltip.', ['open', 'mobile', 'focus'])
    ]
  }
];

export const hakurakuComponentCount = hakurakuRegistry.reduce((total, section) => total + section.entries.length, 0);

export const hakurakuNonVisualContracts = [
  'PageMeta - document metadata and structured page copy',
  'CharaList/columns - table column definitions',
  'VeteransLogic - filtering, affinity, and optimizer logic',
  'VeteransUIHelper - formatting and asset resolution helpers'
];
