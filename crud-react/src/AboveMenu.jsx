import {useState,useEffect} from 'react'
import Transalte from './Transalte.jsx'
function AboveMenu(){
    const [ShowTransMenu, setShowTransMenu] = useState(false)
    const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
    const [selectedText, setSelectedText] = useState('');
    const [CloseMenu, setCloseMenu] = useState(false)
  const [ShowMeaning, setShowMeaning] = useState(false)
    const handleMouseUp = () => {
    
      const selection = window.getSelection();
      const text = selection.toString();
      console.log(text);
      if (text.length > 0) {
      console.log(text);
    
        setSelectedText(text);
        const range = selection.getRangeAt(0).getBoundingClientRect();
        const top = range.top + window.scrollY + 25;
        const left = range.left + window.scrollX;
        console.log(top);
        setButtonPosition({ top, left });
        setShowTransMenu(true)
       setCloseMenu(false)
      ;
      } 
    }
    
    const handleTouchEnd = () => {
      setTimeout(handleMouseUp, 100); // Pequeño retraso para capturar la selección final
    };
    useEffect(() => {
      //document.addEventListener('mouseup', handleMouseUp);
      
    document.addEventListener("selectionchange", handleMouseUp);
      document.addEventListener("touchend", handleTouchEnd);
    
      return () => {
       // document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener("selectionchange", handleMouseUp);
        document.removeEventListener("touchend", handleTouchEnd);
      }
    }, [])
    return(
      <>
        {
        ShowTransMenu?(
          <div style={{
            position: 'absolute',
            zIndex: 100000000,
          }}>
            <Transalte top={buttonPosition.top} left={buttonPosition.left} TTT={selectedText} SetShowTransMenu={setShowTransMenu} ShowMeaning={ShowMeaning} setCloseMenu={setCloseMenu} CloseMenu={CloseMenu} />
          </div>
          
        ):null
      }
      </>
    
    )
    
  }
  export default AboveMenu;