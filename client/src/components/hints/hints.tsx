import React, { useContext, useEffect, useState } from "react";

interface IHintsProps {
  crystals: number;
  onShuffle: () => void; 
  onShowWords: () => void;
}

export function Hints({crystals, onShuffle, onShowWords} : IHintsProps) {

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
    </div>
  )
}