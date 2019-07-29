import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import { JitsiMeetJSProvider } from 'common/vendor';

const JitsiMeetJS = JitsiMeetJSProvider.get();
const ProxyConnectionEvents = JitsiMeetJS.ProxyConnectionEvents;
const ProxyConnectionServiceEvents = JitsiMeetJS.ProxyConnectionServiceEvents;

/**
 * FIXME.
 */
export default class P2PSignalingServer {
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

        logger.log('Will try to create P2P signalling');

        this._proxyConnectionService
            = new JitsiMeetJS.ProxyConnectionService({
                mediaConfiguration: { },
                jitsiConnection,
                onConnectionClosed: remoteAddress => {
                    logger.log(`P2P connection closed with: ${remoteAddress}`);

                    // FIXME cleanup connection when spot-remote leaves the MUC
                },
                onRemoteStream: () => {
                    logger.log('P2P on remote stream');
                },
                onSendMessage: (to, data) => {
                    logger.log(`P2P Send message to: ${to} data: ${data}`);
                    options.onSendP2PMessage(to, data);
                }
            });

        this._proxyConnectionService.on(
            ProxyConnectionServiceEvents.PROXY_CONNECTION_CREATED,
            proxyConnection => this._initProxyConnection(proxyConnection));

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
     * @param {ProxyConnectionPC} proxyConnection - FIXME.
     * @private
     * @returns {void}
     */
    _initProxyConnection(proxyConnection) {
        proxyConnection.on(
            ProxyConnectionEvents.DATA_CHANNEL_MSG_RECEIVED, data => {
                logger.log('Received data channel message', { data });
                this._onDataChannelMessage(proxyConnection, data);
            });
    }

    /**
     * FIXME.
     *
     * @param {ProxyConnectionPC} proxyConnection - FIXME.
     * @param {string} rawData - FIXME.
     * @private
     * @returns {void}
     */
    _onDataChannelMessage(proxyConnection, rawData) {
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

        const { command, data, requestId } = msg;

        if (requestId && command && data) {
            this._options.onSignalingMessageReceived({
                remoteAddress: proxyConnection.getPeerJid(),
                requestId,
                command,
                data
            });
        } else {
            logger.warn('Ignoring P2P msg', { rawData });
        }
    }

    /**
     * FIXME.
     *
     * @param {string} remoteAddress - FIXME.
     * @param {number} requestId - FIXME.
     * @returns {void}
     */
    sendCommandAck(remoteAddress, requestId) {
        const connection = this._proxyConnectionService.getConnectionForAddress(remoteAddress);

        connection && connection.isDataChannelActive() && connection.sendDataChannelMessage(
            JSON.stringify({
                command: 'ack',
                requestId
            }));
    }
}
