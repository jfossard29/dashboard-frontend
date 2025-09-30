import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import ForumPage from "./pages/ForumPage";
import DetailPage from "./pages/DetailPage";
import Sidebar from "./components/Sidebar";
import { charactersMock, serversMock } from "./data/characters";
import Navbar from "./components/Navbar";
import ItemsManagementPage from "./pages/ItemsManagementPage";
import ConfigurationPage from "./pages/ConfigurationPage";
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [characters, setCharacters] = useState(charactersMock);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage("forum");
  };

  if (!isAuthenticated) return <LoginPage handleLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar servers={serversMock} />
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage}/>
      <div className="flex flex-col flex-1">
        {currentPage === "forum" && (
          <ForumPage
            characters={characters}
            onSelectCharacter={(c) => {
              setSelectedCharacter(c);
              setCurrentPage("detail");
            }}
          />
        )}
        {currentPage === "detail" && (
          <DetailPage
            character={selectedCharacter}
            onBack={() => setCurrentPage("forum")}
          />
        )}
        {currentPage === "objets" && (
          <ItemsManagementPage
            onBack={() => setCurrentPage("forum")}
          />
        )}
        {currentPage === "configuration" && (
          <ConfigurationPage
            onBack={() => setCurrentPage("forum")}
          />
        )}
      </div>
    </div>
  );
};

export default App;
