import { PiSignInFill } from "react-icons/pi";
import {GetLocalHost} from '../../../../api/api'
function SpSignin() {
    const host=GetLocalHost()
   async function login(){
      const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
      }
      
      const codeVerifier  = generateRandomString(64);
      const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
      }
      const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
          .replace(/=/g, '')
          .replace(/\+/g, '-')
          .replace(/\//g, '_');
      }
      const hashed = await sha256(codeVerifier)
      const codeChallenge = base64encode(hashed);

const clientId = '7496c296f778417cb553aafca2424aa7';
const redirectUri = `https://192.168.0.11:5173/Spotify`;

const scope = 'user-read-private user-read-email';
const authUrl = new URL("https://accounts.spotify.com/authorize")

// generated in the previous step
window.localStorage.setItem('code_verifier', codeVerifier);

const params =  {
  response_type: 'code',
  client_id: clientId,
  code_challenge_method: 'S256',
  code_challenge: codeChallenge,
  redirect_uri: redirectUri,
}

authUrl.search = new URLSearchParams(params).toString();
window.location.href = authUrl.toString();


    }
  return (
    <div className='SignSpotMenu'>
        <h1 >Sign In</h1>
        <div className='TextSign'>
        <p>Allow us use your Spotify Account to use functions such as:</p>
        <ul>
          <li>To access your Spotify`s playlist</li>
          <li>Interactive Lyrics of your Current playing Song</li>

        </ul>
        </div>
        <button className='ActionButtoms' onClick={login}><PiSignInFill /></button>
    </div>
  )
}

export default SpSignin

