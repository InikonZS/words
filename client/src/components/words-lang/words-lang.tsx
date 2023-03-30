import React from "react";
import '../../style.css';
import './words-lang.css';

interface IChangeWordsLangProps {
  langs: Array<string>;
  langIndex: number;
  setLangIndex: React.Dispatch<React.SetStateAction<number>>;
}

export function ChangeWordsLang({ langs, langIndex, setLangIndex }: IChangeWordsLangProps) {
  return (
    <div className="words-lang">
      <p className="words-lang__title">Please select words language </p>

      <div className="words-lang__container">
        <span className="words-lang__lang">{langs[langIndex]}</span>

        <div className="words-lang__buttons">
          <button className="btn words-lang__button words-lang__button--left" onClick={() => {
            setLangIndex(last => (last + 1) % langs.length)
          }}>left</button>

          <button className="btn words-lang__button words-lang__button--right" onClick={() => {
            setLangIndex(last => ((last + langs.length) - 1) % langs.length)
          }}>right</button>
        </div>

      </div>
    </div>
  )
}