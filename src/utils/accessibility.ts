/**
 * Screen Reader Announcements Utility
 * Provides accessible announcements for dynamic content changes
 */

class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private announcer: HTMLElement;

  private constructor() {
    this.createAnnouncer();
  }

  static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer();
    }
    return ScreenReaderAnnouncer.instance;
  }

  private createAnnouncer(): void {
    // Create screen reader only announcer element
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'assertive');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    this.announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    
    document.body.appendChild(this.announcer);
  }

  /**
   * Announce message to screen readers
   * @param message - Message to announce
   * @param priority - 'polite' for non-urgent, 'assertive' for urgent
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'assertive'): void {
    if (!message?.trim()) return;

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;

    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 100);
  }

  /**
   * Announce quiz progress
   */
  announceQuizProgress(currentQuestion: number, totalQuestions: number, isCorrect?: boolean): void {
    let message = `Question ${currentQuestion} of ${totalQuestions}`;
    if (isCorrect !== undefined) {
      message += `. ${isCorrect ? 'Correct answer' : 'Incorrect answer'}`;
    }
    this.announce(message, 'polite');
  }

  /**
   * Announce game state changes
   */
  announceGameState(state: string, details?: string): void {
    let message = state;
    if (details) {
      message += `. ${details}`;
    }
    this.announce(message, 'assertive');
  }

  /**
   * Announce constitution builder progress
   */
  announceBuilderProgress(articlesPlaced: number, totalArticles: number, sectionCompleted?: string): void {
    let message = `${articlesPlaced} of ${totalArticles} articles placed`;
    if (sectionCompleted) {
      message += `. ${sectionCompleted} section completed`;
    }
    this.announce(message, 'polite');
  }
}

export const screenReader = ScreenReaderAnnouncer.getInstance();

/**
 * Hook for screen reader announcements in React components
 */
export function useScreenReader() {
  const announcer = ScreenReaderAnnouncer.getInstance();

  return {
    announce: (message: string, priority?: 'polite' | 'assertive') => 
      announcer.announce(message, priority),
    announceQuizProgress: (current: number, total: number, isCorrect?: boolean) =>
      announcer.announceQuizProgress(current, total, isCorrect),
    announceGameState: (state: string, details?: string) =>
      announcer.announceGameState(state, details),
    announceBuilderProgress: (placed: number, total: number, completed?: string) =>
      announcer.announceBuilderProgress(placed, total, completed)
  };
}