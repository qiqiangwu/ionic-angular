import { ElementRef, EventEmitter, NgZone } from '@angular/core';
import { Content } from '../content/content';
import { DomController } from '../../platform/dom-controller';
import { GestureController, GestureDelegate } from '../../gestures/gesture-controller';
import { UIEventManager } from '../../gestures/ui-event-manager';
import { PointerEvents } from '../../gestures/pointer-events';
import { Platform } from '../../platform/platform';
export declare class KInfiniteScroll {
    private _content;
    private _zone;
    private _elementRef;
    private _dom;
    private _plt;
    _appliedStyles: boolean;
    _lastCheck: number;
    _gesture: GestureDelegate;
    _events: UIEventManager;
    _pointerEvents: PointerEvents;
    _isEnabled: boolean;
    startY: number;
    currentY: number;
    deltaY: number;
    progress: number;
    /**
     * @internal
     */
    state: string;
    /**
     * @input {boolean} If the infinite scroll is enabled or not. This should be used in place of an `ngIf`. Default is `true`.
     */
    enabled: boolean;
    pullMin: number;
    pullMax: number;
    /**
    * @input {number} How many milliseconds it takes the infinite scroller to to snap back to the `loading` state. Default is `280`.
    */
    snapbackDuration: number;
    /**
     * @output {event} Emitted when the scroll reaches
     * the threshold distance. From within your infinite handler,
     * you must call the infinite scroll's `complete()` method when
     * your async operation has completed.
     */
    ionInfinite: EventEmitter<KInfiniteScroll>;
    constructor(_content: Content, _zone: NgZone, _elementRef: ElementRef, _dom: DomController, _plt: Platform, gestureCtrl: GestureController);
    _onStart(ev: TouchEvent): any;
    _onMove(ev: TouchEvent): 1 | 2 | 3 | 0 | 5 | 6 | 8 | 7;
    _onMoveInZone(): 2 | 4;
    _onEnd(): any;
    _beginLoad(): void;
    /**
     * Call `complete()` within the `infinite` output event handler when
     * your async operation has completed. For example, the `loading`
     * state is while the app is performing an asynchronous operation,
     * such as receiving more data from an AJAX request to add more items
     * to a data list. Once the data has been received and UI updated, you
     * then call this method to signify that the loading has completed.
     * This method will change the infinite scroll's state from `loading`
     * to `enabled`.
     */
    complete(): void;
    cancel(): void;
    _close(state: string, delay: string): void;
    _setCss(y: number, duration: string, overflowVisible: boolean, delay: string): void;
    /**
     * @hidden
     */
    _setListeners(shouldListen: boolean): void;
    /**
     * @hidden
     */
    ngOnInit(): void;
    /**
     * @hidden
     */
    ngOnDestroy(): void;
}
