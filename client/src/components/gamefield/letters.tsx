import React, { useEffect, useRef, useState } from "react";
import { PlayerClient } from "../../player_client";
import { PlayerLocal } from "../../player_local";
import { ILetter, IPlayerData } from "../../gameLogic/interfaces";
import { isClosest } from "../../gameLogic/logicTools";
import { LineOverlay, WordOverlay } from "../../animatedList";
import './hex.css';
import { hex } from "../../consts";

interface ILettersProps {
  client: PlayerClient | PlayerLocal;
  players: Array<IPlayerData>;
  currentPlayerIndex: number;
  selected: Array<ILetter>;
  scale: number;
  onSubmit: (selected: Array<ILetter>) => void;
  letters: Array<Array<ILetter>>;
  animate: Array<ILetter>;
  hintMask: Array<Array<Array<number>>>;
}

export function Letters({ client, players, currentPlayerIndex, selected, scale, onSubmit, letters, animate, hintMask }: ILettersProps) {
  const [pointer, setPointer] = useState<{ x: number, y: number }>(null);
  const [winWord, setWinWord] = useState<Array<ILetter>>(null);
  const fieldRef = useRef<HTMLDivElement>();
  const player = client;

  useEffect(() => {
    if (selected.length) {
      const h = () => {
        if (player.playerName != players[currentPlayerIndex]?.name) {
          return;
        }
        setPointer(null);
        onSubmit(selected);
        setWinWord(selected);
        client.selectLetter([]);
      };
      window.addEventListener('mouseup', h, { once: true });
      return () => {
        window.removeEventListener('mouseup', h);
      }
    }
  }, [selected, currentPlayerIndex]);

  useEffect(() => {
    if (winWord) {
      const tm = setTimeout(() => {
        setWinWord(null);
      }, 2000);
      return () => clearTimeout(tm);
    }
  }, [winWord])

  useEffect(() => {
    setPointer(null);
  }, [currentPlayerIndex])

  const numbersToGradient = (arr: Array<number>) => {
    const full = 360;
    const colors = ['#f00', '#f90', '#ff0', '#9f0', '#0f0', '#090', '#099', '#09f', '#0ff', '#f99', '#ff9', '#9f9', '#999', '#99f', '#9ff'];
    if (!arr.length) {
      return null;
    }
    if (arr.length == 1) {
      return `conic-gradient(${colors[arr[0]]}7 0deg, ${colors[arr[0]]}7 360deg)`;
    }

    const ang = full / arr.length;
    const initial = [0, 45, 0, 45][arr.length - 1] || 0;
    const pairs = arr.map((it, i) => {
      return {
        angle: ang * i + initial,
        color: colors[it % colors.length]
      }
    })
    const records: Array<string> = [];
    pairs.forEach(it => {
      records.push(`${it.color}7 ${it.angle}deg`);
      records.push(`${it.color}7 ${it.angle + ang}deg`);
    });
    const last = records.pop();
    records.unshift(`${pairs[pairs.length - 1].color}7 ${initial}deg`);
    return `conic-gradient(${records.join(', ')})`;
    //console.log(`conic-gradient(${pairs.map(it=> `${it.color}7 ${it.angle}deg`).join(', ')})`)
    //return `conic-gradient(${pairs.map(it=> `${it.color}7 ${it.angle}deg, ${it.color}7 ${it.angle + ang}deg`).join(', ')})`
    //conic-gradient(#ff06 45deg, #f006,45deg, #f006 225deg, #ff06 225deg)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (player.playerName != players[currentPlayerIndex]?.name) {
      return;
    }

    if (fieldRef.current && selected && selected.length) {
      const { left, top } = fieldRef.current.getBoundingClientRect();
      const paddingOffset = scale * 30;
      const point = { x: e.touches[0].clientX - left - paddingOffset, y: e.touches[0].clientY - top - paddingOffset };
      setPointer(point);
      if (Math.hypot(point.x % (70 * scale) - 35 * scale, point.x % (70 * scale) - 35 * scale) < 20 * scale) {
        const letter = letters[Math.floor(point.y / ((60 + 10) * scale))]?.[Math.floor(point.x / ((60 + 10) * scale))];
        //console.log(letter);
        if (letter) {
          if (selected.length && !selected.find(it => it.id == letter.id) && isClosest(selected[selected.length - 1].x, selected[selected.length - 1].y, letter.x, letter.y)) {
            client.selectLetter([...selected, letter]);
          } else if (selected.length > 1 && selected[selected.length - 2].id == letter.id) {
            client.selectLetter([...selected.slice(0, selected.length - 1)]);
          }
        }
      }
    } else {
      setPointer(null);
    }
  }

  const handleWrapperMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (player.playerName != players[currentPlayerIndex]?.name) {
      return;
    }
    if (fieldRef.current && selected && selected.length) {
      const { left, top } = fieldRef.current.getBoundingClientRect();
      const paddingOffset = scale * 30;
      setPointer({ x: e.clientX - left - paddingOffset, y: e.clientY - top - paddingOffset });
      //setPointer({x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY});
    } else {
      setPointer(null);
    }
  }

  const getLetterClassName = (letter: ILetter) => {
    return `${cellStyle} ${selected.find(it => it.id == letter.id) ? "letter_selected" : ""} ${animate.find(it => it.id == letter.id) ? "letter_hide" : ""}`
  }

  const handleMouseDown = (letter: ILetter) => {
    if (player.playerName != players[currentPlayerIndex]?.name) {
      return;
    }
    client.selectLetter([letter]);
  }

  const handleMouseMove = (letter: ILetter) => {
    if (player.playerName != players[currentPlayerIndex]?.name) {
      return;
    }
    if (selected.length && !selected.find(it => it.id == letter.id) && isClosest(selected[selected.length - 1].x, selected[selected.length - 1].y, letter.x, letter.y)) {
      client.selectLetter([...selected, letter]);
    } else if (selected.length > 1 && selected[selected.length - 2].id == letter.id) {
      client.selectLetter([...selected.slice(0, selected.length - 1)]);
    }
  }
  //const hex = true;
  const rowStyle = hex ? 'hex_row' : 'row';
  const cellStyle = hex ? 'hex_cell' : 'letter';
  return (
    <div className="field__group">
      <div className="field"
        ref={fieldRef}
        onMouseMove={handleWrapperMouseMove}
        onTouchMove={handleTouchMove}
      >
        {
          letters.map((row, ri) => {
            return <div className={rowStyle}>
              {
                row.map((letter, li) => {
                  return <div className={getLetterClassName(letter)}
                    style={{
                      'backgroundImage': hintMask && numbersToGradient(hintMask[ri][li])
                    }}
                    onMouseDown={() => {
                      handleMouseDown(letter);
                    }}
                    onMouseMove={() => {
                      handleMouseMove(letter);
                    }}

                    onTouchStart={(e) => {
                      e.preventDefault();
                      if (player.playerName != players[currentPlayerIndex]?.name) {
                        return;
                      }
                      client.selectLetter([letter]);
                    }
                    }

                    onTouchEnd={(e) => {
                      if (player.playerName != players[currentPlayerIndex]?.name) {
                        return;
                      }
                      setPointer(null);
                      onSubmit(selected);
                      setWinWord(selected);
                      client.selectLetter([]);
                    }}
                  >
                    {letter.bonus.find(it => it.name == 'crystal') && <div className="crystal"></div>}
                    {letter.letter}
                    {false && hintMask && hintMask[ri]?.[li] && <div style={{ fontSize: '8px' }}>{hintMask[ri][li].join('/')}</div>}
                  </div>
                })}
            </div>
          })
        }
      </div>
      <LineOverlay word={selected} pointer={pointer} base={scale}></LineOverlay>
      {winWord && <WordOverlay word={winWord}></WordOverlay>}
    </div>
  )
}