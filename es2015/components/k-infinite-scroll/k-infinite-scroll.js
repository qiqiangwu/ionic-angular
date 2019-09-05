import { Directive, ElementRef, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { Content } from '../content/content';
import { DomController } from '../../platform/dom-controller';
import { isTrueProperty } from '../../util/util';
import { GestureController, } from '../../gestures/gesture-controller';
import { UIEventManager } from '../../gestures/ui-event-manager';
import { Platform } from '../../platform/platform';
import { pointerCoord } from '../../util/dom';
export class KInfiniteScroll {
    constructor(_content, _zone, _elementRef, _dom, _plt, gestureCtrl) {
        this._content = _content;
        this._zone = _zone;
        this._elementRef = _elementRef;
        this._dom = _dom;
        this._plt = _plt;
        this._appliedStyles = false;
        this._lastCheck = 0;
        this._isEnabled = true;
        /**
         * @internal
         */
        this.state = STATE_INACTIVE;
        this.pullMin = 40;
        this.pullMax = this.pullMin + 40;
        /**
        * @input {number} How many milliseconds it takes the infinite scroller to to snap back to the `loading` state. Default is `280`.
        */
        this.snapbackDuration = 280;
        /**
         * @output {event} Emitted when the scroll reaches
         * the threshold distance. From within your infinite handler,
         * you must call the infinite scroll's `complete()` method when
         * your async operation has completed.
         */
        this.ionInfinite = new EventEmitter();
        _content._hasInfiniteScroll = true;
        this._events = new UIEventManager(_plt);
        this._gesture = gestureCtrl.createGesture({
            name: 'infinite'
        });
    }
    /**
     * @input {boolean} If the infinite scroll is enabled or not. This should be used in place of an `ngIf`. Default is `true`.
     */
    get enabled() {
        return this._isEnabled;
    }
    set enabled(val) {
        this._isEnabled = isTrueProperty(val);
        this._setListeners(this._isEnabled);
    }
    _onStart(ev) {
        // if multitouch then get out immediately
        if (ev.touches && ev.touches.length > 1) {
            return false;
        }
        if (this.state !== STATE_INACTIVE) {
            return false;
        }
        if (!this._gesture.canStart()) {
            return false;
        }
        const cd = this._content.getContentDimensions();
        const scrollTop = cd.scrollTop;
        const contentHeight = cd.contentHeight;
        const scrollHeight = cd.scrollHeight;
        if (scrollTop + contentHeight < scrollHeight) {
            return false;
        }
        let coord = pointerCoord(ev);
        this.progress = 0;
        this.startY = this.currentY = coord.y;
        this.state = STATE_INACTIVE;
        return true;
    }
    _onMove(ev) {
        // if multitouch then get out immediately
        if (ev.touches && ev.touches.length > 1) {
            return 1;
        }
        if (!this._gesture.canStart()) {
            return 0;
        }
        // do nothing if it's actively infiniting
        // or it's in the process of closing
        // or this was never a startY
        if (this.startY === null || this.state === STATE_LOADING || this.state === STATE_CANCELLING || this.state === STATE_COMPLETING) {
            return 2;
        }
        // if we just updated stuff less than 16ms ago
        // then don't check again, just chillout plz
        let now = Date.now();
        if (this._lastCheck + 16 > now) {
            return 3;
        }
        // remember the last time we checked all this
        this._lastCheck = now;
        // get the current pointer coordinates
        let coord = pointerCoord(ev);
        this.currentY = coord.y;
        // it's now possible they could be pulling up the content
        // how far have they pulled so far?
        this.deltaY = this.startY - coord.y;
        // don't bother if they're scrolling down
        // and have not scrolled down enough to be ignored
        if (this.deltaY <= 0) {
            this.progress = 0;
            if (this.state !== STATE_INACTIVE) {
                this._zone.run(() => {
                    this.state = STATE_INACTIVE;
                });
            }
            if (this._appliedStyles) {
                // reset the styles only if they were applied
                this._setCss(0, (this.snapbackDuration + 'ms'), false, '');
                return 5;
            }
            return 6;
        }
        if (this.state === STATE_INACTIVE) {
            const cd = this._content.getContentDimensions();
            const scrollTop = cd.scrollTop;
            const contentHeight = cd.contentHeight;
            const scrollHeight = cd.scrollHeight;
            // 未到达页面底部不能上拉操作
            if (scrollTop + contentHeight < scrollHeight) {
                this.progress = 0;
                this.startY = null;
                return 7;
            }
            // 到达页面底部，可以上拉操作
            this.state = STATE_PULLING;
        }
        // 阻止原生的滚动事件
        ev.preventDefault();
        this._setCss(this.deltaY, '0ms', true, '');
        if (!this.deltaY) {
            // 如果delta = 0, 退出
            this.progress = 0;
            return 8;
        }
        this._zone.run(() => {
            this._onMoveInZone();
        });
    }
    _onMoveInZone() {
        // set pull progress
        this.progress = this.deltaY / this.pullMin;
        // emit "start" if it hasn't started yet
        /* if (!this._didStart) {
          this._didStart = true;
          this.ionStart.emit(this);
        } */
        // emit "pulling" on every move
        // this.ionPull.emit(this);
        // do nothing if the delta is less than the pull threshold
        if (this.deltaY < this.pullMin) {
            // ensure it stays in the pulling state, cuz its not ready yet
            this.state = STATE_PULLING;
            return 2;
        }
        if (this.deltaY > this.pullMax) {
            // they pulled farther than the max, so kick off the refresh
            // 采用触发touchEnd更新
            // this._beginLoad();
            // return 3;
        }
        // pulled farther than the pull min!!
        // it is now in the `ready` state!!
        // if they let go then it'll refresh, kerpow!!
        this.state = STATE_READY;
        return 4;
    }
    _onEnd() {
        // only run in a zone when absolutely necessary
        if (this.state === STATE_READY) {
            this._zone.run(() => {
                this._beginLoad();
            });
        }
        else if (this.state === STATE_PULLING) {
            this._zone.run(() => {
                this.cancel();
            });
        }
    }
    _beginLoad() {
        this.state = STATE_LOADING;
        // place the content in a hangout position while it thinks
        this._setCss(this.pullMin, (this.snapbackDuration + 'ms'), true, '');
        this.ionInfinite.emit(this);
    }
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
    complete() {
        this._close(STATE_COMPLETING, '120ms');
    }
    cancel() {
        this._close(STATE_CANCELLING, '');
    }
    _close(state, delay) {
        var timer;
        function close(ev) {
            // closing is done, return to inactive state
            if (ev) {
                clearTimeout(timer);
            }
            this.state = STATE_INACTIVE;
            this.progress = 0;
            this._didStart = this.startY = this.currentY = this.deltaY = null;
            this._setCss(0, '0ms', false, '');
        }
        // create fallback timer incase something goes wrong with transitionEnd event
        timer = setTimeout(close.bind(this), 600);
        // create transition end event on the content's scroll element
        this._content.onScrollElementTransitionEnd(close.bind(this));
        // reset set the styles on the scroll element
        // set that the refresh is actively cancelling/completing
        this.state = state;
        this._setCss(0, (this.snapbackDuration + 'ms'), true, delay);
        if (this._pointerEvents) {
            this._pointerEvents.stop();
        }
    }
    _setCss(y, duration, overflowVisible, delay) {
        this._appliedStyles = (y > 0);
        const content = this._content;
        const Css = this._plt.Css;
        content.setScrollElementStyle(Css.transform, ((y > 0) ? 'translateY(' + (-y) + 'px) translateZ(0px)' : 'translateZ(0px)'));
        content.setScrollElementStyle(Css.transitionDuration, duration);
        content.setScrollElementStyle(Css.transitionDelay, delay);
        content.setScrollElementStyle('overflow', (overflowVisible ? 'hidden' : ''));
    }
    /**
     * @hidden
     */
    _setListeners(shouldListen) {
        this._events.unlistenAll();
        this._pointerEvents = null;
        if (shouldListen) {
            this._pointerEvents = this._events.pointerEvents({
                element: this._content.getScrollElement(),
                pointerDown: this._onStart.bind(this),
                pointerMove: this._onMove.bind(this),
                pointerUp: this._onEnd.bind(this),
                zone: false
            });
        }
    }
    /**
     * @hidden
     */
    ngOnInit() {
        this._setListeners(this._isEnabled);
    }
    /**
     * @hidden
     */
    ngOnDestroy() {
        this._setListeners(false);
        this._events.destroy();
        this._gesture.destroy();
    }
}
KInfiniteScroll.decorators = [
    { type: Directive, args: [{
                selector: 'k-infinite-scroll',
                host: {
                    '[class.infinite-scroll-active]': 'state !== "inactive"',
                    '[style.bottom]': '0'
                }
            },] },
];
/** @nocollapse */
KInfiniteScroll.ctorParameters = () => [
    { type: Content, },
    { type: NgZone, },
    { type: ElementRef, },
    { type: DomController, },
    { type: Platform, },
    { type: GestureController, },
];
KInfiniteScroll.propDecorators = {
    'enabled': [{ type: Input },],
    'pullMin': [{ type: Input },],
    'pullMax': [{ type: Input },],
    'snapbackDuration': [{ type: Input },],
    'ionInfinite': [{ type: Output },],
};
const STATE_INACTIVE = 'inactive';
const STATE_PULLING = 'pulling';
const STATE_READY = 'ready';
const STATE_LOADING = 'loading';
const STATE_CANCELLING = 'cancelling';
const STATE_COMPLETING = 'completing';
//# sourceMappingURL=k-infinite-scroll.js.map