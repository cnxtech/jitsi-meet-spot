import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import {
    getCalendarError,
    getCalendarEvents,
    getDisplayName,
    getRemoteJoinCode,
    hasCalendarBeenFetched,
    isSetupComplete
} from 'common/app-state';
import { AutoUpdateChecker } from 'common/auto-update';
import { isBackendEnabled } from 'common/backend';
import { COMMANDS, SERVICE_UPDATES } from 'common/remote-control';
import { ROUTES } from 'common/routing';
import { Clock, LoadingIcon, ScheduledMeetings } from 'common/ui';
import { getRandomMeetingName } from 'common/utils';

import { updateSpotTVSource } from '../../app-state';
import { getPermanentPairingCode } from '../../backend';
import {
    FullscreenToggle,
    JoinInfo,
    SettingsButton,
    WiredScreenshareChangeListener
} from './../components';
import { withCalendar } from './../loaders';

/**
 * A view of all known meetings in the calendar connected with Spot-TV.
 *
 * @extends React.Component
 */
export class Home extends React.Component {
    static defaultProps = {
        remoteJoinCode: ''
    };

    static propTypes = {
        calendarError: PropTypes.any,
        calendarService: PropTypes.object,
        enableAutoUpdate: PropTypes.bool,
        events: PropTypes.array,
        hasFetchedEvents: PropTypes.bool,
        history: PropTypes.object,
        isSetupComplete: PropTypes.bool,
        onUpdateAvailable: PropTypes.func,
        remoteControlServer: PropTypes.object,
        remoteJoinCode: PropTypes.string,
        spotRoomName: PropTypes.string
    };

    /**
     * Initializes a new {@code Home} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            calendarError: null
        };

        this._onCommand = this._onCommand.bind(this);
        this._onRedirectToMeeting = this._onRedirectToMeeting.bind(this);
    }

    /**
     * Registers listeners for updating the view's data and display.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.remoteControlServer.addListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onCommand
        );
    }

    /**
     * Cleans up listeners for daemons and long-running updaters.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.remoteControlServer.removeListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onCommand
        );
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            enableAutoUpdate,
            isSetupComplete: _isSetupComplete,
            spotRoomName
        } = this.props;

        return (
            <WiredScreenshareChangeListener
                onDeviceConnected = { this._onRedirectToMeeting }>
                { enableAutoUpdate
                    && <AutoUpdateChecker
                        onUpdateAvailable = { this.props.onUpdateAvailable } /> }
                <div className = 'spot-home'>
                    <Clock />
                    <div className = 'room-name'>
                        { spotRoomName && <div>{ spotRoomName }</div> }
                    </div>
                    { this._getCalendarEventsView() }
                    {
                        _isSetupComplete
                            && <div className = 'spot-home-footer'>
                                <JoinInfo showDomain = { _isSetupComplete } />
                            </div>
                    }
                </div>
                <div className = 'admin-toolbar'>
                    <FullscreenToggle />
                    <SettingsButton />
                </div>
            </WiredScreenshareChangeListener>
        );
    }

    /**
     * Returns the React Component which should be displayed for the list of
     * calendars.
     *
     * @returns {ReactComponent|null}
     */
    _getCalendarEventsView() {
        if (!this.props.isSetupComplete) {
            return this._renderSetupMessage();
        }

        if (this.props.calendarError) {
            return this._renderError();
        }

        if (this.props.hasFetchedEvents) {
            return this.props.events.length
                ? <ScheduledMeetings events = { this.props.events } />
                : this._renderNoEventsMessage();
        }

        return <LoadingIcon />;
    }

    /**
     * Listens for Spot-Remotes commanding this Spot-TV to enter a meeting.
     *
     * @param {string} type - The type of the command being sent.
     * @param {Object} data - Additional data necessary to execute the command.
     * @private
     * @returns {void}
     */
    _onCommand(type, data) {
        switch (type) {
        case COMMANDS.GO_TO_MEETING: {
            let path = `${ROUTES.MEETING}?location=${data.meetingName}`;

            if (data.invites) {
                path += `&invites=${JSON.stringify(data.invites)}`;
            }

            if (data.startWithScreensharing) {
                path += '&screenshare=true';
            }

            if (data.startWithVideoMuted === true) {
                path += '&startWithVideoMuted=true';
            }

            this.props.history.push(path);

            break;
        }
        }
    }

    /**
     * Proceeds into a random meeting with screensharing enabled.
     *
     * @private
     * @returns {void}
     */
    _onRedirectToMeeting() {
        const meetingName = getRandomMeetingName();

        this.props.history.push(
            `${ROUTES.MEETING}?location=${meetingName}&screenshare=true`);
    }

    /**
     * Instantiates a React Element with a message stating calendar events could
     * not be fetched.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderError() {
        return (
            <div className = 'no-events-message'>
                <div>Unable to get calendar events.</div>
                <div>
                   Please try reconnecting to the room's calendar.
                </div>
            </div>
        );
    }

    /**
     * Instantiates a React Element with a message stating there are no
     * scheduled meetings on the calendar associated with the Spot-TV.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderNoEventsMessage() {
        return (
            <div className = 'no-events-message'>
                <div>There are no scheduled meetings.</div>
                <div>
                    Invite this room to your calendar event
                    and you'll be set
                </div>
            </div>
        );
    }

    /**
     * Instantiates a React Element with a message stating Spot-TV should have a
     * calendar connected.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderSetupMessage() {
        return (
            <div className = 'no-events-message'>
                <h1>Welcome to Spot!</h1>
                <div className = 'setup-instructions'>
                    <div>You're almost set</div>
                    <div>
                        Pair your remote and connect your calendar.
                    </div>
                </div>
                {
                    this.props.remoteJoinCode
                        && (
                            <div className = 'setup-join-code'>
                                <JoinInfo />
                            </div>
                        )
                }
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Home}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        calendarError: getCalendarError(state),
        enableAutoUpdate: isBackendEnabled(state)
            && Boolean(getPermanentPairingCode(state)),
        events: getCalendarEvents(state),
        hasFetchedEvents: hasCalendarBeenFetched(state),
        isSetupComplete: isSetupComplete(state),
        remoteJoinCode: getRemoteJoinCode(state),
        spotRoomName: getDisplayName(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        onUpdateAvailable() {
            dispatch(updateSpotTVSource());
        }
    };
}

export default withRouter(withCalendar(
    connect(mapStateToProps, mapDispatchToProps)(Home)));
