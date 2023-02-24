const artistSearchBtn = document.querySelector('#artist-search')
artistSearchBtn.addEventListener('submit', (e) => {
    e.preventDefault()
    artistSearch((e.target.search.value).toUpperCase())
})

function artistSearch(artistName) {
    fetch(`https://musicbrainz.org/ws/2/artist/?query=${artistName}&limit=20`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'user-agent': 'Music Searcher 1.0 (mdsteinkamp@gmail.com)'
        },
        mode: 'cors'
    })
    .then((resp) => resp.json())
    .then(data => matchArtist(artistName, data))
    .catch((error) => alert('Artist not found try again!', error))
}

function artistReleaseFetch(artistID, offset = 0, previousResponse = []) {
    fetch(`http://musicbrainz.org/ws/2/release?artist=${artistID}&limit=100&offset=${offset}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'user-agent': 'Music Searcher 1.0 (mdsteinkamp@gmail.com)'
        },
        mode: 'cors'
    })
    .then((resp) => resp.json())
    .then(data => {
        const allReleasesArr = [...previousResponse, ...data.releases]
        if (data.releases.length !== 0) {
            offset = offset + 100
            return artistReleaseFetch(artistID, offset, allReleasesArr)
        }
        renderReleases(allReleasesArr)
    })
}

function matchArtist(artistName, artistObj) {
    const artistArr = artistObj.artists
    const matchedArtist = artistArr.find(artist => artist.name.toUpperCase() === artistName)
    renderArtist(matchedArtist)
}

function renderArtist(artistName) {
    const artistCollection = document.querySelector('#artist-collection')
    const card = document.createElement('div')
    card.className = 'card'
    const h2 = document.createElement('h2')
    const pCountry = document.createElement('p')
    h2.textContent = `${artistName.name}`
    pCountry.textContent = `Country: ${artistName.country}`
    card.append(h2, pCountry)
    artistCollection.append(card)
    tagFinder(artistName, artistCollection)
    artistReleaseFetch(artistName.id)
}

function renderReleases(releaseArr) {
    const h4 = document.createElement('h4')
    h4.textContent = "Official Releases:"
    const releases = releaseArr
    const officialReleases = releaseArr.filter(release => release.status === 'Official')
    const sortedOfficialReleases = officialReleases.sort(function (a, b) {
        let c = new Date(a.date)
        let d = new Date(b.date)
        return c - d
    })
    const cleanedReleases = removeDupRelease(sortedOfficialReleases)
    const card = document.querySelector('#release-collection')
    card.appendChild(h4)
    cleanedReleases.forEach(release => {
        const li = document.createElement('li')
        li.setAttribute('id', `${release.title}`)
        li.textContent = `${release.title}, released ${release.date} `
        const selectList = document.createElement('select')
        selectList.setAttribute('id', `${release.title}`)
        const selectOptions = ['Rate Album', '5/5', '4/5', '3/5', '2/5', '1/5']
            for (let i = 0; i < selectOptions.length; i++) {
            const option = document.createElement('option')
            option.value = selectOptions[i]
            option.text = selectOptions[i]
            selectList.append(option)
            li.append(selectList)
        }
        card.append(li)
        selectList.addEventListener('change', (event) => ratedReleases(event))
    })
}

const tagFinder = function(artistName, artistCollection) {
    const h4Genre = document.createElement('h4')
    h4Genre.textContent = "Genres: "
    artistCollection.appendChild(h4Genre)
    return artistName.tags.forEach(tag => {
        const liTag = document.createElement('li')
        liTag.textContent = tag.name
        artistCollection.appendChild(liTag)
    })
}

function removeDupRelease (releaseArr) {
    let seen = {}
    return releaseArr.filter(function(album) {
        return seen.hasOwnProperty(album.title) ? false : (seen[album.title] = true)
    })
}

function ratedReleases(event) {
    const target = event.target
    const releaseTitle = target.parentElement
    const ratedReleases = document.querySelector("#rated-releases")
    const p = document.createElement('p')
    p.setAttribute('class', 'rated')
    p.textContent = "You rated " + releaseTitle.id + " " + event.target.value + " on " + new Date().toISOString().slice(0,10)
    ratedReleases.appendChild(p)
} 

const sortLink = document.querySelector('#sorter')
sortLink.addEventListener('click', () => {
    let allRated = document.getElementsByClassName('rated')
    allRated = Array.from(allRated)
    allRated.sort(function(a, b) {
        return b.textContent.slice(-17, -16) - (a.textContent.slice(-17, -16))
    })
    const sortedReleaseList = document.querySelector('#rated-releases')
    sortedReleaseList.innerHTML = ''
    allRated.forEach(release => {
        const p = document.createElement('p')
        p.textContent = (release.textContent)
        sortedReleaseList.appendChild(p)
    })
})

