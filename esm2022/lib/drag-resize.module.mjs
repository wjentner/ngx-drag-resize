import { NgModule } from '@angular/core';
import { NgxDragDirective } from './drag/drag.directive';
import { NgxDragHandleDirective } from './drag/drag-handle.directive';
import { NgxResizeDirective } from './resize/resize.directive';
import { NgxResizeHandleDirective } from './resize/resize-handle.directive';
import { SharedModule } from './shared/shared.module';
import * as i0 from "@angular/core";
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
export { NgxDragResizeModule };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1yZXNpemUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWRyYWctcmVzaXplL3NyYy9saWIvZHJhZy1yZXNpemUubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDcEUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDN0QsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDMUUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHdCQUF3QixDQUFDOztBQUVwRDs7OztHQUlHO0FBQ0gsTUFZYSxtQkFBbUI7NkVBQW5CLG1CQUFtQjs0REFBbkIsbUJBQW1CO2dFQVY1QixZQUFZOztTQVVILG1CQUFtQjt1RkFBbkIsbUJBQW1CO2NBWi9CLFFBQVE7ZUFBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsWUFBWTtpQkFDYjtnQkFDRCxZQUFZLEVBQUU7b0JBQ1osZ0JBQWdCO29CQUNoQixzQkFBc0I7b0JBQ3RCLGtCQUFrQjtvQkFDbEIsd0JBQXdCO2lCQUN6QjtnQkFDRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxzQkFBc0IsRUFBRSxrQkFBa0IsRUFBRSx3QkFBd0IsQ0FBQzthQUNsRzs7d0ZBQ1ksbUJBQW1CLG1CQVA1QixnQkFBZ0I7UUFDaEIsc0JBQXNCO1FBQ3RCLGtCQUFrQjtRQUNsQix3QkFBd0IsYUFOeEIsWUFBWSxhQVFKLGdCQUFnQixFQUFFLHNCQUFzQixFQUFFLGtCQUFrQixFQUFFLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge05neERyYWdEaXJlY3RpdmV9IGZyb20gJy4vZHJhZy9kcmFnLmRpcmVjdGl2ZSc7XHJcbmltcG9ydCB7Tmd4RHJhZ0hhbmRsZURpcmVjdGl2ZX0gZnJvbSAnLi9kcmFnL2RyYWctaGFuZGxlLmRpcmVjdGl2ZSc7XHJcbmltcG9ydCB7Tmd4UmVzaXplRGlyZWN0aXZlfSBmcm9tICcuL3Jlc2l6ZS9yZXNpemUuZGlyZWN0aXZlJztcclxuaW1wb3J0IHtOZ3hSZXNpemVIYW5kbGVEaXJlY3RpdmV9IGZyb20gJy4vcmVzaXplL3Jlc2l6ZS1oYW5kbGUuZGlyZWN0aXZlJztcclxuaW1wb3J0IHtTaGFyZWRNb2R1bGV9IGZyb20gJy4vc2hhcmVkL3NoYXJlZC5tb2R1bGUnO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBtb2R1bGUgcHJvdmlkZXMgb3Bwb3J0dW5pdHkgdG8gdXNlIGRyYWcgYW5kIHJlc2l6ZSBmdW5jdGlvbmFsaXR5IG9uIEhUTUwgZWxlbWVudHNcclxuICpcclxuICogQGF1dGhvciBEbXl0cm8gUGFyZmVub3YgPGRtaXRyeXBhcmZlbm92OTM3QGdtYWlsLmNvbT5cclxuICovXHJcbkBOZ01vZHVsZSh7XHJcbiAgaW1wb3J0czogW1xyXG4gICAgU2hhcmVkTW9kdWxlXHJcbiAgXSxcclxuICBkZWNsYXJhdGlvbnM6IFtcclxuICAgIE5neERyYWdEaXJlY3RpdmUsXHJcbiAgICBOZ3hEcmFnSGFuZGxlRGlyZWN0aXZlLFxyXG4gICAgTmd4UmVzaXplRGlyZWN0aXZlLFxyXG4gICAgTmd4UmVzaXplSGFuZGxlRGlyZWN0aXZlXHJcbiAgXSxcclxuICBleHBvcnRzOiBbTmd4RHJhZ0RpcmVjdGl2ZSwgTmd4RHJhZ0hhbmRsZURpcmVjdGl2ZSwgTmd4UmVzaXplRGlyZWN0aXZlLCBOZ3hSZXNpemVIYW5kbGVEaXJlY3RpdmVdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hEcmFnUmVzaXplTW9kdWxlIHsgfVxyXG4iXX0=