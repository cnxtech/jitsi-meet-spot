import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import { JitsiMeetJSProvider } from 'common/vendor';

const JitsiMeetJS = JitsiMeetJSProvider.get();
const ProxyConnectionEvents = JitsiMeetJS.ProxyConnectionEvents;

/**
 * FIXME.
 */
export default class P2PSignalingClient {
    /**
     * FIXME.
     *
     * @param {JitsiConnection} jitsiConnection - FIXME.
     * @param {Object} options - FIXME.
     * @param {Function} options.onReadyStateChanged - FIXME.
     * @param {Function} options.onSendP2PMessage - FIXME.
     * @param {Function} options.onSignalingMessageReceived - FIXME.
     */
    constructor(jitsiConnection, options) {
        /**
         * @typedef {Object} PromiseLike
         * @property {Function} resolve - hooked up to Promise's resolve method.
         * @property {Function} reject - hooked up to Promise's reject method.
         */
        /**
         * Map stores command requests sent over P2P signaling in order to resolve original promises when ack is
         * received.
         * @type {Map<number, PromiseLike>}
         * @private
         */
        this._p2pSignalingRequests = new Map();

        this._options = options;

        this._isReady = false;

        logger.log('Will try to create P2P signalling');

        this._proxyConnectionService
            = new JitsiMeetJS.ProxyConnectionService({
                mediaConfiguration: { },
                jitsiConnection,
                onConnectionClosed: () => {
                    this._onReadyStateChanged(false);
                },
                onRemoteStream: () => {
                    logger.log('P2P on remote stream');
                },
                onSendMessage: (to, data) => {
                    logger.log(`P2P Send message to: ${to} data: ${data}`);
                    options.onSendP2PMessage(to, data);
                }
            });

        avUtils.initialize();
    }

    /**
     * FIXME.
     *
     * @param {string} data - FIXME.
     * @param {string} from - FIXME.
     * @returns {void}
     */
    processMessage({ data, from }) {
        this._proxyConnectionService.processMessage({
            data,
            from
        });
    }

    /**
     * FIXME.
     *
     * @param {string} remoteAddress - FIXME.
     * @returns {void}
     */
    start(remoteAddress) {
        const proxyConnection = this._proxyConnectionService.createNewConnection(remoteAddress);

        this._initProxyConnection(proxyConnection);

        proxyConnection.start(
            [],
            { openDataChannel: true }
        );
    }

    /**
     * FIXME.
     *
     * @param {ProxyConnectionPC} proxyConnection - FIXME.
     * @private
     * @returns {void}
     */
    _initProxyConnection(proxyConnection) {
        if (this._p2pSignalingConnection) {
            throw new Error('P2P signaling connection already exists');
        }

        this._p2pSignalingConnection = proxyConnection;

        this._p2pSignalingConnection.on(
            ProxyConnectionEvents.DATA_CHANNEL_STATUS_CHANGED, isReady => {
                logger.log('On data channel status changed', { isReady });
                this._onReadyStateChanged(isReady);
            });
        this._p2pSignalingConnection.on(
            ProxyConnectionEvents.DATA_CHANNEL_MSG_RECEIVED, data => {
                logger.log('Received data channel message', { data });
                this._onDataChannelMessage(data);
            });
    }

    /**
     * FIXME.
     *
     * @param {string} rawData - FIXME.
     * @private
     * @returns {void}
     */
    _onDataChannelMessage(rawData) {
        let msg;

        try {
            msg = JSON.parse(rawData);
        } catch (error) {
            logger.error('Failed to parse P2P message', {
                rawData,
                error
            });

            return;
        }

        const { command, requestId } = msg;

        if (command === 'ack' && requestId) {
            const commandPromise = this._p2pSignalingRequests.get(requestId);

            if (commandPromise) {
                commandPromise.resolve();
            } else {
                logger.warn('No P2P command promise exists', { requestId });
            }

            this._p2pSignalingRequests.delete(requestId);
        } else {
            logger.warn('Ignoring P2P msg', { rawData });
        }
    }

    /**
     * FIXME.
     *
     * @param {boolean} isReady - FIXME.
     * @private
     * @returns {void}
     */
    _onReadyStateChanged(isReady) {
        this._isReady = isReady;
        this._options.onReadyStateChanged && this._options.onReadyStateChanged(isReady);
        if (!this._isReady) {

            // FIXME reject all promises
            this._p2pSignalingRequests.clear();
        }
    }

    /**
     * FIXME.
     *
     * @returns {boolean}
     */
    isReady() {
        return this._isReady;
    }

    /**
     * FIXME.
     *
     * @param {string} command - FIXME.
     * @param {string} data - FIXME.
     * @returns {Promise<any>}
     */
    sendCommand(command, data) {
        logger.log('Sending command over P2P', {
            command,
            data
        });

        // FIXME time may not be 100% reliable for unique IDs
        const requestId = new Date().getTime();

        // FIXME this is a mess
        const promiseWrapper = {
            _p2pSignalingConnection: this._p2pSignalingConnection
        };

        const promise = new Promise(function (resolve, reject) {
            this._p2pSignalingConnection.sendDataChannelMessage(JSON.stringify({
                requestId,
                command,
                data
            }));

            this.resolve = resolve;
            this.reject = reject;
        }.bind(promiseWrapper));

        this._p2pSignalingRequests.set(requestId, promiseWrapper);

        return promise;
    }
}
