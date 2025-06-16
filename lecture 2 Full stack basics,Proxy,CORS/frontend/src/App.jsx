import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';
import { useEffect } from 'react';


function App() {
  const [jokes, setjokes] = useState([])
  useEffect(() => {
    axios.get('/api/jokes')
      .then((response) => {
        setjokes(response.data);
      }).catch((error) => {
        console.error("Error fetching jokes:", error);
      }
      );
    // Cleanup function to avoid memory leaks
    return () => {
      setjokes([]);
    }
  }
    , []);
  return (
    <>
      <h1>fullstack devlopment</h1>
      <p>jokes {jokes.length}</p>
      {jokes.map((joke, index) => (
        <div key={joke.id}>
          <h3>{joke.title}</h3>
          <p>{joke.joke}</p>
        </div>
      ))}
    </>
  )
}

export default App
