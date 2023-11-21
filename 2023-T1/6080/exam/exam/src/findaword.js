import React, { useState } from 'react';

const wordlist = [
	{
		words: ['feed','farm','eat','rat'],
		grid: [
			[['F',[0,1] ],['E',[0]],['E',[0,2] ],['D',[0] ]],
			[['A',[1] ],['Z',[]],['A',[2] ],['D',[] ]],
			[['R',[1,3] ],['A',[3]],['T',[2,3] ],['D',[] ]],
			[['M',[1] ],['G',[]],['R',[]],['D',[] ]],
		]
	},
	{
		words: ['monk','near','eel','more'],
		grid: [
			[['M',[0] ],['O',[0]],['N',[0,1]],['K',[0]]],
			[['C',[] ],['E',[2]],['E',[1,2]],['L',[2]]],
			[['B',[] ],['K',[]],['A',[1]],['L',[]]],
			[['M',[3] ],['O',[3]],['R',[1,3]],['E',[3]]],
		]
	},
	{
		words: ['firm','ramp','damp'],
		grid: [
			[['F',[0] ],['I',[0]],['R',[0,1]],['M',[0]]],
			[['B',[] ],['F',[]],['A',[1]],['O',[]]],
			[['D',[2] ],['A',[2]],['M',[1,2]],['P',[2]]],
			[['E',[] ],['R',[]],['P',[1]],['T',[]]],
		]
	}
]


export default function Findaword() {
  const [clickedCells, setClickedCells] = useState([]);
  
  const randomIndex = Math.floor(Math.random() * wordlist.length);
  const { grid, words } = wordlist[randomIndex];
  
  const renderGrid = () => {
    const gridRows = [];
    for (let i = 0; i < 4; i++) {
      const gridRow = [];
      for (let j = 0; j < 4; j++) {
        gridRow.push(grid[i][j][0]);
      }
      gridRows.push(gridRow);
    }
    return gridRows.map((row, rowIndex) => (
      <div key={rowIndex} style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '25%'}}>
        {row.map((col, colIndex) => {
          const cellKey = `${rowIndex}-${colIndex}`;
          const isClicked = clickedCells.includes(cellKey);
          return (
            <div
              key={cellKey}
              onClick={() => handleCellClick(cellKey)}
              style={{
                width: '25%',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: isClicked ? 'rgb(255, 255, 200)' : '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {col[0]}
            </div>
          )
        })}
      </div>
    ));
  };

  const handleCellClick = (cellKey) => {
    const newClickedCells = clickedCells.includes(cellKey)
      ? clickedCells.filter((clickedCell) => clickedCell !== cellKey)
      : [...clickedCells, cellKey];
    setClickedCells(newClickedCells);
  }

  const renderWords = () => {
    return words.map((word, index) => (
      <div key={index} style={{fontSize: '1.2em', lineHeight: '150%'}}>{word}</div>
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'row', height: '300px', width: '300px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {renderGrid()}
      </div>
      <div>
        {renderWords()}
      </div>
    </div>
  );
}
