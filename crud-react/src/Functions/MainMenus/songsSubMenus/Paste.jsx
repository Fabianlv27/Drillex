import { useState, useEffect, useContext } from "react";
import { Context } from "../../../../Contexts/Context";
import { ListsContext } from "../../../../Contexts/ListsContext";
import LyricsAndWords from "../../secondary menus/LyricsAndWords";

import { IoSendSharp } from "react-icons/io5";
import "../../../styles/Songs.css";

function Paste() {
  const [Lyric, setLyric] = useState("");
  const [RenderPaste, setRenderPaste] = useState([]);
  const { ShowLyric, setShowLyric } = useContext(Context);
  const { GetList,UserLists, setCurrentList } = useContext(ListsContext);

  const CleanerLines = () => {
    // const WithoutLine= Lyric.replace(/\n/g, ' ')
    console.log(Lyric.split("\n"));
    setRenderPaste(Lyric.split("\n"));
  };

  useEffect(() => {
    const HandlerLists = async () => {
      setCurrentList(await GetList());
    };

    HandlerLists();
  }, []);

  return (
    <div>
      <div className="TextandButtonLyricMenu">
        <h2>Paste Lyric</h2>
        <button
          onClick={() => {
            setShowLyric(true);
            CleanerLines();
          }}
          className="ActionButtoms Send"
        >
          <IoSendSharp />
        </button>
      </div>
      <textarea
        name="lyric"
        onChange={(e) => setLyric(e.target.value)}
        cols="30"
        rows="10"
      ></textarea>

      {RenderPaste.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          {ShowLyric ? (
            <div>
              <LyricsAndWords
                LyricReal={RenderPaste}
                UserLists={UserLists}
                SongID={"PasteLyric"}
                bodyHidden={false}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default Paste;
