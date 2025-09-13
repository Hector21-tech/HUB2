/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/modules/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
    // shadcn/ui components
    './src/components/ui/**/*.{js,ts,jsx,tsx}',
  ],
  
  safelist: [
    // Layout & Display
    'grid', 'inline-grid', 'flex', 'inline-flex', 'hidden', 'block', 'inline-block',
    'items-center', 'items-start', 'items-end', 'justify-center', 'justify-between', 'justify-start', 'justify-end',
    'flex-col', 'flex-row', 'flex-wrap',
    'min-h-screen', 'h-full', 'w-full',
    
    // Spacing
    'space-x-4', 'space-y-0', 'space-y-2', 'space-y-4',
    'gap-4', 'gap-6',
    
    // Borders & Rounded
    'border', 'border-b', 'border-t', 'border-l', 'border-r',
    'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl',
    
    // Shadows
    'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg',
    'hover:shadow', 'hover:shadow-md', 'hover:shadow-lg',
    
    // Typography
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
    'font-medium', 'font-semibold', 'font-bold',
    'tracking-tight', 'leading-tight',
    'text-center', 'text-left', 'text-right',
    
    // Colors - Basic
    'bg-white', 'bg-black', 'text-white', 'text-black',
    'bg-transparent', 'text-transparent',
    
    // CSS Variables (shadcn/ui)
    'bg-background', 'text-foreground',
    'bg-card', 'text-card-foreground',
    'bg-primary', 'text-primary-foreground',
    'bg-secondary', 'text-secondary-foreground',
    'bg-muted', 'text-muted-foreground',
    'bg-accent', 'text-accent-foreground',
    'bg-destructive', 'text-destructive-foreground',
    'bg-popover', 'text-popover-foreground',
    'border-border', 'border-input',
    'ring-ring',
    
    // Transitions
    'transition', 'transition-all', 'transition-colors',
    'duration-150', 'duration-200', 'duration-300',
    'ease-in-out', 'ease-out',
    
    // Hover states
    'hover:bg-accent', 'hover:text-accent-foreground',
    'hover:bg-muted', 'hover:text-muted-foreground',
    'hover:bg-secondary', 'hover:text-secondary-foreground',
    
    // Specific component classes
    'ml-auto', 'mr-auto',
    'pb-2', 'pt-2', 'px-4', 'py-2',
    'p-4', 'p-6', 'p-8',
    'mb-2', 'mb-4', 'mt-2', 'mt-4',
    'h-16', 'h-auto',
    'col-span-full',
    
    // Grid patterns - only valid combinations
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-12',
    'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-4',
    'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-6',
    
    // Column span
    'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-full',
    
    // Common spacing patterns used in components
    { pattern: /^(p|px|py|pt|pb|pl|pr)-(0|1|2|3|4|5|6|8)$/ },
    { pattern: /^(m|mx|my|mt|mb|ml|mr)-(0|1|2|3|4|5|6|8|auto)$/ },
  ],

  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}