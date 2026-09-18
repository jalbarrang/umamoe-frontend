import pages from '../../src/seo-pages.json';
import { routeDefinitionForPath } from './router/route-manifest';

interface SeoPage { title: string; description: string; index?: boolean; schema?: Record<string, unknown>[]; }
export function applyRouteMetadata(pathname: string): void {
  const path = pathname.replace(/\/+$/, '') || '/';
  const route = routeDefinitionForPath(path);
  const page: SeoPage = (pages as Record<string, SeoPage>)[path] ?? {
    title: `${route?.title ?? 'uma.moe'} | uma.moe`,
    description: path.startsWith('/profile/') ? 'View an Uma Musume Global trainer profile, inheritance characters, rankings, and fan history.' : path.startsWith('/circles/') ? 'View an Uma Musume Global club profile, member roster, fan progression, and activity.' : 'Uma Musume Global database and planning tools.',
    index: !/^\/(signin|settings|login|veterans|ui|ui-lab|activity)(\/|$)/.test(path) && !/^\/profile\/[^/]+\/(achievements|titles)$/.test(path) && Boolean(route)
  };
  const canonical = `https://uma.moe${path}`;
  const title = document.title || page.title;
  const upsert = (selector: string, create: () => HTMLElement) => {
    const elements = [...document.head.querySelectorAll<HTMLElement>(selector)];
    const element = elements.shift() ?? document.head.appendChild(create());
    elements.forEach(duplicate => duplicate.remove());
    return element;
  };
  for (const [attribute, key, content] of [
    ['name', 'description', page.description], ['name', 'robots', page.index === false ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'],
    ['property', 'og:title', title], ['property', 'og:description', page.description], ['property', 'og:type', 'website'], ['property', 'og:url', canonical], ['property', 'og:site_name', 'uma.moe'], ['property', 'og:image', 'https://uma.moe/assets/logo.webp'],
    ['name', 'twitter:card', 'summary'], ['name', 'twitter:title', title], ['name', 'twitter:description', page.description], ['name', 'twitter:image', 'https://uma.moe/assets/logo.webp']
  ]) {
    const element = upsert(`meta[${attribute}="${key}"]`, () => document.createElement('meta'));
    element.setAttribute(attribute!, key!); element.setAttribute('content', content!);
  }
  const link = upsert('link[rel="canonical"]', () => document.createElement('link'));
  link.setAttribute('rel', 'canonical'); link.setAttribute('href', canonical);
  document.getElementById('page-structured-data')?.remove();
  if (page.index === false) return;
  const graph: Record<string, unknown>[] = [{ '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description: page.description, isPartOf: { '@id': 'https://uma.moe/#website' } }, ...(page.schema ?? [])];
  if (path !== '/') graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'uma.moe', item: 'https://uma.moe/' }, { '@type': 'ListItem', position: 2, name: title, item: canonical }] });
  const schema = document.createElement('script'); schema.id = 'page-structured-data'; schema.type = 'application/ld+json'; schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }); document.head.append(schema);
}
