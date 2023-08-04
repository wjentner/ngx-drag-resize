import { Directive, HostBinding, Inject, Input, Optional, PLATFORM_ID, } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "./resize.directive";
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
    static ɵfac = function NgxResizeHandleDirective_Factory(t) { return new (t || NgxResizeHandleDirective)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(PLATFORM_ID), i0.ɵɵdirectiveInject(i1.NgxResizeDirective, 8)); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: NgxResizeHandleDirective, selectors: [["", "ngxResizeHandle", ""]], hostVars: 1, hostBindings: function NgxResizeHandleDirective_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵattribute("data-ngx-resize-handle-type", ctx.type);
        } }, inputs: { type: ["ngxResizeHandle", "type"] } });
}
export { NgxResizeHandleDirective };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NgxResizeHandleDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxResizeHandle]',
            }]
    }], function () { return [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }, { type: i1.NgxResizeDirective, decorators: [{
                type: Optional
            }] }]; }, { type: [{
            type: Input,
            args: ['ngxResizeHandle']
        }, {
            type: HostBinding,
            args: ['attr.data-ngx-resize-handle-type']
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLWhhbmRsZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZHJhZy1yZXNpemUvc3JjL2xpYi9yZXNpemUvcmVzaXplLWhhbmRsZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFNBQVMsRUFFVCxXQUFXLEVBQ1gsTUFBTSxFQUNOLEtBQUssRUFFTCxRQUFRLEVBQ1IsV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDOzs7QUFJbkQ7Ozs7Ozs7R0FPRztBQUNILE1BR2Esd0JBQXdCO0lBU2hCO0lBQ3FCO0lBQ1Q7SUFWL0I7O09BRUc7SUFHSCxJQUFJLEdBQStCLElBQUksQ0FBQztJQUV4QyxZQUNtQixVQUFtQyxFQUNkLFVBQWtCLEVBQzNCLGVBQW1DO1FBRi9DLGVBQVUsR0FBVixVQUFVLENBQXlCO1FBQ2QsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUMzQixvQkFBZSxHQUFmLGVBQWUsQ0FBb0I7SUFDL0QsQ0FBQztJQUVKOztPQUVHO0lBQ0gsZUFBZTtRQUNiLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUM5RCxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVc7UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN6QixPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7a0ZBbENVLHdCQUF3Qiw0REFVekIsV0FBVzs2REFWVix3QkFBd0I7Ozs7U0FBeEIsd0JBQXdCO3VGQUF4Qix3QkFBd0I7Y0FIcEMsU0FBUztlQUFDO2dCQUNULFFBQVEsRUFBRSxtQkFBbUI7YUFDOUI7O3NCQVdJLE1BQU07dUJBQUMsV0FBVzs7c0JBQ2xCLFFBQVE7d0JBTFgsSUFBSTtrQkFGSCxLQUFLO21CQUFDLGlCQUFpQjs7a0JBQ3ZCLFdBQVc7bUJBQUMsa0NBQWtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBBZnRlclZpZXdJbml0LFxyXG4gIERpcmVjdGl2ZSxcclxuICBFbGVtZW50UmVmLFxyXG4gIEhvc3RCaW5kaW5nLFxyXG4gIEluamVjdCxcclxuICBJbnB1dCxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT3B0aW9uYWwsXHJcbiAgUExBVEZPUk1fSUQsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge05neFJlc2l6ZUhhbmRsZVR5cGV9IGZyb20gJy4vcmVzaXplLWhhbmRsZS10eXBlLmVudW0nO1xyXG5pbXBvcnQge05neFJlc2l6ZURpcmVjdGl2ZX0gZnJvbSAnLi9yZXNpemUuZGlyZWN0aXZlJztcclxuXHJcbi8qKlxyXG4gKiBUaGUgZGlyZWN0aXZlIHRoYXQgYWxsb3dzIHRvIG1hcmsgSFRNTCBlbGVtZW50IGFzIG9uZSBvZiBoYW5kbGUgb2YgcmVzaXppbmcgZWxlbWVudCBmb3Ige0BsaW5rIE5neFJlc2l6ZURpcmVjdGl2ZX1cclxuICpcclxuICogQGF1dGhvciBEbXl0cm8gUGFyZmVub3YgPGRtaXRyeXBhcmZlbm92OTM3QGdtYWlsLmNvbT5cclxuICpcclxuICogQGR5bmFtaWNcclxuICogQHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvYW5ndWxhci1jb21waWxlci1vcHRpb25zI3N0cmljdG1ldGFkYXRhZW1pdFxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbbmd4UmVzaXplSGFuZGxlXScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hSZXNpemVIYW5kbGVEaXJlY3RpdmUgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGF0dHJpYnV0ZSB3aGljaCBkZWZpbmUgdGhlIHNpZGUgdGhlIEhUTUwgZWxlbWVudCB3aWxsIGFmZmVjdCBkdXJpbmcgZHJhZ1xyXG4gICAqL1xyXG4gIEBJbnB1dCgnbmd4UmVzaXplSGFuZGxlJylcclxuICBASG9zdEJpbmRpbmcoJ2F0dHIuZGF0YS1uZ3gtcmVzaXplLWhhbmRsZS10eXBlJylcclxuICB0eXBlOiBOZ3hSZXNpemVIYW5kbGVUeXBlIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcclxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcmVhZG9ubHkgcGxhdGZvcm1JZDogb2JqZWN0LFxyXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSByZWFkb25seSByZXNpemVEaXJlY3RpdmU6IE5neFJlc2l6ZURpcmVjdGl2ZVxyXG4gICkge31cclxuXHJcbiAgLyoqXHJcbiAgICogQGluaGVyaXREb2NcclxuICAgKi9cclxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XHJcbiAgICBpZiAoaXNQbGF0Zm9ybVNlcnZlcih0aGlzLnBsYXRmb3JtSWQpIHx8ICF0aGlzLnJlc2l6ZURpcmVjdGl2ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXNpemVEaXJlY3RpdmUub2JzZXJ2ZSh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAaW5oZXJpdERvY1xyXG4gICAqL1xyXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLnJlc2l6ZURpcmVjdGl2ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXNpemVEaXJlY3RpdmUudW5zdWJzY3JpYmUodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpO1xyXG4gIH1cclxufVxyXG4iXX0=