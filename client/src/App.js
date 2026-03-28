import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import RightPanel from "./components/RightPanel";

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("insta_username") || "");
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    if (username || hasPromptedRef.current) return;

    hasPromptedRef.current = true;
    const asked = window.prompt("Enter your username") || "";
    const clean = asked.trim();
    if (!clean) return;

    localStorage.setItem("insta_username", clean);
    setUsername(clean);
  }, [username]);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar username={username} />

        <div className="content-area">
          <Routes>
            <Route
              path="/"
              element={
                <div className="main-with-panel">
                  <Feed username={username} />
                  <RightPanel />
                </div>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <div className="main-with-panel">
                  <Profile />
                  <RightPanel />
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;