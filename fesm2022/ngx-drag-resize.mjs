import * as i0 from '@angular/core';
import { Directive, InjectionToken, Injectable, Inject, EventEmitter, PLATFORM_ID, Input, Output, Optional, HostBinding, NgModule } from '@angular/core';
import { EMPTY, merge, fromEvent, Subject } from 'rxjs';
import { tap, map, switchMap, takeUntil, filter } from 'rxjs/operators';
import { DOCUMENT, isPlatformServer } from '@angular/common';

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
class BoundaryDirective {
    windowObject;
    documentObject;
    /**
     * CSS selector or HTML element
     */
    boundary = null;
    constructor(windowObject, documentObject) {
        this.windowObject = windowObject;
        this.documentObject = documentObject;
    }
    /**
     * Get boundary position based on {@link boundary}
     */
    getBoundary() {
        const rect = {};
        const boundaryElement = this.resolveBoundaryElement();
        if (boundaryElement instanceof Element) {
            const boundaryElementRect = boundaryElement.getBoundingClientRect();
            rect.left = boundaryElementRect.left;
            rect.top = boundaryElementRect.top;
            rect.bottom = boundaryElementRect.bottom;
            rect.right = boundaryElementRect.right;
            return rect;
        }
        if (boundaryElement instanceof Window && this.windowObject) {
            rect.top = 0;
            rect.left = 0;
            rect.right = this.windowObject.innerWidth;
            rect.bottom = this.windowObject.innerHeight;
            return rect;
        }
        return null;
    }
    /**
     * Resolves HTML element based on {@link boundary}
     */
    resolveBoundaryElement() {
        if (!this.boundary) {
            return null;
        }
        if (this.boundary === 'window' && this.windowObject) {
            return this.windowObject;
        }
        if (typeof this.boundary === 'string') {
            return this.documentObject ? this.documentObject.querySelector(this.boundary) : null;
        }
        return this.boundary;
    }
    /**
     * Returns positional value based on boundary position
     */
    basedOnBoundary(value, position) {
        const boundary = this.getBoundary();
        if (!boundary) {
            return value;
        }
        switch (position) {
            case 'left':
                return value - boundary.left;
            case 'top':
                return value - boundary.top;
        }
        return value;
    }
    static ɵfac = function BoundaryDirective_Factory(t) { return new (t || BoundaryDirective)(i0.ɵɵdirectiveInject(Window), i0.ɵɵdirectiveInject(Document)); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: BoundaryDirective, selectors: [["", "ngxBoundary", ""]] });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BoundaryDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxBoundary]',
            }]
    }], function () { return [{ type: Window }, { type: Document }]; }, null); })();

/**
 * A DI Token representing the window object.
 *
 * Note: might not be available in the Application Context when Application and Rendering
 * Contexts are not the same (e.g. when running the application in a Web Worker or Server).
 *
 * @internal
 */
const WINDOW = new InjectionToken('lib.window', {
    factory: () => (typeof window !== 'undefined' ? window : null)
});

