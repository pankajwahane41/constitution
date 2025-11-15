// Coin Animation Utilities
// Helper functions for triggering coin animations

export const triggerCoinAnimation = (amount: number, sourceElement?: HTMLElement) => {
  if ((window as any).triggerCoinAnimation) {
    (window as any).triggerCoinAnimation(amount, sourceElement);
  }
};

export const triggerCoinAnimationFromButton = (event: React.MouseEvent, amount: number) => {
  const button = event.currentTarget as HTMLElement;
  triggerCoinAnimation(amount, button);
};

export const triggerCoinAnimationFromPosition = (x: number, y: number, amount: number) => {
  const mockElement = {
    getBoundingClientRect: () => ({
      left: x,
      top: y,
      right: x,
      bottom: y,
      width: 0,
      height: 0
    })
  } as HTMLElement;
  
  triggerCoinAnimation(amount, mockElement);
};