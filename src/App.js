import './App.css';

function App() {
  return (
    <div style={{width: '100vw', height: '100vh', overflow: "hidden"}}>
      <div className='draggable bg'>
        <div className='starboard'>
          <div className='title'>
            <p className='titleText'>Unsaved</p>
            <p className='titleEnding'>.txt</p>
          </div>
          <div className='buttons'>
            <div className='button min'>
              <img src='./public/images/buttons/min.png' alt='min'/>
            </div>
            <div className='button max'>
              <img src='./public/images/buttons/max.png' alt='max'/>
            </div>
            <div className='button close'>
              <img src='./public/images/buttons/close.png' alt='close'/>
            </div>
          </div>
        </div>

        <textarea className='textArea' contentEditable placeholder='Brain Juice Here... 🧠🧃🖥️'>
        </textarea>
      </div>
    </div>
  );
}

export default App;
