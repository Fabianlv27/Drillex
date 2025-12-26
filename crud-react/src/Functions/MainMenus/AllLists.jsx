import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListsContext } from "../../../Contexts/ListsContext";
import ListCreator from "../secondary menus/ListCreator";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import { CgCloseO } from "react-icons/cg";
import { GrPrevious, GrNext } from "react-icons/gr"; // Iconos para paginación
import "../../styles/SeeLists.css";

function AllLists() {
  const history = useNavigate();
  const { setCurrentList, GetList, UserLists } = useContext(ListsContext);
  const [ShowCreateList, setShowCreateList] = useState(false);

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Número de listas por página

  useEffect(() => {
    GetList();
  }, []);

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLists = UserLists.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(UserLists.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="MainBackground MyLists">
      <h1>Your Lists</h1>
      
      {/* Botón Crear */}
      <button className="ActionButtoms" onClick={() => setShowCreateList(true)}>
        <MdOutlineCreateNewFolder />
      </button>

      {/* Modal Crear Lista */}
      {ShowCreateList && (
        <div className="ModalOverlay">
            <div className="ListsCreatorMenu">
            <button className="CloseModalBtn" onClick={() => setShowCreateList(false)}>
                <CgCloseO />
            </button>
            <ListCreator Show={setShowCreateList} />
            </div>
        </div>
      )}

      {/* Contenedor con SVG */}
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

        <div className="ListContentWrapper">
            {/* GRID DE LISTAS */}
            <div className="ListsGrid">
            {currentLists.length > 0 ? (
                currentLists.map((list, index) => (
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
            ) : (
                <p style={{color: 'white', gridColumn: '1/-1'}}>No lists found. Create one!</p>
            )}
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalPages > 1 && (
                <div className="PaginationControls">
                    <button onClick={prevPage} disabled={currentPage === 1} className="PageBtn">
                        <GrPrevious />
                    </button>
                    <span className="PageInfo">Page {currentPage} of {totalPages}</span>
                    <button onClick={nextPage} disabled={currentPage === totalPages} className="PageBtn">
                        <GrNext />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default AllLists;