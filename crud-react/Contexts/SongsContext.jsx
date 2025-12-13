import { createContext, useState } from "react";
import PropTypes from "prop-types";

const SongsContext = createContext();

const SongsContextProvider = ({ children }) => {
  const [SingleNameSong, setSingleNameSong] = useState("");
  const [SingleArtistSong, setSingleArtistSong] = useState("");
  const [ShowLyric, setShowLyric] = useState(true);

  return (
    <SongsContext.Provider
      value={{
        SingleNameSong,
        setSingleNameSong,
        SingleArtistSong,
        setSingleArtistSong,
        ShowLyric,
        setShowLyric,
      }}
    >
      {children}
    </SongsContext.Provider>
  );
};

SongsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { SongsContext, SongsContextProvider };