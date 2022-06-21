/** @type {import('tailwindcss').Config} */
module.exports = {
	daisyui:{
		themes:false
	},
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	themes:false,
	theme: {
		extend: {
			// that is animation class
			animation: {
				fadeDeep: 'fade100 .5s ease-in-out',
				fadeShallow: 'fade50 .5s ease-in-out',
			},
			// that is actual animation
			keyframes: (theme) => ({
				fade50: {
					'0%': {
						backgroundColor: theme('colors.transparent'),
					},
					'100%': { backgroundColor: theme('colors.blue.50') },
				},
				fade100: {
					'0%': {
						backgroundColor: theme('colors.transparent'),
					},
					'100%': { backgroundColor: theme('colors.blue.100') },
				},
			}),
		},
	},
	plugins: [require("daisyui")],
}
