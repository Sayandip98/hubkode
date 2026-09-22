import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        surface: {
          primary: "#0d1117",
          secondary: "#161b22",
          tertiary: "#21262d",
          overlay: "#30363d",
        },
        border: {
          default: "#30363d",
          muted: "#21262d",
          emphasis: "#6e7681",
        },
        text: {
          primary: "#e6edf3",
          secondary: "#8b949e",
          muted: "#6e7681",
          link: "#58a6ff",
          danger: "#f85149",
          success: "#3fb950",
          warning: "#d29922",
        },
        accent: {
          blue: "#58a6ff",
          green: "#3fb950",
          red: "#f85149",
          yellow: "#d29922",
          orange: "#db6d28",
          purple: "#bc8cff",
          pink: "#ff7b72",
        },
        gh: {
          canvas: "#0d1117",
          canvasSubtle: "#161b22",
          canvasInset: "#010409",
          borderDefault: "#30363d",
          borderMuted: "#21262d",
          neutral: {
            muted: "rgba(110,118,129,0.4)",
            subtle: "rgba(110,118,129,0.1)",
          },
          attention: {
            muted: "rgba(187,128,9,0.15)",
            subtle: "rgba(187,128,9,0.1)",
          },
          success: {
            muted: "rgba(46,160,67,0.15)",
            subtle: "rgba(46,160,67,0.1)",
          },
          danger: {
            muted: "rgba(248,81,73,0.15)",
            subtle: "rgba(248,81,73,0.1)",
          },
          done: {
            muted: "rgba(163,113,247,0.15)",
            subtle: "rgba(163,113,247,0.1)",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Cascadia Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        overlay: "0 16px 32px rgba(1,4,9,0.85), 0 0 0 1px rgba(48,54,61,0.5)",
        card: "0 1px 0 rgba(48,54,61,0.5)",
        btn: "0 1px 0 rgba(31,35,40,0.1)",
        "btn-primary":
          "0 1px 0 rgba(255,255,255,0.1) inset, 0 1px 0 rgba(31,35,40,0.1)",
        input:
          "inset 0 1px 0 rgba(208,215,222,0.05), 0 0 0 1px rgba(48,54,61,0.8)",
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-in-out",
        "slide-down": "slideDown 0.15s ease-out",
        "slide-up": "slideUp 0.15s ease-out",
        "scale-in": "scaleIn 0.1s ease-out",
        shimmer: "shimmer 1.5s infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      typography: (theme) => ({
        invert: {
          css: {
            "--tw-prose-body": theme("colors.text.primary"),
            "--tw-prose-headings": theme("colors.text.primary"),
            "--tw-prose-links": theme("colors.text.link"),
            "--tw-prose-bold": theme("colors.text.primary"),
            "--tw-prose-counters": theme("colors.text.secondary"),
            "--tw-prose-bullets": theme("colors.text.secondary"),
            "--tw-prose-hr": theme("colors.border.default"),
            "--tw-prose-quotes": theme("colors.text.secondary"),
            "--tw-prose-quote-borders": theme("colors.border.emphasis"),
            "--tw-prose-captions": theme("colors.text.muted"),
            "--tw-prose-code": theme("colors.accent.pink"),
            "--tw-prose-pre-code": theme("colors.text.primary"),
            "--tw-prose-pre-bg": theme("colors.surface.tertiary"),
            "--tw-prose-th-borders": theme("colors.border.default"),
            "--tw-prose-td-borders": theme("colors.border.muted"),
          },
        },
      }),
      screens: {
        xs: "475px",
      },
      gridTemplateColumns: {
        sidebar: "240px 1fr",
        "sidebar-lg": "280px 1fr",
        repo: "1fr 296px",
      },
    },
  },
  plugins: [typography],
};
