export interface Preview {
  id: string;
  title: string;
  library: 'uma' | 'hakuraku';
  group: string;
  components: string[];
  route: string;
}

export const previews: Preview[] = [
  { id: 'button', title: 'Buttons & toggles', library: 'uma', group: 'Controls', components: ['components/Button.svelte', 'components/IconButton.svelte', 'components/ToggleButton.svelte', 'components/SegmentedControl.svelte'], route: '/database' },
  { id: 'text-field', title: 'Text, search & numbers', library: 'uma', group: 'Controls', components: ['components/TextField.svelte'], route: '/database' },
  { id: 'select', title: 'Select & autocomplete', library: 'uma', group: 'Controls', components: ['components/SelectField.svelte', 'components/SelectFieldSlim.svelte', 'components/Combobox.svelte'], route: '/database' },
  { id: 'choice', title: 'Checkboxes, radio & sliders', library: 'uma', group: 'Controls', components: ['components/Checkbox.svelte', 'components/RadioGroup.svelte', 'components/Slider.svelte'], route: '/settings' },
  { id: 'file', title: 'File upload', library: 'uma', group: 'Controls', components: ['components/FileDrop.svelte'], route: '/veterans' },
  { id: 'navigation', title: 'Tabs & pagination', library: 'uma', group: 'Navigation', components: ['components/Tabs.svelte', 'components/Pagination.svelte'], route: '/database' },
  { id: 'menu', title: 'Account menu & tooltips', library: 'uma', group: 'Navigation', components: ['components/Menu.svelte', 'components/Tooltip.svelte'], route: '/settings' },
  { id: 'table', title: 'Responsive data table', library: 'uma', group: 'Navigation', components: ['components/DataTable.svelte'], route: '/profile' },
  { id: 'feedback', title: 'Feedback & empty states', library: 'uma', group: 'Feedback', components: ['components/Banner.svelte', 'components/EmptyState.svelte', 'components/Spinner.svelte', 'components/ToastRegion.svelte'], route: '/veterans' },
  { id: 'dialog', title: 'Dialogs & disclosures', library: 'uma', group: 'Feedback', components: ['components/Dialog.svelte', 'components/Disclosure.svelte', 'components/InspectPopover.svelte'], route: '/timeline' },
  { id: 'page-layout', title: 'Page layout, ad rails & privacy', library: 'uma', group: 'Layouts', components: ['layouts/AppPage.svelte', 'layouts/PageFrame.svelte', 'layouts/StickyFooterAd.svelte', 'styles/privacy.css'], route: '/tools/statistics' },
  { id: 'race-dialogs', title: 'Race history & optimal races', library: 'uma', group: 'Game displays', components: ['pages/database/RaceResultsDialog.svelte', 'pages/database/OptimalRacesDialog.svelte', 'components/Dialog.svelte'], route: '/database' },
  { id: 'planner-goals', title: 'Pull planner goals', library: 'uma', group: 'Game displays', components: ['pages/carat-planner/PlannerTargetGoals.svelte'], route: '/timeline?tab=carat-planner' },
  { id: 'affinity-picker', title: 'Target & legacy picker', library: 'uma', group: 'Game displays', components: ['components/AffinityPicker.svelte', 'components/CharacterSelectDialog.svelte'], route: '/database' },
  { id: 'character-picker', title: 'Include / exclude Umas', library: 'uma', group: 'Game displays', components: ['components/IncludeExcludePicker.svelte', 'components/CharacterPicker.svelte'], route: '/veterans' },
  { id: 'support-picker', title: 'Support card picker', library: 'uma', group: 'Game displays', components: ['components/SupportCardPicker.svelte'], route: '/database' },
  { id: 'identity', title: 'Skills, sparks & stats', library: 'uma', group: 'Game displays', components: ['components/SkillChip.svelte', 'components/SparkRow.svelte', 'components/SparkItem.svelte', 'components/RankBadge.svelte', 'components/AptitudeGrid.svelte', 'components/StatStrip.svelte'], route: '/veterans' },
  { id: 'lineage', title: 'Lineage & affinity', library: 'uma', group: 'Game displays', components: ['components/LineageTree.svelte'], route: '/tools/lineage-planner' },
  { id: 'race-schedule', title: 'Race badges & schedule', library: 'uma', group: 'Game displays', components: ['components/RaceBadge.svelte', 'components/RaceSchedule.svelte'], route: '/tools/lineage-planner' },
  { id: 'timeline-card', title: 'Timeline events', library: 'uma', group: 'Game displays', components: ['components/TimelineEventCard.svelte'], route: '/timeline' },
  { id: 'circle-card', title: 'Club ranking & profile', library: 'uma', group: 'Game displays', components: ['components/CircleCard.svelte'], route: '/circles' },
  { id: 'veteran-card', title: 'Veteran collection card', library: 'hakuraku', group: 'Veterans', components: ['pages/profile/ProfileVeteranCard.svelte', 'pages/profile/ProfileVeteranIdentity.svelte', 'pages/profile/ProfileVeteranAffinity.svelte'], route: '/veterans' },
  { id: 'veteran-spark-matcher', title: 'Spark rules & operators', library: 'hakuraku', group: 'Veterans', components: ['pages/profile/ProfileVeteranSparkMatcher.svelte', 'components/Slider.svelte'], route: '/database' },
  { id: 'veteran-summary', title: 'Veteran detail summary', library: 'hakuraku', group: 'Veterans', components: ['components/VeteranSummary.svelte'], route: '/database' },
  { id: 'statistics-filters', title: 'Statistics filters', library: 'hakuraku', group: 'Statistics', components: ['pages/statistics/StatisticsFilterControls.svelte'], route: '/tools/statistics' },
  { id: 'statistics-ranking', title: 'Statistics rankings', library: 'hakuraku', group: 'Statistics', components: ['pages/statistics/StatisticsRanking.svelte', 'components/MetricBar.svelte'], route: '/tools/statistics' },
  { id: 'statistics-deck-matrix', title: 'Deck composition', library: 'hakuraku', group: 'Statistics', components: ['pages/statistics/StatisticsDeckMatrix.svelte'], route: '/tools/statistics' },
  { id: 'statistics-chart', title: 'Statistics charts', library: 'hakuraku', group: 'Statistics', components: ['pages/statistics/StatisticsChartPanel.svelte', 'components/ChartFrame.svelte'], route: '/tools/statistics' }
];
