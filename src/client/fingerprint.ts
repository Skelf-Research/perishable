/**
 * Generate a client fingerprint based on various browser characteristics
 * This helps identify and track clients to prevent abuse
 */
export class Fingerprinter {
  private static entropyCollected: boolean = false;
  private static mouseMovements: Array<{x: number, y: number, time: number}> = [];
  private static keyPresses: Array<{key: string, time: number}> = [];
  private static startTime: number = Date.now();

  /**
   * Initialize entropy collection
   */
  public static initEntropyCollection(): void {
    // Only initialize once
    if (this.entropyCollected) return;
    
    // Listen for mouse movements
    document.addEventListener('mousemove', (e) => {
      this.mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      });
    });

    // Listen for key presses
    document.addEventListener('keydown', (e) => {
      this.keyPresses.push({
        key: e.key,
        time: Date.now()
      });
    });
  }

  /**
   * Check if sufficient entropy has been collected
   */
  public static hasSufficientEntropy(): boolean {
    const timeElapsed = Date.now() - this.startTime;
    const hasEnoughMovements = this.mouseMovements.length >= 10;
    const hasEnoughKeyPresses = this.keyPresses.length >= 3;
    const hasTimeElapsed = timeElapsed >= 5000; // 5 seconds
    
    return hasEnoughMovements || hasEnoughKeyPresses || hasTimeElapsed;
  }

  /**
   * Generate a comprehensive fingerprint of the client
   */
  public static async generate(): Promise<string> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return 'non-browser-environment';
    }

    // Wait for sufficient entropy if not already collected
    if (!this.entropyCollected) {
      await this.waitForEntropy();
    }

    const components = [
      this.getUserAgent(),
      this.getLanguage(),
      this.getTimezoneOffset(),
      this.getScreenInfo(),
      this.getPlugins(),
      this.getCanvasFingerprint(),
      this.getWebglFingerprint(),
      this.getEntropyData()
    ];
    
    // Join all components and create a hash
    const fingerprint = components.join('|');
    return this.simpleHash(fingerprint);
  }

  /**
   * Wait for sufficient entropy to be collected
   */
  private static async waitForEntropy(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.hasSufficientEntropy()) {
          this.entropyCollected = true;
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        this.entropyCollected = true;
        resolve();
      }, 30000);
    });
  }

  private static getUserAgent(): string {
    return navigator.userAgent || '';
  }

  private static getLanguage(): string {
    return navigator.language || '';
  }

  private static getTimezoneOffset(): string {
    return new Date().getTimezoneOffset().toString();
  }

  private static getScreenInfo(): string {
    return [
      screen.width,
      screen.height,
      screen.colorDepth,
      screen.pixelDepth
    ].join(',');
  }

  private static getPlugins(): string {
    // Note: Plugin detection may not be available in all browsers
    try {
      if (navigator.plugins) {
        return Array.from(navigator.plugins)
          .map(plugin => plugin.name)
          .join(',');
      }
    } catch (e) {
      // Ignore errors
    }
    return '';
  }

  private static getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Hello, world', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Hello, world', 4, 17);
        return canvas.toDataURL();
      }
    } catch (e) {
      // Ignore errors
    }
    return '';
  }

  private static getWebglFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && gl instanceof WebGLRenderingContext) {
        return gl.getParameter(gl.VERSION) + 
               gl.getParameter(gl.RENDERER) + 
               gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
      }
    } catch (e) {
      // Ignore errors
    }
    return '';
  }

  private static getEntropyData(): string {
    // Include mouse movement patterns
    const mousePattern = this.mouseMovements
      .slice(-20) // Last 20 movements
      .map(m => `${m.x},${m.y},${m.time}`)
      .join('|');
    
    // Include key press patterns
    const keyPattern = this.keyPresses
      .slice(-10) // Last 10 key presses
      .map(k => `${k.key},${k.time}`)
      .join('|');
    
    return `${mousePattern}|${keyPattern}`;
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}