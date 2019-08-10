import {LINKS} from '../../../utils/constants'
import {history} from '../../../utils/history'

export default function (StoryXMLPlayer, story, username, attemptedAll) {
    function saveToServer() {
    }

    function loadFromServer() {
    }

    var hookHandlers = {
        startMission: function () {
            return history.push('/academy/missions');
        },
        startQuest: function () {
            return history.push('/academy/quests');
        },
        openTemplate: function (name) {
            switch (name) {
                case 'textbook':
                    return window.open(LINKS.TEXTBOOK, '_blank');
                case 'announcements':
                    return window.open(LINKS.LUMINUS);
                case 'assessments':
                    return history.push('/academy/missions');
                case 'forum':
                    return window.open(LINKS.PIAZZA);
                case 'materials':
                    return history.push('/material');
                case 'IDE':
                    return history.push('/playground');
                case 'path':
                    return history.push('/academy/paths');
                case 'sourcecast':
                    return history.push('/sourcecast');
                case 'about':
                    return history.push('/contributors');
                default:
                    return window.open(LINKS.LUMINUS);
            }
        },
        pickUpCollectible: function (collectible) {
            if (typeof Storage !== 'undefined') {
                localStorage.setItem(collectible, 'collected');
            }
        },
        playSound: function (name) {
            var sound = new Audio(ASSETS_HOST + 'sounds/' + name + '.mp3');
            if (sound) {
                sound.play();
            }
        },
        saveCompletedQuest: function (questId) {
            if (typeof Storage !== 'undefined') {
                localStorage.setItem(questId, 'completed');
            }
        }
    };

    function openWristDevice() {
        window.open(LINKS.LUMINUS);
    }

    function startGame(div, canvas, saveData) {
        saveData = saveData || loadFromServer();
        StoryXMLPlayer.init(div, canvas, {
            saveData: saveData,
            hookHandlers: hookHandlers,
            saveFunc: saveToServer,
            wristDeviceFunc: openWristDevice,
            playerName: username,
            playerImageCanvas: $('<canvas />'),
            changeLocationHook: function (newLocation) {
                if (typeof Storage !== 'undefined') {
                    // Code for localStorage/sessionStorage.
                    localStorage.cs1101s_source_academy_location = newLocation;
                }
            }
        });
    }

    function initialize(div, canvas) {
        startGame(div, canvas);

        let enterDevMode = confirm("Do you want to enter dev mode?");
        let storyId, loadFromLocal;
        if (enterDevMode) {
            storyId = prompt("Please enter storyID here");
            if (storyId == null || !storyId.replace(/\s/g, '').length) {
                //storyId not entered or only contains whitespace
                storyId = 'master';
            }
            loadFromLocal = confirm("Do you want to load " + storyId + ".story.xml from your local device?");
            if (loadFromLocal) {
                alert("Loading " + storyId + "...\nPlease ensure that storyxml_server is serving on localhost port 8088.");
            } else {
                alert("Loading " + storyId + " from AWS repository...");
            }
        } else {
            storyId = 'master';
            loadFromLocal = false;
        }

        StoryXMLPlayer.loadStory(storyId, loadFromLocal, function () {});
    }

    return initialize;
};
