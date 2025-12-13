
import { BsFillSendCheckFill } from "react-icons/bs";
import { useState,useContext ,useEffect} from "react";
import { ListsContext } from "../../Contexts/ListsContext";
import { WordsContext } from "../../Contexts/WordsContext";
import PropTypes from 'prop-types';

function AddWordToList({data,ExtraFunction,CurrentListId=""}) {
     const [ListsToPost, setListsToPost] = useState([]);
      const { AddWord } = useContext(WordsContext);
     const {GetList,UserLists, setUserLists} = useContext(ListsContext)
useEffect(() => {
    if (UserLists.length == 0) {
      GetList().then((fetchedLists) => {
       setUserLists(fetchedLists)  ;
      });
    }
  }, []);

     const PostData = async () => {
      console.log(data)
  await AddWord(ListsToPost,data);
  if (ExtraFunction) {
    console.log(ExtraFunction)
    ExtraFunction();
  }
    }
  return (
                  <div
                style={{
                  height: "auto",
                  width: "12rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.72)",
                  borderRadius: "10px",
                  boxShadow: "0px 0px 20px black",
                  backdropFilter: "blur(6px)",
                }}
              >
                <div
                  style={{
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    width: "8rem",
                    height: "9rem",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "scroll",
                    backgroundImage:
                      "linear-gradient(to right,rgba(16, 15, 16, 0.91),rgba(17, 15, 18, 0.84),rgba(17, 16, 21, 0.86),rgba(16, 17, 23, 0.86),rgba(13, 18, 25, 0.83),rgba(14, 22, 29, 0.84),rgba(14, 25, 34, 0.88),rgba(12, 29, 38, 0.84),rgba(12, 35, 47, 0.87),rgba(10, 34, 45, 0.7),rgba(8, 33, 45, 0.7),rgba(5, 34, 45, 0.6))",
                    scrollbarWidth: "none",
                  }}
                >
                  <form>
                    {UserLists.map((list, i) =>
                      CurrentListId != list.id ? (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            minHeight: "2rem",
                            width: "99%",
                            borderBottom: "solid 1px grey",
                            alignItems: "center",
                            color: "white",
                          }}
                        >
                          <input
                            checked={ListsToPost.includes(list.id)}
                            onClick={() => {
                              if (!ListsToPost.includes(list.id)) {
                                setListsToPost([...ListsToPost, list.id]);
                              } else {
                                setListsToPost(
                                  ListsToPost.filter((e) => e != list.id)
                                );
                              }
                            }}
                            type="radio"
                            key={i}
                            style={{ marginLeft: "0.5rem" }}
                          />
                          <label
                            htmlFor="radio-free"
                            style={{ marginLeft: "1rem" }}
                          >
                            {list.title}
                          </label>
                        </div>
                      ) : null
                    )}
                  </form>
                </div>
                <button
                  style={{ marginBottom: "1rem" }}
                  className="ActionButtoms sent"
                  onClick={PostData}
                >
                  <BsFillSendCheckFill />
                </button>
              </div>
  )
}
AddWordToList.propTypes = {
  data: PropTypes.any.isRequired, // obligatorio
  ExtraFunction: PropTypes.func, // opcional
  CurrentListId: PropTypes.string // opcional
};
export default AddWordToList