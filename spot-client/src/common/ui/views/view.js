import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getBackgroundUrl, isAnyModalOpen } from 'common/app-state';
import { logger } from 'common/logger';

/**
 * A React Component representing a single screen in the single-page application
 * and is responsible for basic layout.
 *
 * @extends React.Component
 */
class View extends React.Component {
    static propTypes = {
        backgroundUrl: PropTypes.string,
        children: PropTypes.node,
        hideBackground: PropTypes.bool,
        isAnyModalOpen: PropTypes.bool,
        name: PropTypes.string
    };

    /**
     * Logs the display of the view.
     *
     * @inheritdoc
     */
    componentDidMount() {
        logger.log('View mounted', { name: this.props.name });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        let backgroundStyles;

        if (!this.props.hideBackground) {
            const backgroundUrl = this.props.backgroundUrl;

            if (backgroundUrl) {
                backgroundStyles = {
                    backgroundImage: `url('${backgroundUrl}')`
                };
            }
        }

        const className = `view ${this.props.isAnyModalOpen ? 'modal-open' : ''}`;

        const gradientStyle
            = `view-gradient ${backgroundStyles ? 'visible' : ''}`;

        return (
            <div
                className = { className }
                data-qa-id = { `${this.props.name}-view` }>
                <div
                    className = 'view-background-container'
                    style = { backgroundStyles }>
                    <div className = { gradientStyle } />
                </div>
                {

                    /**
                     * The div with view-content-container will allow for
                     * overflow while the div with view-content-center allows
                     * for centering whatever the children might be. This is
                     * done for cross browser support with safari and android
                     * browsers.
                     */
                }
                <div className = 'view-content-container'>
                    <div className = 'view-content-center'>
                        { this.props.children }
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code View}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        backgroundUrl: getBackgroundUrl(state),
        isAnyModalOpen: isAnyModalOpen(state)
    };
}

export default connect(mapStateToProps)(View);
