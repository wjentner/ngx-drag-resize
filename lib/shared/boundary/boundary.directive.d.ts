import { Boundary } from './boundary';
import * as i0 from "@angular/core";
/**
 * The directive is used to work with boundary area for HTML element
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @internal
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
export declare class BoundaryDirective {
    private readonly windowObject?;
    private readonly documentObject?;
    /**
     * CSS selector or HTML element
     */
    protected boundary: string | HTMLElement | Window | null;
    constructor(windowObject?: Window | undefined, documentObject?: Document | undefined);
    /**
     * Get boundary position based on {@link boundary}
     */
    protected getBoundary(): Boundary | null;
    /**
     * Resolves HTML element based on {@link boundary}
     */
    protected resolveBoundaryElement(): Element | Window | null;
    /**
     * Returns positional value based on boundary position
     */
    protected basedOnBoundary(value: number, position: 'left' | 'top'): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<BoundaryDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BoundaryDirective, "[ngxBoundary]", never, {}, {}, never, never, false, never>;
}
