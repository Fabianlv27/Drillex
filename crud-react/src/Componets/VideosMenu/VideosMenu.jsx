import {useEffect,useState} from 'react'
import './VideosMenu.css'

function VideosMenu({GetTrs,setVideoId,handleJump}) {
    const [UserVideos, setUserVideos] = useState([])

useEffect(() => {
  const videos=JSON.parse(localStorage.getItem('videosYT')||[])
  setUserVideos(videos)

}, [])

 const VideoHandler=(v)=>{
    GetTrs(v.link,false)
    setVideoId(v.link)
    handleJump(v.time)
 }
  return (
    <div className='VideoMenuCont' >

        <h2>History</h2>
        {
            UserVideos.length>0&&(
                <div className='ImgVideoCont'>
                    {
                        UserVideos.map((v,i)=>(
                            <img src={"https://img.youtube.com/vi/"+v.link+"/hqdefault.jpg"} key={i} onClick={()=>VideoHandler(v)} />
                        ))
                    }
                </div>
            )
        }
    </div>
  )
}

export default VideosMenu