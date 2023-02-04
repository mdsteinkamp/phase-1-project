//Event listener for Artist Search form, sends user input to artistSearch fetch fn
const artistSearchBtn = document.querySelector('#artist-search')
artistSearchBtn.addEventListener('submit', (e) => {
    e.preventDefault()
    artistSearch((e.target.search.value).toUpperCase())
})

//Event listener for Genre & Country form, sends user input to genreCountrySearch fetch fn
// const genSearchBtn = document.querySelector("#genre-search")
// genSearchBtn.addEventListener('submit', (e) => {
//     e.preventDefault()
//     const inputGenre = e.target.gensearch.value
//     const inputCountry = e.target.selectCountry.value
//     // console.log(e.target.gensearch.value)
//     // console.log(e.target.selectCountry.value)
//     genreCountrySearch(inputGenre, inputCountry)
// })


//GET request based on artist search limited to 10 returned results
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
}

//GET request using artist MBID, will go through paginated artist releases based on offset +100
//and return ALL releases in array to send to renderReleases fn
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

//Matches the artist based on user input from list returned from API, sends result to renderArtist fn
function matchArtist(artistName, artistObj) {
    const artistArr = artistObj.artists
    const matchedArtist = artistArr.find(artist => artist.name.toUpperCase() === artistName)
    renderArtist(matchedArtist)
}

//renders the artist info to the DOM
function renderArtist(artistName) {
    const artistCollection = document.querySelector('#artist-collection')
    const card = document.createElement('div')
    card.className = 'card'
    const h2 = document.createElement('h2')
    const pCountry = document.createElement('p')
    // const pGenre = document.createElement('p')
    h2.textContent = `${artistName.name}`
    pCountry.textContent = `Country: ${artistName.country}`
    card.appendChild(h2)
    card.appendChild(pCountry)
    artistCollection.appendChild(card)
    tagFinder(artistName, artistCollection)
    artistReleaseFetch(artistName.id)
}

//renders official releases via filter to the DOM
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
    // console.log(sortedOfficialReleases)
    const cleanedReleases = removeDupRelease(sortedOfficialReleases)
    // console.log(cleanedReleases)
    const card = document.querySelector('#release-collection')
    card.appendChild(h4)
    // console.log(card)
    cleanedReleases.forEach(release => {
        const li = document.createElement('li')
        li.textContent = `${release.title}, released ${release.date}`
        card.appendChild(li)
    })
    // const select = document.createElement('select')
    // select.setAttribute('id', 'releaseselect')
    // const card = document.querySelector('#artist-collection')
}

//loops through tags in artist & posts to DOM with Genre header under artist info
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

//removes duplicate releases from array via hashtable & looking up property 
function removeDupRelease (releaseArr) {
    let seen = {}
    return releaseArr.filter(function(album) {
        return seen.hasOwnProperty(album.title) ? false : (seen[album.title] = true)
    })
}

function releaseRater () {
    const node = document.querySelector('#release-collection')
    const releases = node.getElementsByTagName('li')
    for (const release of releases) {
        console.log(release.textContent)
    }
}







//generates object of countries with country code keys
const getCountries = function(lang = 'en') {
    const A = 65
    const Z = 90
    const countryName = new Intl.DisplayNames([lang], { type: 'region' });
    const countries = {}
    for(let i=A; i<=Z; ++i) {
        for(let j=A; j<=Z; ++j) {
            let code = String.fromCharCode(i) + String.fromCharCode(j)
            let name = countryName.of(code)
            if (code !== name) {
                countries[code] = name
            }
        }
    }
    return countries
}

//loops through country names & adds to HTML select
// function countrySelect(getCountries) {
//     const select = document.getElementById("selectCountry");
//     const countries = Object.values(getCountries())
//     countries.sort()

//     for(let i = 0; i < countries.length; i++) {
//         const opt = countries[i];
//         const el = document.createElement("option");
//         el.textContent = opt;
//         el.setAttribute('id', 'country')
//         el.value = opt;
//         select.appendChild(el);
//     }
// }
// countrySelect(getCountries)


// root https://musicbrainz.org/ws/2/
//  browse:   /<RESULT_ENTITY_TYPE>?<BROWSING_ENTITY_TYPE>=<MBID>&limit=<LIMIT>&offset=<OFFSET>&inc=<INC>
// http://musicbrainz.org/ws/2/tag/?query=shoegaze
// http://musicbrainz.org/ws/2/tag/?query=${genre}`, {
// http://musicbrainz.org/ws/2/country?query=${country}
// http://musicbrainz.org/ws/2/genre/all?limit=<LIMIT>&offset=<OFFSET>
// %20AND%20country:${country}

// http://musicbrainz.org/ws/2/release?label=47e718e1-7ee4-460c-b1cc-1192a841c6e5&offset=12&limit=2
// artist browse with finland MBID: http://musicbrainz.org/ws/2/artist?area=6a264f94-6ff1-30b1-9a81-41f7bfabd616&limit=100&offset=100
