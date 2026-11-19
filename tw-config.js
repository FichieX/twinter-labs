/* Twinter Labs design tokens for Tailwind CDN. Load right AFTER <script src="https://cdn.tailwindcss.com"></script> */
const twinterColors = {
  mint: { DEFAULT: '#157A6E', soft: '#E6F1EE', deep: '#105F56' },
  sage: { DEFAULT: '#499F68', soft: '#E9F3EC', deep: '#2F7048' },
  mauve: { DEFAULT: '#B4654A', soft: '#F6EAE5', deep: '#9A4E36' },
  fog: { DEFAULT: '#C2C5BB' },
};

tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF7',   // page background
        card:  '#FFFFFF',   // cards, inputs, nav
        ink:   '#1B2B28',   // headings, primary buttons
        ink2:  '#3E4B47',   // body text
        muted: '#5A6662',   // secondary text (AA on white/paper)
        line:  '#E3E5DE',   // borders, dividers
        mint: twinterColors.mint,
        sage: twinterColors.sage,
        sea:   { DEFAULT: '#77B28C', soft: '#EEF5F0' },
        fog: twinterColors.fog,
        mauve: twinterColors.mauve,
        brand: twinterColors.mint,
        leaf: twinterColors.sage,
        clay: twinterColors.mauve,
        stone: twinterColors.fog
      },
      fontFamily: {
        sans:    ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        mono:    ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27,43,40,.04), 0 8px 24px -12px rgba(27,43,40,.14)',
        lift: '0 1px 2px rgba(27,43,40,.04), 0 8px 24px -12px rgba(27,43,40,.14)'
      }
    }
  }
};
