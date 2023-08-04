import { Directive, EventEmitter, HostBinding, Inject, Input, Output, PLATFORM_ID, } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { DOCUMENT, isPlatformServer } from '@angular/common';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BoundaryDirective } from '../shared/boundary/boundary.directive';
import { WINDOW } from '../core/window.token';
import { NgxResizeHandleType } from './resize-handle-type.enum';
import * as i0 from "@angular/core";
import * as i1 from "../core/drag.service";
/**
 * The directive that allows to resize HTML element on page
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
class NgxResizeDirective extends BoundaryDirective {
    elementRef;
    renderer;
    dragService;
    document;
    window;
    platformId;
    /**
     * Emits when directive was destroyed
     */
    destroy$ = new Subject();
    /**
     * Emits next every time when behaviour for wheel event was changed
     */
    wheelBehaviourChange$ = new Subject();
    /**
     * Emits next every time when behaviour for touches event was changed
     */
    touchBehaviourChange$ = new Subject();
    /**
     * An array of observers which affect on resizable element
     */
    observers = [];
    /**
     * A regular expression for keyboard code
     */
    wheelInitiatorRegExp = null;
    /**
     * Make a resize unavailable by wheel
     */
    isWheelDisabled = false;
    /**
     * Make a resize unavailable by touches
     */
    isTouchesDisabled = false;
    /**
     * Minimal width in px
     */
    ngxResizeMinWidth = 0;
    /**
     * Minimal height in px
     */
    ngxResizeMinHeight = 0;
    /**
     * Aspect ratio the element will use during resize
     *
     * @example
     * 16/9 - 9/16 * 100 = 56.25
     * 1/1 - 1/1 * 100 = 100
     */
    ngxResizeAspectRatio = 0;
    /**
     * Disables any resize events
     */
    ngxResizeDisabled = false;
    /**
     * Locks axis for the resize
     */
    ngxResizeLockAxis = null;
    /**
     * Constrain of the resizing area.
     * Can be as a HTMLElement or CSS selector.
     * You can put 'window' string to define window object as a constrain.
     */
    set ngxResizeBoundary(boundary) {
        this.boundary = boundary;
    }
    /**
     * A regular expression that matches with keyboard key code.
     * When value is provided the element can be scaled by 'Key + wheel'.
     * If value not provided the element can be scaled just by 'wheel'.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
     */
    set ngxResizeWheelInitiatorRegExp(pattern) {
        if (!pattern) {
            this.wheelInitiatorRegExp = null;
            this.subscribeForWheelEvent();
            return;
        }
        this.wheelInitiatorRegExp = new RegExp(pattern);
        this.subscribeForWheelEvent();
    }
    /**
     * Disables resize by wheel.
     * By default is 'false'.
     */
    set ngxResizeWheelDisabled(disabled) {
        this.isWheelDisabled = disabled;
        this.subscribeForWheelEvent();
    }
    /**
     * Enables inversion for wheel event
     */
    ngxResizeWheelInverse = false;
    /**
     * Disables resize by touches.
     * By default is 'false'.
     * Resize work by using two fingers.
     */
    set ngxResizeTouchesDisabled(disabled) {
        this.isTouchesDisabled = disabled;
        this.subscribeForTouchEvents();
    }
    /**
     * Position CSS style. Allows 'absolute' and 'fixed'. Default is 'absolute'.
     * Will be applied to host element.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position
     */
    ngxResizePosition = 'absolute';
    /**
     * Emits changes when element was resized
     */
    ngxResized = new EventEmitter();
    constructor(elementRef, renderer, dragService, document, window, platformId) {
        super(window, document);
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.dragService = dragService;
        this.document = document;
        this.window = window;
        this.platformId = platformId;
    }
    /**
     * @inheritDoc
     */
    ngAfterViewInit() {
        if (isPlatformServer(this.platformId)) {
            return;
        }
        this.initialResize();
        this.subscribeForWheelEvent();
        this.subscribeForTouchEvents();
    }
    /**
     * @inheritDoc
     */
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.wheelBehaviourChange$.complete();
        this.touchBehaviourChange$.complete();
    }
    /**
     * Unsubscribe from the element dragging and remove it from an array of observable objects
     */
    unsubscribe(target) {
        const indexOf = this.observers.findIndex((item) => item.element === target);
        if (indexOf < 0) {
            return;
        }
        this.observers[indexOf].subscription.unsubscribe();
        this.observers.splice(indexOf, 1);
    }
    /**
     * Observe the element dragging which will be as handle for resize
     */
    observe(target) {
        if (!this.resolveInitiatorType(target)) {
            return;
        }
        let hostElementRect = this.elementRef.nativeElement.getBoundingClientRect();
        let eventInitial = null;
        const subscription$ = this.dragService
            .fromElement(target)
            .pipe(tap((event) => event.nativeEvent.preventDefault()), tap((event) => event.nativeEvent.stopImmediatePropagation()), map((event) => {
            if (!eventInitial ||
                eventInitial.x !== event.initial.x ||
                eventInitial.y !== event.initial.y) {
                eventInitial = event.initial;
                hostElementRect = this.elementRef.nativeElement.getBoundingClientRect();
            }
            const offsetFromHost = {
                top: event.initial.y - hostElementRect.top,
                left: event.initial.x - hostElementRect.left,
                bottom: hostElementRect.bottom - event.initial.y,
                right: hostElementRect.right - event.initial.x,
            };
            return {
                ...event,
                initiator: target,
                offsetFromHost,
                initial: event.initial,
                nativeEvent: event.nativeEvent,
            };
        }), tap(this.onResize.bind(this)), takeUntil(this.destroy$))
            .subscribe();
        this.observers.push({ subscription: subscription$, element: target });
    }
    /**
     * Starts the subscription for touch events
     */
    subscribeForTouchEvents() {
        this.touchBehaviourChange$.next(true);
        if (this.isTouchesDisabled || isPlatformServer(this.platformId)) {
            return;
        }
        let prevDistance = 0;
        const touchStart$ = fromEvent(this.elementRef.nativeElement, 'touchstart').pipe(filter((event) => event.targetTouches.length === 2));
        const touchEnd$ = fromEvent(this.elementRef.nativeElement, 'touchend');
        const touchMove$ = fromEvent(this.elementRef.nativeElement, 'touchmove', {
            passive: false,
        }).pipe(tap((event) => event.preventDefault()), filter((event) => event.targetTouches.length === 2 && event.changedTouches.length === 2));
        touchStart$
            .pipe(tap((event) => {
            const aTouch = event.targetTouches.item(0);
            const bTouch = event.targetTouches.item(1);
            if (!aTouch || !bTouch) {
                return;
            }
            prevDistance = this.touchesDistance(aTouch, bTouch);
        }), switchMap(() => touchMove$.pipe(tap((event) => {
            const aTouch = event.targetTouches.item(0);
            const bTouch = event.targetTouches.item(1);
            if (!aTouch || !bTouch) {
                return;
            }
            const distance = this.touchesDistance(aTouch, bTouch);
            this.onScale({ delta: distance - prevDistance }, event);
            prevDistance = distance;
        }), takeUntil(touchEnd$))), takeUntil(this.destroy$), takeUntil(this.touchBehaviourChange$))
            .subscribe();
    }
    /**
     * Returns distance between two touches
     */
    touchesDistance(a, b) {
        return Math.sqrt(Math.pow(b.clientX - a.clientX, 2) + Math.pow(b.clientY - a.clientY, 2));
    }
    /**
     * Make a subscription for wheel events
     */
    subscribeForWheelEvent() {
        this.wheelBehaviourChange$.next(true);
        if (this.isWheelDisabled || isPlatformServer(this.platformId)) {
            return;
        }
        const wheel$ = fromEvent(this.elementRef.nativeElement, 'wheel').pipe(tap((event) => event.preventDefault()), tap((event) => {
            const delta = this.ngxResizeWheelInverse ? event.deltaY : event.deltaY * -1;
            this.onScale({ delta }, event);
        }), takeUntil(this.wheelBehaviourChange$), takeUntil(this.destroy$));
        if (!this.wheelInitiatorRegExp) {
            wheel$.subscribe();
            return;
        }
        const wheelInitiatorFilter = filter((event) => this.wheelInitiatorRegExp ? this.wheelInitiatorRegExp.test(event.code) : true);
        const wheelInitiatorStart$ = fromEvent(this.window, 'keydown').pipe(wheelInitiatorFilter);
        const wheelInitiatorEnd$ = fromEvent(this.window, 'keyup').pipe(wheelInitiatorFilter);
        wheelInitiatorStart$
            .pipe(switchMap(() => wheel$.pipe(takeUntil(wheelInitiatorEnd$))), takeUntil(this.wheelBehaviourChange$), takeUntil(this.destroy$))
            .subscribe();
    }
    /**
     * Runs initial resize for the host element
     */
    initialResize() {
        setTimeout(() => {
            this.onScale({ delta: 0 });
        });
    }
    /**
     * Starts the calculation of scale event and changes host size
     */
    onScale(scale, nativeEvent) {
        const hostElementRect = this.elementRef.nativeElement.getBoundingClientRect();
        const boundaryRect = this.getBoundary();
        let maxUpscale = scale.delta;
        if (boundaryRect) {
            maxUpscale = Math.floor(Math.min(hostElementRect.top - boundaryRect.top, boundaryRect.right - hostElementRect.right, boundaryRect.bottom - hostElementRect.bottom, hostElementRect.left - boundaryRect.left));
        }
        const maxDownscale = Math.max(0, Math.min(hostElementRect.width - this.ngxResizeMinWidth, hostElementRect.height - this.ngxResizeMinHeight)) * -1;
        const delta = Math.max(maxDownscale, Math.min(maxUpscale, scale.delta));
        let top = hostElementRect.top - delta / 2;
        let left = hostElementRect.left - delta / 2;
        if (boundaryRect) {
            top = Math.max(boundaryRect.top, top);
            left = Math.max(boundaryRect.left, left);
        }
        let height = hostElementRect.height + delta;
        let width = hostElementRect.width + delta;
        if (boundaryRect) {
            height = Math.min(boundaryRect.bottom - top, height);
            width = Math.min(boundaryRect.right - left, width);
        }
        if (this.ngxResizeLockAxis === 'x') {
            left = hostElementRect.left;
            width = hostElementRect.width;
        }
        if (this.ngxResizeLockAxis === 'y') {
            top = hostElementRect.top;
            height = hostElementRect.height;
        }
        const proportionalSize = this.ngxResizeLockAxis === 'y'
            ? this.fromWidthProportion(width)
            : this.fromHeightProportion(height);
        if (proportionalSize && this.ngxResizeLockAxis === 'y') {
            height = proportionalSize;
            top = hostElementRect.top - (height - hostElementRect.height) / 2;
        }
        if (proportionalSize && this.ngxResizeLockAxis !== 'y') {
            width = proportionalSize;
            left = hostElementRect.left - (width - hostElementRect.width) / 2;
        }
        if (boundaryRect &&
            (top <= boundaryRect.top ||
                top + height >= boundaryRect.bottom ||
                left <= boundaryRect.left ||
                left + width >= boundaryRect.right)) {
            top = hostElementRect.top;
            height = hostElementRect.height;
            left = hostElementRect.left;
            width = hostElementRect.width;
        }
        this.updateHostStyle('left', `${this.basedOnBoundary(left, 'left')}px`);
        this.updateHostStyle('width', `${width}px`);
        this.updateHostStyle('top', `${this.basedOnBoundary(top, 'top')}px`);
        this.updateHostStyle('height', `${height}px`);
        this.emitResize(nativeEvent);
    }
    /**
     * Check whether is resize is available for current initiator type
     */
    canResize(initiatorType) {
        switch (initiatorType) {
            case NgxResizeHandleType.TopLeft:
            case NgxResizeHandleType.TopRight:
            case NgxResizeHandleType.BottomLeft:
            case NgxResizeHandleType.BottomRight:
                return !this.ngxResizeLockAxis;
            case NgxResizeHandleType.Left:
            case NgxResizeHandleType.Right:
                return this.ngxResizeLockAxis !== 'x';
            case NgxResizeHandleType.Top:
            case NgxResizeHandleType.Bottom:
                return this.ngxResizeLockAxis !== 'y';
        }
        return !this.ngxResizeLockAxis;
    }
    /**
     * Starts the calculation of resize event and changes host size
     */
    onResize(event) {
        if (this.ngxResizeDisabled) {
            return;
        }
        const initiatorType = this.resolveInitiatorType(event.initiator);
        if (!initiatorType || !this.canResize(initiatorType)) {
            return;
        }
        const hostElementRect = this.elementRef.nativeElement.getBoundingClientRect();
        const boundaryRect = this.getBoundary();
        if (!boundaryRect) {
            return;
        }
        switch (initiatorType) {
            case NgxResizeHandleType.TopLeft:
                return this.topLeftMovement(event, hostElementRect, boundaryRect);
            case NgxResizeHandleType.Top:
                return this.topMovement(event, hostElementRect, boundaryRect);
            case NgxResizeHandleType.TopRight:
                return this.topRightMovement(event, hostElementRect, boundaryRect);
            case NgxResizeHandleType.Right:
                return this.rightMovement(event, hostElementRect, boundaryRect);
            case NgxResizeHandleType.BottomRight:
                return this.bottomRightMovement(event, hostElementRect, boundaryRect);
            case NgxResizeHandleType.Bottom:
                return this.bottomMovement(event, hostElementRect, boundaryRect);
            case NgxResizeHandleType.BottomLeft:
                return this.bottomLeftMovement(event, hostElementRect, boundaryRect);
            case NgxResizeHandleType.Left:
                return this.leftMovement(event, hostElementRect, boundaryRect);
        }
    }
    topLeftMovement(event, hostElementRect, boundaryRect) {
        if (this.ngxResizeAspectRatio) {
            this.topMovement(event, hostElementRect, boundaryRect);
            return;
        }
        this.topMovement(event, hostElementRect, boundaryRect);
        this.leftMovement(event, hostElementRect, boundaryRect);
    }
    topRightMovement(event, hostElementRect, boundaryRect) {
        if (this.ngxResizeAspectRatio) {
            this.topMovement(event, hostElementRect, boundaryRect);
            return;
        }
        this.topMovement(event, hostElementRect, boundaryRect);
        this.rightMovement(event, hostElementRect, boundaryRect);
    }
    bottomRightMovement(event, hostElementRect, boundaryRect) {
        if (this.ngxResizeAspectRatio) {
            this.bottomMovement(event, hostElementRect, boundaryRect);
            return;
        }
        this.bottomMovement(event, hostElementRect, boundaryRect);
        this.rightMovement(event, hostElementRect, boundaryRect);
    }
    bottomLeftMovement(event, hostElementRect, boundaryRect) {
        if (this.ngxResizeAspectRatio) {
            this.bottomMovement(event, hostElementRect, boundaryRect);
            return;
        }
        this.bottomMovement(event, hostElementRect, boundaryRect);
        this.leftMovement(event, hostElementRect, boundaryRect);
    }
    topMovement(event, hostElementRect, boundaryRect) {
        let y = event.y - event.offsetFromHost.top;
        if (boundaryRect) {
            y = Math.max(boundaryRect.top, Math.min(y, boundaryRect.bottom));
        }
        let top = Math.min(y, hostElementRect.bottom - this.ngxResizeMinHeight);
        let height = hostElementRect.height - (top - hostElementRect.top);
        const initiatorType = this.resolveInitiatorType(event.initiator);
        const widthProportions = initiatorType ? this.getWidthProportions(boundaryRect, hostElementRect, initiatorType, height) : null;
        if (widthProportions) {
            top = top + (height - this.fromWidthProportion(widthProportions.width));
            height = Math.min(height, this.fromWidthProportion(widthProportions.width));
        }
        this.updateHostStyle('top', `${this.basedOnBoundary(top, 'top')}px`);
        this.updateHostStyle('height', `${height}px`);
        if (widthProportions) {
            this.updateHostStyle('left', `${this.basedOnBoundary(widthProportions.left, 'left')}px`);
            this.updateHostStyle('width', `${widthProportions.width}px`);
        }
        this.emitResize(event.nativeEvent);
    }
    rightMovement(event, hostElementRect, boundaryRect) {
        let x = event.x + event.offsetFromHost.right;
        if (boundaryRect) {
            x = Math.max(boundaryRect.left, Math.min(x, boundaryRect.right));
        }
        let width = Math.max(this.ngxResizeMinWidth, x - hostElementRect.left);
        if (boundaryRect) {
            width = Math.min(width, boundaryRect.right - hostElementRect.left);
        }
        const initiatorType = this.resolveInitiatorType(event.initiator);
        const heightProportions = initiatorType ? this.getHeightProportions(boundaryRect, hostElementRect, initiatorType, width) : null;
        if (heightProportions) {
            width = Math.min(width, this.fromHeightProportion(heightProportions.height));
        }
        this.updateHostStyle('width', `${width}px`);
        if (heightProportions) {
            this.updateHostStyle('top', `${this.basedOnBoundary(heightProportions.top, 'top')}px`);
            this.updateHostStyle('height', `${heightProportions.height}px`);
        }
        this.emitResize(event.nativeEvent);
    }
    bottomMovement(event, hostElementRect, boundaryRect) {
        let y = event.y + event.offsetFromHost.bottom;
        if (boundaryRect) {
            y = Math.max(boundaryRect.top, Math.min(y, boundaryRect.bottom));
        }
        let height = Math.max(this.ngxResizeMinHeight, y - hostElementRect.top);
        if (boundaryRect) {
            height = Math.min(height, boundaryRect.bottom - hostElementRect.top);
        }
        const initiatorType = this.resolveInitiatorType(event.initiator);
        const widthProportions = initiatorType ? this.getWidthProportions(boundaryRect, hostElementRect, initiatorType, height) : null;
        if (widthProportions) {
            height = Math.min(height, this.fromWidthProportion(widthProportions.width));
        }
        this.updateHostStyle('height', `${height}px`);
        if (widthProportions) {
            this.updateHostStyle('left', `${this.basedOnBoundary(widthProportions.left, 'left')}px`);
            this.updateHostStyle('width', `${widthProportions.width}px`);
        }
        this.emitResize(event.nativeEvent);
    }
    leftMovement(event, hostElementRect, boundaryRect) {
        let x = event.x - event.offsetFromHost.left;
        if (boundaryRect) {
            x = Math.max(boundaryRect.left, Math.min(x, boundaryRect.right));
        }
        let left = Math.min(x, hostElementRect.right - this.ngxResizeMinWidth);
        let width = hostElementRect.width - (left - hostElementRect.left);
        const initiatorType = this.resolveInitiatorType(event.initiator);
        const heightProportions = initiatorType ? this.getHeightProportions(boundaryRect, hostElementRect, initiatorType, width) : null;
        if (heightProportions) {
            left = left + (width - this.fromHeightProportion(heightProportions.height));
            width = Math.min(width, this.fromHeightProportion(heightProportions.height));
        }
        this.updateHostStyle('left', `${this.basedOnBoundary(left, 'left')}px`);
        this.updateHostStyle('width', `${width}px`);
        if (heightProportions) {
            this.updateHostStyle('top', `${this.basedOnBoundary(heightProportions.top, 'top')}px`);
            this.updateHostStyle('height', `${heightProportions.height}px`);
        }
        this.emitResize(event.nativeEvent);
    }
    /**
     * Get position and size of width
     */
    getWidthProportions(boundaryRect, hostElementRect, type, height) {
        let width = this.fromHeightProportion(height);
        if (!width) {
            return null;
        }
        if (type !== NgxResizeHandleType.TopLeft && type !== NgxResizeHandleType.BottomLeft) {
            width = boundaryRect ? Math.min(width, boundaryRect.right - hostElementRect.left) : width;
        }
        if (type !== NgxResizeHandleType.TopRight && type !== NgxResizeHandleType.BottomRight) {
            width = boundaryRect ? Math.min(width, hostElementRect.right - boundaryRect.left) : width;
        }
        let left = hostElementRect.left;
        if (type === NgxResizeHandleType.TopLeft || type === NgxResizeHandleType.BottomLeft) {
            left = left - (width - hostElementRect.width);
        }
        if (type === NgxResizeHandleType.Top || type === NgxResizeHandleType.Bottom) {
            left = left - (width - hostElementRect.width) / 2;
        }
        return { left, width };
    }
    /**
     * Get position and size of height
     */
    getHeightProportions(boundaryRect, hostElementRect, type, width) {
        let height = this.fromWidthProportion(width);
        if (!height) {
            return null;
        }
        if (type !== NgxResizeHandleType.TopLeft && type !== NgxResizeHandleType.TopRight) {
            height = boundaryRect ? Math.min(height, boundaryRect.bottom - hostElementRect.top) : height;
        }
        if (type !== NgxResizeHandleType.BottomLeft && type !== NgxResizeHandleType.BottomRight) {
            height = boundaryRect ? Math.min(height, hostElementRect.bottom - boundaryRect.top) : height;
        }
        let top = hostElementRect.top;
        if (type === NgxResizeHandleType.TopLeft || type === NgxResizeHandleType.TopRight) {
            top = top - (height - hostElementRect.height);
        }
        if (type === NgxResizeHandleType.Left || type === NgxResizeHandleType.Right) {
            top = top - (height - hostElementRect.height) / 2;
        }
        return { top, height };
    }
    /**
     * Get width based on {@link ngxResizeAspectRatio} from height
     */
    fromHeightProportion(height) {
        return !this.ngxResizeAspectRatio ? 0 : Math.floor((height / this.ngxResizeAspectRatio) * 100);
    }
    /**
     * Get height based on {@link ngxResizeAspectRatio} from width
     */
    fromWidthProportion(width) {
        return !this.ngxResizeAspectRatio ? 0 : Math.floor((width * this.ngxResizeAspectRatio) / 100);
    }
    /**
     * Updates host element style
     */
    updateHostStyle(style, value) {
        this.renderer.setStyle(this.elementRef.nativeElement, style, value);
    }
    /**
     * Resolves the type of handle HTML element
     */
    resolveInitiatorType(initiator) {
        return initiator.getAttribute('data-ngx-resize-handle-type');
    }
    /**
     * Emits resize event to the {@link ngxResized}
     */
    emitResize(nativeEvent) {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const parentRect = this.elementRef.nativeElement.parentElement?.getBoundingClientRect();
        this.ngxResized.emit({
            // nativeEvent,
            parentRect,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
        });
    }
    static ɵfac = function NgxResizeDirective_Factory(t) { return new (t || NgxResizeDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.Renderer2), i0.ɵɵdirectiveInject(i1.DragService), i0.ɵɵdirectiveInject(DOCUMENT), i0.ɵɵdirectiveInject(WINDOW), i0.ɵɵdirectiveInject(PLATFORM_ID)); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NgxResizeDirective, selectors: [["", "ngxResize", ""]], hostVars: 2, hostBindings: function NgxResizeDirective_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵstyleProp("position", ctx.ngxResizePosition);
        } }, inputs: { ngxResizeMinWidth: "ngxResizeMinWidth", ngxResizeMinHeight: "ngxResizeMinHeight", ngxResizeAspectRatio: "ngxResizeAspectRatio", ngxResizeDisabled: "ngxResizeDisabled", ngxResizeLockAxis: "ngxResizeLockAxis", ngxResizeBoundary: "ngxResizeBoundary", ngxResizeWheelInitiatorRegExp: "ngxResizeWheelInitiatorRegExp", ngxResizeWheelDisabled: "ngxResizeWheelDisabled", ngxResizeWheelInverse: "ngxResizeWheelInverse", ngxResizeTouchesDisabled: "ngxResizeTouchesDisabled", ngxResizePosition: "ngxResizePosition" }, outputs: { ngxResized: "ngxResized" }, features: [i0.ɵɵInheritDefinitionFeature] });
}
export { NgxResizeDirective };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxResizeDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxResize]',
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i1.DragService }, { type: Document, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: Window, decorators: [{
                type: Inject,
                args: [WINDOW]
            }] }, { type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }]; }, { ngxResizeMinWidth: [{
            type: Input
        }], ngxResizeMinHeight: [{
            type: Input
        }], ngxResizeAspectRatio: [{
            type: Input
        }], ngxResizeDisabled: [{
            type: Input
        }], ngxResizeLockAxis: [{
            type: Input
        }], ngxResizeBoundary: [{
            type: Input
        }], ngxResizeWheelInitiatorRegExp: [{
            type: Input
        }], ngxResizeWheelDisabled: [{
            type: Input
        }], ngxResizeWheelInverse: [{
            type: Input
        }], ngxResizeTouchesDisabled: [{
            type: Input
        }], ngxResizePosition: [{
            type: HostBinding,
            args: ['style.position']
        }, {
            type: Input
        }], ngxResized: [{
            type: Output
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1kcmFnLXJlc2l6ZS9zcmMvbGliL3Jlc2l6ZS9yZXNpemUuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxTQUFTLEVBRVQsWUFBWSxFQUNaLFdBQVcsRUFDWCxNQUFNLEVBQ04sS0FBSyxFQUVMLE1BQU0sRUFDTixXQUFXLEdBRVosTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQWdCLE1BQU0sTUFBTSxDQUFDO0FBQ3hELE9BQU8sRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBS3hFLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQU01QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQzs7O0FBRTlEOzs7Ozs7O0dBT0c7QUFDSCxNQUdhLGtCQUFtQixTQUFRLGlCQUFpQjtJQXFJNUM7SUFDUTtJQUNBO0lBQ2tCO0lBQ0Y7SUFDSztJQXhJeEM7O09BRUc7SUFDSyxRQUFRLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUVqQzs7T0FFRztJQUNLLHFCQUFxQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7SUFFOUM7O09BRUc7SUFDSyxxQkFBcUIsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBRTlDOztPQUVHO0lBQ0ssU0FBUyxHQUEyRCxFQUFFLENBQUM7SUFFL0U7O09BRUc7SUFDSyxvQkFBb0IsR0FBa0IsSUFBSSxDQUFDO0lB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LENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUscUJBQXFCLEVBQUUsQ0FBQTtRQUV2RixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztZQUNuQixlQUFlO1lBQ2YsVUFBVTtZQUNWLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ2hCLENBQUMsQ0FBQztJQUNMLENBQUM7NEVBeHhCVSxrQkFBa0Isc0lBd0luQixRQUFRLHdCQUNSLE1BQU0sd0JBQ04sV0FBVzs2REExSVYsa0JBQWtCOzs7O1NBQWxCLGtCQUFrQjt1RkFBbEIsa0JBQWtCO2NBSDlCLFNBQVM7ZUFBQztnQkFDVCxRQUFRLEVBQUUsYUFBYTthQUN4Qjs7c0JBeUlJLE1BQU07dUJBQUMsUUFBUTs7c0JBQ2YsTUFBTTt1QkFBQyxNQUFNOztzQkFDYixNQUFNO3VCQUFDLFdBQVc7d0JBbEdaLGlCQUFpQjtrQkFBekIsS0FBSztZQUtHLGtCQUFrQjtrQkFBMUIsS0FBSztZQVNHLG9CQUFvQjtrQkFBNUIsS0FBSztZQUtHLGlCQUFpQjtrQkFBekIsS0FBSztZQUtHLGlCQUFpQjtrQkFBekIsS0FBSztZQU9PLGlCQUFpQjtrQkFBN0IsS0FBSztZQVdPLDZCQUE2QjtrQkFBekMsS0FBSztZQWVPLHNCQUFzQjtrQkFBbEMsS0FBSztZQVFHLHFCQUFxQjtrQkFBN0IsS0FBSztZQU9PLHdCQUF3QjtrQkFBcEMsS0FBSztZQWFOLGlCQUFpQjtrQkFGaEIsV0FBVzttQkFBQyxnQkFBZ0I7O2tCQUM1QixLQUFLO1lBTUksVUFBVTtrQkFBbkIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBEaXJlY3RpdmUsXHJcbiAgRWxlbWVudFJlZixcclxuICBFdmVudEVtaXR0ZXIsXHJcbiAgSG9zdEJpbmRpbmcsXHJcbiAgSW5qZWN0LFxyXG4gIElucHV0LFxyXG4gIE9uRGVzdHJveSxcclxuICBPdXRwdXQsXHJcbiAgUExBVEZPUk1fSUQsXHJcbiAgUmVuZGVyZXIyLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBmcm9tRXZlbnQsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBET0NVTUVOVCwgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IGZpbHRlciwgbWFwLCBzd2l0Y2hNYXAsIHRha2VVbnRpbCwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge0JvdW5kYXJ5RGlyZWN0aXZlfSBmcm9tICcuLi9zaGFyZWQvYm91bmRhcnkvYm91bmRhcnkuZGlyZWN0aXZlJztcclxuaW1wb3J0IHtBeGlzfSBmcm9tICcuLi9jb3JlL2F4aXMnO1xyXG5pbXBvcnQge1Bvc2l0aW9uVHlwZX0gZnJvbSAnLi9wb3NpdGlvbi10eXBlJztcclxuaW1wb3J0IHtOZ3hSZXNpemV9IGZyb20gJy4vcmVzaXplJztcclxuaW1wb3J0IHtEcmFnU2VydmljZX0gZnJvbSAnLi4vY29yZS9kcmFnLnNlcnZpY2UnO1xyXG5pbXBvcnQge1dJTkRPV30gZnJvbSAnLi4vY29yZS93aW5kb3cudG9rZW4nO1xyXG5pbXBvcnQge01vdmVtZW50QmFzZX0gZnJvbSAnLi4vY29yZS9tb3ZlbWVudC9tb3ZlbWVudC1iYXNlJztcclxuaW1wb3J0IHtNb3ZlbWVudH0gZnJvbSAnLi4vY29yZS9tb3ZlbWVudC9tb3ZlbWVudCc7XHJcbmltcG9ydCB7UG9zaXRpb25CYXNlfSBmcm9tICcuLi9jb3JlL3Bvc2l0aW9uLWJhc2UnO1xyXG5pbXBvcnQge0JvdW5kYXJ5fSBmcm9tICcuLi9zaGFyZWQvYm91bmRhcnkvYm91bmRhcnknO1xyXG5pbXBvcnQge1NjYWxlfSBmcm9tICcuL3NjYWxlJztcclxuaW1wb3J0IHtOZ3hSZXNpemVIYW5kbGVUeXBlfSBmcm9tICcuL3Jlc2l6ZS1oYW5kbGUtdHlwZS5lbnVtJztcclxuXHJcbi8qKlxyXG4gKiBUaGUgZGlyZWN0aXZlIHRoYXQgYWxsb3dzIHRvIHJlc2l6ZSBIVE1MIGVsZW1lbnQgb24gcGFnZVxyXG4gKlxyXG4gKiBAYXV0aG9yIERteXRybyBQYXJmZW5vdiA8ZG1pdHJ5cGFyZmVub3Y5MzdAZ21haWwuY29tPlxyXG4gKlxyXG4gKiBAZHluYW1pY1xyXG4gKiBAc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9hbmd1bGFyLWNvbXBpbGVyLW9wdGlvbnMjc3RyaWN0bWV0YWRhdGFlbWl0XHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tuZ3hSZXNpemVdJyxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neFJlc2l6ZURpcmVjdGl2ZSBleHRlbmRzIEJvdW5kYXJ5RGlyZWN0aXZlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgLyoqXHJcbiAgICogRW1pdHMgd2hlbiBkaXJlY3RpdmUgd2FzIGRlc3Ryb3llZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZGVzdHJveSQgPSBuZXcgU3ViamVjdCgpO1xyXG5cclxuICAvKipcclxuICAgKiBFbWl0cyBuZXh0IGV2ZXJ5IHRpbWUgd2hlbiBiZWhhdmlvdXIgZm9yIHdoZWVsIGV2ZW50IHdhcyBjaGFuZ2VkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB3aGVlbEJlaGF2aW91ckNoYW5nZSQgPSBuZXcgU3ViamVjdCgpO1xyXG5cclxuICAvKipcclxuICAgKiBFbWl0cyBuZXh0IGV2ZXJ5IHRpbWUgd2hlbiBiZWhhdmlvdXIgZm9yIHRvdWNoZXMgZXZlbnQgd2FzIGNoYW5nZWRcclxuICAgKi9cclxuICBwcml2YXRlIHRvdWNoQmVoYXZpb3VyQ2hhbmdlJCA9IG5ldyBTdWJqZWN0KCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEFuIGFycmF5IG9mIG9ic2VydmVycyB3aGljaCBhZmZlY3Qgb24gcmVzaXphYmxlIGVsZW1lbnRcclxuICAgKi9cclxuICBwcml2YXRlIG9ic2VydmVyczogeyBzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjsgZWxlbWVudDogSFRNTEVsZW1lbnQgfVtdID0gW107XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgcmVndWxhciBleHByZXNzaW9uIGZvciBrZXlib2FyZCBjb2RlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB3aGVlbEluaXRpYXRvclJlZ0V4cDogUmVnRXhwIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2UgYSByZXNpemUgdW5hdmFpbGFibGUgYnkgd2hlZWxcclxuICAgKi9cclxuICBwcml2YXRlIGlzV2hlZWxEaXNhYmxlZCA9IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgKiBNYWtlIGEgcmVzaXplIHVuYXZhaWxhYmxlIGJ5IHRvdWNoZXNcclxuICAgKi9cclxuICBwcml2YXRlIGlzVG91Y2hlc0Rpc2FibGVkID0gZmFsc2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIE1pbmltYWwgd2lkdGggaW4gcHhcclxuICAgKi9cclxuICBASW5wdXQoKSBuZ3hSZXNpemVNaW5XaWR0aCA9IDA7XHJcblxyXG4gIC8qKlxyXG4gICAqIE1pbmltYWwgaGVpZ2h0IGluIHB4XHJcbiAgICovXHJcbiAgQElucHV0KCkgbmd4UmVzaXplTWluSGVpZ2h0ID0gMDtcclxuXHJcbiAgLyoqXHJcbiAgICogQXNwZWN0IHJhdGlvIHRoZSBlbGVtZW50IHdpbGwgdXNlIGR1cmluZyByZXNpemVcclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogMTYvOSAtIDkvMTYgKiAxMDAgPSA1Ni4yNVxyXG4gICAqIDEvMSAtIDEvMSAqIDEwMCA9IDEwMFxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG5neFJlc2l6ZUFzcGVjdFJhdGlvID0gMDtcclxuXHJcbiAgLyoqXHJcbiAgICogRGlzYWJsZXMgYW55IHJlc2l6ZSBldmVudHNcclxuICAgKi9cclxuICBASW5wdXQoKSBuZ3hSZXNpemVEaXNhYmxlZCA9IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgKiBMb2NrcyBheGlzIGZvciB0aGUgcmVzaXplXHJcbiAgICovXHJcbiAgQElucHV0KCkgbmd4UmVzaXplTG9ja0F4aXM6IEF4aXMgPSBudWxsO1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJhaW4gb2YgdGhlIHJlc2l6aW5nIGFyZWEuXHJcbiAgICogQ2FuIGJlIGFzIGEgSFRNTEVsZW1lbnQgb3IgQ1NTIHNlbGVjdG9yLlxyXG4gICAqIFlvdSBjYW4gcHV0ICd3aW5kb3cnIHN0cmluZyB0byBkZWZpbmUgd2luZG93IG9iamVjdCBhcyBhIGNvbnN0cmFpbi5cclxuICAgKi9cclxuICBASW5wdXQoKSBzZXQgbmd4UmVzaXplQm91bmRhcnkoYm91bmRhcnk6IHN0cmluZyB8IEhUTUxFbGVtZW50KSB7XHJcbiAgICB0aGlzLmJvdW5kYXJ5ID0gYm91bmRhcnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgd2l0aCBrZXlib2FyZCBrZXkgY29kZS5cclxuICAgKiBXaGVuIHZhbHVlIGlzIHByb3ZpZGVkIHRoZSBlbGVtZW50IGNhbiBiZSBzY2FsZWQgYnkgJ0tleSArIHdoZWVsJy5cclxuICAgKiBJZiB2YWx1ZSBub3QgcHJvdmlkZWQgdGhlIGVsZW1lbnQgY2FuIGJlIHNjYWxlZCBqdXN0IGJ5ICd3aGVlbCcuXHJcbiAgICpcclxuICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9LZXlib2FyZEV2ZW50L2NvZGVcclxuICAgKi9cclxuICBASW5wdXQoKSBzZXQgbmd4UmVzaXplV2hlZWxJbml0aWF0b3JSZWdFeHAocGF0dGVybjogUmVnRXhwIHwgc3RyaW5nKSB7XHJcbiAgICBpZiAoIXBhdHRlcm4pIHtcclxuICAgICAgdGhpcy53aGVlbEluaXRpYXRvclJlZ0V4cCA9IG51bGw7XHJcbiAgICAgIHRoaXMuc3Vic2NyaWJlRm9yV2hlZWxFdmVudCgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy53aGVlbEluaXRpYXRvclJlZ0V4cCA9IG5ldyBSZWdFeHAocGF0dGVybik7XHJcbiAgICB0aGlzLnN1YnNjcmliZUZvcldoZWVsRXZlbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc2FibGVzIHJlc2l6ZSBieSB3aGVlbC5cclxuICAgKiBCeSBkZWZhdWx0IGlzICdmYWxzZScuXHJcbiAgICovXHJcbiAgQElucHV0KCkgc2V0IG5neFJlc2l6ZVdoZWVsRGlzYWJsZWQoZGlzYWJsZWQ6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuaXNXaGVlbERpc2FibGVkID0gZGlzYWJsZWQ7XHJcbiAgICB0aGlzLnN1YnNjcmliZUZvcldoZWVsRXZlbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuYWJsZXMgaW52ZXJzaW9uIGZvciB3aGVlbCBldmVudFxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG5neFJlc2l6ZVdoZWVsSW52ZXJzZSA9IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgKiBEaXNhYmxlcyByZXNpemUgYnkgdG91Y2hlcy5cclxuICAgKiBCeSBkZWZhdWx0IGlzICdmYWxzZScuXHJcbiAgICogUmVzaXplIHdvcmsgYnkgdXNpbmcgdHdvIGZpbmdlcnMuXHJcbiAgICovXHJcbiAgQElucHV0KCkgc2V0IG5neFJlc2l6ZVRvdWNoZXNEaXNhYmxlZChkaXNhYmxlZDogYm9vbGVhbikge1xyXG4gICAgdGhpcy5pc1RvdWNoZXNEaXNhYmxlZCA9IGRpc2FibGVkO1xyXG4gICAgdGhpcy5zdWJzY3JpYmVGb3JUb3VjaEV2ZW50cygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUG9zaXRpb24gQ1NTIHN0eWxlLiBBbGxvd3MgJ2Fic29sdXRlJyBhbmQgJ2ZpeGVkJy4gRGVmYXVsdCBpcyAnYWJzb2x1dGUnLlxyXG4gICAqIFdpbGwgYmUgYXBwbGllZCB0byBob3N0IGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9wb3NpdGlvblxyXG4gICAqL1xyXG4gIEBIb3N0QmluZGluZygnc3R5bGUucG9zaXRpb24nKVxyXG4gIEBJbnB1dCgpXHJcbiAgbmd4UmVzaXplUG9zaXRpb246IFBvc2l0aW9uVHlwZSA9ICdhYnNvbHV0ZSc7XHJcblxyXG4gIC8qKlxyXG4gICAqIEVtaXRzIGNoYW5nZXMgd2hlbiBlbGVtZW50IHdhcyByZXNpemVkXHJcbiAgICovXHJcbiAgQE91dHB1dCgpIG5neFJlc2l6ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPE5neFJlc2l6ZT4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVuZGVyZXI6IFJlbmRlcmVyMixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZHJhZ1NlcnZpY2U6IERyYWdTZXJ2aWNlLFxyXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSByZWFkb25seSBkb2N1bWVudDogRG9jdW1lbnQsXHJcbiAgICBASW5qZWN0KFdJTkRPVykgcHJpdmF0ZSByZWFkb25seSB3aW5kb3c6IFdpbmRvdyxcclxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcmVhZG9ubHkgcGxhdGZvcm1JZDogb2JqZWN0XHJcbiAgKSB7XHJcbiAgICBzdXBlcih3aW5kb3csIGRvY3VtZW50KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBpbmhlcml0RG9jXHJcbiAgICovXHJcbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xyXG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIodGhpcy5wbGF0Zm9ybUlkKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbml0aWFsUmVzaXplKCk7XHJcbiAgICB0aGlzLnN1YnNjcmliZUZvcldoZWVsRXZlbnQoKTtcclxuICAgIHRoaXMuc3Vic2NyaWJlRm9yVG91Y2hFdmVudHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBpbmhlcml0RG9jXHJcbiAgICovXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLmRlc3Ryb3kkLm5leHQodHJ1ZSk7XHJcbiAgICB0aGlzLmRlc3Ryb3kkLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLndoZWVsQmVoYXZpb3VyQ2hhbmdlJC5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy50b3VjaEJlaGF2aW91ckNoYW5nZSQuY29tcGxldGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVuc3Vic2NyaWJlIGZyb20gdGhlIGVsZW1lbnQgZHJhZ2dpbmcgYW5kIHJlbW92ZSBpdCBmcm9tIGFuIGFycmF5IG9mIG9ic2VydmFibGUgb2JqZWN0c1xyXG4gICAqL1xyXG4gIHVuc3Vic2NyaWJlKHRhcmdldDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGluZGV4T2YgPSB0aGlzLm9ic2VydmVycy5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gdGFyZ2V0KTtcclxuXHJcbiAgICBpZiAoaW5kZXhPZiA8IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMub2JzZXJ2ZXJzW2luZGV4T2ZdLnN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgdGhpcy5vYnNlcnZlcnMuc3BsaWNlKGluZGV4T2YsIDEpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT2JzZXJ2ZSB0aGUgZWxlbWVudCBkcmFnZ2luZyB3aGljaCB3aWxsIGJlIGFzIGhhbmRsZSBmb3IgcmVzaXplXHJcbiAgICovXHJcbiAgb2JzZXJ2ZSh0YXJnZXQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMucmVzb2x2ZUluaXRpYXRvclR5cGUodGFyZ2V0KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGhvc3RFbGVtZW50UmVjdCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgbGV0IGV2ZW50SW5pdGlhbDogUG9zaXRpb25CYXNlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uJCA9IHRoaXMuZHJhZ1NlcnZpY2VcclxuICAgICAgLmZyb21FbGVtZW50KHRhcmdldClcclxuICAgICAgLnBpcGUoXHJcbiAgICAgICAgdGFwKChldmVudCkgPT4gZXZlbnQubmF0aXZlRXZlbnQucHJldmVudERlZmF1bHQoKSksXHJcbiAgICAgICAgdGFwKChldmVudCkgPT4gZXZlbnQubmF0aXZlRXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCkpLFxyXG4gICAgICAgIG1hcDxNb3ZlbWVudEJhc2UsIE1vdmVtZW50PigoZXZlbnQpID0+IHtcclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgIWV2ZW50SW5pdGlhbCB8fFxyXG4gICAgICAgICAgICBldmVudEluaXRpYWwueCAhPT0gZXZlbnQuaW5pdGlhbC54IHx8XHJcbiAgICAgICAgICAgIGV2ZW50SW5pdGlhbC55ICE9PSBldmVudC5pbml0aWFsLnlcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICBldmVudEluaXRpYWwgPSBldmVudC5pbml0aWFsO1xyXG4gICAgICAgICAgICBob3N0RWxlbWVudFJlY3QgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBvZmZzZXRGcm9tSG9zdCA9IHtcclxuICAgICAgICAgICAgdG9wOiBldmVudC5pbml0aWFsLnkgLSBob3N0RWxlbWVudFJlY3QudG9wLFxyXG4gICAgICAgICAgICBsZWZ0OiBldmVudC5pbml0aWFsLnggLSBob3N0RWxlbWVudFJlY3QubGVmdCxcclxuICAgICAgICAgICAgYm90dG9tOiBob3N0RWxlbWVudFJlY3QuYm90dG9tIC0gZXZlbnQuaW5pdGlhbC55LFxyXG4gICAgICAgICAgICByaWdodDogaG9zdEVsZW1lbnRSZWN0LnJpZ2h0IC0gZXZlbnQuaW5pdGlhbC54LFxyXG4gICAgICAgICAgfSBhcyBCb3VuZGFyeTtcclxuXHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAuLi5ldmVudCxcclxuICAgICAgICAgICAgaW5pdGlhdG9yOiB0YXJnZXQsXHJcbiAgICAgICAgICAgIG9mZnNldEZyb21Ib3N0LFxyXG4gICAgICAgICAgICBpbml0aWFsOiBldmVudC5pbml0aWFsLFxyXG4gICAgICAgICAgICBuYXRpdmVFdmVudDogZXZlbnQubmF0aXZlRXZlbnQsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHRhcCh0aGlzLm9uUmVzaXplLmJpbmQodGhpcykpLFxyXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKVxyXG4gICAgICApXHJcbiAgICAgIC5zdWJzY3JpYmUoKTtcclxuXHJcbiAgICB0aGlzLm9ic2VydmVycy5wdXNoKHsgc3Vic2NyaXB0aW9uOiBzdWJzY3JpcHRpb24kLCBlbGVtZW50OiB0YXJnZXQgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGFydHMgdGhlIHN1YnNjcmlwdGlvbiBmb3IgdG91Y2ggZXZlbnRzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdWJzY3JpYmVGb3JUb3VjaEV2ZW50cygpOiB2b2lkIHtcclxuICAgIHRoaXMudG91Y2hCZWhhdmlvdXJDaGFuZ2UkLm5leHQodHJ1ZSk7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNUb3VjaGVzRGlzYWJsZWQgfHwgaXNQbGF0Zm9ybVNlcnZlcih0aGlzLnBsYXRmb3JtSWQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcHJldkRpc3RhbmNlID0gMDtcclxuXHJcbiAgICBjb25zdCB0b3VjaFN0YXJ0JCA9IGZyb21FdmVudDxUb3VjaEV2ZW50Pih0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ3RvdWNoc3RhcnQnKS5waXBlKFxyXG4gICAgICBmaWx0ZXIoKGV2ZW50KSA9PiBldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA9PT0gMilcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgdG91Y2hFbmQkID0gZnJvbUV2ZW50PFRvdWNoRXZlbnQ+KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAndG91Y2hlbmQnKTtcclxuXHJcbiAgICBjb25zdCB0b3VjaE1vdmUkID0gZnJvbUV2ZW50PFRvdWNoRXZlbnQ+KHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAndG91Y2htb3ZlJywge1xyXG4gICAgICBwYXNzaXZlOiBmYWxzZSxcclxuICAgIH0pLnBpcGUoXHJcbiAgICAgIHRhcCgoZXZlbnQpID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpLFxyXG4gICAgICBmaWx0ZXIoKGV2ZW50KSA9PiBldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA9PT0gMiAmJiBldmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPT09IDIpXHJcbiAgICApO1xyXG5cclxuICAgIHRvdWNoU3RhcnQkXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIHRhcChcclxuICAgICAgICAgIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBhVG91Y2ggPSBldmVudC50YXJnZXRUb3VjaGVzLml0ZW0oMCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGJUb3VjaCA9IGV2ZW50LnRhcmdldFRvdWNoZXMuaXRlbSgxKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghYVRvdWNoIHx8ICFiVG91Y2gpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHByZXZEaXN0YW5jZSA9IHRoaXMudG91Y2hlc0Rpc3RhbmNlKGFUb3VjaCwgYlRvdWNoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgIHN3aXRjaE1hcCgoKSA9PlxyXG4gICAgICAgICAgdG91Y2hNb3ZlJC5waXBlKFxyXG4gICAgICAgICAgICB0YXAoKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgYVRvdWNoID0gZXZlbnQudGFyZ2V0VG91Y2hlcy5pdGVtKDApO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGJUb3VjaCA9IGV2ZW50LnRhcmdldFRvdWNoZXMuaXRlbSgxKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCFhVG91Y2ggfHwgIWJUb3VjaCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLnRvdWNoZXNEaXN0YW5jZShhVG91Y2gsIGJUb3VjaCk7XHJcblxyXG4gICAgICAgICAgICAgIHRoaXMub25TY2FsZSh7IGRlbHRhOiBkaXN0YW5jZSAtIHByZXZEaXN0YW5jZSB9LCBldmVudCk7XHJcblxyXG4gICAgICAgICAgICAgIHByZXZEaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgdGFrZVVudGlsKHRvdWNoRW5kJClcclxuICAgICAgICAgIClcclxuICAgICAgICApLFxyXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcclxuICAgICAgICB0YWtlVW50aWwodGhpcy50b3VjaEJlaGF2aW91ckNoYW5nZSQpXHJcbiAgICAgIClcclxuICAgICAgLnN1YnNjcmliZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBkaXN0YW5jZSBiZXR3ZWVuIHR3byB0b3VjaGVzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0b3VjaGVzRGlzdGFuY2UoYTogVG91Y2gsIGI6IFRvdWNoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coYi5jbGllbnRYIC0gYS5jbGllbnRYLCAyKSArIE1hdGgucG93KGIuY2xpZW50WSAtIGEuY2xpZW50WSwgMikpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFrZSBhIHN1YnNjcmlwdGlvbiBmb3Igd2hlZWwgZXZlbnRzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdWJzY3JpYmVGb3JXaGVlbEV2ZW50KCk6IHZvaWQge1xyXG4gICAgdGhpcy53aGVlbEJlaGF2aW91ckNoYW5nZSQubmV4dCh0cnVlKTtcclxuXHJcbiAgICBpZiAodGhpcy5pc1doZWVsRGlzYWJsZWQgfHwgaXNQbGF0Zm9ybVNlcnZlcih0aGlzLnBsYXRmb3JtSWQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB3aGVlbCQgPSBmcm9tRXZlbnQ8V2hlZWxFdmVudD4odGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICd3aGVlbCcpLnBpcGUoXHJcbiAgICAgIHRhcCgoZXZlbnQpID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpLFxyXG4gICAgICB0YXAoKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLm5neFJlc2l6ZVdoZWVsSW52ZXJzZSA/IGV2ZW50LmRlbHRhWSA6IGV2ZW50LmRlbHRhWSAqIC0xO1xyXG4gICAgICAgIHRoaXMub25TY2FsZSh7IGRlbHRhIH0sIGV2ZW50KTtcclxuICAgICAgfSksXHJcbiAgICAgIHRha2VVbnRpbCh0aGlzLndoZWVsQmVoYXZpb3VyQ2hhbmdlJCksXHJcbiAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIXRoaXMud2hlZWxJbml0aWF0b3JSZWdFeHApIHtcclxuICAgICAgd2hlZWwkLnN1YnNjcmliZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgd2hlZWxJbml0aWF0b3JGaWx0ZXIgPSBmaWx0ZXI8S2V5Ym9hcmRFdmVudD4oKGV2ZW50KSA9PlxyXG4gICAgICB0aGlzLndoZWVsSW5pdGlhdG9yUmVnRXhwID8gdGhpcy53aGVlbEluaXRpYXRvclJlZ0V4cC50ZXN0KGV2ZW50LmNvZGUpIDogdHJ1ZSk7XHJcblxyXG4gICAgY29uc3Qgd2hlZWxJbml0aWF0b3JTdGFydCQgPSBmcm9tRXZlbnQ8S2V5Ym9hcmRFdmVudD4odGhpcy53aW5kb3csICdrZXlkb3duJykucGlwZShcclxuICAgICAgd2hlZWxJbml0aWF0b3JGaWx0ZXJcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgd2hlZWxJbml0aWF0b3JFbmQkID0gZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KHRoaXMud2luZG93LCAna2V5dXAnKS5waXBlKFxyXG4gICAgICB3aGVlbEluaXRpYXRvckZpbHRlclxyXG4gICAgKTtcclxuXHJcbiAgICB3aGVlbEluaXRpYXRvclN0YXJ0JFxyXG4gICAgICAucGlwZShcclxuICAgICAgICBzd2l0Y2hNYXAoKCkgPT4gd2hlZWwkLnBpcGUodGFrZVVudGlsKHdoZWVsSW5pdGlhdG9yRW5kJCkpKSxcclxuICAgICAgICB0YWtlVW50aWwodGhpcy53aGVlbEJlaGF2aW91ckNoYW5nZSQpLFxyXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKVxyXG4gICAgICApXHJcbiAgICAgIC5zdWJzY3JpYmUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJ1bnMgaW5pdGlhbCByZXNpemUgZm9yIHRoZSBob3N0IGVsZW1lbnRcclxuICAgKi9cclxuICBwcml2YXRlIGluaXRpYWxSZXNpemUoKTogdm9pZCB7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgdGhpcy5vblNjYWxlKHsgZGVsdGE6IDAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0cyB0aGUgY2FsY3VsYXRpb24gb2Ygc2NhbGUgZXZlbnQgYW5kIGNoYW5nZXMgaG9zdCBzaXplXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblNjYWxlKHNjYWxlOiBTY2FsZSwgbmF0aXZlRXZlbnQ/OiBFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgaG9zdEVsZW1lbnRSZWN0ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgY29uc3QgYm91bmRhcnlSZWN0ID0gdGhpcy5nZXRCb3VuZGFyeSgpO1xyXG5cclxuICAgIGxldCBtYXhVcHNjYWxlID0gc2NhbGUuZGVsdGE7XHJcblxyXG4gICAgaWYgKGJvdW5kYXJ5UmVjdCkge1xyXG4gICAgICBtYXhVcHNjYWxlID0gTWF0aC5mbG9vcihcclxuICAgICAgICBNYXRoLm1pbihcclxuICAgICAgICAgIGhvc3RFbGVtZW50UmVjdC50b3AgLSBib3VuZGFyeVJlY3QudG9wLFxyXG4gICAgICAgICAgYm91bmRhcnlSZWN0LnJpZ2h0IC0gaG9zdEVsZW1lbnRSZWN0LnJpZ2h0LFxyXG4gICAgICAgICAgYm91bmRhcnlSZWN0LmJvdHRvbSAtIGhvc3RFbGVtZW50UmVjdC5ib3R0b20sXHJcbiAgICAgICAgICBob3N0RWxlbWVudFJlY3QubGVmdCAtIGJvdW5kYXJ5UmVjdC5sZWZ0XHJcbiAgICAgICAgKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1heERvd25zY2FsZSA9XHJcbiAgICAgIE1hdGgubWF4KFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgTWF0aC5taW4oXHJcbiAgICAgICAgICBob3N0RWxlbWVudFJlY3Qud2lkdGggLSB0aGlzLm5neFJlc2l6ZU1pbldpZHRoLFxyXG4gICAgICAgICAgaG9zdEVsZW1lbnRSZWN0LmhlaWdodCAtIHRoaXMubmd4UmVzaXplTWluSGVpZ2h0XHJcbiAgICAgICAgKVxyXG4gICAgICApICogLTE7XHJcblxyXG4gICAgY29uc3QgZGVsdGEgPSBNYXRoLm1heChtYXhEb3duc2NhbGUsIE1hdGgubWluKG1heFVwc2NhbGUsIHNjYWxlLmRlbHRhKSk7XHJcblxyXG4gICAgbGV0IHRvcCA9IGhvc3RFbGVtZW50UmVjdC50b3AgLSBkZWx0YSAvIDI7XHJcbiAgICBsZXQgbGVmdCA9IGhvc3RFbGVtZW50UmVjdC5sZWZ0IC0gZGVsdGEgLyAyO1xyXG5cclxuICAgIGlmIChib3VuZGFyeVJlY3QpIHtcclxuICAgICAgdG9wID0gTWF0aC5tYXgoYm91bmRhcnlSZWN0LnRvcCwgdG9wKTtcclxuICAgICAgbGVmdCA9IE1hdGgubWF4KGJvdW5kYXJ5UmVjdC5sZWZ0LCBsZWZ0KTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaGVpZ2h0ID0gaG9zdEVsZW1lbnRSZWN0LmhlaWdodCArIGRlbHRhO1xyXG4gICAgbGV0IHdpZHRoID0gaG9zdEVsZW1lbnRSZWN0LndpZHRoICsgZGVsdGE7XHJcblxyXG4gICAgaWYgKGJvdW5kYXJ5UmVjdCkge1xyXG4gICAgICBoZWlnaHQgPSBNYXRoLm1pbihib3VuZGFyeVJlY3QuYm90dG9tIC0gdG9wLCBoZWlnaHQpO1xyXG4gICAgICB3aWR0aCA9IE1hdGgubWluKGJvdW5kYXJ5UmVjdC5yaWdodCAtIGxlZnQsIHdpZHRoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5uZ3hSZXNpemVMb2NrQXhpcyA9PT0gJ3gnKSB7XHJcbiAgICAgIGxlZnQgPSBob3N0RWxlbWVudFJlY3QubGVmdDtcclxuICAgICAgd2lkdGggPSBob3N0RWxlbWVudFJlY3Qud2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMubmd4UmVzaXplTG9ja0F4aXMgPT09ICd5Jykge1xyXG4gICAgICB0b3AgPSBob3N0RWxlbWVudFJlY3QudG9wO1xyXG4gICAgICBoZWlnaHQgPSBob3N0RWxlbWVudFJlY3QuaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHByb3BvcnRpb25hbFNpemUgPVxyXG4gICAgICB0aGlzLm5neFJlc2l6ZUxvY2tBeGlzID09PSAneSdcclxuICAgICAgICA/IHRoaXMuZnJvbVdpZHRoUHJvcG9ydGlvbih3aWR0aClcclxuICAgICAgICA6IHRoaXMuZnJvbUhlaWdodFByb3BvcnRpb24oaGVpZ2h0KTtcclxuXHJcbiAgICBpZiAocHJvcG9ydGlvbmFsU2l6ZSAmJiB0aGlzLm5neFJlc2l6ZUxvY2tBeGlzID09PSAneScpIHtcclxuICAgICAgaGVpZ2h0ID0gcHJvcG9ydGlvbmFsU2l6ZTtcclxuICAgICAgdG9wID0gaG9zdEVsZW1lbnRSZWN0LnRvcCAtIChoZWlnaHQgLSBob3N0RWxlbWVudFJlY3QuaGVpZ2h0KSAvIDI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHByb3BvcnRpb25hbFNpemUgJiYgdGhpcy5uZ3hSZXNpemVMb2NrQXhpcyAhPT0gJ3knKSB7XHJcbiAgICAgIHdpZHRoID0gcHJvcG9ydGlvbmFsU2l6ZTtcclxuICAgICAgbGVmdCA9IGhvc3RFbGVtZW50UmVjdC5sZWZ0IC0gKHdpZHRoIC0gaG9zdEVsZW1lbnRSZWN0LndpZHRoKSAvIDI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFxyXG4gICAgICBib3VuZGFyeVJlY3QgJiZcclxuICAgICAgKHRvcCA8PSBib3VuZGFyeVJlY3QudG9wIHx8XHJcbiAgICAgICAgdG9wICsgaGVpZ2h0ID49IGJvdW5kYXJ5UmVjdC5ib3R0b20gfHxcclxuICAgICAgICBsZWZ0IDw9IGJvdW5kYXJ5UmVjdC5sZWZ0IHx8XHJcbiAgICAgICAgbGVmdCArIHdpZHRoID49IGJvdW5kYXJ5UmVjdC5yaWdodClcclxuICAgICkge1xyXG4gICAgICB0b3AgPSBob3N0RWxlbWVudFJlY3QudG9wO1xyXG4gICAgICBoZWlnaHQgPSBob3N0RWxlbWVudFJlY3QuaGVpZ2h0O1xyXG4gICAgICBsZWZ0ID0gaG9zdEVsZW1lbnRSZWN0LmxlZnQ7XHJcbiAgICAgIHdpZHRoID0gaG9zdEVsZW1lbnRSZWN0LndpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlSG9zdFN0eWxlKCdsZWZ0JywgYCR7dGhpcy5iYXNlZE9uQm91bmRhcnkobGVmdCwgJ2xlZnQnKX1weGApO1xyXG4gICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ3dpZHRoJywgYCR7d2lkdGh9cHhgKTtcclxuICAgIHRoaXMudXBkYXRlSG9zdFN0eWxlKCd0b3AnLCBgJHt0aGlzLmJhc2VkT25Cb3VuZGFyeSh0b3AsICd0b3AnKX1weGApO1xyXG4gICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ2hlaWdodCcsIGAke2hlaWdodH1weGApO1xyXG4gICAgdGhpcy5lbWl0UmVzaXplKG5hdGl2ZUV2ZW50KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIHdoZXRoZXIgaXMgcmVzaXplIGlzIGF2YWlsYWJsZSBmb3IgY3VycmVudCBpbml0aWF0b3IgdHlwZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuUmVzaXplKGluaXRpYXRvclR5cGU6IE5neFJlc2l6ZUhhbmRsZVR5cGUpOiBib29sZWFuIHtcclxuICAgIHN3aXRjaCAoaW5pdGlhdG9yVHlwZSkge1xyXG4gICAgICBjYXNlIE5neFJlc2l6ZUhhbmRsZVR5cGUuVG9wTGVmdDpcclxuICAgICAgY2FzZSBOZ3hSZXNpemVIYW5kbGVUeXBlLlRvcFJpZ2h0OlxyXG4gICAgICBjYXNlIE5neFJlc2l6ZUhhbmRsZVR5cGUuQm90dG9tTGVmdDpcclxuICAgICAgY2FzZSBOZ3hSZXNpemVIYW5kbGVUeXBlLkJvdHRvbVJpZ2h0OlxyXG4gICAgICAgIHJldHVybiAhdGhpcy5uZ3hSZXNpemVMb2NrQXhpcztcclxuICAgICAgY2FzZSBOZ3hSZXNpemVIYW5kbGVUeXBlLkxlZnQ6XHJcbiAgICAgIGNhc2UgTmd4UmVzaXplSGFuZGxlVHlwZS5SaWdodDpcclxuICAgICAgICByZXR1cm4gdGhpcy5uZ3hSZXNpemVMb2NrQXhpcyAhPT0gJ3gnO1xyXG4gICAgICBjYXNlIE5neFJlc2l6ZUhhbmRsZVR5cGUuVG9wOlxyXG4gICAgICBjYXNlIE5neFJlc2l6ZUhhbmRsZVR5cGUuQm90dG9tOlxyXG4gICAgICAgIHJldHVybiB0aGlzLm5neFJlc2l6ZUxvY2tBeGlzICE9PSAneSc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuICF0aGlzLm5neFJlc2l6ZUxvY2tBeGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhcnRzIHRoZSBjYWxjdWxhdGlvbiBvZiByZXNpemUgZXZlbnQgYW5kIGNoYW5nZXMgaG9zdCBzaXplXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvblJlc2l6ZShldmVudDogTW92ZW1lbnQpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm5neFJlc2l6ZURpc2FibGVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpbml0aWF0b3JUeXBlID0gdGhpcy5yZXNvbHZlSW5pdGlhdG9yVHlwZShldmVudC5pbml0aWF0b3IpO1xyXG5cclxuICAgIGlmICghaW5pdGlhdG9yVHlwZSB8fCAhdGhpcy5jYW5SZXNpemUoaW5pdGlhdG9yVHlwZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhvc3RFbGVtZW50UmVjdCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgIGNvbnN0IGJvdW5kYXJ5UmVjdCA9IHRoaXMuZ2V0Qm91bmRhcnkoKTtcclxuXHJcbiAgICBpZiAoIWJvdW5kYXJ5UmVjdCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoIChpbml0aWF0b3JUeXBlKSB7XHJcbiAgICAgIGNhc2UgTmd4UmVzaXplSGFuZGxlVHlwZS5Ub3BMZWZ0OlxyXG4gICAgICAgIHJldHVybiB0aGlzLnRvcExlZnRNb3ZlbWVudChldmVudCwgaG9zdEVsZW1lbnRSZWN0LCBib3VuZGFyeVJlY3QpO1xyXG4gICAgICBjYXNlIE5neFJlc2l6ZUhhbmRsZVR5cGUuVG9wOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnRvcE1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgICAgIGNhc2UgTmd4UmVzaXplSGFuZGxlVHlwZS5Ub3BSaWdodDpcclxuICAgICAgICByZXR1cm4gdGhpcy50b3BSaWdodE1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgICAgIGNhc2UgTmd4UmVzaXplSGFuZGxlVHlwZS5SaWdodDpcclxuICAgICAgICByZXR1cm4gdGhpcy5yaWdodE1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgICAgIGNhc2UgTmd4UmVzaXplSGFuZGxlVHlwZS5Cb3R0b21SaWdodDpcclxuICAgICAgICByZXR1cm4gdGhpcy5ib3R0b21SaWdodE1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgICAgIGNhc2UgTmd4UmVzaXplSGFuZGxlVHlwZS5Cb3R0b206XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYm90dG9tTW92ZW1lbnQoZXZlbnQsIGhvc3RFbGVtZW50UmVjdCwgYm91bmRhcnlSZWN0KTtcclxuICAgICAgY2FzZSBOZ3hSZXNpemVIYW5kbGVUeXBlLkJvdHRvbUxlZnQ6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYm90dG9tTGVmdE1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgICAgIGNhc2UgTmd4UmVzaXplSGFuZGxlVHlwZS5MZWZ0OlxyXG4gICAgICAgIHJldHVybiB0aGlzLmxlZnRNb3ZlbWVudChldmVudCwgaG9zdEVsZW1lbnRSZWN0LCBib3VuZGFyeVJlY3QpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0b3BMZWZ0TW92ZW1lbnQoZXZlbnQ6IE1vdmVtZW50LCBob3N0RWxlbWVudFJlY3Q6IERPTVJlY3QsIGJvdW5kYXJ5UmVjdDogQm91bmRhcnkpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm5neFJlc2l6ZUFzcGVjdFJhdGlvKSB7XHJcbiAgICAgIHRoaXMudG9wTW92ZW1lbnQoZXZlbnQsIGhvc3RFbGVtZW50UmVjdCwgYm91bmRhcnlSZWN0KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudG9wTW92ZW1lbnQoZXZlbnQsIGhvc3RFbGVtZW50UmVjdCwgYm91bmRhcnlSZWN0KTtcclxuICAgIHRoaXMubGVmdE1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRvcFJpZ2h0TW92ZW1lbnQoZXZlbnQ6IE1vdmVtZW50LCBob3N0RWxlbWVudFJlY3Q6IERPTVJlY3QsIGJvdW5kYXJ5UmVjdDogQm91bmRhcnkpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm5neFJlc2l6ZUFzcGVjdFJhdGlvKSB7XHJcbiAgICAgIHRoaXMudG9wTW92ZW1lbnQoZXZlbnQsIGhvc3RFbGVtZW50UmVjdCwgYm91bmRhcnlSZWN0KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudG9wTW92ZW1lbnQoZXZlbnQsIGhvc3RFbGVtZW50UmVjdCwgYm91bmRhcnlSZWN0KTtcclxuICAgIHRoaXMucmlnaHRNb3ZlbWVudChldmVudCwgaG9zdEVsZW1lbnRSZWN0LCBib3VuZGFyeVJlY3QpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBib3R0b21SaWdodE1vdmVtZW50KGV2ZW50OiBNb3ZlbWVudCwgaG9zdEVsZW1lbnRSZWN0OiBET01SZWN0LCBib3VuZGFyeVJlY3Q6IEJvdW5kYXJ5KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5uZ3hSZXNpemVBc3BlY3RSYXRpbykge1xyXG4gICAgICB0aGlzLmJvdHRvbU1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmJvdHRvbU1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgICB0aGlzLnJpZ2h0TW92ZW1lbnQoZXZlbnQsIGhvc3RFbGVtZW50UmVjdCwgYm91bmRhcnlSZWN0KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYm90dG9tTGVmdE1vdmVtZW50KGV2ZW50OiBNb3ZlbWVudCwgaG9zdEVsZW1lbnRSZWN0OiBET01SZWN0LCBib3VuZGFyeVJlY3Q6IEJvdW5kYXJ5KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5uZ3hSZXNpemVBc3BlY3RSYXRpbykge1xyXG4gICAgICB0aGlzLmJvdHRvbU1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmJvdHRvbU1vdmVtZW50KGV2ZW50LCBob3N0RWxlbWVudFJlY3QsIGJvdW5kYXJ5UmVjdCk7XHJcbiAgICB0aGlzLmxlZnRNb3ZlbWVudChldmVudCwgaG9zdEVsZW1lbnRSZWN0LCBib3VuZGFyeVJlY3QpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0b3BNb3ZlbWVudChldmVudDogTW92ZW1lbnQsIGhvc3RFbGVtZW50UmVjdDogRE9NUmVjdCwgYm91bmRhcnlSZWN0OiBCb3VuZGFyeSk6IHZvaWQge1xyXG4gICAgbGV0IHkgPSBldmVudC55IC0gZXZlbnQub2Zmc2V0RnJvbUhvc3QudG9wO1xyXG5cclxuICAgIGlmIChib3VuZGFyeVJlY3QpIHtcclxuICAgICAgeSA9IE1hdGgubWF4KGJvdW5kYXJ5UmVjdC50b3AsIE1hdGgubWluKHksIGJvdW5kYXJ5UmVjdC5ib3R0b20pKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdG9wID0gTWF0aC5taW4oeSwgaG9zdEVsZW1lbnRSZWN0LmJvdHRvbSAtIHRoaXMubmd4UmVzaXplTWluSGVpZ2h0KTtcclxuICAgIGxldCBoZWlnaHQgPSBob3N0RWxlbWVudFJlY3QuaGVpZ2h0IC0gKHRvcCAtIGhvc3RFbGVtZW50UmVjdC50b3ApO1xyXG5cclxuICAgIGNvbnN0IGluaXRpYXRvclR5cGUgPSB0aGlzLnJlc29sdmVJbml0aWF0b3JUeXBlKGV2ZW50LmluaXRpYXRvcik7XHJcblxyXG4gICAgY29uc3Qgd2lkdGhQcm9wb3J0aW9ucyA9IGluaXRpYXRvclR5cGUgPyB0aGlzLmdldFdpZHRoUHJvcG9ydGlvbnMoYm91bmRhcnlSZWN0LCBob3N0RWxlbWVudFJlY3QsIGluaXRpYXRvclR5cGUsIGhlaWdodCkgOiBudWxsO1xyXG5cclxuICAgIGlmICh3aWR0aFByb3BvcnRpb25zKSB7XHJcbiAgICAgIHRvcCA9IHRvcCArIChoZWlnaHQgLSB0aGlzLmZyb21XaWR0aFByb3BvcnRpb24od2lkdGhQcm9wb3J0aW9ucy53aWR0aCkpO1xyXG4gICAgICBoZWlnaHQgPSBNYXRoLm1pbihoZWlnaHQsIHRoaXMuZnJvbVdpZHRoUHJvcG9ydGlvbih3aWR0aFByb3BvcnRpb25zLndpZHRoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ3RvcCcsIGAke3RoaXMuYmFzZWRPbkJvdW5kYXJ5KHRvcCwgJ3RvcCcpfXB4YCk7XHJcbiAgICB0aGlzLnVwZGF0ZUhvc3RTdHlsZSgnaGVpZ2h0JywgYCR7aGVpZ2h0fXB4YCk7XHJcblxyXG4gICAgaWYgKHdpZHRoUHJvcG9ydGlvbnMpIHtcclxuICAgICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ2xlZnQnLCBgJHt0aGlzLmJhc2VkT25Cb3VuZGFyeSh3aWR0aFByb3BvcnRpb25zLmxlZnQsICdsZWZ0Jyl9cHhgKTtcclxuICAgICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ3dpZHRoJywgYCR7d2lkdGhQcm9wb3J0aW9ucy53aWR0aH1weGApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZW1pdFJlc2l6ZShldmVudC5uYXRpdmVFdmVudCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJpZ2h0TW92ZW1lbnQoZXZlbnQ6IE1vdmVtZW50LCBob3N0RWxlbWVudFJlY3Q6IERPTVJlY3QsIGJvdW5kYXJ5UmVjdDogQm91bmRhcnkpOiB2b2lkIHtcclxuICAgIGxldCB4ID0gZXZlbnQueCArIGV2ZW50Lm9mZnNldEZyb21Ib3N0LnJpZ2h0O1xyXG5cclxuICAgIGlmIChib3VuZGFyeVJlY3QpIHtcclxuICAgICAgeCA9IE1hdGgubWF4KGJvdW5kYXJ5UmVjdC5sZWZ0LCBNYXRoLm1pbih4LCBib3VuZGFyeVJlY3QucmlnaHQpKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgd2lkdGggPSBNYXRoLm1heCh0aGlzLm5neFJlc2l6ZU1pbldpZHRoLCB4IC0gaG9zdEVsZW1lbnRSZWN0LmxlZnQpO1xyXG5cclxuICAgIGlmIChib3VuZGFyeVJlY3QpIHtcclxuICAgICAgd2lkdGggPSBNYXRoLm1pbih3aWR0aCwgYm91bmRhcnlSZWN0LnJpZ2h0IC0gaG9zdEVsZW1lbnRSZWN0LmxlZnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGluaXRpYXRvclR5cGUgPSB0aGlzLnJlc29sdmVJbml0aWF0b3JUeXBlKGV2ZW50LmluaXRpYXRvcik7XHJcblxyXG4gICAgY29uc3QgaGVpZ2h0UHJvcG9ydGlvbnMgPSBpbml0aWF0b3JUeXBlID8gdGhpcy5nZXRIZWlnaHRQcm9wb3J0aW9ucyhib3VuZGFyeVJlY3QsIGhvc3RFbGVtZW50UmVjdCwgaW5pdGlhdG9yVHlwZSwgd2lkdGgpIDogbnVsbDtcclxuXHJcbiAgICBpZiAoaGVpZ2h0UHJvcG9ydGlvbnMpIHtcclxuICAgICAgd2lkdGggPSBNYXRoLm1pbih3aWR0aCwgdGhpcy5mcm9tSGVpZ2h0UHJvcG9ydGlvbihoZWlnaHRQcm9wb3J0aW9ucy5oZWlnaHQpKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnVwZGF0ZUhvc3RTdHlsZSgnd2lkdGgnLCBgJHt3aWR0aH1weGApO1xyXG5cclxuICAgIGlmIChoZWlnaHRQcm9wb3J0aW9ucykge1xyXG4gICAgICB0aGlzLnVwZGF0ZUhvc3RTdHlsZSgndG9wJywgYCR7dGhpcy5iYXNlZE9uQm91bmRhcnkoaGVpZ2h0UHJvcG9ydGlvbnMudG9wLCAndG9wJyl9cHhgKTtcclxuICAgICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ2hlaWdodCcsIGAke2hlaWdodFByb3BvcnRpb25zLmhlaWdodH1weGApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZW1pdFJlc2l6ZShldmVudC5uYXRpdmVFdmVudCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJvdHRvbU1vdmVtZW50KGV2ZW50OiBNb3ZlbWVudCwgaG9zdEVsZW1lbnRSZWN0OiBET01SZWN0LCBib3VuZGFyeVJlY3Q6IEJvdW5kYXJ5KTogdm9pZCB7XHJcbiAgICBsZXQgeSA9IGV2ZW50LnkgKyBldmVudC5vZmZzZXRGcm9tSG9zdC5ib3R0b207XHJcblxyXG4gICAgaWYgKGJvdW5kYXJ5UmVjdCkge1xyXG4gICAgICB5ID0gTWF0aC5tYXgoYm91bmRhcnlSZWN0LnRvcCwgTWF0aC5taW4oeSwgYm91bmRhcnlSZWN0LmJvdHRvbSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBoZWlnaHQgPSBNYXRoLm1heCh0aGlzLm5neFJlc2l6ZU1pbkhlaWdodCwgeSAtIGhvc3RFbGVtZW50UmVjdC50b3ApO1xyXG5cclxuICAgIGlmIChib3VuZGFyeVJlY3QpIHtcclxuICAgICAgaGVpZ2h0ID0gTWF0aC5taW4oaGVpZ2h0LCBib3VuZGFyeVJlY3QuYm90dG9tIC0gaG9zdEVsZW1lbnRSZWN0LnRvcCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW5pdGlhdG9yVHlwZSA9IHRoaXMucmVzb2x2ZUluaXRpYXRvclR5cGUoZXZlbnQuaW5pdGlhdG9yKTtcclxuXHJcbiAgICBjb25zdCB3aWR0aFByb3BvcnRpb25zID0gaW5pdGlhdG9yVHlwZSA/IHRoaXMuZ2V0V2lkdGhQcm9wb3J0aW9ucyhib3VuZGFyeVJlY3QsIGhvc3RFbGVtZW50UmVjdCwgaW5pdGlhdG9yVHlwZSwgaGVpZ2h0KSA6IG51bGw7XHJcblxyXG4gICAgaWYgKHdpZHRoUHJvcG9ydGlvbnMpIHtcclxuICAgICAgaGVpZ2h0ID0gTWF0aC5taW4oaGVpZ2h0LCB0aGlzLmZyb21XaWR0aFByb3BvcnRpb24od2lkdGhQcm9wb3J0aW9ucy53aWR0aCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlSG9zdFN0eWxlKCdoZWlnaHQnLCBgJHtoZWlnaHR9cHhgKTtcclxuXHJcbiAgICBpZiAod2lkdGhQcm9wb3J0aW9ucykge1xyXG4gICAgICB0aGlzLnVwZGF0ZUhvc3RTdHlsZSgnbGVmdCcsIGAke3RoaXMuYmFzZWRPbkJvdW5kYXJ5KHdpZHRoUHJvcG9ydGlvbnMubGVmdCwgJ2xlZnQnKX1weGApO1xyXG4gICAgICB0aGlzLnVwZGF0ZUhvc3RTdHlsZSgnd2lkdGgnLCBgJHt3aWR0aFByb3BvcnRpb25zLndpZHRofXB4YCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5lbWl0UmVzaXplKGV2ZW50Lm5hdGl2ZUV2ZW50KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbGVmdE1vdmVtZW50KGV2ZW50OiBNb3ZlbWVudCwgaG9zdEVsZW1lbnRSZWN0OiBET01SZWN0LCBib3VuZGFyeVJlY3Q6IEJvdW5kYXJ5KTogdm9pZCB7XHJcbiAgICBsZXQgeCA9IGV2ZW50LnggLSBldmVudC5vZmZzZXRGcm9tSG9zdC5sZWZ0O1xyXG5cclxuICAgIGlmIChib3VuZGFyeVJlY3QpIHtcclxuICAgICAgeCA9IE1hdGgubWF4KGJvdW5kYXJ5UmVjdC5sZWZ0LCBNYXRoLm1pbih4LCBib3VuZGFyeVJlY3QucmlnaHQpKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbGVmdCA9IE1hdGgubWluKHgsIGhvc3RFbGVtZW50UmVjdC5yaWdodCAtIHRoaXMubmd4UmVzaXplTWluV2lkdGgpO1xyXG4gICAgbGV0IHdpZHRoID0gaG9zdEVsZW1lbnRSZWN0LndpZHRoIC0gKGxlZnQgLSBob3N0RWxlbWVudFJlY3QubGVmdCk7XHJcblxyXG4gICAgY29uc3QgaW5pdGlhdG9yVHlwZSA9IHRoaXMucmVzb2x2ZUluaXRpYXRvclR5cGUoZXZlbnQuaW5pdGlhdG9yKTtcclxuXHJcbiAgICBjb25zdCBoZWlnaHRQcm9wb3J0aW9ucyA9IGluaXRpYXRvclR5cGUgPyB0aGlzLmdldEhlaWdodFByb3BvcnRpb25zKGJvdW5kYXJ5UmVjdCwgaG9zdEVsZW1lbnRSZWN0LCBpbml0aWF0b3JUeXBlLCB3aWR0aCkgOiBudWxsO1xyXG5cclxuICAgIGlmIChoZWlnaHRQcm9wb3J0aW9ucykge1xyXG4gICAgICBsZWZ0ID0gbGVmdCArICh3aWR0aCAtIHRoaXMuZnJvbUhlaWdodFByb3BvcnRpb24oaGVpZ2h0UHJvcG9ydGlvbnMuaGVpZ2h0KSk7XHJcbiAgICAgIHdpZHRoID0gTWF0aC5taW4od2lkdGgsIHRoaXMuZnJvbUhlaWdodFByb3BvcnRpb24oaGVpZ2h0UHJvcG9ydGlvbnMuaGVpZ2h0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ2xlZnQnLCBgJHt0aGlzLmJhc2VkT25Cb3VuZGFyeShsZWZ0LCAnbGVmdCcpfXB4YCk7XHJcbiAgICB0aGlzLnVwZGF0ZUhvc3RTdHlsZSgnd2lkdGgnLCBgJHt3aWR0aH1weGApO1xyXG5cclxuICAgIGlmIChoZWlnaHRQcm9wb3J0aW9ucykge1xyXG4gICAgICB0aGlzLnVwZGF0ZUhvc3RTdHlsZSgndG9wJywgYCR7dGhpcy5iYXNlZE9uQm91bmRhcnkoaGVpZ2h0UHJvcG9ydGlvbnMudG9wLCAndG9wJyl9cHhgKTtcclxuICAgICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ2hlaWdodCcsIGAke2hlaWdodFByb3BvcnRpb25zLmhlaWdodH1weGApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZW1pdFJlc2l6ZShldmVudC5uYXRpdmVFdmVudCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgcG9zaXRpb24gYW5kIHNpemUgb2Ygd2lkdGhcclxuICAgKi9cclxuICBwcml2YXRlIGdldFdpZHRoUHJvcG9ydGlvbnMoXHJcbiAgICBib3VuZGFyeVJlY3Q6IEJvdW5kYXJ5LFxyXG4gICAgaG9zdEVsZW1lbnRSZWN0OiBET01SZWN0LFxyXG4gICAgdHlwZTogTmd4UmVzaXplSGFuZGxlVHlwZSxcclxuICAgIGhlaWdodDogbnVtYmVyXHJcbiAgKToge1xyXG4gICAgbGVmdDogbnVtYmVyO1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICB9IHwgbnVsbCB7XHJcbiAgICBsZXQgd2lkdGggPSB0aGlzLmZyb21IZWlnaHRQcm9wb3J0aW9uKGhlaWdodCk7XHJcblxyXG4gICAgaWYgKCF3aWR0aCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZSAhPT0gTmd4UmVzaXplSGFuZGxlVHlwZS5Ub3BMZWZ0ICYmIHR5cGUgIT09IE5neFJlc2l6ZUhhbmRsZVR5cGUuQm90dG9tTGVmdCkge1xyXG4gICAgICB3aWR0aCA9IGJvdW5kYXJ5UmVjdCA/IE1hdGgubWluKHdpZHRoLCBib3VuZGFyeVJlY3QucmlnaHQgLSBob3N0RWxlbWVudFJlY3QubGVmdCkgOiB3aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZSAhPT0gTmd4UmVzaXplSGFuZGxlVHlwZS5Ub3BSaWdodCAmJiB0eXBlICE9PSBOZ3hSZXNpemVIYW5kbGVUeXBlLkJvdHRvbVJpZ2h0KSB7XHJcbiAgICAgIHdpZHRoID0gYm91bmRhcnlSZWN0ID8gTWF0aC5taW4od2lkdGgsIGhvc3RFbGVtZW50UmVjdC5yaWdodCAtIGJvdW5kYXJ5UmVjdC5sZWZ0KSA6IHdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBsZWZ0ID0gaG9zdEVsZW1lbnRSZWN0LmxlZnQ7XHJcblxyXG4gICAgaWYgKHR5cGUgPT09IE5neFJlc2l6ZUhhbmRsZVR5cGUuVG9wTGVmdCB8fCB0eXBlID09PSBOZ3hSZXNpemVIYW5kbGVUeXBlLkJvdHRvbUxlZnQpIHtcclxuICAgICAgbGVmdCA9IGxlZnQgLSAod2lkdGggLSBob3N0RWxlbWVudFJlY3Qud2lkdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlID09PSBOZ3hSZXNpemVIYW5kbGVUeXBlLlRvcCB8fCB0eXBlID09PSBOZ3hSZXNpemVIYW5kbGVUeXBlLkJvdHRvbSkge1xyXG4gICAgICBsZWZ0ID0gbGVmdCAtICh3aWR0aCAtIGhvc3RFbGVtZW50UmVjdC53aWR0aCkgLyAyO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7IGxlZnQsIHdpZHRoIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgcG9zaXRpb24gYW5kIHNpemUgb2YgaGVpZ2h0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRIZWlnaHRQcm9wb3J0aW9ucyhcclxuICAgIGJvdW5kYXJ5UmVjdDogQm91bmRhcnksXHJcbiAgICBob3N0RWxlbWVudFJlY3Q6IERPTVJlY3QsXHJcbiAgICB0eXBlOiBOZ3hSZXNpemVIYW5kbGVUeXBlLFxyXG4gICAgd2lkdGg6IG51bWJlclxyXG4gICk6IHtcclxuICAgIHRvcDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgfSB8IG51bGwge1xyXG4gICAgbGV0IGhlaWdodCA9IHRoaXMuZnJvbVdpZHRoUHJvcG9ydGlvbih3aWR0aCk7XHJcblxyXG4gICAgaWYgKCFoZWlnaHQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGUgIT09IE5neFJlc2l6ZUhhbmRsZVR5cGUuVG9wTGVmdCAmJiB0eXBlICE9PSBOZ3hSZXNpemVIYW5kbGVUeXBlLlRvcFJpZ2h0KSB7XHJcbiAgICAgIGhlaWdodCA9IGJvdW5kYXJ5UmVjdCA/IE1hdGgubWluKGhlaWdodCwgYm91bmRhcnlSZWN0LmJvdHRvbSAtIGhvc3RFbGVtZW50UmVjdC50b3ApIDogaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlICE9PSBOZ3hSZXNpemVIYW5kbGVUeXBlLkJvdHRvbUxlZnQgJiYgdHlwZSAhPT0gTmd4UmVzaXplSGFuZGxlVHlwZS5Cb3R0b21SaWdodCkge1xyXG4gICAgICBoZWlnaHQgPSBib3VuZGFyeVJlY3QgPyBNYXRoLm1pbihoZWlnaHQsIGhvc3RFbGVtZW50UmVjdC5ib3R0b20gLSBib3VuZGFyeVJlY3QudG9wKSA6IGhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdG9wID0gaG9zdEVsZW1lbnRSZWN0LnRvcDtcclxuXHJcbiAgICBpZiAodHlwZSA9PT0gTmd4UmVzaXplSGFuZGxlVHlwZS5Ub3BMZWZ0IHx8IHR5cGUgPT09IE5neFJlc2l6ZUhhbmRsZVR5cGUuVG9wUmlnaHQpIHtcclxuICAgICAgdG9wID0gdG9wIC0gKGhlaWdodCAtIGhvc3RFbGVtZW50UmVjdC5oZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlID09PSBOZ3hSZXNpemVIYW5kbGVUeXBlLkxlZnQgfHwgdHlwZSA9PT0gTmd4UmVzaXplSGFuZGxlVHlwZS5SaWdodCkge1xyXG4gICAgICB0b3AgPSB0b3AgLSAoaGVpZ2h0IC0gaG9zdEVsZW1lbnRSZWN0LmhlaWdodCkgLyAyO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7IHRvcCwgaGVpZ2h0IH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgd2lkdGggYmFzZWQgb24ge0BsaW5rIG5neFJlc2l6ZUFzcGVjdFJhdGlvfSBmcm9tIGhlaWdodFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZnJvbUhlaWdodFByb3BvcnRpb24oaGVpZ2h0OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuICF0aGlzLm5neFJlc2l6ZUFzcGVjdFJhdGlvID8gMCA6IE1hdGguZmxvb3IoKGhlaWdodCAvIHRoaXMubmd4UmVzaXplQXNwZWN0UmF0aW8pICogMTAwKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBoZWlnaHQgYmFzZWQgb24ge0BsaW5rIG5neFJlc2l6ZUFzcGVjdFJhdGlvfSBmcm9tIHdpZHRoXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBmcm9tV2lkdGhQcm9wb3J0aW9uKHdpZHRoOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuICF0aGlzLm5neFJlc2l6ZUFzcGVjdFJhdGlvID8gMCA6IE1hdGguZmxvb3IoKHdpZHRoICogdGhpcy5uZ3hSZXNpemVBc3BlY3RSYXRpbykgLyAxMDApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyBob3N0IGVsZW1lbnQgc3R5bGVcclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZUhvc3RTdHlsZShzdHlsZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCBzdHlsZSwgdmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzb2x2ZXMgdGhlIHR5cGUgb2YgaGFuZGxlIEhUTUwgZWxlbWVudFxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVzb2x2ZUluaXRpYXRvclR5cGUoaW5pdGlhdG9yOiBIVE1MRWxlbWVudCk6IE5neFJlc2l6ZUhhbmRsZVR5cGUgfCBudWxsIHtcclxuICAgIHJldHVybiBpbml0aWF0b3IuZ2V0QXR0cmlidXRlKCdkYXRhLW5neC1yZXNpemUtaGFuZGxlLXR5cGUnKSBhcyBOZ3hSZXNpemVIYW5kbGVUeXBlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW1pdHMgcmVzaXplIGV2ZW50IHRvIHRoZSB7QGxpbmsgbmd4UmVzaXplZH1cclxuICAgKi9cclxuICBwcml2YXRlIGVtaXRSZXNpemUobmF0aXZlRXZlbnQ/OiBFdmVudCk6IHZvaWQge1xyXG4gICAgY29uc3QgcmVjdCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgY29uc3QgcGFyZW50UmVjdCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQ/LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcblxyXG4gICAgdGhpcy5uZ3hSZXNpemVkLmVtaXQoe1xyXG4gICAgICAvLyBuYXRpdmVFdmVudCxcclxuICAgICAgcGFyZW50UmVjdCxcclxuICAgICAgdG9wOiByZWN0LnRvcCxcclxuICAgICAgcmlnaHQ6IHJlY3QucmlnaHQsXHJcbiAgICAgIGJvdHRvbTogcmVjdC5ib3R0b20sXHJcbiAgICAgIGxlZnQ6IHJlY3QubGVmdCxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=