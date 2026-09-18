import { mount } from 'svelte';
import App from './App.svelte';
import { initializeTheme } from './platform/theme';
import { initializeWorkspace } from './domain/workspaces/workspace-state';
import { initializeAuth } from './platform/auth/auth-state';
import './styles/global.css';

initializeTheme();
initializeWorkspace();
// The callback owns session verification; an old stored session must not race it.
if (location.pathname !== '/signin') void initializeAuth();

const target = document.getElementById('app');
if (!target) throw new Error('The application mount point is missing.');

mount(App, { target });
