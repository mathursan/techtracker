/**
 * Synchronous theme bootstrap. Rendered in <head> as an inline script so the
 * `.dark` class lands on <html> BEFORE first paint — no FOUC.
 *
 * Priority: stored preference (localStorage.theme) → OS preference.
 * Options: "light" | "dark" | (missing → follow system).
 *
 * The hand-rolled version is deliberate: `next-themes` v0.4 didn't hydrate
 * under Next 16 Turbopack during UC-12 development. The behaviour is small
 * and fully owned here.
 */
export function ThemeBootstrapScript() {
  const code = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var cl = document.documentElement.classList;
    cl.remove('dark', 'light');
    cl.add(theme);
  } catch (_) {}
})();
`.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
