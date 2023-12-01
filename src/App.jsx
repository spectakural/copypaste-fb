import { useEffect, useState } from 'react'
import './App.css'
import { db } from './firebase.js';
import {useCollectionData} from 'react-firebase-hooks/firestore'
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { v4 } from 'uuid';

function App() {
  const [roomJoined, setRoomJoined] = useState(false)
  const [roomid, setRoomid] = useState("")
  const [messages, setMessages] = useState([])
  const [userMessage, setUserMessage] = useState("")
  const [snapShotRef, setSnapShotRef] = useState(null)
  const [values, loading, error, snapshot] = useCollectionData(collection(db, "messages"))
  const [chatHistory, setChatHistory] = useState(false)
  const [roomHistory, setRoomHistory] = useState([])
  const [showRoomHistory, setShowRoomHistory] = useState(false)


  useEffect(() => {
    if (!loading && roomid) {
      let cloudMessage = snapshot.docs.find((doc) => doc.id === roomid).data().message
      setMessages(cloudMessage)
      setUserMessage(cloudMessage[cloudMessage.length-1])
    }
    
  }, [values])
  
  useEffect(() => {
    let prevRoomid = localStorage.getItem("roomid")
    if (prevRoomid) {
      setRoomid(prevRoomid)
      setRoomJoined(true)
    }

    let prevRoomHistory = localStorage.getItem("roomHistory")
    setRoomHistory(prevRoomHistory ? JSON.parse(prevRoomHistory) : [])
    
  }, [])

  const addToHistory = (roomid) => {
    setRoomHistory([...roomHistory, roomid])
    localStorage.setItem("roomHistory", JSON.stringify(roomHistory))
  }
  
  const addtoDoc = async () => {
    await setDoc(doc(db,"messages",roomid), {
      message: [...messages,userMessage]
    },)
  }

  const setMessageData = () => {
    setMessages(snapshot.docs.find((doc) => doc.id === roomid).data().message)
    setUserMessage(messages[messages.length-1])
  }

  const gotoGithub = () => {
    window.open("https://github.com/AnupamKris", "_blank")
    window.open("https://www.github.com/spectakural", "_blank")
  }

  const gotoRepo = () => {
    window.open("https://github.com/spectakural/copypaste-server", "_blank")
  }

  const connectRoom = () => {
    if (roomid === "") alert("Enter a room id")
    else if (!snapshot.docs.find((doc) => doc.id === roomid)) alert("Room not found")
    else setRoomJoined(true)
    setMessageData()
    localStorage.setItem("roomid", roomid)

    if (roomHistory.includes(roomid)) {
      let index = roomHistory.indexOf(roomid)
      setRoomHistory([...roomHistory.slice(0, index), ...roomHistory.slice(index+1)])
    } else {
      setRoomHistory([...roomHistory, roomid])
    }
  }
  
  const startRoom = async () => {
    const randomid = v4().slice(0, 6)
    
    console.log(randomid)
    await setDoc(doc(db,"messages",randomid), {
      message: ["Lets get started!"]
    })
    
    setRoomJoined(true)
    setRoomid(randomid)
    setMessageData()
    localStorage.setItem("roomid", randomid)

    if (roomHistory.includes(randomid)) {
      let index = roomHistory.indexOf(randomid)
      setRoomHistory([...roomHistory.slice(0, index), ...roomHistory.slice(index+1)])
    } else {
      setRoomHistory([...roomHistory, randomid])
    }
  }

  const backToHome = () => {
    setChatHistory(false)
    setShowRoomHistory(false)
    setRoomJoined(false)
    localStorage.removeItem("roomid")
  }

  const toggleChatHistory = () => {
    setChatHistory(!chatHistory)
  }

  const toggleRoomHistory = () => {
    setShowRoomHistory(!showRoomHistory)
  }

  const copyClipHistory = (e) => {
    let text = e.target.innerText
    navigator.clipboard.writeText(text)
  }

  const copyMessage = () => {
    navigator.clipboard.writeText(userMessage)
  }

  const shareRoomCode = () => {
    navigator.clipboard.writeText(roomid)
  }

  return (
    <div className="App">
      {!roomJoined && <div className='room-container'> 
        <h3>{"<copypaste />"}</h3>
        <div className="inputs">
        <input type="text" placeholder="Enter Room ID" value={roomid} onChange={(e)=>setRoomid(e.target.value)} className='inputbutts'/>
        <button onClick={connectRoom} className='inputbutts'>Enter</button>
        <button onClick={startRoom} className='inputbutts'>Start new Room</button>
        </div>
        <p onClick={gotoGithub}>{"Made w <3 by Kural & Anupam"}</p>
      </div>}
      {roomJoined && <div className='app-container'>
        <div className='left-buttons'>
          <ion-icon id="share-room-code" name="share-social" onClick={shareRoomCode} title="Copy Room Code"></ion-icon>
          <ion-icon id="chat-history" name="chatbubbles" onClick={toggleChatHistory} title="Show Clipboard History"></ion-icon>
          <ion-icon id="room-history" name="albums" onClick={toggleRoomHistory} title="Show Room History"></ion-icon>
          <ion-icon id="back-to-home" name="arrow-back" onClick={backToHome} title="Go Back to Home"></ion-icon>
        </div>
        <div className="right-buttons">
          <ion-icon id="clipboard" name="clipboard" onClick={copyMessage} title="Copy Message"></ion-icon>
        </div>
        <h3 onClick={gotoRepo}>{"<copypaste />"}</h3>
        <textarea name="messagebox" id="messagebox" cols="30" rows="10" value={userMessage} onChange={(e)=>setUserMessage(e.target.value)}></textarea>
        <button onClick={addtoDoc}>Send</button>
        <p onClick={gotoGithub}>{"Made w <3 by Kural & Anupam"}</p>
      </div>}
      {<div className={"chat-history " + (chatHistory ? "history-active" : "") }>
        <h3>Chat History</h3>
        {messages.map((msg, index) => <p className="clip-history-card" onClick={copyClipHistory} key={index}>{msg}</p>)}
      </div>}
      {<div className={"chat-history " + (showRoomHistory ? "history-active" : "") }>
        <h3>Room History</h3>
        {roomHistory.map((msg, index) => <p className="clip-history-card" onClick={copyClipHistory} key={index}>{msg}</p>)}
      </div>}
    </div>
  )
}

export default App