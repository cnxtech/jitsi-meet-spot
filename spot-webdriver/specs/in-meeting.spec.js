const SpotSession = require('../user/spot-session');

describe('While in a meeting ', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();
    const spotSession = new SpotSession(spotTV, spotRemote);

    beforeEach(() => {
        spotSession.connectRemoteToTV();
        spotSession.joinMeeting();
        spotRemote
            .getInMeetingPage()
            .waitForVisible();
    });

    it('can toggle audio mute', () => {
        const spotRemoteInMeetingPage = spotRemote.getInMeetingPage();
        const spotTVMeetingPage = spotTV.getMeetingPage();

        spotRemoteInMeetingPage.muteAudio();

        spotRemoteInMeetingPage.waitForAudioMutedStateToBe(true);
        spotTVMeetingPage.waitForAudioMutedStateToBe(true);

        spotRemoteInMeetingPage.unmuteAudio();

        spotRemoteInMeetingPage.waitForAudioMutedStateToBe(false);
        spotTVMeetingPage.waitForAudioMutedStateToBe(false);
    });

    it('can toggle video mute', () => {
        const spotRemoteInMeetingPage = spotRemote.getInMeetingPage();
        const spotTVMeetingPage = spotTV.getMeetingPage();

        spotRemoteInMeetingPage.muteVideo();

        spotRemoteInMeetingPage.waitForVideoMutedStateToBe(true);
        spotTVMeetingPage.waitForVideoMutedStateToBe(true);

        spotRemoteInMeetingPage.unmuteVideo();

        spotRemoteInMeetingPage.waitForVideoMutedStateToBe(false);
        spotTVMeetingPage.waitForVideoMutedStateToBe(false);
    });

    it('can toggle tile view', () => {
        const spotRemoteInMeetingPage = spotRemote.getInMeetingPage();
        const spotTVMeetingPage = spotTV.getMeetingPage();
        const inTileView = spotTVMeetingPage.isInTileView();

        // The tests use the current value of inTileView to toggle instead of
        // assuming true/false in case some previous test already toggled tile
        // view and so jitsi-meet has opened with tile view already enabled.
        spotRemoteInMeetingPage.setTileView(!inTileView);
        spotTVMeetingPage.waitForTileViewStateToBe(!inTileView);

        spotRemoteInMeetingPage.setTileView(inTileView);
        spotTVMeetingPage.waitForTileViewStateToBe(inTileView);
    });

    it('does not have volume control when Spot-TV is in a browser', () => {
        expect(spotRemote.getInMeetingPage().hasVolumeControls()).toBe(false);
    });
});
