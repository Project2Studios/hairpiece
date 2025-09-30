// TypeScript declarations for Google Ad Placement API
declare global {
  interface Window {
    adsbygoogle: any[];
    adBreak: (config: AdBreakConfig) => void;
    adConfig: (config: AdConfigOptions) => void;
  }
}

interface AdBreakConfig {
  type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
  name: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adDismissed?: () => void;
  adViewed?: () => void;
  adBreakDone?: (placementInfo: any) => void;
  beforeReward?: (showAdFn: () => void) => void;
}

interface AdConfigOptions {
  preloadAdBreaks?: 'on' | 'off';
  sound?: 'on' | 'off';
  onReady?: () => void;
}

class AdService {
  private lastAdTime: number = 0;
  private readonly AD_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour in milliseconds
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    // Create a promise that resolves when ads are ready
    this.initializationPromise = new Promise((resolve) => {
      const checkAdConfig = () => {
        if (window.adConfig) {
          window.adConfig({
            preloadAdBreaks: 'on',
            sound: 'on',
            onReady: () => {
              this.isInitialized = true;
              console.log('[AdService] Initialized and ready');
              resolve();
            },
          });
        } else {
          // Retry after a short delay if adConfig not available yet
          setTimeout(checkAdConfig, 100);
        }
      };

      checkAdConfig();

      // Fallback timeout - resolve after 5 seconds even if not ready
      setTimeout(() => {
        if (!this.isInitialized) {
          console.log('[AdService] Initialization timeout, continuing without ads');
          resolve();
        }
      }, 5000);
    });
  }

  /**
   * Wait for ad service to be initialized
   */
  private async waitForInitialization(): Promise<boolean> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    return this.isInitialized && typeof window.adBreak === 'function';
  }

  /**
   * Check if enough time has passed since the last ad
   */
  private canShowAd(): boolean {
    const now = Date.now();
    const timeSinceLastAd = now - this.lastAdTime;
    return timeSinceLastAd >= this.AD_COOLDOWN_MS;
  }

  /**
   * Show placeholder video ad as fallback
   */
  private showPlaceholderAd(callbacks?: {
    onStart?: () => void;
    onComplete?: () => void;
    onDismissed?: () => void;
  }): Promise<void> {
    return new Promise((resolve) => {
      console.log('[AdService] Showing placeholder ad');
      callbacks?.onStart?.();

      // Auto-complete after 15 seconds
      const autoCompleteTimer = setTimeout(() => {
        console.log('[AdService] Placeholder ad auto-completed');
        callbacks?.onComplete?.();
        resolve();
      }, 15000); // 15 second placeholder

      // Allow early dismissal via global callback
      (window as any).__skipPlaceholderAd = () => {
        clearTimeout(autoCompleteTimer);
        console.log('[AdService] Placeholder ad skipped');
        callbacks?.onDismissed?.();
        resolve();
        delete (window as any).__skipPlaceholderAd;
      };
    });
  }

  /**
   * Show an interstitial ad during loading/waiting periods
   * Returns a promise that resolves when the ad is complete or fails
   */
  public async showLoadingAd(callbacks?: {
    onStart?: () => void;
    onComplete?: () => void;
    onDismissed?: () => void;
  }): Promise<void> {
    // Wait for initialization to complete
    const isReady = await this.waitForInitialization();

    // If ads not available, show placeholder instead
    if (!isReady) {
      console.log('[AdService] Ads not available, showing placeholder');
      return this.showPlaceholderAd(callbacks);
    }

    return new Promise((resolve) => {
      if (!this.canShowAd()) {
        console.log('[AdService] Ad cooldown active, skipping');
        resolve();
        return;
      }

      // Update last ad time
      this.lastAdTime = Date.now();

      console.log('[AdService] Attempting to show ad');

      // Trigger the ad
      window.adBreak({
        type: 'next',
        name: 'loading-ad',
        beforeAd: () => {
          console.log('[AdService] Ad starting');
          callbacks?.onStart?.();
        },
        afterAd: () => {
          console.log('[AdService] Ad completed');
          callbacks?.onComplete?.();
          resolve();
        },
        adDismissed: () => {
          console.log('[AdService] Ad dismissed');
          callbacks?.onDismissed?.();
          resolve();
        },
        adBreakDone: (placementInfo: any) => {
          console.log('[AdService] Ad break done', placementInfo);
          // Ensure promise resolves even if callbacks weren't called
          setTimeout(() => resolve(), 100);
        },
      });
    });
  }

  /**
   * Show a rewarded video ad (optional feature for premium benefits)
   */
  public async showRewardedAd(callbacks?: {
    onReward?: () => void;
    onDismissed?: () => void;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isInitialized || !window.adBreak) {
        console.log('[AdService] Rewarded ads not available');
        resolve(false);
        return;
      }

      let rewarded = false;

      window.adBreak({
        type: 'reward',
        name: 'reward-ad',
        beforeReward: (showAdFn) => {
          // User agreed to watch ad
          showAdFn();
        },
        adViewed: () => {
          console.log('[AdService] Rewarded ad viewed');
          rewarded = true;
          callbacks?.onReward?.();
          resolve(true);
        },
        adDismissed: () => {
          console.log('[AdService] Rewarded ad dismissed');
          callbacks?.onDismissed?.();
          resolve(rewarded);
        },
        adBreakDone: () => {
          setTimeout(() => resolve(rewarded), 100);
        },
      });
    });
  }

  /**
   * Check if the ad service is ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get time until next ad is available (in seconds)
   */
  public getTimeUntilNextAd(): number {
    if (this.lastAdTime === 0) return 0;

    const timeSinceLastAd = Date.now() - this.lastAdTime;
    const timeRemaining = this.AD_COOLDOWN_MS - timeSinceLastAd;

    return timeRemaining > 0 ? Math.ceil(timeRemaining / 1000) : 0;
  }
}

// Export singleton instance
export const adService = new AdService();