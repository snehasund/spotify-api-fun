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
        const topArtists = await getTopArtists(accessToken);
        populateUI(accessToken, profile);
    }
})();

async function fetchProfile(accessToken: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });

    return await result.json();
}

async function getTopArtists(accessToken: string) {
    const topArtists = await fetch(`https://api.spotify.com/v1/me/top/artists`, {
        method: 'GET', headers: { Authorization: `Bearer ${accessToken}` }
    });

    return await topArtists.json();
}

function populateUI(profile: UserProfile, topArtists: any) {
    document.getElementById("displayName")!.innerText = profile.display_name; 
    document.getElementById("avatar")!.setAttribute("src", profile.images[0].url);
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.innerText = profile.uri;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url")!.innerText = profile.href;
    document.getElementById("url")!.setAttribute("href", profile.href);
    document.getElementById("imgUrl")!.innerText = profile.images[0].url;
}
