import './App.css';

import min from './images/buttons/min.png';
import full from './images/buttons/full.png';
import close from './images/buttons/close.png';
import save from './images/status/save.png';

import cleanSlate from './images/new.png';
import openFile from './images/open.png';

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

const minsBetweenAutosave = 5;

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
    transform: "scale("+ Math.max(window.innerWidth / 400 * 5, 10) + ") translate(-50%, -50%)" + "rotate(" + (Math.random() * 30 - 15) + "deg)",
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

function Writer({startingInfo = null}) {

  const minimize = () => {
    ipcRenderer.send('minimize');
  }

  const maximize = () => {
    ipcRenderer.send('maximize');
  }

  const closeCmd = () => {
    if (text !== lastSavedText) {
      const result = window.confirm("You have unsaved changes. Your changes will be lost if you exit. Click OK to exit. If you want to save, click cancel and then click the save button. (The applicaition will 'bounce' to the taskbar to mitigate a focus bug)");
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
      ending: ending,
      path: savePath,
    });

    setLastSavedText(text);
  }

  const [title, setTitle] = useState("UNTITLED");
  const [ending, setEnding] = useState(".txt");
  const [saveStatus, setSaveStatus] = useState("UNSAVED"); //UNSAVED, AWAITING, SAVING
  const [savePath, setSavePath] = useState(null);

  const [mins, setMins] = useState(minsBetweenAutosave);

  const [text, setText] = useState("");

  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth);

  const [lastSavedText, setLastSavedText] = useState("");

  const [keysPressed, setKeysPressed] = useState([]);

  const [titleHovered, setTitleHovered] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    });

    ipcRenderer.on('savePath', (event, path) => {
      setSavePath(path);

      let fileName = path.split('\\')[path.split('\\').length - 1];

      setTitle(fileName.split('.')[0]);

      setSaveStatus("SAVING");
      setMins(minsBetweenAutosave);

      setTimeout(() => {
        setSaveStatus("AWAITING");
      }, 2000);
    });
  }
  , []);

  useEffect(() => {

    if (saveStatus !== "AWAITING") {
      return;
    }

    console.log(mins == 0 ? "Autosaving Now" : ("Autosaving in " + mins + " minutes"))

    if (mins === 0) {
      saveCmd();
      return;
    }

    setTimeout(() => {
        setMins(mins - 1);
    }, 60 * 1000);
  }, [saveStatus, mins]);

  useEffect(() => {
    if (!startingInfo) {
      return;
    }

    setText(startingInfo.text);
    setLastSavedText(startingInfo.text);
    document.getElementsByClassName('textArea')[0].innerHTML = startingInfo.text;

    setTitle(startingInfo.title);
    setEnding(startingInfo.ending);

    setSavePath(startingInfo.filePath);

    setSaveStatus("AWAITING");
    setMins(minsBetweenAutosave);
  }, [startingInfo])

  return (
    <div style={{width: '100vw', height: '100vh', overflow: "hidden"}}>
      <div className='bg'>
        {
          //display key animation thing
          keysPressed.map((key, index) => {

            if (key === "") {
              return null;
            }

            return <Key key={index} keyChar={key}/>
          })
        }
        <div className='starboard'>
          <div className='title'>
            <input onMouseOver={() => {
              setTitleHovered(true);
            }} onMouseLeave={() => {
              setTitleHovered(false);
            }} 
            style={{width: titleHovered ? width - 200 : 
              Math.max(75, Math.min(width - 200, title.length * 15)),
              border: titleHovered ? "2px solid rgba(255, 255, 255, 0.25)" : "none",
              borderRadius: 2,
            }} className='titleTextInput' onBlur={() => {
              if (title === "") {
                setTitle("UNTITLED");
              }

              if (title.includes(".")){
                setTitle(title.replace(".", ""));
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
          let next = keysPressed.concat(e.key);

          //set all the keys not in last 50 to ""
          for (let i = 0; i < next.length - 50; i++) {
            next[i] = "";
          }

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

function App () {

  const [openApp, setOpenApp] = useState(false);
  const [startingInfo, setStartingInfo] = useState(null)

  useEffect(() => {
    ipcRenderer.on('openFileData', (event, info) => {
      setStartingInfo(info);

      ipcRenderer.send('changeWindowDim');
      setOpenApp(true);
    });
  }, [])

  if (openApp) {
    return <Writer startingInfo={startingInfo} />
  }

  return (
    <div  style={{width: "100vw", height: "100vh", overflow: "hidden"}}>
      <div className='decisionBounds'>
        <div className='decisionContainer'>
          <div className='new nodrag decision' onClick={() => {
            // change window height and width
            ipcRenderer.send('changeWindowDim');
            setOpenApp(true);
          }} >
            <p className='decisionSubheader'>CREATE NEW</p>
            <p className='decisionHeader'>CLEAN SLATE</p>
            <img className='decisionImg' src={cleanSlate} width={120} height={120}/>
          </div>
          <div onClick={() => {
            // change window height and width
            ipcRenderer.send('openFile');
          }}  className='open nodrag decision'>
            <p className='decisionSubheader'>CONTINUE ANY</p>
            <p className='decisionHeader'>TEXT FILES</p>
            <img className='decisionImg' src={openFile} width={110} height={110}/>
          </div>
        </div>
        <div className='decisionHeaderContainer draggable'/>
        <div className='decisionDivider' />
      </div>
    </div>
  );
}

export default App;
