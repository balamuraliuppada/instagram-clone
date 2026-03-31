import { useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import RightPanel from "./components/RightPanel";
import Header from "./components/Header";

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("insta_username") || "");
  const [usernameInput, setUsernameInput] = useState("");

  const appDisplayName = useMemo(() => {
    if (!username) return "Guest";
    return username;
  }, [username]);

  const handleStartSession = (event) => {
    event.preventDefault();
    const clean = usernameInput.trim();
    if (!clean) return;

    localStorage.setItem("insta_username", clean);
    setUsername(clean);
    setUsernameInput("");
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        {!username ? (
          <main className="welcome-shell">
            <section className="welcome-card">
              <p className="welcome-kicker">Welcome to InstaClone Pro</p>
              <h1 className="welcome-title">Start your social workspace</h1>
              <p className="welcome-subtitle">
                Pick your username to unlock your feed, profile insights, follows, and live activity.
              </p>

              <form className="welcome-form" onSubmit={handleStartSession}>
                <input
                  className="welcome-input"
                  value={usernameInput}
                  onChange={(event) => setUsernameInput(event.target.value)}
                  placeholder="Choose a username"
                  maxLength={30}
                  required
                />
                <button className="welcome-btn" type="submit">
                  Continue
                </button>
              </form>
            </section>
          </main>
        ) : (
          <>
            <Sidebar username={username} />

            <div className="content-area">
              <Header username={appDisplayName} setUsername={setUsername} />

              <Routes>
                <Route
                  path="/"
                  element={
                    <div className="main-with-panel">
                      <Feed username={username} />
                      <RightPanel username={username} />
                    </div>
                  }
                />
                <Route
                  path="/profile/:username"
                  element={
                    <div className="main-with-panel">
                      <Profile currentUsername={username} />
                      <RightPanel username={username} />
                    </div>
                  }
                />
              </Routes>
            </div>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;