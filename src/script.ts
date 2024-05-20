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
        const topTracks = await getTopTracks(accessToken, "long_term", 20, 0);
        const topArtists = await getTopArtists(accessToken, "long_term", 20, 0);
        populateUI(profile, topTracks, topArtists);
    }
})();

async function fetchProfile(accessToken: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });

    return await result.json();
}

async function getTopTracks(accessToken: string, time_range: string, limit: number, offset: number) {
    const topTracks = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=${time_range}&offset=${offset}`, {
        method: 'GET', headers: { Authorization: `Bearer ${accessToken}` }
    });

    return await topTracks.json();
}

async function getTopArtists(accessToken: string, time_range: string, limit: number, offset: number) {
    const topArtists = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=${limit}&time_range=${time_range}&offset=${offset}`, {
        method: 'GET', headers: { Authorization: `Bearer ${accessToken}` }
    });

    return await topArtists.json();
}

function populateUI(profile: UserProfile, topTracks: any, topArtists: any) {
    document.getElementById("displayName")!.innerText = profile.display_name; 
    document.getElementById("avatar")!.setAttribute("src", profile.images[0].url);
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.innerText = profile.uri;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url")!.innerText = profile.href;
    document.getElementById("url")!.setAttribute("href", profile.href);
    document.getElementById("imgUrl")!.innerText = profile.images[0].url;

    //display top tracks
    const topTracksList = document.getElementById("topTracks")!;
    topTracks.items.forEach((track: any) => {
        const trackItem = document.createElement("li");
        trackItem.innerText = track.name;
        topTracksList.appendChild(trackItem);
    });
    
    //display top artists
    const topArtistsList = document.getElementById("topArtists")!;
    topArtists.items.forEach((artist: any) => {
        const artistItem = document.createElement("li");
        artistItem.innerText = artist.name;
        topArtistsList.appendChild(artistItem);
    });
}
