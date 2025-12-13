import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../../Contexts/Context";
import { WordsContext } from "../../../Contexts/WordsContext";
function Hero() {
  const history = useNavigate();
  const { setLanguage, RHost, Ahost,Language } = useContext(Context);
  const { GetWords, setUdpate } = useContext(WordsContext);
  const [userData, setuserData] = useState({});
  const cardsData = [
  {
    title: "Create Words",
    description: "Let´s create our own words to get more vocabulary",
    img: "",
    onClick: "createWords/create",
  },
  {
    title: "See Words",
    description: "Let´s see and manage yours words",
    img: "",
    onClick: "AllLists",
  },
  {
    title: "Random Repeticion",
    description: "Let´s see and manage yours words",
    img: "",
    onClick: "Random",
  },
  {
    title: "Songs",
    description: "Practice with yours favorites song`s lyrics",
    img: "",
    onClick: "Songs",
  },
  {
    title: "Handled Game",
    description: "Gess the hidden word",
    img: "",
    onClick: "Hand",
  },
  {
    title: "Image Game",
    description: "Let´s Gess the word by the image",
    img: "",
    onClick: "ImageGame",
  },
  {
    title: "Synonyms and Antonyms Game",
    description: "Let´s gess the word by the Synonyms and Antonyms",
    img: "",
    onClick: "SynAntGame",
  },
  {
    title: "All Voice Game",
    description: "Let´s Practice your Listening by this game",
    img: "",
    onClick: "AllVoiceGame",
  },
  {
    title: "Discover Phrasal Verbs",
    description: "Let´s discover phrasal verbs to increase your vocabulary",
    img: "",
    onClick: "PhrData",
  },
   {
    title: "writing skills",
    description: "Practice your writing skills by creating texts",
    img: "",
    onClick: "wSkills",
  },
];

 const flagImage=(lang)=>{
      switch (lang) {
        case "en":
          return "https://flagcdn.com/w320/gb.png";
        case "es":
          return "https://flagcdn.com/w320/es.png";
        case "fr":
          return "https://flagcdn.com/w320/fr.png";
        case "de":
          return "https://flagcdn.com/w320/de.png";
        case "it":
          return "https://flagcdn.com/w320/it.png";
        default:
          return "https://flagcdn.com/w320/gb.png"; // Default to English flag
      }
    }
  useEffect(() => {
   
    console.log(RHost);
    const fetchData = async () => {
      try {
        const cookies = document.cookie;
        console.log(cookies);
        const cookiesArray = cookies.split(";");
        let UJson={username:"",id:""}
        cookiesArray.forEach(async (cookie) => {
          const [name, value] = cookie.trim().split("=");
          if (name === "lang") {
            setLanguage(value);

          }
          if (name === "e") {
            try {
              const data = await fetch(`${Ahost}/users/me/${value}`);
              console.log(data);
              const dj = await data.json();
              console.log(dj);
               UJson.username = dj[0][0];
               UJson.id = dj[0][1];
              console.log(dj);
              setuserData(UJson);
              if (dj[0][0] == "" || dj[0][1] == "") {
               // window.location.href = `${RHost}/signin`;
              } 

            } catch (error) {
              //window.location.href=`${RHost}/signin`
            }
          }

        });
      } catch (error) {
    // window.location.href = `${RHost}/signin`;
      }
    };
    console.log("hero");
    fetchData();
  }, []);

  const handelCreate = () => {
    history("/createWords/create");
  };

  const handleSee = () => {
    history("/AllLists");
  };

  return (
    <div className="MainBackground">
      {userData ? (
        <div className="content">
          <h1>Welcome </h1>

          <div className="Userinf">
            <img src={flagImage(Language)} alt="" />
            <p className="UserName">{userData.username}</p>
          </div>
        </div>
      ) : null}
      <div className="cardContainer custom-shape-divider-top-1720802046">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            class="shape-fill"
          ></path>
        </svg>
      {cardsData.map((card, index) => (
  <div
    key={index}
    className="oneCard"
    onClick={() => history(`/${card.onClick}`)}
  >
    <h3>{card.title}</h3>
    <p>{card.description}</p>
    <img src={card.img} alt={card.title} />
  </div>
))}

      </div>
    </div>
  );
}

export default Hero;
