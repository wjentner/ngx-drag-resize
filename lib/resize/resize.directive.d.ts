import { AfterViewInit, ElementRef, EventEmitter, OnDestroy, Renderer2 } from '@angular/core';
import { BoundaryDirective } from '../shared/boundary/boundary.directive';
import { Axis } from '../core/axis';
import { PositionType } from './position-type';
import { NgxResize } from './resize';
import { DragService } from '../core/drag.service';
import * as i0 from "@angular/core";
/**
 * The directive that allows to resize HTML element on page
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
export declare class NgxResizeDirective extends BoundaryDirective implements AfterViewInit, OnDestroy {
    readonly elementRef: ElementRef<HTMLElement>;
    private readonly renderer;
    private readonly dragService;
    private readonly document;
    private readonly window;
    private readonly platformId;
    /**
     * Emits when directive was destroyed
     */
    private destroy$;
    /**
     * Emits next every time when behaviour for wheel event was changed
     */
    private wheelBehaviourChange$;
    /**
     * Emits next every time when behaviour for touches event was changed
     */
    private touchBehaviourChange$;
    /**
     * An array of observers which affect on resizable element
     */
    private observers;
    /**
     * A regular expression for keyboard code
     */
    private wheelInitiatorRegExp;
    /**
     * Make a resize unavailable by wheel
     */
    private isWheelDisabled;
    /**
     * Make a resize unavailable by touches
     */
    private isTouchesDisabled;
    /**
     * Minimal width in px
     */
    ngxResizeMinWidth: number;
    /**
     * Minimal height in px
     */
    ngxResizeMinHeight: number;
    /**
     * Aspect ratio the element will use during resize
     *
     * @example
     * 16/9 - 9/16 * 100 = 56.25
     * 1/1 - 1/1 * 100 = 100
     */
    ngxResizeAspectRatio: number;
    /**
     * Disables any resize events
     */
    ngxResizeDisabled: boolean;
    /**
     * Locks axis for the resize
     */
    ngxResizeLockAxis: Axis;
    /**
     * Constrain of the resizing area.
     * Can be as a HTMLElement or CSS selector.
     * You can put 'window' string to define window object as a constrain.
     */
    set ngxResizeBoundary(boundary: string | HTMLElement);
    /**
     * A regular expression that matches with keyboard key code.
     * When value is provided the element can be scaled by 'Key + wheel'.
     * If value not provided the element can be scaled just by 'wheel'.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
     */
    set ngxResizeWheelInitiatorRegExp(pattern: RegExp | string);
    /**
     * Disables resize by wheel.
     * By default is 'false'.
     */
    set ngxResizeWheelDisabled(disabled: boolean);
    /**
     * Enables inversion for wheel event
     */
    ngxResizeWheelInverse: boolean;
    /**
     * Disables resize by touches.
     * By default is 'false'.
     * Resize work by using two fingers.
     */
    set ngxResizeTouchesDisabled(disabled: boolean);
    /**
     * Position CSS style. Allows 'absolute' and 'fixed'. Default is 'absolute'.
     * Will be applied to host element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position
     */
    ngxResizePosition: PositionType;
    /**
     * Emits changes when element was resized
     */
    ngxResized: EventEmitter<NgxResize>;
    constructor(elementRef: ElementRef<HTMLElement>, renderer: Renderer2, dragService: DragService, document: Document, window: Window, platformId: object);
    /**
     * @inheritDoc
     */
    ngAfterViewInit(): void;
    /**
     * @inheritDoc
     */
    ngOnDestroy(): void;
    /**
     * Unsubscribe from the element dragging and remove it from an array of observable objects
     */
    unsubscribe(target: HTMLElement): void;
    /**
     * Observe the element dragging which will be as handle for resize
     */
    observe(target: HTMLElement): void;
    /**
     * Starts the subscription for touch events
     */
    private subscribeForTouchEvents;
    /**
     * Returns distance between two touches
     */
    private touchesDistance;
    /**
     * Make a subscription for wheel events
     */
    private subscribeForWheelEvent;
    /**
     * Runs initial resize for the host element
     */
    private initialResize;
    /**
     * Starts the calculation of scale event and changes host size
     */
    private onScale;
    /**
     * Check whether is resize is available for current initiator type
     */
    private canResize;
    /**
     * Starts the calculation of resize event and changes host size
     */
    private onResize;
    private topLeftMovement;
    private topRightMovement;
    private bottomRightMovement;
    private bottomLeftMovement;
    private topMovement;
    private rightMovement;
    private bottomMovement;
    private leftMovement;
    /**
     * Get position and size of width
     */
    private getWidthProportions;
    /**
     * Get position and size of height
     */
    private getHeightProportions;
    /**
     * Get width based on {@link ngxResizeAspectRatio} from height
     */
    private fromHeightProportion;
    /**
     * Get height based on {@link ngxResizeAspectRatio} from width
     */
    private fromWidthProportion;
    /**
     * Updates host element style
     */
    private updateHostStyle;
    /**
     * Resolves the type of handle HTML element
     */
    private resolveInitiatorType;
    /**
     * Emits resize event to the {@link ngxResized}
     */
    private emitResize;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxResizeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgxResizeDirective, "[ngxResize]", never, { "ngxResizeMinWidth": { "alias": "ngxResizeMinWidth"; "required": false; }; "ngxResizeMinHeight": { "alias": "ngxResizeMinHeight"; "required": false; }; "ngxResizeAspectRatio": { "alias": "ngxResizeAspectRatio"; "required": false; }; "ngxResizeDisabled": { "alias": "ngxResizeDisabled"; "required": false; }; "ngxResizeLockAxis": { "alias": "ngxResizeLockAxis"; "required": false; }; "ngxResizeBoundary": { "alias": "ngxResizeBoundary"; "required": false; }; "ngxResizeWheelInitiatorRegExp": { "alias": "ngxResizeWheelInitiatorRegExp"; "required": false; }; "ngxResizeWheelDisabled": { "alias": "ngxResizeWheelDisabled"; "required": false; }; "ngxResizeWheelInverse": { "alias": "ngxResizeWheelInverse"; "required": false; }; "ngxResizeTouchesDisabled": { "alias": "ngxResizeTouchesDisabled"; "required": false; }; "ngxResizePosition": { "alias": "ngxResizePosition"; "required": false; }; }, { "ngxResized": "ngxResized"; }, never, never, false, never>;
}
