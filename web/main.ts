import { mount } from 'svelte';
import App from './App.svelte';
import { initializeTheme } from './platform/theme';
import './styles/global.css';

initializeTheme();

const target = document.getElementById('app');
if (!target) throw new Error('The application mount point is missing.');

mount(App, { target });
