import { ElementRef, EventEmitter, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { BoundaryDirective } from '../shared/boundary/boundary.directive';
import { PositionStrategy } from './position-strategy';
import { Axis } from '../core/axis';
import { NgxDrag } from './drag';
import { DragService } from '../core/drag.service';
import * as i0 from "@angular/core";
/**
 * The directive that allows to drag HTML element on page
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
export declare class NgxDragDirective extends BoundaryDirective implements OnInit, OnDestroy {
    private readonly elementRef;
    private readonly renderer;
    private readonly dragService;
    private readonly window;
    private readonly document;
    private readonly platformId;
    /**
     * Initial size and position of host element
     */
    private hostElementRectInitial;
    /**
     * Emits when directive was destroyed
     */
    private destroy$;
    /**
     * Emits when observable target was changed
     */
    private observableTargetChange$;
    /**
     * Define positioning strategy.
     *
     * 'free' - position will changing by 'transform: translate3d()' style
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translate3d
     *
     * 'relative' - position will changing by 'top' and 'left' style
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position
     *
     * Default is 'free'.
     */
    ngxDragPositionStrategy: PositionStrategy;
    /**
     * Locks axis for the dragging
     */
    ngxDragLockAxis: Axis;
    /**
     * Disable any drag events
     */
    ngxDragDisabled: boolean;
    /**
     * Constrain for the dragging element.
     * Can be as a HTMLElement or CSS selector.
     * You can put 'window' string to define window object as a constrain.
     */
    set ngxDragBoundary(boundary: string | HTMLElement);
    /**
     * Emits changes when element was dragged
     */
    ngxDragged: EventEmitter<NgxDrag>;
    constructor(elementRef: ElementRef<HTMLElement>, renderer: Renderer2, dragService: DragService, window: Window, document: Document, platformId: object);
    /**
     * @inheritDoc
     */
    ngOnInit(): void;
    /**
     * @inheritDoc
     */
    ngOnDestroy(): void;
    /**
     * Observe the element dragging which will be as handle for dragging
     */
    observe(target?: HTMLElement): void;
    /**
     * Update size and position of host element
     */
    private updateInitialRect;
    /**
     * Starts the calculation of drag event and changes host position
     */
    private onDrag;
    /**
     * Updates the host style
     */
    private updateHostStyle;
    /**
     * Emits drag event to the {@link ngxDragged}
     */
    private emitDrag;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxDragDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgxDragDirective, "[ngxDrag]", never, { "ngxDragPositionStrategy": { "alias": "ngxDragPositionStrategy"; "required": false; }; "ngxDragLockAxis": { "alias": "ngxDragLockAxis"; "required": false; }; "ngxDragDisabled": { "alias": "ngxDragDisabled"; "required": false; }; "ngxDragBoundary": { "alias": "ngxDragBoundary"; "required": false; }; }, { "ngxDragged": "ngxDragged"; }, never, never, false, never>;
}
