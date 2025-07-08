import React from "react";
import { FaFutbol, FaRunning, FaTshirt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion for subtle hover effects

// Re-using the color configuration from the Sporty & Energetic landing page
const colorsSporty = {
  primaryBg: "bg-gray-950", // Even darker for footer base
  secondaryBg: "bg-gray-800",
  primaryText: "text-white",
  secondaryText: "text-gray-300",
  accentLime: "bg-lime-500 text-gray-900", // Verde lima brillante
  accentLimeHover: "bg-lime-400",
  accentOrange: "bg-orange-500 text-white", // Naranja intenso
  accentOrangeHover: "bg-orange-600",
  cardBg: "bg-gray-800",
  cardBorder: "border-gray-700",
  iconBg: "bg-lime-600",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const FooterLink = ({ to, children }) => (
    <motion.li
      whileHover={{
        x: 5,
        color: colorsSporty.accentLime.split(" ")[0].replace("bg-", "text-"),
      }} // Extracts text color from accentLime
      className="text-gray-400 hover:text-lime-400 transition-all duration-200"
    >
      <Link to={to}>{children}</Link>
    </motion.li>
  );

  return (
    <footer
      className={`${colorsSporty.primaryBg} ${colorsSporty.primaryText} py-16 px-6 border-t border-gray-800`}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* About Section */}
        <div>
          <div className="flex items-center mb-5">
            <img
              src="/dark_logo.webp"
              alt="FinderGoal Logo"
              className="w-12 h-12  mb-4 drop-shadow-lg rounded-full "
              draggable={false}
            />
            <span className="text-2xl font-extrabold text-white">
              FinderGoal
            </span>
          </div>
          <p className="text-gray-400 text-base leading-relaxed">
            Conectamos la pasión por el fútbol. Encuentra tu partido, forma tu
            equipo y vive cada gol con la comunidad más vibrante.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-xl mb-6 text-lime-400 uppercase tracking-wider md:hidden">
            Enlaces Rápidos
          </h3>
          <h4 className="font-bold text-xl mb-6 text-lime-400 uppercase tracking-wider hidden md:block">
            Enlaces Rápidos
          </h4>
          <ul className="space-y-3">
            <FooterLink to="/">Inicio</FooterLink>
            <FooterLink to="/matches">Partidos</FooterLink>
            <FooterLink to="/fields">Canchas</FooterLink>
            <FooterLink to="/premium">Premium</FooterLink>
          </ul>
        </div>

        {/* Legal Section */}
        <div>
          <h3 className="font-bold text-xl mb-6 text-lime-400 uppercase tracking-wider md:hidden">
            Legal
          </h3>
          <h4 className="font-bold text-xl mb-6 text-lime-400 uppercase tracking-wider hidden md:block">
            Legal
          </h4>
          <ul className="space-y-3">
            <FooterLink to="/terms">Términos de Servicio</FooterLink>
            <FooterLink to="/privacy">Política de Privacidad</FooterLink>
            <FooterLink to="/cookies">Política de Cookies</FooterLink>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="font-bold text-xl mb-6 text-lime-400 uppercase tracking-wider md:hidden">
            Contáctanos
          </h3>
          <h4 className="font-bold text-xl mb-6 text-lime-400 uppercase tracking-wider hidden md:block">
            Contáctanos
          </h4>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center">
              <span className="mr-2 text-lime-500 text-lg">📧</span>{" "}
              info@findergoal.com
            </li>
            {/* <li className="flex items-center">
              <span className="mr-2 text-lime-500 text-lg">📞</span> +34 123 456 789
            </li> */}
            <li className="flex items-center">
              <span className="mr-2 text-lime-500 text-lg">📍</span> Valladolid,
              España
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-500 text-sm">
        © {currentYear} FinderGoal. Todos los derechos reservados. Diseñado
        para campeones.
      </div>
    </footer>
  );
}
