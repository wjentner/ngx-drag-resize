import { InjectionToken } from '@angular/core';
/**
 * A DI Token representing the window object.
 *
 * Note: might not be available in the Application Context when Application and Rendering
 * Contexts are not the same (e.g. when running the application in a Web Worker or Server).
 *
 * @internal
 */
export declare const WINDOW: InjectionToken<Window | null>;
