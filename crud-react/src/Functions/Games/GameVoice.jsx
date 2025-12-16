import { useContext, useEffect, useState } from 'react';
import { Context } from '../../../Contexts/Context';
import { ListsContext } from '../../../Contexts/ListsContext';
import { WordsContext } from '../../../Contexts/WordsContext';
import api from '../../../api/axiosClient'; // Importamos el cliente seguro
import '../SingleSp.css';

function GameVoice() {
    // Contextos
    const { Language } = useContext(Context);
    const { UserLists, GetList, CurrentListId, setCurrentList } = useContext(ListsContext);
    const { GetWords } = useContext(WordsContext);

    // Estados locales
    const [ShowGame, setShowGame] = useState(false);
    const [Choises, setChoises] = useState([]);
    const [Index, setIndex] = useState(0);
    const [Random, setRandom] = useState([]);
    const [IsCorrect, setIsCorrect] = useState(0); // 0: Neutro, 1: Perdió, 2: Ganó
    const [Link, setLink] = useState('');

    // Cargar listas al iniciar si no hay
    useEffect(() => {
        if (UserLists.length === 0) {
            GetList();
        }
    }, [UserLists, GetList]);

    // Función para mezclar array (Fisher-Yates)
    const Shuffler = (Array) => {
        const Shuffled = [...Array];
        for (let i = Shuffled.length - 1; i > 0; i--) {
            let RandomNum = Math.floor(Math.random() * (i + 1));
            let temp = Shuffled[i];
            Shuffled[i] = Shuffled[RandomNum];
            Shuffled[RandomNum] = temp;
        }
        return Shuffled;
    };

    // Función auxiliar para obtener audio
    const playAudio = async (text) => {
        if (!text) return;
        // Limpiamos caracteres raros para la URL
        const cleanText = text.replace(/[\/\-]/g, ' '); 
        try {
            // Usamos api.get con responseType blob y pasamos el LANGUAGE
            const response = await api.get(`/texto_a_voz/${cleanText}/${Language}`, {
                responseType: 'blob'
            });
            const audioUrl = URL.createObjectURL(response.data);
            setLink(audioUrl);
        } catch (error) {
            console.error('Error getting audio:', error);
        }
    };

    // Generar opciones incorrectas aleatorias
    const HandlerChoises = (TempRandom, currentIndex) => {
        let NumbersChoise = [];
        
        // Evitamos bucle infinito si hay menos de 3 palabras
        if(TempRandom.length < 3) {
             setChoises([currentIndex]); // Fallback
             return;
        }

        while (NumbersChoise.length < 3) {
            let RandomNum = Math.floor(Math.random() * TempRandom.length);
            if (!NumbersChoise.includes(RandomNum) && RandomNum !== currentIndex) {
                NumbersChoise.push(RandomNum);
            }
        }

        // Insertar la respuesta correcta en una posición aleatoria
        const correctPos = Math.floor(Math.random() * 3); // 0, 1, ó 2
        // Si el array no se llenó (ej. solo hay 2 palabras), ajustamos
        if (NumbersChoise.length < 3) NumbersChoise.push(currentIndex);
        else NumbersChoise[correctPos] = currentIndex;

        setChoises(NumbersChoise);
    };

    const startGame = async () => {
        // Obtenemos las palabras de la lista actual
        // Nota: GetWords retorna una promesa con las palabras
        const words = await GetWords(CurrentListId.id);
        
        if (words && words.length > 0) {
            const TempSh = Shuffler(words);
            setRandom(TempSh);
            setIndex(0);
            setIsCorrect(0);
            
            // Reproducir audio del significado (Meaning) de la primera palabra
            // Asumo que el juego es: Escuchar Significado -> Adivinar Palabra
            await playAudio(TempSh[0].meaning);
            
            HandlerChoises(TempSh, 0);
            setShowGame(true);
        } else {
            alert("This list is empty or couldn't load words.");
        }
    };

    const Check = (nameToTest) => {
        // Comparamos con la palabra correcta actual
        if (nameToTest === Random[Index].name) {
            setIsCorrect(2); // Ganó
        } else {
            setIsCorrect(1); // Perdió
        }
    };

    const Next = async () => {
        const nextIndex = Index + 1;

        if (Random[nextIndex]) {
            setChoises([]);
            setIsCorrect(0);
            setLink(''); // Limpiar audio anterior

            // Preparar siguiente ronda
            HandlerChoises(Random, nextIndex);
            
            // Reproducir siguiente audio
            await playAudio(Random[nextIndex].meaning);
            
            setIndex(nextIndex);
        } else {
            // Fin del juego
            setIndex(0);
            setShowGame(false);
            alert("Game Over!");
        }
    };

    const handleListChange = (e) => {
        const selectedId = e.target.value;
        // Buscamos el objeto lista completo para tener el título también si es necesario
        const selectedList = UserLists.find(l => l.id === selectedId);
        if(selectedList) {
            setCurrentList({ id: selectedList.id, title: selectedList.title });
        }
    };

    return (
        <div>
            {UserLists.length > 0 ? (
                <select onChange={handleListChange} value={CurrentListId.id}>
                    {/* Opción por defecto o placeholder */}
                    <option value="" disabled>Select a list</option>
                    {UserLists.map((list) => (
                        <option key={list.id} value={list.id}>
                            {list.title || list.name}
                        </option>
                    ))}
                </select>
            ) : (
                <p>Loading lists...</p>
            )}

            {!ShowGame && UserLists.length > 0 ? (
                <button onClick={startGame}>Start Game</button>
            ) : null}

            <div>
                {ShowGame && Random.length > 0 && Random[Index] ? (
                    <>
                        <div className={`${IsCorrect !== 0 ? 'blocked' : ''}`}>
                            <h1>What did you hear?</h1>
                            <div>
                                {Link && <audio controls src={Link} autoPlay></audio>}
                            </div>
                            
                            <div className="choices-container">
                                {Choises.map((c, i) => (
                                    // Aseguramos que Random[c] existe antes de renderizar
                                    Random[c] && (
                                        <button key={i} onClick={() => Check(Random[c].name)}>
                                            {Random[c].name}
                                        </button>
                                    )
                                ))}
                            </div>
                        </div>

                        {IsCorrect === 1 && (
                            <div className="feedback lose">
                                <h2>Incorrect</h2>
                                <p>The Correct Answer was: <b>{Random[Index].name}</b></p>
                                <button onClick={Next}>Next</button>
                            </div>
                        )}

                        {IsCorrect === 2 && (
                            <div className="feedback win">
                                <h2>Correct!</h2>
                                <p>Great job!</p>
                                <button onClick={Next}>Next</button>
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default GameVoice;