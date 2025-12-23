"use client";

export function WorldMapStyles() {
	return (
		<style
			dangerouslySetInnerHTML={{
				__html: `
      @keyframes marker-glow {
        0%, 100% {
          opacity: 0.3;
          filter: blur(0px);
        }
        50% {
          opacity: 0.8;
          filter: blur(2px);
        }
      }
      @keyframes marker-breathe {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
      }
      .marker-glow-ring {
        animation: marker-glow 2s ease-in-out infinite;
      }
      .marker-breathe {
        animation: marker-breathe 1.5s ease-in-out infinite;
      }
    `,
			}}
		/>
	);
}
