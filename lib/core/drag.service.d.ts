import { Observable } from 'rxjs';
import { MovementBase } from './movement/movement-base';
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
export declare class DragService {
    private readonly document;
    private readonly window;
    /**
     * Emits on mouse or touch event was ended
     */
    /**
     * Emits on mouse or touch move
     */
    constructor(document: Document, window: Window);
    /**
     * Creates an observable that emits drag event
     */
    fromElement(target: HTMLElement): Observable<MovementBase>;
    /**
     * Returns position of mouse or touch event
     */
    private fromMovementNativeEvent;
    /**
     * Returns position of event when drag was started
     */
    private fromEnter;
    /**
     * Implements behaviour to detect drag events
     */
    private forMove;
    static ɵfac: i0.ɵɵFactoryDeclaration<DragService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DragService>;
}
