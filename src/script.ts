import { redirectToAuthCodeFlow, getAccessToken } from './authCodeWithPkce';

const clientId = "efe05af2049e4cdfa23e2a047520440d";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

(async () => {
    if (!code) {
        redirectToAuthCodeFlow(clientId);
    } else {
        const accessToken = await getAccessToken(clientId, code);
        const profile = await fetchProfile(accessToken);
        const topsons = await getTopTracks(accessToken);
        const topArtists = await getTopArtists(accessToken);
        populateUI(accessToken, profile, topsons.items);
    }
})();

async function fetchProfile(accessToken: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });

    return await result.json();
}

async function getTopTracks(token) {
    var tokstr = "Bearer " + token;
    var term = "";
    term = "long_term";
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=100&time_range=" + term, {
        method: "GET", headers: { Authorization: tokstr }
    });
    return await result.json();
}

async function getTopArtists(accessToken: string) {
    const topArtists = await fetch(`https://api.spotify.com/v1/me/top/artists`, {
        method: 'GET', headers: { Authorization: `Bearer ${accessToken}` }
    });

    return await topArtists.json();
}

function populateUI(profile: UserProfile, topsongs, topArtists: any) {
    document.getElementById("displayName")!.innerText = profile.display_name; 
    document.getElementById("avatar")!.setAttribute("src", profile.images[0].url);
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.innerText = profile.uri;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url")!.innerText = profile.href;
    document.getElementById("url")!.setAttribute("href", profile.href);
    document.getElementById("imgUrl")!.innerText = profile.images[0].url;
    
    // how do i display top artists & top tracks
    var song1 = topsongs[0]
    var song2 = topsongs[1]
    var song3 = topsongs[2]


    document.getElementById("songs").innerHTML = "<strong>Your top songs:</strong> <br>"
    for (let i = 0; i < topsongs.length; i++) {
        var num = i + 1;
        var artists = topsongs[i].artists;
        document.getElementById("songs").innerHTML += num + ". " + topsongs[i].name + "<br>";
    }
}
