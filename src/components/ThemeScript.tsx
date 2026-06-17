// Server Component — renders an inline <script> in the SSR HTML.
// React 19 supports <script> with `dangerouslySetInnerHTML` in Server Components.
// This runs before hydration, preventing theme flash (FOUC).

const themeScript = `
(function(){
  try {
    var s = localStorage.getItem('theme');
    var d = window.matchMedia('(prefers-color-scheme:dark)').matches;
    var t = s || (d ? 'dark' : 'light');
    document.documentElement.classList.toggle('light', t === 'light');
    document.documentElement.classList.toggle('dark', t === 'dark');
  } catch(e){}
})();
`;

export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
