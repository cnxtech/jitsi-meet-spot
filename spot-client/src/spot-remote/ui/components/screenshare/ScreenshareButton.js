import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    hideModal,
    isModalOpen,
    showModal
} from 'common/app-state';
import { ScreenShare } from 'common/icons';

import { NavButton } from './../nav';

import ScreenshareModal from './ScreenshareModal';

/**
 * A component for displaying and hiding {@code ScreenshareModal}.
 *
 * @extends React.Component
 */
export class ScreenshareButton extends React.Component {
    static propTypes = {
        isScreenshareModalOpen: PropTypes.bool,
        onHideModal: PropTypes.func,
        onShowScreenshareModal: PropTypes.func,
        onWillOpenModal: PropTypes.func,
        screensharingType: PropTypes.string
    };

    /**
     * Initializes a new {@code ScreenshareButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onToggleScreenshare = this._onToggleScreenshare.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { isScreenshareModalOpen, screensharingType } = this.props;
        const screenshareButtonStyles = `sharebutton ${isScreenshareModalOpen
            || screensharingType ? 'active' : ''}`;

        return (
            <NavButton
                className = { screenshareButtonStyles }
                label = 'Share Content'
                onClick = { this._onToggleScreenshare }
                qaId = {
                    screensharingType ? 'stop-share' : 'start-share'
                }
                subIcon = { this._renderScreenshareSubIcon() }>
                <ScreenShare />
            </NavButton>
        );
    }

    /**
     * Callback invoked when the screenshare button is clicked to either open
     * the modal or close it.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreenshare() {
        if (this.props.isScreenshareModalOpen) {
            this.props.onHideModal();

            return;
        }

        if (this.props.onWillOpenModal()) {
            this.props.onShowScreenshareModal();
        }
    }

    /**
     * Renders the element on the screenshare button which shows screenshare is
     * active.
     *
     * @private
     * @returns {ReactElement|null}
     */
    _renderScreenshareSubIcon() {
        return this.props.screensharingType
            ? <div className = 'on-indicator' />
            : null;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code ScreenshareButton}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const { screensharingType } = getInMeetingStatus(state);

    return {
        isScreenshareModalOpen: isModalOpen(state, ScreenshareModal),
        screensharingType
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
        /**
         * Stop displaying all modals.
         *
         * @returns {void}
         */
        onHideModal() {
            dispatch(hideModal());
        },

        /**
         * Displays the {@code ScreenshareModal} to interact with wired and/or
         * wireless screensharing.
         *
         * @returns {void}
         */
        onShowScreenshareModal() {
            dispatch(showModal(ScreenshareModal));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ScreenshareButton);
