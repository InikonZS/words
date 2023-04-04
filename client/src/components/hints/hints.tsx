import React from "react";
import '../../style.css';
import './hints.css';

interface IHintsProps {
  crystals: number;
  onShuffle: () => void; 
  onShowWords: () => void;
  onShowMask: () => void;
}

export function Hints({crystals, onShuffle, onShowWords, onShowMask} : IHintsProps) {

  return (
    <div className="hints">
      <h3 className="hints__title">Available hints:</h3>
      <button className="btn hints__button hints__button--shuffle" disabled={crystals < 1} onClick={() => {
        onShuffle();
      }}>
        shuffle
      </button>
      <button className="btn hints__button hints__button--show-words" disabled={crystals < 2} onClick={() => {
        onShowWords();
      }}>
        show words
      </button>
      <button className="btn hints__button hints__button--show-mask" disabled={crystals < 3} onClick={() => {
        onShowMask();
      }}>
        show mask
      </button>
    </div>
  )
}