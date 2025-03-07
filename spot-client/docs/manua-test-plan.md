# Manual Test Plan

This document is a manual QA test plan to run as needed. Also, it serves as a feature and behavior summary for Spot.

Note that some of the test cases should already be automated in Spot-Webdriver.

Environments supported as a Spot-Remote
------
- [ ] Latest Firefox
- [ ] Latest Chrome (has wireless screenshare support)
- [ ] Latest Safari
- [ ] Latest iOS Safari
- [ ] Latest Android Chrome
- [ ] iOS 10.x iPad
- [ ] iOS 11.x iPad
- [ ] iOS 12.x iPad

Hosting
------
- [ ] Spot-TV can only be opened from Chrome

Pairing
------
- [ ] Spot-Remote can pair with Spot-TV

Calendar
------
- [ ] Spot-Remote sees Spot-TV's calendar events

Setup
------
- [ ] Device selection is saved
- [ ] Selected devices are used in a meeting
- [ ] Wired screensharing can be enabled and disabled
- [ ] Room name is saved and displayed in the app and meeting

Home
------
- [ ] Spot-Remote starts a calendar meeting
- [ ] Spot-Remote starts an ad-hoc meeting with random name
- [ ] Spot-Remote starts an ad-hoc meeting with typed in name
- [ ] Spot-Remote starts an ad-hoc meeting on a specified domain
- [ ] Spot-Remote starts an ad-hoc meeting by dialing out
- [ ] Spot-Remote starts an ad-hoc meeting with wired screenshare
- [ ] Spot-Remote starts an ad-hoc meeting with wireless screenshare

Spot In Meeting
------
- [ ] Spot-Remote toggles audio mute
- [ ] Spot-Remote toggles video mute
- [ ] Spot-Remote toggles wireless screensharing
- [ ] Spot-Remote toggles wired screensharing
- [ ] Spot-TV automatically hides filmstrip when screensharing in a lonely call
- [ ] Spot-TV automatically pins the latest screenshare
- [ ] Spot-Remote toggles tile view layout
- [ ] Spot-Remote can change Spot-TV volume when Spot-TV is hosted in Electron
- [ ] Spot-Remote cannot change Spot-TV volume when Spot-TV is hosted in a browser
- [ ] Spot-Remote hangs up
- [ ] Spot-Remote submits feedback
- [ ] Spot-TV and Spot-Remote proceed to Home after feedback submission

Wireless SS
------
- [ ] Spot-Remote stops wireless SS by clicking the Chrome bar
- [ ] Spot-Remote stops wireless SS by clicking the hangup button
- [ ] Spot-Remote stops wireless SS by closing the browser window
- [ ] Spot-Remote cancels screenshare picker
- [ ] Spot-Remote cannot share wirelessly on any browser except Chrome

Automatic Wired Screensharing
------
- [ ] Spot-TV at Home automatically joins a meeting with SS when connecting a device
- [ ] Spot-TV in a meeting automatically starts SS when connecting a device
- [ ] Spot-TV in a meeting automatically stops SS when disconnecting a device

Disconnects - Open source flow
------
- [ ] Spot-TV reloads the page and Spot-Remote displays join code entry
- [ ] Spot-Remote reconnects to a Spot-TV after disconnect
- [ ] Spot-TV reestablishes its own connection to the backend after losing internet
- [ ] Spot-Remote reestablishes its connection to the Spot-TV after losing internet

Disconnects - Backend flow
------
- [ ] Spot-TV exits the browser and Spot-Remote remains waiting for the Spot-TV
- [ ] Spot-TV automatically rejoins with existing setup when re-opening the browser
- [ ] Spot-Remote reconnects automatically to the Spot-TV after the Spot-TV reconnects
- [ ] Spot-TV reestablishes its own connection to the backend after losing internet
- [ ] Spot-Remote reestablishes its connection to the Spot-TV after losing internet

Screenshare Selection
------
Wired available and wireless available
- [ ] Click start sharing shows selection buttons for both
- [ ] Click Wireless opens desktop picker
- [ ] Click start with Wireless in progress shows modal with stop button
- [ ] Clicking stop wireless screenshare button stops screenshare, displays selection again  
- [ ] Clicking Wired shows connect cable message
- [ ] Click start with wired in progress shows stop button
- [ ] Clicking stop wired screenshare button stops screenshare, displays selection again

Wired unavailable and wireless available
- [ ] Click start opens desktop picker
- [ ] Click start with wireless in progress shows modal with stop button
- [ ] Clicking stop wireless closes the modal
- [ ] There is no mention of wired screensharing

Wired available and wireless unavailable
- [ ] Click start opens the modal showing connect cable message
- [ ] Click start with wired in progress shows stop button
- [ ] Clicking stop button stops screenshare, displays start again
- [ ] On browser, clicking start button opens modal asking to use different browser
- [ ] On mobile, clicking start button opens modal asking to go to a different site

Wired unavailable and wireless unavailable
- [ ] On browser, clicking start button opens modal asking to use different browser
- [ ] On mobile, clicking start button opens modal asking to go to a different site
- [ ] There is no mention of wired screensharing

Share Mode
------
- [ ] Spot-Remote enters share mode when submitting the join code while the host name matches the one specified share domain in config
- [ ] Spot-Remote enters share mode when submitting the join code with the "share" query param present
- [ ] Spot-Remote is automatically prompted with the screenshare picker after initial join code submit
- [ ] On wireless screenshare start, and Spot-TV not in a meeting, Spot-TV enters a random meeting with screensharing
- [ ] On wireless screenshare start, and Spot-TV in a meeting, SpotTV starts wireless screensharing in the current meeting
- [ ] Spot-Remote stopping screensharing exists the meeting
- [ ] Another Spot-Remote stopping the screensharing leave Spot-TV in the meeting
- [ ] At mode select, clicking the "Remote Control" button takes Spot-Remote to the full remote control view
- [ ] At mode select, unsupported browsers cannot start wireless screensharing
- [ ] At mode select, Spot-Remote cannot start a wireless screenshare if Spot-TV is already screensharing

Auto-updates - Backend flow only
------
- [ ] Automatically reloads the page at the configured time (default 2am)
