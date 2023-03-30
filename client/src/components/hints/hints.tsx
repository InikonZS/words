import React, { useContext, useEffect, useState } from "react";

interface IHintsProps {
  crystals: number;
  onShuffle: () => void; 
}

export function Hints({crystals, onShuffle} : IHintsProps) {

  return (
    <div>
      <button disabled={crystals < 1} onClick={() => {
        onShuffle();
      }}>
        shuffle
      </button>
    </div>
  )
}