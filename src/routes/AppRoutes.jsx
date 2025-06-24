import { Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import Landing from "../pages/Landing";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Matches from "../pages/Matches";
import MatchDetail from "../pages/MatchDetail";
import CreateMatch from "../pages/CreateMatch";
import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import Field from "../pages/Field";
import Community from "../pages/Community";

// Aquí puedes agregar lógica de rutas protegidas si lo deseas

function PrivateRoute({ children }) {
  const { user } = useStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    />
    <Route path="/fields" element={<Field />} />
    <Route path="/matches" element={<Matches />} />
    <Route path="/matches/:id" element={<MatchDetail />} />
    <Route
      path="/create-match"
      element={
        <PrivateRoute>
          <CreateMatch />
        </PrivateRoute>
      }
    />
    <Route path="/community" element={<Community />} />
    <Route
      path="/profile"
      element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
