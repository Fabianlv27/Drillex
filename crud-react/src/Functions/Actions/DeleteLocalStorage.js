export const DeleteLocalStorage=(Prefijo)=>{
    for (let i = 0; i < localStorage.length; i++) {
      const clave=localStorage.key(i)
      if (clave.startsWith(Prefijo)) {
        localStorage.removeItem(clave)
        i--
      }        
    }
}