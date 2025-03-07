import persistence from './persistence';

/**
 * A unique identifier to use for persistence so the persistence service can
 * easily differentiate data it is interested in.
 *
 * @private
 * @type {string}
 */
const STORE_PERSISTENCE_KEY = 'spot';

/**
 * The last state update processed. Used as a flag to differentiate initial
 * bootstrapping and subsequent updates.
 *
 * @private
 * @type {Object}
 */
let cachedState;

/**
 * A list of store values that should trigger persistance updating if the value
 * has changed.
 *
 * @private
 * @type {Array<string>}
 */
const keysToStore = [
    'calendars.calendarType',
    'calendars.email',
    'calendars.displayName',
    'deviceId.deviceId',
    'setup.avatarUrl',
    'setup.completed',
    'setup.displayName',
    'setup.preferredCamera',
    'setup.preferredMic',
    'setup.preferredSpeaker',
    'spotRemote.permanentPairingCode',
    'spot-tv/backend.longLivedPairingCodeInfo',
    'spot-tv/backend.permanentPairingCode',
    'spotRemote.completedOnboarding',
    'wiredScreenshare.deviceLabel',
    'wiredScreenshare.idleValue'
];

/**
 * Checks if the new state update should update the persisted state.
 *
 * @param {Object} oldState - The outdated state object.
 * @param {Object} newState - The new state object to be compared to the old
 * state object.
 * @private
 * @returns {boolean} True if the new state has a changed value that should
 * trigger a persistence update.
 */
function hasUpdateOfInterest(oldState, newState) {
    return keysToStore.some(key => {
        const statePath = key.split('.');
        const oldValue = statePath.reduce((a = {}, b) => a[b], oldState);
        const newValue = statePath.reduce((a, b) => a[b], newState);

        return oldValue !== newValue;
    });
}

/**
 * Transforms the Redux state into the format expected for persisted storage.
 *
 * @param {Object} state - The state object from Redux.
 * @private
 * @returns {Object} A new state object formatted for persisted storage.
 */
function parsePersistedState(state) {
    return {
        calendars: {
            calendarType: state.calendars.calendarType,
            displayName: state.calendars.displayName,
            email: state.calendars.email
        },
        deviceId: {
            deviceId: state.deviceId.deviceId
        },
        setup: {
            avatarUrl: state.setup.avatarUrl,
            completed: state.setup.completed,
            displayName: state.setup.displayName,
            preferredCamera: state.setup.preferredCamera,
            preferredMic: state.setup.preferredMic,
            preferredSpeaker: state.setup.preferredSpeaker,
            screenshareDevice: state.setup.screenshareDevice,
            screenshareDeviceIdleValue:
                state.setup.screenshareDeviceIdleValue
        },
        wiredScreenshare: {
            deviceLabel: state.wiredScreenshare.deviceLabel,
            idleValue: state.wiredScreenshare.idleValue
        },

        // TODO: either unify with Spot remote or move to Spot TV/app-state
        'spot-tv/backend': {
            longLivedPairingCodeInfo: state['spot-tv/backend'].longLivedPairingCodeInfo,
            permanentPairingCode: state['spot-tv/backend'].permanentPairingCode
        },
        spotRemote: {
            completedOnboarding: state.spotRemote.completedOnboarding,
            permanentPairingCode: state.spotRemote.permanentPairingCode
        }
    };
}

/**
 * Removes the saved application state.
 *
 * @returns {void}
 */
export function clearPersistedState() {
    persistence.remove(STORE_PERSISTENCE_KEY);
}

/**
 * Returns the application state that has been stored through the persistence
 * service.
 *
 * @returns {Object}
 */
export function getPersistedState() {
    return persistence.get(STORE_PERSISTENCE_KEY) || {};
}

/**
 * Updates the persisted application state if the new state has an updated value
 * that should trigger a persistence update.
 *
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
export function setPersistedState(store) {
    const newState = parsePersistedState(store.getState());

    // Check if cached state exists to intentionally skip a save request being
    // triggered due to the initial hydrating of the redux store.
    if (cachedState && hasUpdateOfInterest(cachedState, newState)) {
        persistence.set(STORE_PERSISTENCE_KEY, newState);
    }

    cachedState = newState;
}
