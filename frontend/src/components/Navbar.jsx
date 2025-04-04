import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const Navbar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div></div> {/* Placeholder to push menu to the right */}
      
      {/* Dropdown Menu */}
      <div className="relative ml-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          ☰ {isOpen ? <ChevronUp className="ml-2" size={18} /> : <ChevronDown className="ml-2" size={18} />}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-lg rounded-lg py-2">
            <Link
              to="/tv-display"
              className="block px-4 py-2 hover:bg-gray-200"
              onClick={() => setIsOpen(false)}
            >
              TV Display
            </Link>
            <Link
              to="/logout"
              className="block px-4 py-2 text-red-600 hover:bg-gray-200"
              onClick={() => setIsOpen(false)}
            >
              Logout
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
