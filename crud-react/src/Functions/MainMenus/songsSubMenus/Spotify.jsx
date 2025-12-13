import { useState, useEffect } from "react";
import SingleSpSong from "./SingleSpSong";
import "../../SingleSp.css";
import "../../../styles/Spotify.css";

function Spotify() {
const [Block, setBlock] = useState(false);
const [SingleSongInfo, setSingleSongInfo] = useState({id: "", name: "", artist: ""});
const [profileData, setProfileData] = useState({});
const [playListData, setPlayListData] = useState([]);
const [Traks, setTraks] = useState([]);
const [ListShowed, setListShowed] = useState(null);
const clientId = import.meta.env.VITE_SpotifiClientId; // Make sure to set REACT_APP_SPOTIFY_CLIENT_ID in your .env file
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

useEffect(() => {
console.log(clientId)
SesionVerifier();
}, []);


useEffect(() => {
console.log(playListData)
}, [playListData]);

 const getTraks = async (link) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(link, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });
      const data = await response.json();
      console.log(data);
      setTraks(data.items);
      console.log(Traks);
    } catch (error) {
      console.error("Error fetching Traks:", error);
    }
  };
   const ShowerList = (id) => {
    playListData.forEach((element) => {
      if (element.id == id) {
        console.log(element);
        setListShowed(element);
        const link = element.tracks.href;
        getTraks(link);
      }
    });
  };
  const HandleParams = (FId, FArt, Fname) => {
  setSingleSongInfo({
    id: FId, 
    name: Fname,
    artist: FArt
  });
  };
const SesionVerifier= async() => {

async function redirectToAuthCodeFlow(clientId) {
    // TODO: Redirect to Spotify authorization page
      const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "https://dibylocal.com:5173/Spotify");
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function getAccessToken(clientId, code) {
  // TODO: Get access token for code
    const verifier = localStorage.getItem("verifier");
    console.log(verifier,clientId, code);
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://dibylocal.com:5173/Spotify");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    console.log(access_token)
    if (!access_token) {
          redirectToAuthCodeFlow(clientId);

    }
    return access_token;

}

async function fetchProfile(token) {
    // TODO: Call Web API
    console.log(token)
      const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

const getProfileList = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(
          "https://api.spotify.com/v1/me/playlists",
          {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        console.log(data.items[0].images[0])
        setPlayListData(data.items);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
  
    const accessToken = await getAccessToken(clientId, code);
    localStorage.setItem("access_token", accessToken);
    const profile = await fetchProfile(accessToken);
    console.log(profile);
    //populateUI(profile);
    setProfileData(profile);
    getProfileList();
}
}




  return (
    <div className="SpMenu">
      <div  className={`${Block ? "blocked" : ""}`}>
        <h1 style={{textAlign:"center"}}>Spotify LYRICS</h1>
        {profileData.display_name && (
          <div style={{width:"100%",height:"auto",display:"flex",alignItems:"center",flexDirection:"column", justifyContent:"center"}}>
            <div className="SpUserinf ">
              <div className="SptextUserInf">
                <p>{profileData.display_name}</p>
              </div>

              <img src={profileData.images[0]?.url?? '(no profile image)'} />
            </div>
            {playListData.length > 0 && (
              <div className="MainSpContainer"style={{width:"100%",height:"auto",display:"flex",alignItems:"center",flexDirection:"column", justifyContent:"center"}} >
                <div className="MyListsContainer">
                  {playListData.map((singleList) => (
                    <div className="SingleSpListMine" key={singleList.id}>
                        <img style={{height:"5rem",width:"100%",flex:"1"}} src={singleList.images[0].url} alt="" />
                        <div style={{minHeight:"3rem", width:"100%",backgroundColor:"rgba(0, 0, 0, 0.32)",display:"flex",alignItems:"center" , justifyContent:"center"}}>
                      <h3 onClick={() => ShowerList(singleList.id)}>
                        {singleList.name}
                      </h3>
                      </div>
                    </div>
                  ))}
                </div>
                {ListShowed && (
                  <div className="ShowenList">
                    <h2>{ListShowed.name}</h2>
                    <div className="AllSpListSongs">
                      {Traks &&
                        Traks.map((e,i) => (
                          <div key={i} onClick={() => { 
                            const FSingleId = e.track.id;

                            const FSingleArtist = e.track.artists[0].name;

                            const FNameSong = e.track.name;
                            HandleParams(
                              FSingleId,
                              FSingleArtist,
                              FNameSong
                            );
                            setBlock(true);
                          }}className="SignleSpListSong">
                            <img src={e.track.album.images[0].url} />
                            <p>
                              {e.track.name}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {SingleSongInfo.id && <SingleSpSong SingleSongInfo={SingleSongInfo} setSingleSongInfo={setSingleSongInfo} setBlock={setBlock} />}
    </div>
  );
}

export default Spotify;
