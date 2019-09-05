(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@angular/core", "../../config/config", "./k-infinite-scroll"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require("@angular/core");
    var config_1 = require("../../config/config");
    var k_infinite_scroll_1 = require("./k-infinite-scroll");
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
            { type: core_1.Component, args: [{
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
                        encapsulation: core_1.ViewEncapsulation.None,
                    },] },
        ];
        /** @nocollapse */
        KInfiniteScrollContent.ctorParameters = function () { return [
            { type: k_infinite_scroll_1.KInfiniteScroll, },
            { type: config_1.Config, },
        ]; };
        KInfiniteScrollContent.propDecorators = {
            'loadingSpinner': [{ type: core_1.Input },],
            'loadingText': [{ type: core_1.Input },],
            'completeText': [{ type: core_1.Input },],
        };
        return KInfiniteScrollContent;
    }());
    exports.KInfiniteScrollContent = KInfiniteScrollContent;
});
//# sourceMappingURL=k-infinite-scroll-content.js.map