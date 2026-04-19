/**
 * Synchronous theme bootstrap. Rendered as the first body child (inline
 * `<script dangerouslySetInnerHTML>`) so the `.dark` class lands on <html>
 * BEFORE first paint — no FOUC.
 *
 * Priority: stored preference (`localStorage.theme`) → OS preference →
 * hardcoded light fallback (so we never end up class-less when both reads
 * throw, e.g. locked-down contexts).
 *
 * The hand-rolled version is deliberate: `next-themes` v0.4's Provider
 * context didn't hydrate under Next 16 Turbopack during UC-12 development
 * (click-through to `setTheme` was a no-op; no init script was injected).
 * This is small, deterministic, and fully owned here.
 */
const BOOTSTRAP_PAYLOAD = `
(function(){
  var theme = 'light';
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      theme = stored;
    } else if (typeof window.matchMedia === 'function'
               && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  } catch (_) {}
  try {
    var cl = document.documentElement.classList;
    cl.remove('dark', 'light');
    cl.add(theme);
  } catch (_) {}
})();
`.trim();

export function ThemeBootstrapScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_PAYLOAD }} />;
}
