import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListsContext } from "../../../Contexts/ListsContext";
import ListCreator from "../secondary menus/ListCreator";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import { CgCloseO } from "react-icons/cg";
function AllLists() {
  const history = useNavigate();
  const { setCurrentList, GetList, UserLists } =
    useContext(ListsContext);
  const [ShowCreateList, setShowCreateList] = useState(false);

  useEffect(() => {
    GetList();
  }, []);

  return (
    <div className="MainBackground MyLists">
      <h1>Your Lists</h1>
      <button className="ActionButtoms" onClick={() => setShowCreateList(true)}>
        <MdOutlineCreateNewFolder />
      </button>
      {ShowCreateList && (
        <div className="ListsCreatorMenu">
          <button onClick={() => setShowCreateList(false)}>
            <CgCloseO />
          </button>
          <ListCreator Show={setShowCreateList} />
        </div>
      )}
      <div className="MyListsMenuContainer custom-shape-divider-top-17208831491">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill"
          ></path>
        </svg>
        <div className="ListCont2">
          {UserLists.length > 0
            ? UserLists.map((list, index) => (
                <div
                  key={index}
                  className="MyListsMenu"
                  onClick={() => {
                    setCurrentList({ id: list.id, title: list.title });
                    history(`/AllWords/${list.title}/${list.id}`);
                  }}
                >
                  <h3>{list.title}</h3>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}

export default AllLists;
