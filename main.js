debugger;
console.log('Current Origin:', window.location.origin);

document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementById('login-button');
    const resultsContainer = document.getElementById('results'); // Get the results container

    const clientId = 'dfc2685cc00140e9aae1430de8b7f52f';
    const redirectUri = 'https://constbogdan.github.io/';

    loginButton.addEventListener('click', function () {
        let codeVerifier = generateRandomString(128);

        generateCodeChallenge(codeVerifier).then(codeChallenge => {
            let state = generateRandomString(16);
            let scope = 'user-read-private user-read-email';

            localStorage.setItem('code_verifier', codeVerifier);

            let args = new URLSearchParams({
                response_type: 'code',
                client_id: clientId,
                scope: scope,
                redirect_uri: redirectUri,
                state: state,
                code_challenge_method: 'S256',
                code_challenge: codeChallenge
            });

            window.location = 'https://accounts.spotify.com/authorize?' + args;
        });
    });

    async function generateCodeChallenge(codeVerifier) {
        function base64encode(string) {
            return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);

        return base64encode(digest);
    }

    function generateRandomString(length) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    // Capture the access code after redirect
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // You can use the captured 'code' for further processing
    if (code) {
        console.log('Access code:', code);

        // Perform the next steps using the captured 'code'

        // This is where you pass the access code to the fetchWebApi function
        const token = code; // Use the captured access code
        fetchTopTracks(token);
    }

    async function fetchTopTracks(token) {
        const topTracks = await getTopTracks(token);
        const trackList = topTracks?.map(
            ({ name, artists }) =>
                `${name} by ${artists.map(artist => artist.name).join(', ')}`
        );

        // Display results in the results container
        resultsContainer.innerHTML = trackList ? trackList.join('<br>') : 'No tracks found';
    }

    async function getTopTracks(token) {
        return (await fetchWebApi(
            'v1/artists/4Z8W4fKeB5YxbusRsdQVPb', 'GET', token
        )).items;
    }

    async function fetchWebApi(endpoint, method, token) {
        const url = `https://api.spotify.com/${endpoint}`;
        console.log('API URL:', url);
        const res = await fetch(`https://api.spotify.com/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            method
        });
        return await res.json();
    }
});
