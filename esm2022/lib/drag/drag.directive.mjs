import { Directive, EventEmitter, Inject, Input, Output, PLATFORM_ID, } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { DOCUMENT, isPlatformServer } from '@angular/common';
import { BoundaryDirective } from '../shared/boundary/boundary.directive';
import { WINDOW } from '../core/window.token';
import * as i0 from "@angular/core";
import * as i1 from "../core/drag.service";
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
    static ɵfac = function NgxDragDirective_Factory(t) { return new (t || NgxDragDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.Renderer2), i0.ɵɵdirectiveInject(i1.DragService), i0.ɵɵdirectiveInject(WINDOW), i0.ɵɵdirectiveInject(DOCUMENT), i0.ɵɵdirectiveInject(PLATFORM_ID)); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NgxDragDirective, selectors: [["", "ngxDrag", ""]], inputs: { ngxDragPositionStrategy: "ngxDragPositionStrategy", ngxDragLockAxis: "ngxDragLockAxis", ngxDragDisabled: "ngxDragDisabled", ngxDragBoundary: "ngxDragBoundary" }, outputs: { ngxDragged: "ngxDragged" }, features: [i0.ɵɵInheritDefinitionFeature] });
}
export { NgxDragDirective };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxDragDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxDrag]',
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i1.DragService }, { type: Window, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZHJhZy1yZXNpemUvc3JjL2xpYi9kcmFnL2RyYWcuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBRVQsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBR0wsTUFBTSxFQUNOLFdBQVcsR0FFWixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUsxRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7OztBQU05Qzs7Ozs7OztHQU9HO0FBQ0gsTUFHYSxnQkFBaUIsU0FBUSxpQkFBaUI7SUEwRGxDO0lBQ0E7SUFDQTtJQUNnQjtJQUNFO0lBQ0c7SUE3RHhDOztPQUVHO0lBQ0ssc0JBQXNCLEdBR25CLElBQUksQ0FBQztJQUVoQjs7T0FFRztJQUNLLFFBQVEsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBRWpDOztPQUVHO0lBQ0ssdUJBQXVCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUVoRDs7Ozs7Ozs7OztPQVVHO0lBQ00sdUJBQXVCLEdBQXFCLE1BQU0sQ0FBQztJQUU1RDs7T0FFRztJQUNNLGVBQWUsR0FBUyxJQUFJLENBQUM7SUFFdEM7O09BRUc7SUFDTSxlQUFlLEdBQUcsS0FBSyxDQUFDO0lBRWpDOzs7O09BSUc7SUFDSCxJQUFhLGVBQWUsQ0FBQyxRQUE4QjtRQUN6RCxJQUFJLENBQUMsUUFB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QyxXQUFtQjtRQUNsQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ25FLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxxQkFBcUIsRUFBRSxDQUFDO1FBRXhGLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQ25CLG1CQUFtQjtZQUNuQixVQUFVO1lBQ1YsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7U0FDaEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzswRUE1T1UsZ0JBQWdCLHNJQTZEakIsTUFBTSx3QkFDTixRQUFRLHdCQUNSLFdBQVc7NkRBL0RWLGdCQUFnQjs7U0FBaEIsZ0JBQWdCO3VGQUFoQixnQkFBZ0I7Y0FINUIsU0FBUztlQUFDO2dCQUNULFFBQVEsRUFBRSxXQUFXO2FBQ3RCOztzQkE4REksTUFBTTt1QkFBQyxNQUFNOztzQkFDYixNQUFNO3VCQUFDLFFBQVE7O3NCQUNmLE1BQU07dUJBQUMsV0FBVzt3QkFoQ1osdUJBQXVCO2tCQUEvQixLQUFLO1lBS0csZUFBZTtrQkFBdkIsS0FBSztZQUtHLGVBQWU7a0JBQXZCLEtBQUs7WUFPTyxlQUFlO2tCQUEzQixLQUFLO1lBT0ksVUFBVTtrQkFBbkIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgRGlyZWN0aXZlLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIEluamVjdCxcclxuICBJbnB1dCxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT25Jbml0LFxyXG4gIE91dHB1dCxcclxuICBQTEFURk9STV9JRCxcclxuICBSZW5kZXJlcjIsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgbWFwLCB0YWtlVW50aWwsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgRE9DVU1FTlQsIGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBCb3VuZGFyeURpcmVjdGl2ZSB9IGZyb20gJy4uL3NoYXJlZC9ib3VuZGFyeS9ib3VuZGFyeS5kaXJlY3RpdmUnO1xyXG5pbXBvcnQgeyBQb3NpdGlvblN0cmF0ZWd5IH0gZnJvbSAnLi9wb3NpdGlvbi1zdHJhdGVneSc7XHJcbmltcG9ydCB7IEF4aXMgfSBmcm9tICcuLi9jb3JlL2F4aXMnO1xyXG5pbXBvcnQgeyBOZ3hEcmFnIH0gZnJvbSAnLi9kcmFnJztcclxuaW1wb3J0IHsgRHJhZ1NlcnZpY2UgfSBmcm9tICcuLi9jb3JlL2RyYWcuc2VydmljZSc7XHJcbmltcG9ydCB7IFdJTkRPVyB9IGZyb20gJy4uL2NvcmUvd2luZG93LnRva2VuJztcclxuaW1wb3J0IHsgTW92ZW1lbnRCYXNlIH0gZnJvbSAnLi4vY29yZS9tb3ZlbWVudC9tb3ZlbWVudC1iYXNlJztcclxuaW1wb3J0IHsgTW92ZW1lbnQgfSBmcm9tICcuLi9jb3JlL21vdmVtZW50L21vdmVtZW50JztcclxuaW1wb3J0IHsgQm91bmRhcnkgfSBmcm9tICcuLi9zaGFyZWQvYm91bmRhcnkvYm91bmRhcnknO1xyXG5pbXBvcnQgeyBQb3NpdGlvbkJhc2UgfSBmcm9tICcuLi9jb3JlL3Bvc2l0aW9uLWJhc2UnO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBkaXJlY3RpdmUgdGhhdCBhbGxvd3MgdG8gZHJhZyBIVE1MIGVsZW1lbnQgb24gcGFnZVxyXG4gKlxyXG4gKiBAYXV0aG9yIERteXRybyBQYXJmZW5vdiA8ZG1pdHJ5cGFyZmVub3Y5MzdAZ21haWwuY29tPlxyXG4gKlxyXG4gKiBAZHluYW1pY1xyXG4gKiBAc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9hbmd1bGFyLWNvbXBpbGVyLW9wdGlvbnMjc3RyaWN0bWV0YWRhdGFlbWl0XHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tuZ3hEcmFnXScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hEcmFnRGlyZWN0aXZlIGV4dGVuZHMgQm91bmRhcnlEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWwgc2l6ZSBhbmQgcG9zaXRpb24gb2YgaG9zdCBlbGVtZW50XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBob3N0RWxlbWVudFJlY3RJbml0aWFsOiB7XHJcbiAgICBsZWZ0OiBudW1iZXI7XHJcbiAgICB0b3A6IG51bWJlcjtcclxuICB9IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8qKlxyXG4gICAqIEVtaXRzIHdoZW4gZGlyZWN0aXZlIHdhcyBkZXN0cm95ZWRcclxuICAgKi9cclxuICBwcml2YXRlIGRlc3Ryb3kkID0gbmV3IFN1YmplY3QoKTtcclxuXHJcbiAgLyoqXHJcbiAgICogRW1pdHMgd2hlbiBvYnNlcnZhYmxlIHRhcmdldCB3YXMgY2hhbmdlZFxyXG4gICAqL1xyXG4gIHByaXZhdGUgb2JzZXJ2YWJsZVRhcmdldENoYW5nZSQgPSBuZXcgU3ViamVjdCgpO1xyXG5cclxuICAvKipcclxuICAgKiBEZWZpbmUgcG9zaXRpb25pbmcgc3RyYXRlZ3kuXHJcbiAgICpcclxuICAgKiAnZnJlZScgLSBwb3NpdGlvbiB3aWxsIGNoYW5naW5nIGJ5ICd0cmFuc2Zvcm06IHRyYW5zbGF0ZTNkKCknIHN0eWxlXHJcbiAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvdHJhbnNmb3JtLWZ1bmN0aW9uL3RyYW5zbGF0ZTNkXHJcbiAgICpcclxuICAgKiAncmVsYXRpdmUnIC0gcG9zaXRpb24gd2lsbCBjaGFuZ2luZyBieSAndG9wJyBhbmQgJ2xlZnQnIHN0eWxlXHJcbiAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvcG9zaXRpb25cclxuICAgKlxyXG4gICAqIERlZmF1bHQgaXMgJ2ZyZWUnLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG5neERyYWdQb3NpdGlvblN0cmF0ZWd5OiBQb3NpdGlvblN0cmF0ZWd5ID0gJ2ZyZWUnO1xyXG5cclxuICAvKipcclxuICAgKiBMb2NrcyBheGlzIGZvciB0aGUgZHJhZ2dpbmdcclxuICAgKi9cclxuICBASW5wdXQoKSBuZ3hEcmFnTG9ja0F4aXM6IEF4aXMgPSBudWxsO1xyXG5cclxuICAvKipcclxuICAgKiBEaXNhYmxlIGFueSBkcmFnIGV2ZW50c1xyXG4gICAqL1xyXG4gIEBJbnB1dCgpIG5neERyYWdEaXNhYmxlZCA9IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJhaW4gZm9yIHRoZSBkcmFnZ2luZyBlbGVtZW50LlxyXG4gICAqIENhbiBiZSBhcyBhIEhUTUxFbGVtZW50IG9yIENTUyBzZWxlY3Rvci5cclxuICAgKiBZb3UgY2FuIHB1dCAnd2luZG93JyBzdHJpbmcgdG8gZGVmaW5lIHdpbmRvdyBvYmplY3QgYXMgYSBjb25zdHJhaW4uXHJcbiAgICovXHJcbiAgQElucHV0KCkgc2V0IG5neERyYWdCb3VuZGFyeShib3VuZGFyeTogc3RyaW5nIHwgSFRNTEVsZW1lbnQpIHtcclxuICAgIHRoaXMuYm91bmRhcnkgPSBib3VuZGFyeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVtaXRzIGNoYW5nZXMgd2hlbiBlbGVtZW50IHdhcyBkcmFnZ2VkXHJcbiAgICovXHJcbiAgQE91dHB1dCgpIG5neERyYWdnZWQgPSBuZXcgRXZlbnRFbWl0dGVyPE5neERyYWc+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVuZGVyZXI6IFJlbmRlcmVyMixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZHJhZ1NlcnZpY2U6IERyYWdTZXJ2aWNlLFxyXG4gICAgQEluamVjdChXSU5ET1cpIHByaXZhdGUgcmVhZG9ubHkgd2luZG93OiBXaW5kb3csXHJcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IGRvY3VtZW50OiBEb2N1bWVudCxcclxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcmVhZG9ubHkgcGxhdGZvcm1JZDogb2JqZWN0XHJcbiAgKSB7XHJcbiAgICBzdXBlcih3aW5kb3csIGRvY3VtZW50KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBpbmhlcml0RG9jXHJcbiAgICovXHJcbiAgbmdPbkluaXQoKTogdm9pZCB7XHJcbiAgICBpZiAoaXNQbGF0Zm9ybVNlcnZlcih0aGlzLnBsYXRmb3JtSWQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm9ic2VydmUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBpbmhlcml0RG9jXHJcbiAgICovXHJcbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICB0aGlzLmRlc3Ryb3kkLm5leHQodHJ1ZSk7XHJcbiAgICB0aGlzLmRlc3Ryb3kkLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLm9ic2VydmFibGVUYXJnZXRDaGFuZ2UkLmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPYnNlcnZlIHRoZSBlbGVtZW50IGRyYWdnaW5nIHdoaWNoIHdpbGwgYmUgYXMgaGFuZGxlIGZvciBkcmFnZ2luZ1xyXG4gICAqL1xyXG4gIG9ic2VydmUodGFyZ2V0ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpOiB2b2lkIHtcclxuICAgIHRoaXMub2JzZXJ2YWJsZVRhcmdldENoYW5nZSQubmV4dCh0cnVlKTtcclxuXHJcbiAgICBsZXQgaG9zdEVsZW1lbnRSZWN0ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBsZXQgZXZlbnRJbml0aWFsOiBQb3NpdGlvbkJhc2UgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmRyYWdTZXJ2aWNlXHJcbiAgICAgIC5mcm9tRWxlbWVudCh0YXJnZXQpXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIHRhcCgoZXZlbnQpID0+IGV2ZW50Lm5hdGl2ZUV2ZW50LnByZXZlbnREZWZhdWx0KCkpLFxyXG4gICAgICAgIG1hcDxNb3ZlbWVudEJhc2UsIE1vdmVtZW50PigoZXZlbnQpID0+IHtcclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgIWV2ZW50SW5pdGlhbCB8fFxyXG4gICAgICAgICAgICBldmVudEluaXRpYWwueCAhPT0gZXZlbnQuaW5pdGlhbC54IHx8XHJcbiAgICAgICAgICAgIGV2ZW50SW5pdGlhbC55ICE9PSBldmVudC5pbml0aWFsLnlcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICBldmVudEluaXRpYWwgPSBldmVudC5pbml0aWFsO1xyXG4gICAgICAgICAgICBob3N0RWxlbWVudFJlY3QgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ob3N0RWxlbWVudFJlY3RJbml0aWFsKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbml0aWFsUmVjdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3Qgb2Zmc2V0RnJvbUhvc3QgPSB7XHJcbiAgICAgICAgICAgIHRvcDogZXZlbnQuaW5pdGlhbC55IC0gaG9zdEVsZW1lbnRSZWN0LnRvcCxcclxuICAgICAgICAgICAgbGVmdDogZXZlbnQuaW5pdGlhbC54IC0gaG9zdEVsZW1lbnRSZWN0LmxlZnQsXHJcbiAgICAgICAgICAgIGJvdHRvbTogaG9zdEVsZW1lbnRSZWN0LmJvdHRvbSAtIGV2ZW50LmluaXRpYWwueSxcclxuICAgICAgICAgICAgcmlnaHQ6IGhvc3RFbGVtZW50UmVjdC5yaWdodCAtIGV2ZW50LmluaXRpYWwueCxcclxuICAgICAgICAgIH0gYXMgQm91bmRhcnk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgLi4uZXZlbnQsXHJcbiAgICAgICAgICAgIGluaXRpYXRvcjogdGFyZ2V0LFxyXG4gICAgICAgICAgICBvZmZzZXRGcm9tSG9zdCxcclxuICAgICAgICAgICAgaW5pdGlhbDogZXZlbnQuaW5pdGlhbCxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgdGFwKHRoaXMub25EcmFnLmJpbmQodGhpcykpLFxyXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcclxuICAgICAgICB0YWtlVW50aWwodGhpcy5vYnNlcnZhYmxlVGFyZ2V0Q2hhbmdlJClcclxuICAgICAgKVxyXG4gICAgICAuc3Vic2NyaWJlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgc2l6ZSBhbmQgcG9zaXRpb24gb2YgaG9zdCBlbGVtZW50XHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVJbml0aWFsUmVjdCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy53aW5kb3cpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlY3QgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICB0aGlzLmhvc3RFbGVtZW50UmVjdEluaXRpYWwgPSB7XHJcbiAgICAgIGxlZnQ6IHRoaXMud2luZG93LnNjcm9sbFggKyByZWN0LmxlZnQsXHJcbiAgICAgIHRvcDogdGhpcy53aW5kb3cuc2Nyb2xsWSArIHJlY3QudG9wLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0cyB0aGUgY2FsY3VsYXRpb24gb2YgZHJhZyBldmVudCBhbmQgY2hhbmdlcyBob3N0IHBvc2l0aW9uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvbkRyYWcoZXZlbnQ6IE1vdmVtZW50KTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5uZ3hEcmFnRGlzYWJsZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhvc3RFbGVtZW50UmVjdCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgY29uc3QgYm91bmRhcnlSZWN0ID0gdGhpcy5nZXRCb3VuZGFyeSgpO1xyXG5cclxuICAgIGxldCBsZWZ0ID0gZXZlbnQueCAtIGV2ZW50Lm9mZnNldEZyb21Ib3N0LmxlZnQ7XHJcbiAgICBsZXQgdG9wID0gZXZlbnQueSAtIGV2ZW50Lm9mZnNldEZyb21Ib3N0LnRvcDtcclxuXHJcbiAgICBpZiAoYm91bmRhcnlSZWN0KSB7XHJcbiAgICAgIGxlZnQgPSBNYXRoLm1heChib3VuZGFyeVJlY3QubGVmdCwgbGVmdCk7XHJcbiAgICAgIGxlZnQgPSBNYXRoLm1pbihcclxuICAgICAgICBib3VuZGFyeVJlY3QubGVmdCArIChib3VuZGFyeVJlY3QucmlnaHQgLSBib3VuZGFyeVJlY3QubGVmdCkgLSBob3N0RWxlbWVudFJlY3Qud2lkdGgsXHJcbiAgICAgICAgbGVmdFxyXG4gICAgICApO1xyXG5cclxuICAgICAgdG9wID0gTWF0aC5tYXgoYm91bmRhcnlSZWN0LnRvcCwgdG9wKTtcclxuICAgICAgdG9wID0gTWF0aC5taW4oXHJcbiAgICAgICAgYm91bmRhcnlSZWN0LnRvcCArIChib3VuZGFyeVJlY3QuYm90dG9tIC0gYm91bmRhcnlSZWN0LnRvcCkgLSBob3N0RWxlbWVudFJlY3QuaGVpZ2h0LFxyXG4gICAgICAgIHRvcFxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm5neERyYWdQb3NpdGlvblN0cmF0ZWd5ID09PSAnZnJlZScgJiYgdGhpcy5ob3N0RWxlbWVudFJlY3RJbml0aWFsKSB7XHJcbiAgICAgIGxlZnQgPSBsZWZ0IC0gdGhpcy5ob3N0RWxlbWVudFJlY3RJbml0aWFsLmxlZnQgKyB0aGlzLndpbmRvdy5zY3JvbGxYO1xyXG4gICAgICB0b3AgPSB0b3AgLSB0aGlzLmhvc3RFbGVtZW50UmVjdEluaXRpYWwudG9wICsgdGhpcy53aW5kb3cuc2Nyb2xsWTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm5neERyYWdMb2NrQXhpcyA9PT0gJ3knKSB7XHJcbiAgICAgICAgdG9wID0gaG9zdEVsZW1lbnRSZWN0LnRvcCAtIHRoaXMuaG9zdEVsZW1lbnRSZWN0SW5pdGlhbC50b3AgKyB0aGlzLndpbmRvdy5zY3JvbGxZO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5uZ3hEcmFnTG9ja0F4aXMgPT09ICd4Jykge1xyXG4gICAgICAgIGxlZnQgPSBob3N0RWxlbWVudFJlY3QubGVmdCAtIHRoaXMuaG9zdEVsZW1lbnRSZWN0SW5pdGlhbC5sZWZ0ICsgdGhpcy53aW5kb3cuc2Nyb2xsWDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUzZCgke2xlZnR9cHgsICR7dG9wfXB4LCAwKWApO1xyXG4gICAgICB0aGlzLmVtaXREcmFnKGV2ZW50Lm5hdGl2ZUV2ZW50KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm5neERyYWdMb2NrQXhpcyA9PT0gJ3gnKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlSG9zdFN0eWxlKCd0b3AnLCBgJHt0aGlzLmJhc2VkT25Cb3VuZGFyeSh0b3AsICd0b3AnKX1weGApO1xyXG4gICAgICB0aGlzLmVtaXREcmFnKGV2ZW50Lm5hdGl2ZUV2ZW50KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm5neERyYWdMb2NrQXhpcyA9PT0gJ3knKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlSG9zdFN0eWxlKCdsZWZ0JywgYCR7dGhpcy5iYXNlZE9uQm91bmRhcnkobGVmdCwgJ2xlZnQnKX1weGApO1xyXG4gICAgICB0aGlzLmVtaXREcmFnKGV2ZW50Lm5hdGl2ZUV2ZW50KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlSG9zdFN0eWxlKCdsZWZ0JywgYCR7dGhpcy5iYXNlZE9uQm91bmRhcnkobGVmdCwgJ2xlZnQnKX1weGApO1xyXG4gICAgdGhpcy51cGRhdGVIb3N0U3R5bGUoJ3RvcCcsIGAke3RoaXMuYmFzZWRPbkJvdW5kYXJ5KHRvcCwgJ3RvcCcpfXB4YCk7XHJcbiAgICB0aGlzLmVtaXREcmFnKGV2ZW50Lm5hdGl2ZUV2ZW50KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGhvc3Qgc3R5bGVcclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZUhvc3RTdHlsZShzdHlsZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCBzdHlsZSwgdmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW1pdHMgZHJhZyBldmVudCB0byB0aGUge0BsaW5rIG5neERyYWdnZWR9XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBlbWl0RHJhZyhuYXRpdmVFdmVudD86IEV2ZW50KTogdm9pZCB7XHJcbiAgICBjb25zdCByZWN0ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBjb25zdCBwYXJlbnRSZWN0ID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQucGFyZW50RWxlbWVudD8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgdGhpcy5uZ3hEcmFnZ2VkLmVtaXQoe1xyXG4gICAgICAvLyBuYXRpdmVFdmVudCwgICAgXHJcbiAgICAgIHBhcmVudFJlY3QsXHJcbiAgICAgIHRvcDogcmVjdC50b3AsXHJcbiAgICAgIHJpZ2h0OiByZWN0LnJpZ2h0LFxyXG4gICAgICBib3R0b206IHJlY3QuYm90dG9tLFxyXG4gICAgICBsZWZ0OiByZWN0LmxlZnQsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19