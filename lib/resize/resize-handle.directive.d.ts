import { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { NgxResizeHandleType } from './resize-handle-type.enum';
import { NgxResizeDirective } from './resize.directive';
import * as i0 from "@angular/core";
/**
 * The directive that allows to mark HTML element as one of handle of resizing element for {@link NgxResizeDirective}
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
export declare class NgxResizeHandleDirective implements AfterViewInit, OnDestroy {
    private readonly elementRef;
    private readonly platformId;
    private readonly resizeDirective;
    /**
     * Sets the attribute which define the side the HTML element will affect during drag
     */
    type: NgxResizeHandleType | null;
    constructor(elementRef: ElementRef<HTMLElement>, platformId: object, resizeDirective: NgxResizeDirective);
    /**
     * @inheritDoc
     */
    ngAfterViewInit(): void;
    /**
     * @inheritDoc
     */
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxResizeHandleDirective, [null, null, { optional: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgxResizeHandleDirective, "[ngxResizeHandle]", never, { "type": { "alias": "ngxResizeHandle"; "required": false; }; }, {}, never, never, false, never>;
}
