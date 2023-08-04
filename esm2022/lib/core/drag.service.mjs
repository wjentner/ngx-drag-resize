import { Inject, Injectable } from '@angular/core';
import { EMPTY, fromEvent, merge } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { WINDOW } from './window.token';
import * as i0 from "@angular/core";
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
export { DragService };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWRyYWctcmVzaXplL3NyYy9saWIvY29yZS9kcmFnLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzNELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFJaEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDOztBQUV4Qzs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUdhLFdBQVc7SUFrQmU7SUFDRjtJQWxCbkM7O09BRUc7SUFDSCxtQ0FBbUM7SUFDbkMseURBQXlEO0lBQ3pELHlEQUF5RDtJQUN6RCxLQUFLO0lBRUw7O09BRUc7SUFDSCxrQ0FBa0M7SUFDbEMseURBQXlEO0lBQ3pELHdEQUF3RDtJQUN4RCxLQUFLO0lBRUwsWUFDcUMsUUFBa0IsRUFDcEIsTUFBYztRQURaLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDcEIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUM3QyxDQUFDO0lBRUw7O09BRUc7SUFDSCxXQUFXLENBQUMsTUFBbUI7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbEIsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FDbEIsU0FBUyxDQUFpQixNQUFNLEVBQUUsV0FBVyxDQUFDLEVBQzlDLFNBQVMsQ0FBaUIsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUNoRCxDQUFDO1FBRUYsT0FB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QU07dUJBQUMsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBFTVBUWSwgZnJvbUV2ZW50LCBtZXJnZSwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IG1hcCwgc3dpdGNoTWFwLCB0YWtlVW50aWwsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgTW92ZW1lbnROYXRpdmUgfSBmcm9tICcuL21vdmVtZW50L21vdmVtZW50LW5hdGl2ZSc7XHJcbmltcG9ydCB7IFBvc2l0aW9uQmFzZSB9IGZyb20gJy4vcG9zaXRpb24tYmFzZSc7XHJcbmltcG9ydCB7IE1vdmVtZW50QmFzZSB9IGZyb20gJy4vbW92ZW1lbnQvbW92ZW1lbnQtYmFzZSc7XHJcbmltcG9ydCB7IFdJTkRPVyB9IGZyb20gJy4vd2luZG93LnRva2VuJztcclxuXHJcbi8qKlxyXG4gKiBUaGUgc2VydmljZSB0aGF0IGFsbG93cyB0byBvYnNlcnZlIHRoZSBlbGVtZW50IGRyYWdnaW5nXHJcbiAqXHJcbiAqIEBhdXRob3IgRG15dHJvIFBhcmZlbm92IDxkbWl0cnlwYXJmZW5vdjkzN0BnbWFpbC5jb20+XHJcbiAqXHJcbiAqIEBpbnRlcm5hbFxyXG4gKlxyXG4gKiBAZHluYW1pY1xyXG4gKiBAc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9hbmd1bGFyLWNvbXBpbGVyLW9wdGlvbnMjc3RyaWN0bWV0YWRhdGFlbWl0XHJcbiAqL1xyXG5ASW5qZWN0YWJsZSh7XHJcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgRHJhZ1NlcnZpY2Uge1xyXG4gIC8qKlxyXG4gICAqIEVtaXRzIG9uIG1vdXNlIG9yIHRvdWNoIGV2ZW50IHdhcyBlbmRlZFxyXG4gICAqL1xyXG4gIC8vIHByaXZhdGUgcmVhZG9ubHkgbGVhdmUkID0gbWVyZ2UoXHJcbiAgLy8gICBmcm9tRXZlbnQ8TW92ZW1lbnROYXRpdmU+KHRoaXMuZG9jdW1lbnQsICdtb3VzZXVwJyksXHJcbiAgLy8gICBmcm9tRXZlbnQ8TW92ZW1lbnROYXRpdmU+KHRoaXMuZG9jdW1lbnQsICd0b3VjaGVuZCcpXHJcbiAgLy8gKTtcclxuXHJcbiAgLyoqXHJcbiAgICogRW1pdHMgb24gbW91c2Ugb3IgdG91Y2ggbW92ZVxyXG4gICAqL1xyXG4gIC8vIHByaXZhdGUgcmVhZG9ubHkgbW92ZSQgPSBtZXJnZShcclxuICAvLyAgIGZyb21FdmVudDxNb3ZlbWVudE5hdGl2ZT4odGhpcy53aW5kb3csICdtb3VzZW1vdmUnKSxcclxuICAvLyAgIGZyb21FdmVudDxNb3ZlbWVudE5hdGl2ZT4odGhpcy53aW5kb3csICd0b3VjaG1vdmUnKVxyXG4gIC8vICk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSByZWFkb25seSBkb2N1bWVudDogRG9jdW1lbnQsXHJcbiAgICBASW5qZWN0KFdJTkRPVykgcHJpdmF0ZSByZWFkb25seSB3aW5kb3c6IFdpbmRvd1xyXG4gICkgeyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIGRyYWcgZXZlbnRcclxuICAgKi9cclxuICBmcm9tRWxlbWVudCh0YXJnZXQ6IEhUTUxFbGVtZW50KTogT2JzZXJ2YWJsZTxNb3ZlbWVudEJhc2U+IHtcclxuICAgIGlmICghdGhpcy5kb2N1bWVudCkge1xyXG4gICAgICByZXR1cm4gRU1QVFk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZW50ZXIkID0gbWVyZ2UoXHJcbiAgICAgIGZyb21FdmVudDxNb3ZlbWVudE5hdGl2ZT4odGFyZ2V0LCAnbW91c2Vkb3duJyksXHJcbiAgICAgIGZyb21FdmVudDxNb3ZlbWVudE5hdGl2ZT4odGFyZ2V0LCAndG91Y2hzdGFydCcpXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBlbnRlciQucGlwZShcclxuICAgICAgdGFwKChldmVudCkgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSksXHJcbiAgICAgIG1hcCgoZXZlbnQpID0+IHRoaXMuZnJvbUVudGVyKGV2ZW50KSksXHJcbiAgICAgIHN3aXRjaE1hcCgoZXZlbnQpID0+IHRoaXMuZm9yTW92ZShldmVudCkpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBwb3NpdGlvbiBvZiBtb3VzZSBvciB0b3VjaCBldmVudFxyXG4gICAqL1xyXG4gIHByaXZhdGUgZnJvbU1vdmVtZW50TmF0aXZlRXZlbnQoZXZlbnQ6IE1vdmVtZW50TmF0aXZlKTogUG9zaXRpb25CYXNlIHtcclxuICAgIGxldCB4ID0gMDtcclxuICAgIGxldCB5ID0gMDtcclxuXHJcbiAgICBpZiAoIXRoaXMud2luZG93KSB7XHJcbiAgICAgIHJldHVybiB7IHgsIHkgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoJ1RvdWNoRXZlbnQnIGluIHRoaXMud2luZG93ICYmIGV2ZW50IGluc3RhbmNlb2YgVG91Y2hFdmVudCkge1xyXG4gICAgICBjb25zdCB0b3VjaCA9IGV2ZW50LnRvdWNoZXMubGVuZ3RoID8gZXZlbnQudG91Y2hlcy5pdGVtKDApIDogbnVsbDtcclxuICAgICAgeCA9IHRvdWNoID8gdG91Y2guY2xpZW50WCA6IDA7XHJcbiAgICAgIHkgPSB0b3VjaCA/IHRvdWNoLmNsaWVudFkgOiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChldmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQpIHtcclxuICAgICAgeCA9IGV2ZW50LmNsaWVudFg7XHJcbiAgICAgIHkgPSBldmVudC5jbGllbnRZO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7IHgsIHkgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgcG9zaXRpb24gb2YgZXZlbnQgd2hlbiBkcmFnIHdhcyBzdGFydGVkXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBmcm9tRW50ZXIoZXZlbnQ6IE1vdmVtZW50TmF0aXZlKTogUG9zaXRpb25CYXNlIHtcclxuICAgIHJldHVybiB0aGlzLmZyb21Nb3ZlbWVudE5hdGl2ZUV2ZW50KGV2ZW50KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEltcGxlbWVudHMgYmVoYXZpb3VyIHRvIGRldGVjdCBkcmFnIGV2ZW50c1xyXG4gICAqL1xyXG4gIHByaXZhdGUgZm9yTW92ZShpbml0aWFsOiBQb3NpdGlvbkJhc2UpOiBPYnNlcnZhYmxlPE1vdmVtZW50QmFzZT4ge1xyXG5cclxuICAgIHJldHVybiBtZXJnZShcclxuICAgICAgZnJvbUV2ZW50PE1vdmVtZW50TmF0aXZlPih0aGlzLndpbmRvdywgJ21vdXNlbW92ZScpLFxyXG4gICAgICBmcm9tRXZlbnQ8TW92ZW1lbnROYXRpdmU+KHRoaXMud2luZG93LCAndG91Y2htb3ZlJylcclxuICAgICkucGlwZShcclxuICAgICAgbWFwKChldmVudCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQmFzZSA9IHRoaXMuZnJvbU1vdmVtZW50TmF0aXZlRXZlbnQoZXZlbnQpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgLi4ucG9zaXRpb25CYXNlLFxyXG4gICAgICAgICAgaW5pdGlhbCxcclxuICAgICAgICAgIG5hdGl2ZUV2ZW50OiBldmVudCxcclxuICAgICAgICB9O1xyXG4gICAgICB9KSxcclxuICAgICAgdGFrZVVudGlsKG1lcmdlKFxyXG4gICAgICAgIGZyb21FdmVudDxNb3ZlbWVudE5hdGl2ZT4odGhpcy5kb2N1bWVudCwgJ21vdXNldXAnKSxcclxuICAgICAgICBmcm9tRXZlbnQ8TW92ZW1lbnROYXRpdmU+KHRoaXMuZG9jdW1lbnQsICd0b3VjaGVuZCcpXHJcbiAgICAgICkpXHJcbiAgICApO1xyXG5cclxuICAgIC8vIHJldHVybiB0aGlzLm1vdmUkLnBpcGUoXHJcbiAgICAvLyAgIG1hcCgoZXZlbnQpID0+IHtcclxuICAgIC8vICAgICBjb25zdCBwb3NpdGlvbkJhc2UgPSB0aGlzLmZyb21Nb3ZlbWVudE5hdGl2ZUV2ZW50KGV2ZW50KTtcclxuXHJcbiAgICAvLyAgICAgcmV0dXJuIHtcclxuICAgIC8vICAgICAgIC4uLnBvc2l0aW9uQmFzZSxcclxuICAgIC8vICAgICAgIGluaXRpYWwsXHJcbiAgICAvLyAgICAgICBuYXRpdmVFdmVudDogZXZlbnQsXHJcbiAgICAvLyAgICAgfTtcclxuICAgIC8vICAgfSksXHJcbiAgICAvLyAgIHRha2VVbnRpbCh0aGlzLmxlYXZlJClcclxuICAgIC8vICk7XHJcbiAgfVxyXG59XHJcbiJdfQ==