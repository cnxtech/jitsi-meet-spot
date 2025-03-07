const {
    BrowserWindow
} = require('electron');

const {
    defaultSpotURL,
    spashScreen
} = require('../../config');

const { config } = require('../config');
const { logger } = require('../logger');

/**
 * This is the reference for the main window. May be exposed from this scope later, but we don't have
 * any reasons to do it yet.
 */
let applicationWindow;

/**
 * Reference to the splash window. This can be disabled in the config.
 */
let splashWindow;

/**
 * Function to create the main window (application window).
 *
 * @returns {void}
 */
function createApplicationWindow() {
    applicationWindow = new BrowserWindow({
        fullscreen: config.getValue('window.fullscreen'),
        height: config.getValue('window.height'),
        show: false,
        width: config.getValue('window.width'),
        webPreferences: {
            nodeIntegration: true
        }
    });

    if (spashScreen && !config.getValue('window.fullscreen')) {
        splashWindow = new BrowserWindow({
            frame: false,
            height: spashScreen.height,
            maximizable: false,
            parent: applicationWindow,
            resizable: false,
            width: spashScreen.width
        });

        splashWindow.loadFile(spashScreen.logo);
    }

    // Set event handlers
    applicationWindow.once('ready-to-show', _onWindowReady);
    applicationWindow.on('resize', _onWindowResize);
    applicationWindow.on('enter-full-screen', _onWindowFullScreenChange);
    applicationWindow.on('leave-full-screen', _onWindowFullScreenChange);
    applicationWindow.on('enter-html-full-screen', _onHtmlFullScreenChange);
    applicationWindow.on('exit-html-full-screen', _onHtmlFullScreenChange);

    applicationWindow.loadURL(defaultSpotURL);

    logger.info(`Spot started with Spot-TV URL ${defaultSpotURL}`);
}

/**
 * Callback to handle 'enter-html-full-screen' and 'exit-html-full-screen' event of the main window.
 *
 * @returns {void}
 */
function _onHtmlFullScreenChange() {
    applicationWindow.setFullScreen(!applicationWindow.isFullScreen());
}

/**
 * Callback to handle 'enter-full-screen' and 'leave-full-screen' events of the main window.
 *
 * @returns {void}
 */
function _onWindowFullScreenChange() {
    // NOTE: Setting fullscreen: false disables the possibility to set the window full screen.
    config.setValue('window.fullscreen', applicationWindow.isFullScreen() ? true : undefined);
}

/**
 * Callback to handle 'ready-to-show' event of the main window.
 *
 * @returns {void}
 */
function _onWindowReady() {
    splashWindow && splashWindow.destroy();
    applicationWindow.show();
}

/**
 * Callback to persist window size on resizing the main window.
 *
 * @returns {void}
 */
function _onWindowResize() {
    const [ width, height ] = applicationWindow.getSize();

    config.setValue('window.height', height);
    config.setValue('window.width', width);
}

module.exports = {
    createApplicationWindow
};
