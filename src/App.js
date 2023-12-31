import './App.css';

//React and Redux APIs
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Icons to be used in the UI
//import BreakIcon from './Assets/icons8-break.svg';
//import FocusIcon from './Assets/icons8-focus.svg';
import DownIcon from './Assets/icons8-down.svg';
import UpIcon from './Assets/icons8-up.svg';
import StartIcon from './Assets/icons8-play.svg';
import PauseIcon from './Assets/icons8-stop (1).svg';
import ResetIcon from './Assets/icons8-reset.svg';
import TimerIcon from './Assets/icons8-timer (1).svg';

//Audio to be used when timer finishes countdown
import Beep from './Assets/mixkit-alarm-clock-beep-988.wav';

function App() {
  //To track if the timer is paused or playing
  const [isPaused, setIsPaused] = useState(true);
  const [inSession, setInSession] = useState(true);

  //To keep track of the number of session and break rounds
  const [breakRound, setBreakRound] = useState(0);
  const [sessionRound, setSessionRound] = useState(0);

  //To refrence the audio in my jsx
  const audioRef = useRef(null);

  const dispatch = useDispatch();

  //States managed in redux store
  const breakLength = useSelector((state)=> state.breakLength); //To get the break length to be displayd from redux store
  const sessionLength = useSelector((state)=> state.sessionLength); //To get the session length to be displayd from redux store
  const sessionCount = useSelector((state)=> state.session); //The session time remaining in seconds
  const breakCount = useSelector((state)=> state.break); //The break time remaining in seconds

  //Actions to be dispatched to redux store
  const incBreakLength = () => {
    //dispatch action that increases the break length by one if timer isn't running
    breakLength+1 <= 60 && isPaused && dispatch({type:'INCBREAK'});
  }
  const decBreakLength = () => {
    //dispatch action that decreases the break length by one if timer isn't running
    breakLength-1 > 0 && isPaused && dispatch({type:'DECBREAK'});
  }
  const incSessionLength = () => {
    //dispatch action that increases the session length by one if timer isn't running
    sessionLength+1 <= 60 && isPaused && dispatch({type:'INCSESSION'});
  }
  const decSessionLength = () => {
    //dispatch action that decreases the session length by one if timer isn't running
    sessionLength-1 > 0 && isPaused && dispatch({type:'DECSESSION'});
  }

  //Actions that updates the session count and break count if the set lengths changes
  useEffect(()=>{
    //dispatch action that updates the break count with updated break length, if timer is paused.
    if(isPaused) {
      dispatch({type:'SETBREAK', payload:breakLength*60})
    }
  }, [dispatch, breakLength]) //isPaused not included in the dependency array to avoid unecessary renders

  useEffect(()=>{
    //dispatch action that updates the break count with updated break length, if timer is paused.
    if(isPaused) {
      dispatch({type:'SETSESSION', payload:sessionLength*60})
    }
  }, [dispatch, sessionLength]) //isPaused not included in the dependency array to avoid unecessary renders

  //To restart the timer when countdow finishes
  const restart = useCallback(() => {
    //dispatch actions that resets the session and break counts to the initial state
    dispatch({type:'SETSESSION', payload:sessionLength*60})
    dispatch({type:'SETBREAK', payload:breakLength*60})
  }, [dispatch,sessionLength, breakLength])

  //To check if the timer should be in session or on break
  useEffect(()=> {
    if(breakRound === sessionRound) {
      setInSession(true);
    } else {
      setInSession(false);
    }
  }, [setInSession, sessionRound, breakRound]);

  const beep = useCallback(() => {
    audioRef.current.play();
  }, [audioRef])

  const rewoundAudio = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  //Handles the countdown and timer updates
  useEffect(()=> {
    let interval;
    let sessionDuration = sessionCount;
    let breakDuration = breakCount;

    const updateSessionCount = () => {
      if(!isPaused) {
        //console.log(sessionDuration, "before");
        sessionDuration>0 && (sessionDuration-=1);
        //console.log(sessionDuration, "after");
        dispatch({
          type:'COUNTSESSION',
          payload:sessionDuration,
        })
        //console.log(sessionCount, "display")
        
        if(sessionCount === 0){
          clearInterval(interval);
          //beep();
          setSessionRound(sessionRound+1);
        }
        sessionDuration===0 && beep();
      }
    }
    const updateBreakCount = () => {
      if(!isPaused) {
        //console.log(breakDuration, "before");
        breakDuration>0 && (breakDuration-=1);
        //console.log(breakDuration, "after");
        dispatch({
          type:'COUNTBREAK',
          payload:breakDuration,
        })
        //console.log(breakCount, "display");
        if(breakCount===0) {
          //beep();
          clearInterval(interval);
          setBreakRound(breakRound+1);
          restart();
        }
        breakDuration===0 && beep();
      }
    }

    if(inSession) {
      interval = setInterval(updateSessionCount, 1000);
    }
    else {
      interval = setInterval(updateBreakCount, 1000);
    }
    return ()=> clearInterval(interval);
  }, [isPaused, inSession, sessionCount, breakCount, dispatch, breakRound, sessionRound, beep, restart])

  //Timer Display Format
  const timeDisplay = (seconds) => {
    return (`${((seconds/60)|0)>9?((seconds/60)|0):"0"+((seconds/60)|0)}:${((seconds%60)|0)>9?((seconds%60)|0):"0"+((seconds%60)|0)}`) 
  }
  
  //Dispatches actions that sets the clock to it initial state
  const reset = () => {
    dispatch({
      type: 'RESET',
      defaultBreakLength: 5,
      defaultSessionLength:25,
      defaultSessionCount: 25*60,
      defaultBreakCount: 5*60
    })
    setIsPaused(true); //Pauses the timer on reset
    setSessionRound(0);
    setBreakRound(0);
    rewoundAudio();
  }


  return (
    <div className="App">
      <div id="setting">
        <div id="setting-break">
          <p id="break-label">Break Length</p>
          <div>
          <button id="break-increment" onClick={()=>incBreakLength()}><img src={UpIcon} alt="increase break length"/></button>
          <p id="break-length">{breakLength}</p>
          <button id="break-decrement" onClick={()=>decBreakLength()}><img src={DownIcon} alt="decrease break length"/></button>
          </div>
        </div>
        <div id="setting-session">
          <p id="session-label">Session Length</p>
          <div>
            <button id="session-increment" onClick={()=>incSessionLength()}><img src={UpIcon} alt="increase session length"/></button>
            <p id="session-length">{sessionLength}</p>
            <button id="session-decrement" onClick={()=>decSessionLength()}><img src={DownIcon} alt="decrease session length"/></button>
          </div>
        </div>
      </div>
      <div id='counter'>
        <div>
          <p id="timer-label">{inSession?"Session":"Break"}</p>
          <p id="time-left">{inSession?timeDisplay(sessionCount): timeDisplay(breakCount)}</p>
          <p>Time Left</p>
        </div>
        <audio ref={audioRef} id='beep' src={Beep}></audio>
      </div>
      <div id='control'>
        <button id="start_stop" onClick={()=> setIsPaused((prevIsPaused)=> !prevIsPaused)}><img src={isPaused? StartIcon: PauseIcon} alt="start or pause"/></button>
        <button id="reset" onClick={()=>reset()}><img src={ResetIcon} alt="reset"/></button>
      </div>
    </div>
  );
}

export default App;
