import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { MyContextProvider } from "../Contexts/Context";
import { WordsContextProvider } from "../Contexts/WordsContext";
import { ListsContextProvider } from "../Contexts/ListsContext";
import { SongsContextProvider } from "../Contexts/SongsContext";
import { DiccionaryContextProvider } from "../Contexts/DiccionaryContext";
import Hero from "./Functions/MainMenus/Hero";
import WSkills from './Functions/Games/WSkills'
import WordsCreator from "./Functions/MainMenus/WordsCreator";
import AllWords from "./Functions/MainMenus/AllWords";
import Random from "./Functions/Games/Random";
import Songs from "./Functions/MainMenus/songs";
import SpSignin from "./Functions/MainMenus/songsSubMenus/SpSignin";
import YoutubeVideo from "./Functions/MainMenus/songsSubMenus/YoutubeVideo";
import Spotify from "./Functions/MainMenus/songsSubMenus/Spotify";
import AllLists from "./Functions/MainMenus/AllLists";
import HangedGame from "./Functions/Games/HangedGame";
import FindByImage from "./Functions/Games/FindByimage";
import AllVoiceGame from "./Functions/Games/AllVoiceGame";
import GameVoice from "./Functions/Games/GameVoice";
import Dash from "./Functions/MainMenus/Dash";
import SymAntsGame from "./Functions/Games/SymAntsGame";
import PhrData from "./Functions/MainMenus/PhrData";
import AboveMenu from "./AboveMenu";
import Navbar from "./Functions/MainMenus/Navbar";
import FloatingMenu from "./Functions/MainMenus/FloatingMenu";
import ProtectedRoute from "./ProtectedRoute";
import GoogleLoginMenu from "./Functions/MainMenus/user/GoogleLoginMenu";
import GoogleSigninMenu from "./Functions/MainMenus/user/GoogleSigninMenu";

function AppContent() {
  const location = useLocation(); // Obtén la ubicación actual

  return (
    <MyContextProvider>
      <ListsContextProvider>
        <WordsContextProvider>
          <SongsContextProvider>
            <DiccionaryContextProvider>
              {location.pathname !== "/login" &&
                location.pathname !== "/signin" && <Navbar />}
              {location.pathname !== "/login" &&
                location.pathname !== "/signin" &&
                location.pathname !== "/createWords" &&
                location.pathname !== "/Hero"&&
                <FloatingMenu />}
              <Routes>
                <Route path="/login" element={<GoogleLoginMenu />} />
                <Route path="/signin" element={<GoogleSigninMenu />} />
                <Route path="/" element={<Dash />} />
                <Route path="/Hero" element={<Hero />} />
                <Route
                  path="/createWords/:mode/:idCurrentList?/:titleCurrentList?"
                  element={
                    <ProtectedRoute>
                      <WordsCreator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/AllWords/:listName/:idCurrentList"
                  element={
                    <ProtectedRoute>
                      <AllWords />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/AllLists"
                  element={
                    <ProtectedRoute>
                      <AllLists />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Random"
                  element={
                    <ProtectedRoute>
                      <Random />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/songs"
                  element={
                    <ProtectedRoute>
                      <Songs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Spotify"
                  element={
                    <ProtectedRoute>
                      <Spotify />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/SpSignin"
                  element={
                    <ProtectedRoute>
                      <SpSignin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Hand/:listId?"
                  element={
                    <ProtectedRoute>
                      <HangedGame />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ImageGame"
                  element={
                    <ProtectedRoute>
                      <FindByImage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/GameVoice"
                  element={
                    <ProtectedRoute>
                      <GameVoice />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/YoutubeVideo"
                  element={
                    <ProtectedRoute>
                      <YoutubeVideo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/SynAntGame"
                  element={
                    <ProtectedRoute>
                      <SymAntsGame />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/AllVoiceGame"
                  element={
                    <ProtectedRoute>
                      <AllVoiceGame />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/PhrData"
                  element={
                    <ProtectedRoute>
                      <PhrData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wSkills"
                  element={
                    <ProtectedRoute>
                      <WSkills />
                    </ProtectedRoute>
                  }
                />
              </Routes>


            </DiccionaryContextProvider>
          </SongsContextProvider>
        </WordsContextProvider>
      </ListsContextProvider>
    </MyContextProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
