var gData;

SC.initialize({
    client_id: '481fa42b193b17e654a022565712c958'
});

function loadRecents() {
    if (localStorage['recents']) return JSON.parse(localStorage['recents']);
    else return [];
}

function saveRecents(recents) {
    localStorage['recents'] = JSON.stringify(recents);
}

function addToRecent(strToSearch) {
    var strHTML = '';
    var recents = loadRecents();
    if (strToSearch) {
        recents.unshift(strToSearch);
        if (recents.length > 5) recents.pop();
    }
    recents.forEach(function (recent) {
        strHTML += '<li><p role="button" onclick="putInSearch(this)">' + recent + '</p></li>';
    });
    document.querySelector('.recent').innerHTML = strHTML;
    saveRecents(recents);
}

function addList() {
    var lis = '';
    gData.collection.forEach(function (track, i) {
        lis += '<li><p role="button" class="animated" onclick="selectTrack(this,' + i + ')">' + track.title + '</p></li>';
    });
    document.querySelector('.results').innerHTML = lis;
    elResults.innerHTML = lis.join('\n');
}

function search() {
    var strToSearch = document.querySelector('.search').value;
    addToRecent(strToSearch);
    SC.get('/tracks', {
        q: strToSearch, limit: 6, linked_partitioning: 1
    }).then(function (data) {
        gData = data;
        addList();
    });
}

function loadNext() {
    var request = new XMLHttpRequest();
    request.open('GET', gData.next_href, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            gData = JSON.parse(request.responseText);
            addList();
        } else {
            console.log('target server returned an error');
        }
    };
    request.onerror = function () {
        console.log('There was a connection error of some sort');
    };
    request.send();
}

function putInSearch(el) {
    var strToSearch = el.innerText;
    document.querySelector('.search').value = strToSearch;
    search();
}

function displayImage(elImg, index) {
    var elTrackImage = document.querySelector('.track-img');
    var artworkUrl = gData.collection[index].artwork_url;
    elTrackImage.classList.add('show-element');
    elTrackImage.setAttribute('src', '');
    elTrackImage.setAttribute('onclick', 'playTrack("' + index + '")');
    var imgSrc = artworkUrl ? artworkUrl.replace('large', 'crop') : 'images/no_image.gif';
    elTrackImage.setAttribute('src', imgSrc);
}

function selectTrack(el, index) {

    var alreadyFade = document.querySelector('.fadeOutRight');
    if (alreadyFade) alreadyFade.classList.remove('fadeOutRight');
    el.classList.add('fadeOutRight');

    var elImg = document.querySelector('.track-img');
    if (elImg.classList.contains('fadeIn')) elImg.classList.remove('fadeIn');
    setTimeout(function () {
        elImg.classList.add('fadeIn');
    }, 1);
    displayImage(elImg, index);
}

function playTrack(index) {
    var iframe;
    var trackUrl = gData.collection[index].permalink_url;
    SC.oEmbed(trackUrl, { auto_play: true }).then(function (oEmbed) {
        var playerContainer = document.getElementById('player');
        playerContainer.innerHTML = oEmbed.html;
        playerContainer.querySelector('iframe').setAttribute('allow', 'autoplay');
    });
}

addToRecent();
