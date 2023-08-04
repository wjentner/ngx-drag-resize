import { Directive, Inject, Optional, PLATFORM_ID, } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "./drag.directive";
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
    static ɵfac = function NgxDragHandleDirective_Factory(t) { return new (t || NgxDragHandleDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i1.NgxDragDirective, 8), i0.ɵɵdirectiveInject(PLATFORM_ID)); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NgxDragHandleDirective, selectors: [["", "ngxDragHandle", ""]] });
}
export { NgxDragHandleDirective };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxDragHandleDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxDragHandle]',
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: i1.NgxDragDirective, decorators: [{
                type: Optional
            }] }, { type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1oYW5kbGUuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWRyYWctcmVzaXplL3NyYy9saWIvZHJhZy9kcmFnLWhhbmRsZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFNBQVMsRUFFVCxNQUFNLEVBRU4sUUFBUSxFQUNSLFdBQVcsR0FDWixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQzs7O0FBR25EOzs7Ozs7O0dBT0c7QUFDSCxNQUdhLHNCQUFzQjtJQUVkO0lBQ1k7SUFDUztJQUh4QyxZQUNtQixVQUFtQyxFQUN2QixhQUErQixFQUN0QixVQUFrQjtRQUZ2QyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtRQUN2QixrQkFBYSxHQUFiLGFBQWEsQ0FBa0I7UUFDdEIsZUFBVSxHQUFWLFVBQVUsQ0FBUTtJQUN2RCxDQUFDO0lBRUo7O09BRUc7SUFDSCxlQUFlO1FBQ2IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVc7UUFDVCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssT0FBTztRQUNiLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUM1RCxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzVELENBQUM7Z0ZBOUJVLHNCQUFzQiwwR0FJdkIsV0FBVzs2REFKVixzQkFBc0I7O1NBQXRCLHNCQUFzQjt1RkFBdEIsc0JBQXNCO2NBSGxDLFNBQVM7ZUFBQztnQkFDVCxRQUFRLEVBQUUsaUJBQWlCO2FBQzVCOztzQkFJSSxRQUFROztzQkFDUixNQUFNO3VCQUFDLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gIEFmdGVyVmlld0luaXQsXHJcbiAgRGlyZWN0aXZlLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgSW5qZWN0LFxyXG4gIE9uRGVzdHJveSxcclxuICBPcHRpb25hbCxcclxuICBQTEFURk9STV9JRCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7Tmd4RHJhZ0RpcmVjdGl2ZX0gZnJvbSAnLi9kcmFnLmRpcmVjdGl2ZSc7XHJcblxyXG4vKipcclxuICogVGhlIGRpcmVjdGl2ZSB0aGF0IGFsbG93cyB0byBtYXJrIEhUTUwgZWxlbWVudCBhcyBoYW5kbGUgb2YgZHJhZ2dpbmcgZWxlbWVudCBmb3Ige0BsaW5rIE5neERyYWdEaXJlY3RpdmV9XHJcbiAqXHJcbiAqIEBhdXRob3IgRG15dHJvIFBhcmZlbm92IDxkbWl0cnlwYXJmZW5vdjkzN0BnbWFpbC5jb20+XHJcbiAqXHJcbiAqIEBkeW5hbWljXHJcbiAqIEBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2FuZ3VsYXItY29tcGlsZXItb3B0aW9ucyNzdHJpY3RtZXRhZGF0YWVtaXRcclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW25neERyYWdIYW5kbGVdJyxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neERyYWdIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcclxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgZHJhZ0RpcmVjdGl2ZTogTmd4RHJhZ0RpcmVjdGl2ZSxcclxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcmVhZG9ubHkgcGxhdGZvcm1JZDogb2JqZWN0XHJcbiAgKSB7fVxyXG5cclxuICAvKipcclxuICAgKiBAaW5oZXJpdERvY1xyXG4gICAqL1xyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcclxuICAgIHRoaXMub2JzZXJ2ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQGluaGVyaXREb2NcclxuICAgKi9cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMub2JzZXJ2ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBob3N0IGVsZW1lbnQgYXMgb2JzZXJ2YWJsZSBwb2ludCBmb3Ige0BsaW5rIE5neERyYWdEaXJlY3RpdmV9XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBvYnNlcnZlKCk6IHZvaWQge1xyXG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIodGhpcy5wbGF0Zm9ybUlkKSB8fCAhdGhpcy5kcmFnRGlyZWN0aXZlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRyYWdEaXJlY3RpdmUub2JzZXJ2ZSh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==