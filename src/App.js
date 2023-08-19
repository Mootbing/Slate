import './App.css';

import min from './images/buttons/min.png';
import full from './images/buttons/full.png';
import close from './images/buttons/close.png';
import save from './images/status/save.png';
import { useEffect, useState } from 'react';

const splashTexts = [
  "Squeeze Your Brain Juices... 🧠🧃🖥️",
  "What's On Your Mind? ❔⬆️🤯",
  "Capture Your Thoughts... 📝🪶💡",
  "Write Your Heart Out... ❤️📝💘",
  "Tackle Your Tasks... 📝📅📆",
  "Do Without Distractions... 📝🚫📱",
]

const formats = [
  ".txt",
  // ".blank",
  // ".md",
  // ".html",
]

const selectedSplash = splashTexts[Math.floor(Math.random() * splashTexts.length)];

// electron
const { ipcRenderer } = window.require('electron');

function Key ({keyChar, index}) {

  const [style, setStyle] = useState({});
  const [display, setDisplay] = useState(true);

  const newStyle = {
    // left: "50%",
    left: Math.random() * 100 + "%",
    bottom: "100%",
    opacity: 0,
    transform: "scale(5) translate(-50%, -50%)" + "rotate(" + (Math.random() * 30 - 15) + "deg)",
  }

  useEffect(() => {
    setTimeout(() => {
      setStyle(newStyle);
    }, 25);

    setTimeout(() => {
      setDisplay(false);
    }
    , 2000);
  }, []);

  if (!display) {
    return null;
  }

  return <p className='key' style={style}>{keyChar}</p>
}

function App() {

  const minimize = () => {
    ipcRenderer.send('minimize');
  }

  const maximize = () => {
    ipcRenderer.send('maximize');
  }

  const closeCmd = () => {
    if (text !== lastSavedText) {
      const result = window.confirm("You have unsaved changes. Are you sure you want to exit? (Your changes will be lost). If you want to save, click cancel and then click the save button. (The applicaition will 'bounce' to the taskbar to mitigate a focus bug)");
      if (!result) {
        //window is bugged after the dialogue box,fix by minimizing
        ipcRenderer.send('minimize');
        
        //take out of minimized state
        setTimeout(() => {
          ipcRenderer.send('unminimize');
        }, 100);

        return;
      }
    }

    ipcRenderer.send('close');
  }

  const saveCmd = () => {
    ipcRenderer.send('save', {
      text: text,
      title: title,
      ending: ending
    });

    setLastSavedText(text);

    setSaveStatus("SAVED");
    setMins(5);

    setTimeout(() => {
      setSaveStatus("AWAITING");
    }, 2000);
  }

  const [title, setTitle] = useState("UNTITLED");
  const [ending, setEnding] = useState(".txt");
  const [saveStatus, setSaveStatus] = useState("UNSAVED"); //UNSAVED, AWAITING, SAVED
  const [mins, setMins] = useState(5);

  const [text, setText] = useState("");

  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth);

  const [lastSavedText, setLastSavedText] = useState("");

  const [keysPressed, setKeysPressed] = useState([]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    });

    setInterval(() => {
      if (saveStatus === "UNSAVED") {
        return;
      }

      if (mins === 0) {
        saveCmd();
      } else {
        setMins(mins - 1);
      }
    }, 60 * 1000);
  }
  , []);

  return (
    <div style={{width: '100vw', height: '100vh', overflow: "hidden"}}>
      <div className='draggable bg'>
        {
          //display key animation thing
          keysPressed.map((key, index) => {
            return <Key key={index} keyChar={key}/>
          })
        }
        <div className='starboard'>
          <div className='title'>
            <input style={{width:
              Math.max(75, Math.min(width - 200, title.length * 15))
            }} className='titleTextInput' onBlur={() => {
              if (title === "") {
                setTitle("UNTITLED");
              }
            }} value={title} onChange={(e) => {
              setTitle(e.target.value);
            }}/>
            <a className='titleEnding' onClick={() => {
              setEnding(
                formats[(formats.indexOf(ending) + 1) % formats.length]
              );
            }}>{ending + (text !== lastSavedText ? "*" : "")}</a>
          </div>
          <div className='buttons'>
            <a className='button min' onClick={minimize}>
              <img src={min} className='button' alt='min' />
            </a>
            <a className='button full'>
              <img src={full} className='button' alt='full' onClick={maximize}/>
            </a>
            <a className='button close' onClick={closeCmd}>
              <img src={close} className='button' alt='close'/>
            </a>
          </div>
        </div>

        <textarea className='textArea' placeholder={
          selectedSplash
        } style={{height: height  - 110}} onChange={(e) => {
          setText(e.target.value);
        }}
        onKeyDown={(e) => {

          const next = keysPressed.concat(e.key)

          setKeysPressed(next);
        }}
        />

        <div className='bottomBar'>
          <div className='saveStatus'>
            <div onClick={saveCmd} className='button saveContainer'> 
              <img src={save} className='save' alt='save'/>
            </div>
            <p className='status' style={{color: saveStatus == "UNSAVED" ? "#fff" : "#AFAFAF"}}>{saveStatus != "AWAITING" ? saveStatus : `Autosave In ${mins}M`}</p>
          </div>
          <div className='right'>
            <p className='status'>{
              text.split('').length == 0 ? 0 : text.split(' ').length
            } WORDS | {
              text.split('').length
            } CHARACTERS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