/**
 * The service that allows to observe the element dragging
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @internal
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
class DragService {
    document;
    window;
    /**
     * Emits on mouse or touch event was ended
     */
    // private readonly leave$ = merge(
    //   fromEvent<MovementNative>(this.document, 'mouseup'),
    //   fromEvent<MovementNative>(this.document, 'touchend')
    // );
    /**
     * Emits on mouse or touch move
     */
    // private readonly move$ = merge(
    //   fromEvent<MovementNative>(this.window, 'mousemove'),
    //   fromEvent<MovementNative>(this.window, 'touchmove')
    // );
    constructor(document, window) {
        this.document = document;
        this.window = window;
    }
    /**
     * Creates an observable that emits drag event
     */
    fromElement(target) {
        if (!this.document) {
            return EMPTY;
        }
        const enter$ = merge(fromEvent(target, 'mousedown'), fromEvent(target, 'touchstart'));
        return enter$.pipe(tap((event) => event.preventDefault()), map((event) => this.fromEnter(event)), switchMap((event) => this.forMove(event)));
    }
    /**
     * Returns position of mouse or touch event
     */
    fromMovementNativeEvent(event) {
        let x = 0;
        let y = 0;
        if (!this.window) {
            return { x, y };
        }
        if ('TouchEvent' in this.window && event instanceof TouchEvent) {
            const touch = event.touches.length ? event.touches.item(0) : null;
            x = touch ? touch.clientX : 0;
            y = touch ? touch.clientY : 0;
        }
        if (event instanceof MouseEvent) {
            x = event.clientX;
            y = event.clientY;
        }
        return { x, y };
    }
    /**
     * Returns position of event when drag was started
     */
    fromEnter(event) {
        return this.fromMovementNativeEvent(event);
    }
    /**
     * Implements behaviour to detect drag events
     */
    forMove(initial) {
        return merge(fromEvent(this.window, 'mousemove'), fromEvent(this.window, 'touchmove')).pipe(map((event) => {
            const positionBase = this.fromMovementNativeEvent(event);
            return {
                ...positionBase,
                initial,
                nativeEvent: event,
            };
        }), takeUntil(merge(fromEvent(this.document, 'mouseup'), fromEvent(this.document, 'touchend'))));
        // return this.move$.pipe(
        //   map((event) => {
        //     const positionBase = this.fromMovementNativeEvent(event);
        //     return {
        //       ...positionBase,
        //       initial,
        //       nativeEvent: event,
        //     };
        //   }),
        //   takeUntil(this.leave$)
        // );
    }
    static ɵfac = function DragService_Factory(t) { return new (t || DragService)(i0.ɵɵinject(DOCUMENT), i0.ɵɵinject(WINDOW)); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: DragService, factory: DragService.ɵfac, providedIn: 'root' });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DragService, [{
        type: Injectable,
        args: [{
                providedIn: 'root',
            }]
    }], function () { return [{ type: Document, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: Window, decorators: [{
                type: Inject,
                args: [WINDOW]
            }] }]; }, null); })();

