import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://YOUR-API.onrender.com/leaderboard")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h1>XP Leaderboard</h1>
      <ul>
        {users.map((u, i) => (
          <li key={u.user_id}>
            #{i + 1} {u.username} — {u.xp} XP
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
