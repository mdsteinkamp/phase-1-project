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
    .catch((error) => alert('Artist not found try again!', error))
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

// function trackListFetch(albumID) {
//         fetch(`https://musicbrainz.org/ws/2/release/${albumID}`, {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'user-agent': 'Music Searcher 1.0 (mdsteinkamp@gmail.com)'
//             },
//             mode: 'cors'
//         })
//         .then((resp) => resp.json())
//         .then(data => console.log(data))
//         .catch((error) => alert('Album not found try again!', error))
// }

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
    cleanedReleases.forEach(release => {
        // console.log(release.id)
        const li = document.createElement('li')
        li.setAttribute('id', `${release.title}`)
        li.textContent = `${release.title}, released ${release.date} `
        // li.addEventListener('click', (event) => trackListFetch(release.id))
        const selectList = document.createElement('select')
        selectList.setAttribute('id', `${release.title}`)
        const selectOptions = ['Rate Album', '5/5', '4/5', '3/5', '2/5', '1/5']
            for (let i = 0; i < selectOptions.length; i++) {
            const option = document.createElement('option')
            option.value = selectOptions[i]
            option.text = selectOptions[i]
            selectList.appendChild(option)
            li.appendChild(selectList)
        }
        card.appendChild(li)
        selectList.addEventListener('change', (event) => ratedReleases(event))
    })
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

//lists your release ratings with a timestamp
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
    allRated = Array.prototype.slice.call(allRated)
    allRated.sort(function(a, b) {
        return a.textContent.slice(-17, -16).localeCompare(b.textContent.slice(-17, -16))
    })
    allRatedReversed = allRated.reverse()
    const sortedReleaseList = document.querySelector('#rated-releases')
    sortedReleaseList.innerHTML = ''
    allRatedReversed.forEach(release => {
        const p = document.createElement('p')
        console.log(release)
        p.textContent = (release.textContent)
        sortedReleaseList.appendChild(p)
    })
})

// function sortObject(object) {
//     return Object.keys(object).sort().reduce(function (result, key) {
//         result[key] = object[key];
//         return result;
//     }, {});    
// }

//adds select to every artist release with rating options
// function releaseRater() {
//     const node = document.querySelector('#release-collection')
//     const releases = node.getElementsByTagName('li')
//     for (const release of releases) {
//         const selectList = document.createElement('select')
//         selectList.setAttribute('id', 'releaseselect')
//         const selectOptions = ['Rate Album', 'Five 🤘', 'Four 👍', 'Three 👌', 'Two 🤏', 'One 👎']
//         for (let i = 0; i < selectOptions.length; i++) {
//             const option = document.createElement('option')
//             option.value = selectOptions[i]
//             option.text = selectOptions[i]
//             selectList.appendChild(option)
//         }
//         selectList.addEventListener('change', (event) => ratedReleases(event))
//         release.appendChild(selectList)
//     }
// }


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
