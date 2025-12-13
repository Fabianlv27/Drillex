import {GetLocalHost} from './api'

const {host,getTokenFromCookies}=GetLocalHost()
const token=getTokenFromCookies()

export async function PostProgress(game,idList) {
    try {
           await fetch(`${host}/user/progress/${token}`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({idList:idList,game:game})
    })
     
    } catch (error) {
        alert(error)
    }
}

export async function UpdateProgress(data) {
       fetch(`${host}/user/progress/update/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(() => {
      console.log("Progreso enviado");
      localStorage.removeItem("pendingProgress"); // limpiar si ya se mandó
    })
    .catch(err => console.error("Error enviando progreso:", err));
  
}

export async function GetData(idList,game) {
    console.log(idList)
        try {
         const Data=  await fetch(`${host}/user/progress/${token}/${idList}/${game}`)
    const Progress=Data.json()
    return Progress
     
    } catch (error) {
        alert(error)
    }
}