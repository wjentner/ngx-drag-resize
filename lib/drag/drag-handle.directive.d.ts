import { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { NgxDragDirective } from './drag.directive';
import * as i0 from "@angular/core";
/**
 * The directive that allows to mark HTML element as handle of dragging element for {@link NgxDragDirective}
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
export declare class NgxDragHandleDirective implements AfterViewInit, OnDestroy {
    private readonly elementRef;
    private readonly dragDirective;
    private readonly platformId;
    constructor(elementRef: ElementRef<HTMLElement>, dragDirective: NgxDragDirective, platformId: object);
    /**
     * @inheritDoc
     */
    ngAfterViewInit(): void;
    /**
     * @inheritDoc
     */
    ngOnDestroy(): void;
    /**
     * Sets host element as observable point for {@link NgxDragDirective}
     */
    private observe;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxDragHandleDirective, [null, { optional: true; }, null]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgxDragHandleDirective, "[ngxDragHandle]", never, {}, {}, never, never, false, never>;
}
