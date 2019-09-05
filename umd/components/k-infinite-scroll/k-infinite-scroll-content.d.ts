import { Config } from '../../config/config';
import { KInfiniteScroll } from './k-infinite-scroll';
/**
 * @hidden
 */
export declare class KInfiniteScrollContent {
    inf: KInfiniteScroll;
    private _config;
    /**
     * @input {string} An animated SVG spinner that shows while loading.
     */
    loadingSpinner: string;
    /**
     * @input {string} Optional text to display while loading.
     */
    loadingText: string;
    /**
     * @input {string} Optional text to display while load complete.
     */
    completeText: string;
    constructor(inf: KInfiniteScroll, _config: Config);
    /**
     * @hidden
     */
    ngOnInit(): void;
}
