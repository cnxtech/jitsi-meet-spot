/**
 * The base class for page objects from which all other page objects should
 * inherit from.
 */
class PageObject {
    /**
     * Initializes a new {@code PageObject} instance.
     *
     * @param {Object} driver - The webdriver.io browser instance which can
     * interact with Spot.
     */
    constructor(driver) {
        this.driver = driver;
    }

    /**
     * Finds HTML element.
     *
     * @param {string | Function} selector - A selector passed to the driver in order to find
     * the element.
     * @returns {Element}
     */
    select(selector) {
        return this.driver.$(selector);
    }

    /**
     * A shortcut for first selecting an {@code Element} and then calling {@code waitForDisplayed}.
     *
     * @param {string | Function} selector - A selector passed to the driver in order to find
     * the element.
     * @param {number} [waitTime] - Optional wait time given in milliseconds.
     * @returns {Element} - Returns the selected element for future use.
     */
    waitForElementDisplayed(selector, waitTime) {
        const element = this.select(selector);

        element.waitForDisplayed(waitTime);

        return element;
    }

    /**
     * Waits for an element to no longer be visible.
     *
     * @param {string | Function} selector - A selector passed to the driver in order to find
     * the element.
     * @param {number} [waitTime] - Optional wait time given in milliseconds.
     * @returns {Element} - Returns the selected element for future use.
     */
    waitForElementHidden(selector, waitTime) {
        const element = this.select(selector);

        element.waitForDisplayed(waitTime, true);

        return element;
    }

    /**
     * Waits for the element to be in the given state.
     *
     * @param {boolean} state - The state to wait for.
     * @param {Object} options - See each option for details.
     * @param {string} options.onStateSelector - The element selector used for the truthy state.
     * @param {string} options.offStateSelector - The element's selector used for the not truthy
     * state.
     * @param {number} options.waitTime - How long will the method wait for the state to change (in
     * milliseconds).
     * @returns {void}
     */
    waitForBooleanState(state, options) {
        const {
            onStateSelector,
            offStateSelector,
            waitTime
        } = options;
        const selector = state ? onStateSelector : offStateSelector;

        this.waitForElementDisplayed(selector, waitTime);
    }

    /**
     * Waits for this page object to be visible on the browser.
     *
     * @returns {void}
     */
    waitForVisible() {
        const rootElement = this.select(this.rootSelector);

        rootElement.waitForExist();
    }
}

module.exports = PageObject;
