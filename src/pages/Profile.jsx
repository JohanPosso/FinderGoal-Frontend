import React from "react";
import { useStore } from "../store/useStore";

export default function Profile() {
  const { user } = useStore();

  if (!user)
    return <div className="p-8 text-center">No has iniciado sesión.</div>;

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-primary-light rounded-xl shadow-lg p-6 flex flex-col items-center">
        <img
          src={user.avatar}
          alt="avatar"
          className="w-28 h-28 rounded-full mb-4 border-4 border-accent-light shadow"
        />
        <h2 className="text-3xl font-extrabold text-accent-dark mb-2 text-center">
          {user.name}
        </h2>
        <div className="text-gray-600 mb-2">{user.email}</div>
        <div className="mt-4 text-sm text-gray-500 text-center">
          ¡Listo para jugar fútbol!
        </div>
      </div>
    </div>
  );
}
