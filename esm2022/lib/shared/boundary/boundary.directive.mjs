import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
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
export { BoundaryDirective };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BoundaryDirective, [{
        type: Directive,
        args: [{
                selector: '[ngxBoundary]',
            }]
    }], function () { return [{ type: Window }, { type: Document }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRhcnkuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWRyYWctcmVzaXplL3NyYy9saWIvc2hhcmVkL2JvdW5kYXJ5L2JvdW5kYXJ5LmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDOztBQUd4Qzs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUdhLGlCQUFpQjtJQU1DO0lBQXdDO0lBTHJFOztPQUVHO0lBQ08sUUFBUSxHQUF5QyxJQUFJLENBQUM7SUFFaEUsWUFBNkIsWUFBcUIsRUFBbUIsY0FBeUI7UUFBakUsaUJBQVksR0FBWixZQUFZLENBQVM7UUFBbUIsbUJBQWMsR0FBZCxjQUFjLENBQVc7SUFBRyxDQUFDO0lBRWxHOztPQUVHO0lBQ08sV0FBVztRQUNuQixNQUFNLElBQUksR0FBRyxFQUFjLENBQUM7UUFFNUIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFFdEQsSUFBSSxlQUFlLFlBQVksT0FBTyxFQUFFO1lBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFcEUsSUFBSSxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDckMsSUFBSSxDQUFDLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUM7WUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUM7WUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFFdkMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELElBQUksZUFBZSxZQUFZLE1BQU0sSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQzFELElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDO1lBQzFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUM7WUFFNUMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOztPQUVHO0lBQ08sc0JBQXNCO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1NBQzFCO1FBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDdEY7UUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUVEOztPQUVHO0lBQ08sZUFBZSxDQUFDLEtBQWEsRUFBRSxRQUF3QjtRQUMvRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLE1BQU07Z0JBQ1QsT0FBTyxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztZQUMvQixLQUFLLEtBQUs7Z0JBQ1IsT0FBTyxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztTQUMvQjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzsyRUE1RVUsaUJBQWlCOzZEQUFqQixpQkFBaUI7O1NBQWpCLGlCQUFpQjt1RkFBakIsaUJBQWlCO2NBSDdCLFNBQVM7ZUFBQztnQkFDVCxRQUFRLEVBQUUsZUFBZTthQUMxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtCb3VuZGFyeX0gZnJvbSAnLi9ib3VuZGFyeSc7XHJcblxyXG4vKipcclxuICogVGhlIGRpcmVjdGl2ZSBpcyB1c2VkIHRvIHdvcmsgd2l0aCBib3VuZGFyeSBhcmVhIGZvciBIVE1MIGVsZW1lbnRcclxuICpcclxuICogQGF1dGhvciBEbXl0cm8gUGFyZmVub3YgPGRtaXRyeXBhcmZlbm92OTM3QGdtYWlsLmNvbT5cclxuICpcclxuICogQGludGVybmFsXHJcbiAqXHJcbiAqIEBkeW5hbWljXHJcbiAqIEBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2FuZ3VsYXItY29tcGlsZXItb3B0aW9ucyNzdHJpY3RtZXRhZGF0YWVtaXRcclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW25neEJvdW5kYXJ5XScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBCb3VuZGFyeURpcmVjdGl2ZSB7XHJcbiAgLyoqXHJcbiAgICogQ1NTIHNlbGVjdG9yIG9yIEhUTUwgZWxlbWVudFxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBib3VuZGFyeTogc3RyaW5nIHwgSFRNTEVsZW1lbnQgfCBXaW5kb3cgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSB3aW5kb3dPYmplY3Q/OiBXaW5kb3csIHByaXZhdGUgcmVhZG9ubHkgZG9jdW1lbnRPYmplY3Q/OiBEb2N1bWVudCkge31cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGJvdW5kYXJ5IHBvc2l0aW9uIGJhc2VkIG9uIHtAbGluayBib3VuZGFyeX1cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgZ2V0Qm91bmRhcnkoKTogQm91bmRhcnkgfCBudWxsIHtcclxuICAgIGNvbnN0IHJlY3QgPSB7fSBhcyBCb3VuZGFyeTtcclxuXHJcbiAgICBjb25zdCBib3VuZGFyeUVsZW1lbnQgPSB0aGlzLnJlc29sdmVCb3VuZGFyeUVsZW1lbnQoKTtcclxuXHJcbiAgICBpZiAoYm91bmRhcnlFbGVtZW50IGluc3RhbmNlb2YgRWxlbWVudCkge1xyXG4gICAgICBjb25zdCBib3VuZGFyeUVsZW1lbnRSZWN0ID0gYm91bmRhcnlFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgcmVjdC5sZWZ0ID0gYm91bmRhcnlFbGVtZW50UmVjdC5sZWZ0O1xyXG4gICAgICByZWN0LnRvcCA9IGJvdW5kYXJ5RWxlbWVudFJlY3QudG9wO1xyXG4gICAgICByZWN0LmJvdHRvbSA9IGJvdW5kYXJ5RWxlbWVudFJlY3QuYm90dG9tO1xyXG4gICAgICByZWN0LnJpZ2h0ID0gYm91bmRhcnlFbGVtZW50UmVjdC5yaWdodDtcclxuXHJcbiAgICAgIHJldHVybiByZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChib3VuZGFyeUVsZW1lbnQgaW5zdGFuY2VvZiBXaW5kb3cgJiYgdGhpcy53aW5kb3dPYmplY3QpIHtcclxuICAgICAgcmVjdC50b3AgPSAwO1xyXG4gICAgICByZWN0LmxlZnQgPSAwO1xyXG4gICAgICByZWN0LnJpZ2h0ID0gdGhpcy53aW5kb3dPYmplY3QuaW5uZXJXaWR0aDtcclxuICAgICAgcmVjdC5ib3R0b20gPSB0aGlzLndpbmRvd09iamVjdC5pbm5lckhlaWdodDtcclxuXHJcbiAgICAgIHJldHVybiByZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzb2x2ZXMgSFRNTCBlbGVtZW50IGJhc2VkIG9uIHtAbGluayBib3VuZGFyeX1cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgcmVzb2x2ZUJvdW5kYXJ5RWxlbWVudCgpOiBFbGVtZW50IHwgV2luZG93IHwgbnVsbCB7XHJcbiAgICBpZiAoIXRoaXMuYm91bmRhcnkpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuYm91bmRhcnkgPT09ICd3aW5kb3cnICYmIHRoaXMud2luZG93T2JqZWN0KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLndpbmRvd09iamVjdDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuYm91bmRhcnkgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRvY3VtZW50T2JqZWN0ID8gdGhpcy5kb2N1bWVudE9iamVjdC5xdWVyeVNlbGVjdG9yKHRoaXMuYm91bmRhcnkpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5ib3VuZGFyeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgcG9zaXRpb25hbCB2YWx1ZSBiYXNlZCBvbiBib3VuZGFyeSBwb3NpdGlvblxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBiYXNlZE9uQm91bmRhcnkodmFsdWU6IG51bWJlciwgcG9zaXRpb246ICdsZWZ0JyB8ICd0b3AnKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGJvdW5kYXJ5ID0gdGhpcy5nZXRCb3VuZGFyeSgpO1xyXG5cclxuICAgIGlmICghYm91bmRhcnkpIHtcclxuICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaCAocG9zaXRpb24pIHtcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlIC0gYm91bmRhcnkubGVmdDtcclxuICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICByZXR1cm4gdmFsdWUgLSBib3VuZGFyeS50b3A7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxufVxyXG4iXX0=