/**
 * The directive that allows to drag HTML element on page
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
class NgxDragDirective extends BoundaryDirective {
    elementRef;
    renderer;
    dragService;
    window;
    document;
    platformId;
    /**
     * Initial size and position of host element
     */
    hostElementRectInitial = null;
    /**
     * Emits when directive was destroyed
     */
    destroy$ = new Subject();
    /**
     * Emits when observable target was changed
     */
    observableTargetChange$ = new Subject();
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
    ngxDragPositionStrategy = 'free';
    /**
     * Locks axis for the dragging
     */
    ngxDragLockAxis = null;
    /**
     * Disable any drag events
     */
    ngxDragDisabled = false;
    /**
     * Constrain for the dragging element.
     * Can be as a HTMLElement or CSS selector.
     * You can put 'window' string to define window object as a constrain.
     */
    set ngxDragBoundary(boundary) {
        this.boundary = boundary;
    }
    /**
     * Emits changes when element was dragged
     */
    ngxDragged = new EventEmitter();
    constructor(elementRef, renderer, dragService, window, document, platformId) {
        super(window, document);
        this.elementRef = elementRef;
        this.renderer = renderer;
        this.dragService = dragService;
        this.window = window;
        this.document = document;
        this.platformId = platformId;
    }
    /**
     * @inheritDoc
     */
    ngOnInit() {
        if (isPlatformServer(this.platformId)) {
            return;
        }
        this.observe();
    }
    /**
     * @inheritDoc
     */
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.observableTargetChange$.complete();
    }
    /**
     * Observe the element dragging which will be as handle for dragging
     */
    observe(target = this.elementRef.nativeElement) {
        this.observableTargetChange$.next(true);
        let hostElementRect = this.elementRef.nativeElement.getBoundingClientRect();
        let eventInitial = null;
        this.dragService
            .fromElement(target)
            .pipe(tap((event) => event.nativeEvent.preventDefault()), map((event) => {
            if (!eventInitial ||
                eventInitial.x !== event.initial.x ||
                eventInitial.y !== event.initial.y) {
                eventInitial = event.initial;
                hostElementRect = this.elementRef.nativeElement.getBoundingClientRect();
                if (!this.hostElementRectInitial) {
                    this.updateInitialRect();
                }
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
            };
        }), tap(this.onDrag.bind(this)), takeUntil(this.destroy$), takeUntil(this.observableTargetChange$))
            .subscribe();
    }
    /**
     * Update size and position of host element
     */
    updateInitialRect() {
        if (!this.window) {
            return;
        }
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        this.hostElementRectInitial = {
            left: this.window.scrollX + rect.left,
            top: this.window.scrollY + rect.top,
        };
    }
    /**
     * Starts the calculation of drag event and changes host position
     */
    onDrag(event) {
        if (this.ngxDragDisabled) {
            return;
        }
        const hostElementRect = this.elementRef.nativeElement.getBoundingClientRect();
        const boundaryRect = this.getBoundary();
        let left = event.x - event.offsetFromHost.left;
        let top = event.y - event.offsetFromHost.top;
        if (boundaryRect) {
            left = Math.max(boundaryRect.left, left);
            left = Math.min(boundaryRect.left + (boundaryRect.right - boundaryRect.left) - hostElementRect.width, left);
            top = Math.max(boundaryRect.top, top);
            top = Math.min(boundaryRect.top + (boundaryRect.bottom - boundaryRect.top) - hostElementRect.height, top);
        }
        if (this.ngxDragPositionStrategy === 'free' && this.hostElementRectInitial) {
            left = left - this.hostElementRectInitial.left + this.window.scrollX;
            top = top - this.hostElementRectInitial.top + this.window.scrollY;
            if (this.ngxDragLockAxis === 'y') {
                top = hostElementRect.top - this.hostElementRectInitial.top + this.window.scrollY;
            }
            if (this.ngxDragLockAxis === 'x') {
                left = hostElementRect.left - this.hostElementRectInitial.left + this.window.scrollX;
            }
            this.updateHostStyle('transform', `translate3d(${left}px, ${top}px, 0)`);
            this.emitDrag(event.nativeEvent);
            return;
        }
        if (this.ngxDragLockAxis === 'x') {
            this.updateHostStyle('top', `${this.basedOnBoundary(top, 'top')}px`);
            this.emitDrag(event.nativeEvent);
            return;
        }
        if (this.ngxDragLockAxis === 'y') {
            this.updateHostStyle('left', `${this.basedOnBoundary(left, 'left')}px`);
            this.emitDrag(event.nativeEvent);
            return;
        }
        this.updateHostStyle('left', `${this.basedOnBoundary(left, 'left')}px`);
        this.updateHostStyle('top', `${this.basedOnBoundary(top, 'top')}px`);
        this.emitDrag(event.nativeEvent);
    }
    /**
     * Updates the host style
     */
    updateHostStyle(style, value) {
        this.renderer.setStyle(this.elementRef.nativeElement, style, value);
    }
    /**
     * Emits drag event to the {@link ngxDragged}
     */
    emitDrag(nativeEvent) {
        const rect = this.elementRef.nativeElement.getBoundingClientRect();
        const parentRect = this.elementRef.nativeElement.parentElement?.getBoundingClientRect();
        this.ngxDragged.emit({
            // nativeEvent,    
            parentRect,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
        });
    }
    static ɵfac = function NgxDragDirective_Factory(t) { return new (t || NgxDragDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.Renderer2), i0.ɵɵdirectiveInject(DragService), i0.ɵɵdirectiveInject(WINDOW), i0.ɵɵdirectiveInject(DOCUMENT), i0.ɵɵdirectiveInject(PLATFORM_ID)); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NgxDragDirective, selectors: [["", "ngxDrag", ""]], inputs: { ngxDragPositionStrategy: "ngxDragPositionStrategy", ngxDragLockAxis: "ngxDragLockAxis", ngxDragDisabled: "ngxDragDisabled", ngxDragBoundary: "ngxDragBoundary" }, outputs: { ngxDragged: "ngxDragged" }, features: [i0.ɵɵInheritDefinitionFeature] });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxDragDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxDrag]',
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.Renderer2 }, { type: DragService }, { type: Window, decorators: [{
                type: Inject,
                args: [WINDOW]
            }] }, { type: Document, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }]; }, { ngxDragPositionStrategy: [{
            type: Input
        }], ngxDragLockAxis: [{
            type: Input
        }], ngxDragDisabled: [{
            type: Input
        }], ngxDragBoundary: [{
            type: Input
        }], ngxDragged: [{
            type: Output
        }] }); })();

