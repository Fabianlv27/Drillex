import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../../Contexts/Context";
import api from "../../../api/axiosClient.js";
import "../../styles/Hero.css"; // Asegúrate de tener este archivo o usa main.css si prefieres

function Hero() {
  const history = useNavigate();
  const { setLanguage, Language } = useContext(Context);
  const [userData, setuserData] = useState({});

  // DATOS AGRUPADOS POR CATEGORÍA
  const categories = {
    "Learning & Management": [
      {
        title: "Create Words",
        description: "Add new vocabulary to your lists.",
        img: "https://i.postimg.cc/3wxkyDWH/unnamed_2_removebg_preview.png",
        onClick: "createWords/create",
      },
      {
        title: "Your Lists",
        description: "Review and edit your word collections.",
        img: "https://i.postimg.cc/JhzsyBtD/Gemini_Generated_Image_6916jg6916jg6916_removebg_preview.png",
        onClick: "AllLists",
      },
      {
        title: "Phrasal Verbs",
        description: "Discover essential phrasal verbs.",
        img: "https://i.postimg.cc/25S1qB3D/unnamed_1_removebg_preview.png",
        onClick: "PhrData",
      },
    ],
    "Games & Practice": [
      {
        title: "Random Repetition",
        description: "Flashcards for quick review.",
        img: "https://i.postimg.cc/N0jKyrLt/unnamed_4_removebg_preview.png",
        onClick: "Random",
      },
      {
        title: "Hangman",
        description: "Guess the hidden word.",
        img: "https://i.postimg.cc/k4jF6m7j/ahorcado.png",
        onClick: "Hand",
      },
      {
        title: "Visual Memory",
        description: "Match words with images.",
        img: "https://i.postimg.cc/C1vHBgwc/imgg.png",
        onClick: "ImageGame",
      },
      {
        title: "Synonyms & Antonyms",
        description: "Challenge your word relations.",
        img: "https://i.postimg.cc/VNkJSb5k/unnamed_removebg_preview.png",
        onClick: "SynAntGame",
      },
    ],
    "Skills & Media": [
      {
        title: "Listening Practice",
        description: "Train your ear with audio games.",
        img: "https://i.postimg.cc/fbRV30kb/Gemini_Generated_Image_1bj7k1bj7k1bj7k1_removebg_preview.png",
        onClick: "AllVoiceGame",
      },
      {
        title: "Writing Skills",
        description: "Practice writing with AI feedback.",
        img: "https://i.postimg.cc/rpwDdtzV/unnamed_5_removebg_preview.png",
        onClick: "WSkills",
      },
      {
        title: "Songs & Media",
        description: "Learn with your favorite lyrics.",
        img: "https://i.postimg.cc/76BMGkqm/media.png",
        onClick: "Songs",
      },
    ],
  };

  const flagImage = (lang) => {
    switch (lang) {
      case "en": return "https://flagcdn.com/w320/gb.png";
      case "es": return "https://flagcdn.com/w320/es.png";
      case "it": return "https://flagcdn.com/w320/it.png";
      default: return "https://flagcdn.com/w320/gb.png";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Manejo de Cookies (Simplificado)
        const langCookie = document.cookie.split(";").find(c => c.trim().startsWith("lang="));
        if (langCookie) setLanguage(langCookie.split("=")[1]);

        const response = await api.get(`/users/me`);
        setuserData({ username: response.data[0][0], id: response.data.id });
      } catch (error) {
        console.error("Auth error", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="MainBackground HeroContainer">
      {/* HEADER DE BIENVENIDA */}
      {userData.username && (
        <div className="HeroHeader">
          <h1>Welcome back, <span className="UserName">{userData.username}</span></h1>
          <div className="UserLangBadge">
             <img src={flagImage(Language)} alt="Lang" />
          </div>
        </div>
      )}

      {/* FONDO SVG (Mantenido intacto) */}
      <div className="custom-shape-divider-top-1720802046">
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
      </div>

      {/* SECCIONES DE TARJETAS */}
      <div className="SectionsWrapper">
        {Object.entries(categories).map(([catName, items]) => (
          <div key={catName} className="CategorySection">
            <h2 className="CategoryTitle">{catName}</h2>
            <div className="CardsGrid">
              {items.map((card, index) => (
                <div
                  key={index}
                  className="HeroCard"
                  onClick={() => history(`/${card.onClick}`)}
                >
                  <div className="CardImage">
                    <img src={card.img} alt={card.title} />
                  </div>
                  <div className="CardContent">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hero;