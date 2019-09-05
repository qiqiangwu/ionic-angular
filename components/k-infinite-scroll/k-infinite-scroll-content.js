import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Config } from '../../config/config';
import { KInfiniteScroll } from './k-infinite-scroll';
/**
 * @hidden
 */
var KInfiniteScrollContent = (function () {
    function KInfiniteScrollContent(inf, _config) {
        this.inf = inf;
        this._config = _config;
    }
    /**
     * @hidden
     */
    KInfiniteScrollContent.prototype.ngOnInit = function () {
        if (!this.loadingSpinner) {
            this.loadingSpinner = this._config.get('infiniteLoadingSpinner', this._config.get('spinner', 'ios'));
        }
    };
    KInfiniteScrollContent.decorators = [
        { type: Component, args: [{
                    selector: 'k-infinite-scroll-content',
                    template: '<div class="infinite-loading">' +
                        '<div class="infinite-loading-spinner" *ngIf="loadingSpinner">' +
                        '<ion-spinner [name]="loadingSpinner"></ion-spinner>' +
                        '</div>' +
                        '<div class="infinite-loading-text" [innerHTML]="loadingText" *ngIf="loadingText"></div>' +
                        '</div>' +
                        '<div class="infinite-complete">' +
                        '<div class="infinite-complete-text" [innerHTML]="completeText" *ngIf="completeText"></div>' +
                        '</div>',
                    host: {
                        '[attr.state]': 'inf.state'
                    },
                    encapsulation: ViewEncapsulation.None,
                },] },
    ];
    /** @nocollapse */
    KInfiniteScrollContent.ctorParameters = function () { return [
        { type: KInfiniteScroll, },
        { type: Config, },
    ]; };
    KInfiniteScrollContent.propDecorators = {
        'loadingSpinner': [{ type: Input },],
        'loadingText': [{ type: Input },],
        'completeText': [{ type: Input },],
    };
    return KInfiniteScrollContent;
}());
export { KInfiniteScrollContent };
//# sourceMappingURL=k-infinite-scroll-content.js.map