/**
 * The directive that allows to mark HTML element as handle of dragging element for {@link NgxDragDirective}
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
class NgxDragHandleDirective {
    elementRef;
    dragDirective;
    platformId;
    constructor(elementRef, dragDirective, platformId) {
        this.elementRef = elementRef;
        this.dragDirective = dragDirective;
        this.platformId = platformId;
    }
    /**
     * @inheritDoc
     */
    ngAfterViewInit() {
        this.observe();
    }
    /**
     * @inheritDoc
     */
    ngOnDestroy() {
        this.observe();
    }
    /**
     * Sets host element as observable point for {@link NgxDragDirective}
     */
    observe() {
        if (isPlatformServer(this.platformId) || !this.dragDirective) {
            return;
        }
        this.dragDirective.observe(this.elementRef.nativeElement);
    }
    static ɵfac = function NgxDragHandleDirective_Factory(t) { return new (t || NgxDragHandleDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(NgxDragDirective, 8), i0.ɵɵdirectiveInject(PLATFORM_ID)); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NgxDragHandleDirective, selectors: [["", "ngxDragHandle", ""]] });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxDragHandleDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxDragHandle]',
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: NgxDragDirective, decorators: [{
                type: Optional
            }] }, { type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }]; }, null); })();

var NgxResizeHandleType;
(function (NgxResizeHandleType) {
    NgxResizeHandleType["TopLeft"] = "top-left";
    NgxResizeHandleType["Top"] = "top";
    NgxResizeHandleType["TopRight"] = "top-right";
    NgxResizeHandleType["Right"] = "right";
    NgxResizeHandleType["BottomRight"] = "bottom-right";
    NgxResizeHandleType["Bottom"] = "bottom";
    NgxResizeHandleType["BottomLeft"] = "bottom-left";
    NgxResizeHandleType["Left"] = "left";
})(NgxResizeHandleType || (NgxResizeHandleType = {}));

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
    static ɵfac = function NgxResizeDirective_Factory(t) { return new (t || NgxResizeDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.Renderer2), i0.ɵɵdirectiveInject(DragService), i0.ɵɵdirectiveInject(DOCUMENT), i0.ɵɵdirectiveInject(WINDOW), i0.ɵɵdirectiveInject(PLATFORM_ID)); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NgxResizeDirective, selectors: [["", "ngxResize", ""]], hostVars: 2, hostBindings: function NgxResizeDirective_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵstyleProp("position", ctx.ngxResizePosition);
        } }, inputs: { ngxResizeMinWidth: "ngxResizeMinWidth", ngxResizeMinHeight: "ngxResizeMinHeight", ngxResizeAspectRatio: "ngxResizeAspectRatio", ngxResizeDisabled: "ngxResizeDisabled", ngxResizeLockAxis: "ngxResizeLockAxis", ngxResizeBoundary: "ngxResizeBoundary", ngxResizeWheelInitiatorRegExp: "ngxResizeWheelInitiatorRegExp", ngxResizeWheelDisabled: "ngxResizeWheelDisabled", ngxResizeWheelInverse: "ngxResizeWheelInverse", ngxResizeTouchesDisabled: "ngxResizeTouchesDisabled", ngxResizePosition: "ngxResizePosition" }, outputs: { ngxResized: "ngxResized" }, features: [i0.ɵɵInheritDefinitionFeature] });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxResizeDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxResize]',
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.Renderer2 }, { type: DragService }, { type: Document, decorators: [{
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

/**
 * The directive that allows to mark HTML element as one of handle of resizing element for {@link NgxResizeDirective}
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 *
 * @dynamic
 * @see https://angular.io/guide/angular-compiler-options#strictmetadataemit
 */
class NgxResizeHandleDirective {
    elementRef;
    platformId;
    resizeDirective;
    /**
     * Sets the attribute which define the side the HTML element will affect during drag
     */
    type = null;
    constructor(elementRef, platformId, resizeDirective) {
        this.elementRef = elementRef;
        this.platformId = platformId;
        this.resizeDirective = resizeDirective;
    }
    /**
     * @inheritDoc
     */
    ngAfterViewInit() {
        if (isPlatformServer(this.platformId) || !this.resizeDirective) {
            return;
        }
        this.resizeDirective.observe(this.elementRef.nativeElement);
    }
    /**
     * @inheritDoc
     */
    ngOnDestroy() {
        if (!this.resizeDirective) {
            return;
        }
        this.resizeDirective.unsubscribe(this.elementRef.nativeElement);
    }
    static ɵfac = function NgxResizeHandleDirective_Factory(t) { return new (t || NgxResizeHandleDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(PLATFORM_ID), i0.ɵɵdirectiveInject(NgxResizeDirective, 8)); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NgxResizeHandleDirective, selectors: [["", "ngxResizeHandle", ""]], hostVars: 1, hostBindings: function NgxResizeHandleDirective_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-ngx-resize-handle-type", ctx.type);
        } }, inputs: { type: ["ngxResizeHandle", "type"] } });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxResizeHandleDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxResizeHandle]',
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }, { type: NgxResizeDirective, decorators: [{
                type: Optional
            }] }]; }, { type: [{
            type: Input,
            args: ['ngxResizeHandle']
        }, {
            type: HostBinding,
            args: ['attr.data-ngx-resize-handle-type']
        }] }); })();

