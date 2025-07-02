import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import EmailNotification from "./components/EmailNotification";
import "./App.css";

function App() {
  const [emailNotification, setEmailNotification] = useState({
    isVisible: false,
    message: "",
    type: "success"
  });

  const showEmailNotification = (message, type = "success") => {
    setEmailNotification({
      isVisible: true,
      message,
      type
    });
  };

  const hideEmailNotification = () => {
    setEmailNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <AppRoutes />
        <Footer />
        
        {/* Notificación de correos */}
        <EmailNotification
          message={emailNotification.message}
          type={emailNotification.type}
          isVisible={emailNotification.isVisible}
          onClose={hideEmailNotification}
          autoClose={true}
          duration={5000}
        />
      </div>
    </Router>
  );
}

export default App;
