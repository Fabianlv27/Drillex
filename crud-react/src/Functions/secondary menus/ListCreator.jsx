import { useState, useContext } from 'react';
import {ListsContext} from '../../../Contexts/ListsContext'
import "../../styles/SeeLists.css"
function ListCreator({Show}) {
    const {CreateList} = useContext(ListsContext)
    const [Title, setTitle] = useState('')
  
  return (
    <div className=''>
        <h2>LetsCreate a List!</h2>
        <form onSubmit={async (e) => {
        e.preventDefault();
        if (Title.trim() === "") {
            alert("Please enter a title for the list.");
            return;
        }
        CreateList(Title)
        Show(false) // Close the creator menu after creating the list
      }}>
        <div className="input-group">
    <input type="text" className="inputCreateList" id="Email" name="Email" placeholder="Title" autocomplete="off" onChange={(e)=>setTitle(e.target.value)}/>
    <input className="button--submit" value="Create" type="submit"/>
</div>
</form>
       
    </div>
  )
}


export default ListCreator