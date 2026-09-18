export default import.meta.glob<string>('/src/assets/timeline-images/**/*.webp', { eager: true, query: '?url', import: 'default' });
