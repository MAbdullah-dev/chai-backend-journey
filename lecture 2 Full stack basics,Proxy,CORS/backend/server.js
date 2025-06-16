import express from 'express';
const app = express();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.get('/api/jokes',(req,res)=>{
    const jokes =  [
    {
      id: 1,
      title: "Developer Joke",
      joke: "Why do programmers prefer dark mode? Because light attracts bugs!"
    },
    {
      id: 2,
      title: "JavaScript Joke",
      joke: "Why did the JavaScript developer go broke? Because he kept using 'var' when he should have been using 'let'."
    },
    {
      id: 3,
      title: "Backend Joke",
      joke: "I told my backend to get a life, so it responded with 200 OK."
    },
    {
      id: 4,
      title: "Database Joke",
      joke: "Why did the SQL query break up with the database? It had too many relationships."
    },
    {
      id: 5,
      title: "API Joke",
      joke: "I asked an API for a joke, but it just gave me a 404: Joke Not Found."
    }
  ]
    res.json(jokes);
})
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});