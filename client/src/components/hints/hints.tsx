import React, { useContext, useEffect, useState } from "react";

interface IHintsProps {
  onShuffle: () => void; 
}

export function Hints({onShuffle} : IHintsProps) {

  return (
    <div>
      <button onClick={() => {
        onShuffle();
      }}>
        shuffle
      </button>
    </div>
  )
}