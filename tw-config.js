/* Twinter Labs design tokens for Tailwind CDN. Load right AFTER <script src="https://cdn.tailwindcss.com"></script> */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper: '#F6F8F7',   // page background
        card:  '#FFFFFF',   // cards, inputs, nav
        ink:   '#1E2A2E',   // headings, primary buttons
        ink2:  '#3F4E53',   // body text
        muted: '#5F6F74',   // secondary text (AA on white/paper)
        line:  '#DFE7E4',   // borders, dividers
        mint:  { DEFAULT: '#82D4BB', soft: '#E6F6F0', deep: '#2A7059' },
        sage:  { DEFAULT: '#82C09A', soft: '#E8F3EC', deep: '#3C7A54' },
        sea:   { DEFAULT: '#82AC9F', soft: '#E9F0ED' },
        fog:   { DEFAULT: '#829298' },
        mauve: { DEFAULT: '#94778B', soft: '#F2ECF0', deep: '#6F5468' }
      },
      fontFamily: {
        sans:    ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        mono:    ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30,42,46,.04), 0 8px 24px -12px rgba(30,42,46,.14)',
        lift: '0 2px 4px rgba(30,42,46,.05), 0 18px 40px -18px rgba(30,42,46,.22)'
      }
    }
  }
};
