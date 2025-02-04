module.exports = {
	darkMode: ["class"],
	content: ["./src/**/*.{js,jsx,ts,tsx}", "app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "./node_modules/tailwindcss-animate/**/*.{js,ts}"],
	theme: {
	  extend: {
		colors: {
		  "notion-bg": "#ffffff",
		  "notion-text": "#37352f",
		  "notion-gray": "#f7f6f3",
		  "notion-gray-dark": "#ebeae8",
		  "notion-orange": "#ff9500",
		  "notion-orange-dark": "#e68500",
		  "notion-text-light": "#6b6b6b",
		  "notion-dark": "#191919",
		  "notion-text-dark": "#d3d3d3",
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  }
  
  