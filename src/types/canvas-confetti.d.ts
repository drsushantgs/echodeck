declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    // ...add more options as needed
  }
  function confetti(options?: ConfettiOptions): void;
  export default confetti;
}