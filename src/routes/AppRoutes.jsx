import { Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import Landing from "../pages/Landing";
import React, { Suspense, lazy } from "react";

const Register = lazy(() => import("../pages/Register"));
const Login = lazy(() => import("../pages/Login"));
const Matches = lazy(() => import("../pages/Matches"));
const MatchDetail = lazy(() => import("../pages/MatchDetail"));
const CreateMatch = lazy(() => import("../pages/CreateMatch"));
const Profile = lazy(() => import("../pages/Profile"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Field = lazy(() => import("../pages/Field"));
const Community = lazy(() => import("../pages/Community"));
const WhatsappParser = lazy(() => import("../pages/WhatsappParser"));
const EmailSettings = lazy(() => import("../pages/EmailSettings"));
const AdminPanel = lazy(() => import("../pages/AdminPanel"));

// Aquí puedes agregar lógica de rutas protegidas si lo deseas

function PrivateRoute({ children }) {
  const { user } = useStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PrivateAdminRoute({ children }) {
  const { user } = useStore();
  if (!user || !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/register" element={
      <Suspense fallback={<div>Cargando...</div>}>
        <Register />
      </Suspense>
    } />
    <Route path="/login" element={
      <Suspense fallback={<div>Cargando...</div>}>
        <Login />
      </Suspense>
    } />
    <Route path="/dashboard" element={
      <PrivateRoute>
        <Suspense fallback={<div>Cargando...</div>}>
          <Dashboard />
        </Suspense>
      </PrivateRoute>
    } />
    <Route path="/fields" element={
      <Suspense fallback={<div>Cargando...</div>}>
        <Field />
      </Suspense>
    } />
    <Route path="/matches" element={
      <Suspense fallback={<div>Cargando...</div>}>
        <Matches />
      </Suspense>
    } />
    <Route path="/whatsapp-parser" element={
      <Suspense fallback={<div>Cargando...</div>}>
        <WhatsappParser />
      </Suspense>
    } />
    <Route path="/matches/:id" element={
      <Suspense fallback={<div>Cargando...</div>}>
        <MatchDetail />
      </Suspense>
    } />
    <Route path="/create-match" element={
      <PrivateRoute>
        <Suspense fallback={<div>Cargando...</div>}>
          <CreateMatch />
        </Suspense>
      </PrivateRoute>
    } />
    <Route path="/community" element={
      <Suspense fallback={<div>Cargando...</div>}>
        <Community />
      </Suspense>
    } />
    <Route path="/profile" element={
      <PrivateRoute>
        <Suspense fallback={<div>Cargando...</div>}>
          <Profile />
        </Suspense>
      </PrivateRoute>
    } />
    <Route path="/email-settings" element={
      <PrivateAdminRoute>
        <Suspense fallback={<div>Cargando...</div>}>
          <EmailSettings />
        </Suspense>
      </PrivateAdminRoute>
    } />
    <Route path="/admin" element={
      <PrivateAdminRoute>
        <Suspense fallback={<div>Cargando...</div>}>
          <AdminPanel />
        </Suspense>
      </PrivateAdminRoute>
    } />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
