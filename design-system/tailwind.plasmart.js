/**
 * Plasmart "Signal" — Tailwind preset.
 * Usage:  module.exports = { presets: [require('./tailwind.plasmart')], ... }
 * Still link design-system/styles.css (or tokens/*.css) for fonts, grain/glow
 * helpers and the base reset; this preset only exposes the tokens to Tailwind.
 * Dark is the ONLY theme — do not add a light variant.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#08090b', 'bg-2': '#0d0f13', panel: '#111419',
        ink: '#eef0f3', muted: '#8a8f99', faint: '#4f545d',
        accent: '#6e7bff', 'accent-soft': 'rgba(110,123,255,.6)', 'accent-12': 'rgba(110,123,255,.12)',
        hairline: 'rgba(255,255,255,.10)', 'hairline-strong': 'rgba(255,255,255,.20)',
        wa: '#25d366',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(44px, 9vw, 150px)', { lineHeight: '.94', letterSpacing: '-.04em' }],
        display: ['clamp(44px, 11vw, 200px)', { lineHeight: '.94', letterSpacing: '-.05em' }],
        h1: ['clamp(34px, 5.6vw, 88px)', { lineHeight: '.98', letterSpacing: '-.035em' }],
        h2: ['clamp(30px, 4vw, 62px)', { lineHeight: '.98', letterSpacing: '-.03em' }],
        h3: ['clamp(28px, 3.4vw, 52px)', { lineHeight: '1.12', letterSpacing: '-.03em' }],
        stat: ['clamp(40px, 6vw, 90px)', { lineHeight: '.94', letterSpacing: '-.04em' }],
        lead: ['clamp(17px, 1.5vw, 21px)', { lineHeight: '1.6' }],
        body: ['17px', { lineHeight: '1.55', letterSpacing: '-.01em' }],
        'body-sm': ['15px', { lineHeight: '1.55' }],
        xs: ['14px', { lineHeight: '1.5' }],
        mono: ['12px', { letterSpacing: '.1em' }],
        'mono-sm': ['11px', { letterSpacing: '.22em' }],
        'mono-lg': ['13px', { letterSpacing: '.1em' }],
      },
      letterSpacing: { mega: '-.05em', hero: '-.04em', tight: '-.035em', snug: '-.03em', body: '-.01em', label: '.1em', kicker: '.22em' },
      borderRadius: { xs: '2px', sm: '4px', md: '6px', pill: '100px' },
      maxWidth: { content: '1480px' },
      spacing: { pad: 'clamp(20px, 4.5vw, 80px)', section: 'clamp(80px, 13vh, 180px)', 'section-lg': 'clamp(120px, 22vh, 280px)' },
      boxShadow: {
        glow: '0 0 12px rgba(110,123,255,.6)',
        'glow-sm': '0 0 8px rgba(110,123,255,.6)',
        nav: '0 10px 30px rgba(0,0,0,.35)',
        pop: '0 24px 60px rgba(0,0,0,.5)',
      },
      transitionTimingFunction: { signal: 'cubic-bezier(.19, 1, .22, 1)', 'signal-out': 'cubic-bezier(.16, 1, .3, 1)' },
      transitionDuration: { fast: '250ms', base: '350ms', slow: '550ms', panel: '800ms' },
      backdropBlurr: { glass: '12px' },
    },
  },
};
