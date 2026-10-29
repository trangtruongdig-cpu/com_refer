import animate from 'tailwindcss-animate';
import type { Config } from 'tailwindcss';

/* Màu, font, bóng, hoạ tiết đều trỏ về biến của src/styles/phoenix-theme.css
   (copy từ repo khiemnguyendinh/phoenix-skills). Không viết mã màu trực tiếp
   ở đây: đổi nhận diện chỉ sửa một chỗ. */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        phoenix: {
          navy: 'var(--navy)',
          'navy-900': 'var(--navy-900)',
          purple: 'var(--blue)',
          'purple-700': 'var(--blue-700)',
          lavender: 'var(--cyan)',
          'lavender-200': 'var(--blue-200)',
          'lavender-50': 'var(--blue-50)',
          yellow: 'var(--yellow)',
          'yellow-600': 'var(--yellow-600)',
          ink: 'var(--ink)',
          slate: 'var(--slate-700)',
          muted: 'var(--slate-500)',
          line: 'var(--line)',
          surface: 'var(--surface-1)',
          panel: 'var(--surface-2)',
          sunken: 'var(--surface-sunken)',
          'success-bg': 'var(--success-bg)',
          'success-fg': 'var(--success-fg)',
          'warning-bg': 'var(--warning-bg)',
          'warning-fg': 'var(--warning-fg)',
          'danger-bg': 'var(--danger-bg)',
          'danger-fg': 'var(--danger-fg)',
          'info-bg': 'var(--info-bg)',
          'info-fg': 'var(--info-fg)',
        },
      },
      fontFamily: {
        sans: ['Google Sans Flex', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
        display: ['Google Sans Flex', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
        serif: ['Rokkitt', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '24px',
        '2xl': '36px',
      },
      boxShadow: {
        'phoenix-sm': 'var(--shadow-sm)',
        'phoenix-md': 'var(--shadow-md)',
        'phoenix-lg': 'var(--shadow-lg)',
        'phoenix-purple': 'var(--shadow-blue)',
      },
      backgroundImage: {
        'grad-brand': 'var(--grad-brand)',
        'grad-brand-soft': 'var(--grad-brand-soft)',
        'grad-circle': 'var(--grad-circle)',
        'grad-spark': 'var(--grad-spark)',
        'grad-night': 'var(--grad-night)',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
