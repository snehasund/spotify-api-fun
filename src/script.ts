const clientId = "efe05af2049e4cdfa23e2a047520440d"; // Replace with your client id
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    // Code to get access token and fetch required data
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    // const topArtists = await getTopArtists(accessToken);
    const topTracks = await getTopTracks(accessToken);
    populateUI(profile);

    const revealTopArtistsButton = document.getElementById('revealTopArtistsButton');
    revealTopArtistsButton.addEventListener('click', async () => {
        try {
            const topArtists = await getTopArtists(accessToken);
            const topTracks = await getTopTracks(accessToken);

            populateTopArtists(topArtists);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch top artists. Please try again.');
        }
    });
    revealTopTracksButton.addEventListener('click', async () => {
        try {
            const topTracks = await getTopTracks(accessToken);
            populateTopTracks(topTracks);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch top tracks. Please try again.');
        }
    });
    // Function to populate top artists
    function populateTopArtists(topArtists) {
        const topArtistsContainer = document.getElementById("topArtists");
        topArtistsContainer.innerHTML = ''; // Clear previous content

        topArtists.items.forEach(artist => {
            const artistContainer = document.createElement('div');
            artistContainer.style.textAlign = 'center';
            artistContainer.style.marginRight = '20px';

            const profileImage = new Image(200, 200);
            profileImage.src = artist.images[0].url;

            const artistName = document.createElement('span');
            artistName.innerText = artist.name;
            artistName.style.display = 'block';

            artistContainer.appendChild(profileImage);
            artistContainer.appendChild(artistName);

            topArtistsContainer.appendChild(artistContainer);
            artistContainer.style.display = 'inline-block';
        });
    }
    function populateTopTracks(topTracks) {
        const trackList = document.getElementById("topTracksList");
        trackList.innerHTML = ''; // Clear previous content

        topTracks.items.forEach(track => {
            const trackName = document.createElement('li');
            trackName.innerText = track.name;
            trackList.appendChild(trackName);
        });
    }
    const generateButton = document.getElementById('generatePlaylistButton');
    
    generateButton.addEventListener('click', async () => {
        try {
            const playlistInfo = await createPlaylist(accessToken, profile.id);
            const addedTracks = await addTopTracks(accessToken, playlistInfo.id, topTracks);

            alert('Playlist created and tracks added successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate playlist. Please try again.');
        }
    });
}

export async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId: string, code: string): Promise<string> {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

// get top artists
async function getTopArtists(token: string) {
    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

// get top tracks
async function getTopTracks(token: string) {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

// create new user playlist
async function createPlaylist(token: string, user_id: string) {
    const result = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({name: "i show this to dad"})
    });
    return await result.json();
}

// add top tracks to playlist
async function addTopTracks(token: string, playlist_id: string, topTracks: any) {
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({playlist_id: playlist_id, uris: topTracks.items.map((i)=>i.uri)})
    });

    return await result.json()
}

function populateUI(profile: UserProfile) {
    document.getElementById("displayName")!.innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar")!.appendChild(profileImage);
    }
}