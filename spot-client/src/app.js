import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import { apiMessageReceived, setBootstrapComplete } from 'common/app-state';
import { logger } from 'common/logger';
import { ROUTES } from 'common/routing';
import {
    ErrorBoundary,
    FatalError,
    IdleCursorDetector,
    ModalManager,
    Notifications
} from 'common/ui';
import { Help, JoinCodeEntry, RemoteControl, ShareView } from 'spot-remote/ui';
import {
    Home,
    Meeting,
    OutlookOauth,
    Setup,
    SpotView,
    UnsupportedBrowser,
    WiredScreenshareDetector
} from 'spot-tv/ui';
import { SpotTVRemoteControlLoader } from './spot-tv/ui/loaders';
import { SpotTvRestrictedRoute } from './spot-tv/routing';

/**
 * The root of the application which determines what view should be displayed.
 *
 * @extends React.Component
 */
export class App extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        location: PropTypes.object
    };

    /**
     * Initializes a new {@code App} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            hideCursor: true
        };

        this._onCursorIdleChange = this._onCursorIdleChange.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onPostMessage = this._onPostMessage.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);

        this._renderHomeView = this._renderHomeView.bind(this);
        this._renderMeetingView = this._renderMeetingView.bind(this);
        this._renderSetupView = this._renderSetupView.bind(this);
        this._renderUnsupportedBrowserView
            = this._renderUnsupportedBrowserView.bind(this);
    }

    /**
     * Adds event listeners that modify app behavior or appearance.
     *
     * @inheritdoc
     */
    componentDidMount() {
        logger.log('App mounted', {
            duration: window.performance.now(),
            userAgent: window.navigator.userAgent
        });

        /**
         * Defer touch actions to web to handle instead of the mobile device.
         */
        document.addEventListener('touchstart', this._onTouchStart, true);

        /**
         * First half of the hack to prevent outline styles from displaying
         * while using a mouse to navigate but show them when using a keyboard.
         * Hide outlines when the mouse is being used so clicking does not
         * outline anything.
         */
        document.body.addEventListener('mousedown', this._onMouseDown);

        /**
         * Second half of the hack to prevent outline styles from displaying
         * while using a mouse to navigate but show them when using a keyboard.
         * Show outlines when the keyboard is being used so tabbing does
         * outline the focused element.
         */
        document.body.addEventListener('keydown', this._onKeyDown);

        /**
         * Instructions can be received through the iframe postMessage
         * event to instruct the remote or the spot TV to do something.
         */
        window.addEventListener('message', this._onPostMessage);

        this.props.dispatch(setBootstrapComplete());
    }

    /**
     * Removes event listeners that modify app behavior or appearance.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        document.removeEventListener('touchstart', this._onTouchStart);
        document.removeEventListener('mousedown', this._onMouseDown);
        document.removeEventListener('keydown', this._onKeyDown);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const rootClassName
            = `app ${this.state.hideCursor ? 'idleCursor' : ''}`;

        return (
            <ErrorBoundary errorComponent = { FatalError }>
                <IdleCursorDetector
                    onCursorIdleChange = { this._onCursorIdleChange }>
                    <div className = { rootClassName }>

                        <Notifications />
                        <Switch>
                            {

                                /**
                                 * Spot-TV specific routes.
                                 */
                            }
                            <SpotTvRestrictedRoute
                                path = { ROUTES.MEETING }
                                render = { this._renderMeetingView } />
                            <SpotTvRestrictedRoute
                                path = { ROUTES.OUTLOOK_OAUTH }
                                render = { this._renderOutlookOauthView } />
                            <SpotTvRestrictedRoute
                                path = { ROUTES.SETUP }
                                render = { this._renderSetupView }
                                requireSetup = { false } />
                            <SpotTvRestrictedRoute
                                path = { ROUTES.HOME }
                                render = { this._renderHomeView } />
                            <Route
                                path = { ROUTES.UNSUPPORTED_BROWSER }
                                render = { this._renderUnsupportedBrowserView } />

                            {

                                /**
                                 * Spot-Remote specific routes.
                                 */
                            }
                            <Route
                                component = { Help }
                                path = { ROUTES.HELP } />
                            <Route
                                component = { ShareView }
                                path = { ROUTES.SHARE } />
                            <Route
                                component = { RemoteControl }
                                path = { ROUTES.REMOTE_CONTROL } />
                            <Route component = { JoinCodeEntry } />
                        </Switch>
                    </div>
                    <ModalManager />
                </IdleCursorDetector>
            </ErrorBoundary>
        );
    }

    /**
     * Callback invoked to update the known idle state of the cursor.
     *
     * @param {boolean} cursorIsIdle - Whether or not the cursor is idle.
     * @private
     * @returns {void}
     */
    _onCursorIdleChange(cursorIsIdle) {
        this.setState({ hideCursor: cursorIsIdle });
    }

    /**
     * Callback invoked when keyboard event occurs so outline styles can be
     * shown.
     *
     * @private
     * @returns {void}
     */
    _onKeyDown() {
        document.body.classList.remove('using-mouse');
    }

    /**
     * Callback invoked when a click occurs so outline styles can be hidden.
     *
     * @private
     * @returns {void}
     */
    _onMouseDown() {
        document.body.classList.add('using-mouse');
    }

    /**
     * Callback invoked on window 'message' event.
     *
     * @param {Object} event - The message event posted.
     * @returns {void}
     */
    _onPostMessage({ data }) {
        try {
            const parsedMessage = typeof data === 'object' ? data : JSON.parse(data);

            // A Jitsi API message needs to have a messageType and a messageData field, otherwise we ignore
            // handling it. Those messages may have arrived from other integrations, such as webpack.

            const { messageData, messageType } = parsedMessage;

            messageData && messageType && this.props.dispatch(apiMessageReceived(messageType, messageData));
        } catch (error) {
            logger.warn(`Unknown message received: '${data}'`, error);
        }
    }

    /**
     * Callback invoked on touch event.
     *
     * @private
     * @returns {void}
     */
    _onTouchStart() {
        /** no-op */
    }

    /**
     * Returns the Spot TV home (calendar) view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderHomeView() {
        return this._renderSpotViewWithRemoteControl(Home, 'home');
    }

    /**
     * Returns the Spot TV in-meeting view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderMeetingView() {
        return this._renderSpotViewWithRemoteControl(Meeting, 'meeting');
    }

    /**
     * Returns the Spot-TV view for processing an Outlook oauth redirect.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderOutlookOauthView() {
        return <OutlookOauth />;
    }

    /**
     * Returns the Spot TV setup view.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderSetupView() {
        return (
            <SpotView name = { 'setup' }>
                <Setup />
            </SpotView>
        );
    }

    /**
     * Helper to ensure all Spot TV views share the same wrapper responsible
     * for maintaining the remote control service.
     *
     * @param {ReactComponent} View - The child to display within the remote
     * control service loader.
     * @param {string} name - The name associate with the view. Used for remotes
     * to identify what view the spot is showing.
     * @private
     * @returns {ReactComponent}
     */
    _renderSpotViewWithRemoteControl(View, name) {
        return (
            <SpotTVRemoteControlLoader>
                <WiredScreenshareDetector />
                <SpotView name = { name }>
                    <View />
                </SpotView>
            </SpotTVRemoteControlLoader>
        );
    }

    /**
     * Returns the Spot-TV view to message that Spot-TV will not run in the
     * current environment.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderUnsupportedBrowserView() {
        return (
            <SpotView name = { 'unsupported' }>
                <UnsupportedBrowser />
            </SpotView>
        );
    }
}

export default connect()(withRouter(App));