/**
 * @internal
 */
class SharedModule {
    static ɵfac = function SharedModule_Factory(t) { return new (t || SharedModule)(); };
    static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SharedModule });
    static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SharedModule, [{
        type: NgModule,
        args: [{
                declarations: [
                    BoundaryDirective
                ],
                exports: [
                    BoundaryDirective
                ]
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(SharedModule, { declarations: [BoundaryDirective], exports: [BoundaryDirective] }); })();

/**
 * The module provides opportunity to use drag and resize functionality on HTML elements
 *
 * @author Dmytro Parfenov <dmitryparfenov937@gmail.com>
 */
class NgxDragResizeModule {
    static ɵfac = function NgxDragResizeModule_Factory(t) { return new (t || NgxDragResizeModule)(); };
    static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NgxDragResizeModule });
    static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SharedModule] });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxDragResizeModule, [{
        type: NgModule,
        args: [{
                imports: [
                    SharedModule
                ],
                declarations: [
                    NgxDragDirective,
                    NgxDragHandleDirective,
                    NgxResizeDirective,
                    NgxResizeHandleDirective
                ],
                exports: [NgxDragDirective, NgxDragHandleDirective, NgxResizeDirective, NgxResizeHandleDirective]
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(NgxDragResizeModule, { declarations: [NgxDragDirective,
        NgxDragHandleDirective,
        NgxResizeDirective,
        NgxResizeHandleDirective], imports: [SharedModule], exports: [NgxDragDirective, NgxDragHandleDirective, NgxResizeDirective, NgxResizeHandleDirective] }); })();

/*
 * Public API Surface of ngx-drag-resize
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NgxDragDirective, NgxDragHandleDirective, NgxDragResizeModule, NgxResizeDirective, NgxResizeHandleDirective, NgxResizeHandleType };
//# sourceMappingURL=ngx-drag-resize.mjs.map
