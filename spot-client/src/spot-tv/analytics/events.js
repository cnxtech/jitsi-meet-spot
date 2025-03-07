/**
 * Events used when spot is connecting to the backend using a pairing code.
 */
export const backendPairingEvents = {
    SUBMIT: 'backend-pairing-code-submit',
    VALIDATE_FAIL: 'backend-pairing-code-validation-fail',
    VALIDATE_SUCCESS: 'backend-pairing-code-validation-success'
};

export const permanentPairingCodeEvents = {
    PAIRING_FAIL: 'permanent-pairing-code-fail',
    PAIRING_SUCCESS: 'permanent-pairing-code-success'
};
