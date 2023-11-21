import React, {useRef} from 'react';
import {strs} from "./data/blanko";
import { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';

export default function Blanko() {
  const firstRef = useRef();
  const secondRef = useRef();
  const thirdRef = useRef();  
  function BlankoBox(){
    const [resetFlag, setResetFlag] = useState(false);
    let randomNumber = parseInt(Math.random()*7,10);
    let randomString = strs[randomNumber];
    randomString = randomString.split('');
    const blankIndexes = [];
    while (blankIndexes.length < 3) {
      const index = Math.floor(Math.random() * 12);
      if (!blankIndexes.includes(index) && randomString[index]!==' ') {
        blankIndexes.push(index);
      }
    }
    const handleCheckQuestion = () => {
      if (randomString[blankIndexes[0]] === firstRef.current.value && randomString[blankIndexes[1]] === secondRef.current.value && randomString[blankIndexes[2]] === thirdRef.current.value){
        localStorage.setItem('correct', parseInt(localStorage.getItem('correct'))+1);
        alert('Correct!');
        setResetFlag(true);
      }
    };
    const handleResetQuestion = () => {
      setResetFlag(true);
    };
    const boxContent = randomString.map((char,index) => {
      if (index === blankIndexes[0]){
        return <span key={index} style={{border:'2px solid black', padding:'5px' ,width: '15px'}}><input style={{width:'20px', height:'20px'}} ref={firstRef} onChange={handleCheckQuestion}/></span>
      }else if (index === blankIndexes[1]){
        return <span key={index} style={{border:'2px solid black', padding:'5px' ,width: '15px'}}><input style={{width:'20px', height:'20px'}} ref={secondRef} onChange={handleCheckQuestion}/></span>
      }else if (index === blankIndexes[2]){
        return <span key={index} style={{border:'2px solid black', padding:'5px' ,width: '15px'}}><input style={{width:'20px', height:'20px'}} ref={thirdRef} onChange={handleCheckQuestion}/></span>
      } else {
        return <span key={index} style={{border:'2px solid black', padding:'5px' ,width: '15px'}}>{char}</span>
      }
    })
    const resetInputs = () => {
      firstRef.current.value = '';
      secondRef.current.value = '';
      thirdRef.current.value = '';
    };
    useEffect(() => {
      if (resetFlag) {
        resetInputs();
        setResetFlag(false);
      }
    }, [resetFlag]);
    return (
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div>{boxContent}</div>
        <Button color='primary' size='small' onClick={handleResetQuestion}>reset</Button>
      </div>
    );
  }
  return (
    <div style={{ paddingTop: '90px', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h2>blanko</h2>
      <BlankoBox/>
    </div>
  );
}
