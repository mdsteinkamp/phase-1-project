//Event listener for Artis Search form, sends user input to artistSearch fetch fn
const artistSearchBtn = document.querySelector('#artist-search')
artistSearchBtn.addEventListener('submit', (e) => {
    e.preventDefault()
    artistSearch((e.target.search.value).toUpperCase())
})

//capitalizes first letter of each user input word to prep for fetch
//removed as words like 'of' are lowercase in API return
// const upperInput = function (userInput) {
//     const words = userInput.split(' ')
//     for (let i = 0; i < words.length; i++) {
//       words[i] = words[i][0].toUpperCase() + words[i].substr(1)
//     }
//     return words.join(' ')
// }

//GET request based on artist search limited to 10 returned results
function artistSearch(artistName) {
    fetch(`https://musicbrainz.org/ws/2/artist/?query=${artistName}&limit=2`, {
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

//Matches the artist based on user input from list returned from API, sends result to renderArtist fn
function matchArtist(artistName, artistObj) {
    const artistArr = artistObj.artists
    console.log(artistArr)
    const matchedArtist = artistArr.find(artist => artist.name.toUpperCase() === artistName)
    console.log(matchedArtist)
    renderArtist(matchedArtist)
}

//renders the artist info to the DOM
function renderArtist(artistName) {
    const artistCollection = document.querySelector('#artist-collection')
    const card = document.createElement('div')
    card.className = 'card'
    const h2 = document.createElement('h2')
    const pCountry = document.createElement('p')
    const pGenre = document.createElement('p')
    const btn = document.createElement('button')
    h2.textContent = `${artistName.name}`
    pCountry.textContent = `Country: ${artistName.country}`
    card.appendChild(h2)
    card.appendChild(pCountry)
    artistCollection.appendChild(card)
    tagFinder(artistName, artistCollection)
    artistCollection.append(btn)
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
function countrySelect(getCountries) {
    const select = document.getElementById("selectCountry");
    const countries = Object.values(getCountries())
    countries.sort()

    for(let i = 0; i < countries.length; i++) {
        const opt = countries[i];
        const el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
}
countrySelect(getCountries)