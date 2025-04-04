/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        floating: "floating 3s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out infinite",
        zoom: "zoom 1.5s ease-in-out infinite",
        rotate: "rotate 3s linear infinite",
        bounceSlow: "bounceSlow 5s ease-in-out forwards",
        heartbeat: "heartbeat 1.5s ease-in-out infinite",
        fadeIn: "fadeIn 2s ease-in-out forwards",
        fadeOut: "fadeOut 2s ease-in-out forwards",
        pulseFast: "pulseFast 0.5s ease-in-out infinite",
        flip: "flip 3s ease-in-out forwards",
        swing: "swing 2s ease-in-out infinite",
        wobble: "wobble 1.5s ease-in-out infinite",
        neonGlow: "neonGlow 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        floating: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "50%": { transform: "translateX(5px)" },
          "75%": { transform: "translateX(-5px)" },
        },
        zoom: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(360deg)" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "10%": { transform: "translateY(-8px)" },  // Lowered height
          "20%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-6px)" },  // Lowered height
          "40%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },  // Lowered height
          "60%": { transform: "translateY(0)" },
          "70%": { transform: "translateY(-3px)" },  // Lowered height
          "80%": { transform: "translateY(0)" },
          "90%": { transform: "translateY(-2px)" },  // Lowered height
          "100%": { transform: "translateY(0)" },
        },
        
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        pulseFast: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(1080deg)" },
        },
        swing: {
          "0%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(15deg)" },
          "50%": { transform: "rotate(-15deg)" },
          "75%": { transform: "rotate(10deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        wobble: {
          "0%": { transform: "translateX(0)" },
          "15%": { transform: "translateX(-10px) rotate(-5deg)" },
          "30%": { transform: "translateX(10px) rotate(5deg)" },
          "45%": { transform: "translateX(-10px) rotate(-3deg)" },
          "60%": { transform: "translateX(10px) rotate(3deg)" },
          "75%": { transform: "translateX(-5px) rotate(-2deg)" },
          "100%": { transform: "translateX(0)" },
        },
        neonGlow: {
          "0%": { textShadow: "0 0 5px #39ff14, 0 0 10px #39ff14, 0 0 15px #39ff14" },
          "100%": { textShadow: "0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14" },
        },
      },
    },
  },
  plugins: [],
};
