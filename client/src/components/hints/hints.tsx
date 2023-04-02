import React, { useContext, useEffect, useState } from "react";

interface IHintsProps {
  crystals: number;
  onShuffle: () => void; 
  onShowWords: () => void;
  onShowMask: () => void;
}

export function Hints({crystals, onShuffle, onShowWords, onShowMask} : IHintsProps) {

  return (
    <div>
      <button disabled={crystals < 1} onClick={() => {
        onShuffle();
      }}>
        shuffle
      </button>
      <button disabled={crystals < 0} onClick={() => {
        onShowWords();
      }}>
        show words
      </button>
      <button disabled={crystals < 0} onClick={() => {
        onShowMask();
      }}>
        show mask
      </button>
    </div>
  )
}