import React, { useState, useEffect } from 'react';

const colors = ['red', 'blue', 'orange', 'yellow', 'green', 'purple', 'pink'];

function getRandomColors(color) {
  const randomColors = [];
  while (randomColors.length < 3) {
    const randomIndex = Math.floor(Math.random() * colors.length);
    const randomColor = colors[randomIndex];
    if (!randomColors.includes(randomColor) && randomColor !== color) {
      randomColors.push(randomColor);
    }
  }
  const randomIndex = Math.floor(Math.random() * 4);
  randomColors.splice(randomIndex, 0, color);
  return randomColors;
}

export default function Wordcolour() {
  const [gameStart, setGameStart] = useState(false);
  const [color, setColor] = useState('');
  const [choiceColors, setChoiceColors] = useState([]);
  const [check, setCheck] = useState(0);
  const [resetFlag, setResetFlag] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setGameStart(true);
    }, 2000);
  }, []);
  useEffect(() => {
    const Color = colors[Math.floor(Math.random() * colors.length)];
    setColor(Color);
    setChoiceColors(getRandomColors(Color));
  }, []);
  const handleClick = (col) => {
    if(color === col){
      setCheck(check+1);
      setResetFlag(true);
    }
  };
  useEffect(() => {
    if (check === 3) {
      localStorage.setItem('correct', parseInt(localStorage.getItem('correct'))+1);
      alert('You have won');
      setCheck(0);
    }
  }, [check]);
  useEffect(() => {
    if (resetFlag) {
      const Color = colors[Math.floor(Math.random() * colors.length)];
      setColor(Color);
      setChoiceColors(getRandomColors(Color));
      setResetFlag(false);
    }
  }, [resetFlag]);
  return (
    <>
      {!gameStart && (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
          <div style={{ width: '50%', backgroundColor: '#ccc' }}>
          </div>
          <div style={{ width: '50%', backgroundColor: '#999' }}>
          </div>
        </div>
      )}
      {gameStart && (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50%', backgroundColor: '#ccc' }}>
            {color}
          </div>
          <div style={{ width: '50%', backgroundColor: '#999', display: 'flex' }}>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '50%', backgroundColor: choiceColors[0], cursor: 'pointer' }} onClick={() => handleClick(choiceColors[0])}></div>
              <div style={{ height: '50%', backgroundColor: choiceColors[1], cursor: 'pointer' }} onClick={() => handleClick(choiceColors[1])}></div>
            </div>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '50%', backgroundColor: choiceColors[2], cursor: 'pointer' }} onClick={() => handleClick(choiceColors[2])}></div>
              <div style={{ height: '50%', backgroundColor: choiceColors[3], cursor: 'pointer' }} onClick={() => handleClick(choiceColors[3])}></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
