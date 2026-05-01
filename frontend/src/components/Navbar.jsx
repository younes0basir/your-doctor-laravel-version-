import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, userType, userData, logout } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm py-2' : 'bg-white py-4'}`}>
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center">
            <img
              className="h-10"
              src={assets.logo_L}
              alt="Logo"
            />
            <span className="ml-2 text-xl font-bold text-gray-600 hidden sm:block">YOUR DOCTOR</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-4 py-2.5 rounded-md font-medium text-sm transition-all ${isActive ? 'text-[#ff5a5f]' : 'text-gray-600 hover:text-[#ff5a5f]'}`
              }
            >
              ACCUEIL
            </NavLink>
            <NavLink 
              to="/doctors" 
              className={({ isActive }) => 
                `px-4 py-2.5 rounded-md font-medium text-sm transition-all ${isActive ? 'text-[#ff5a5f]' : 'text-gray-600 hover:text-[#ff5a5f]'}`
              }
            >
              MÉDECINS
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `px-4 py-2.5 rounded-md font-medium text-sm transition-all ${isActive ? 'text-[#ff5a5f]' : 'text-gray-600 hover:text-[#ff5a5f]'}`
              }
            >
              À PROPOS
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `px-4 py-2.5 rounded-md font-medium text-sm transition-all ${isActive ? 'text-[#ff5a5f]' : 'text-gray-600 hover:text-[#ff5a5f]'}`
              }
            >
              CONTACT
            </NavLink>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {token ? (
              // Logged in user menu
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#ff5a5f] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userData?.full_name?.charAt(0) || userType?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {userData?.full_name || userType}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{userData?.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{userType}</p>
                    </div>
                    
                    {userType === 'patient' && (
                      <>
                        <NavLink
                          to="/my-appointments"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Mes Rendez-vous
                        </NavLink>
                        <NavLink
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Mon Profil
                        </NavLink>
                      </>
                    )}
                    
                    {userType === 'doctor' && (
                      <>
                        <NavLink
                          to="/doctor/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Tableau de Bord
                        </NavLink>
                        <NavLink
                          to="/doctor/appointments"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Mes Rendez-vous
                        </NavLink>
                      </>
                    )}
                    
                    {userType === 'admin' && (
                      <>
                        <NavLink
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Administration
                        </NavLink>
                      </>
                    )}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in - show login and register buttons
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2.5 text-[#ff5a5f] hover:bg-[#ff5a5f]/10 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
                >
                  Inscription
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2.5 bg-[#ff5a5f] hover:bg-[#e04a50] text-white text-sm font-medium rounded-md transition-colors shadow-sm hover:shadow-md flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Connexion
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(true)}
              className="md:hidden p-2 -mr-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${showMenu ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={() => setShowMenu(false)}
      ></div>

      {/* Mobile Menu Content */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center">
            <img src={assets.logo_L} className="h-7" alt="Logo" />
            <span className="ml-2 text-lg font-bold text-[#1a1a1a]">MedConnect</span>
          </div>
          <button
            onClick={() => setShowMenu(false)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-5 h-[calc(100%-68px)] overflow-y-auto">
          <div className="flex flex-col h-full">
            <nav className="flex flex-col gap-1 mb-6">
              <NavLink 
                onClick={() => setShowMenu(false)}
                to="/" 
                className={({ isActive }) => 
                  `px-4 py-3 rounded-md font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                ACCUEIL
              </NavLink>
              <NavLink 
                onClick={() => setShowMenu(false)}
                to="/doctors" 
                className={({ isActive }) => 
                  `px-4 py-3 rounded-md font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                MÉDECINS
              </NavLink>
              <NavLink 
                onClick={() => setShowMenu(false)}
                to="/about" 
                className={({ isActive }) => 
                  `px-4 py-3 rounded-md font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                À PROPOS
              </NavLink>
              <NavLink 
                onClick={() => setShowMenu(false)}
                to="/contact" 
                className={({ isActive }) => 
                  `px-4 py-3 rounded-md font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                CONTACT
              </NavLink>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
              {token ? (
                // Logged in user options
                <div className="space-y-2">
                  <div className="px-4 py-3 bg-gray-50 rounded-md mb-3">
                    <p className="text-sm font-semibold text-gray-800">{userData?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{userType}</p>
                  </div>
                  
                  {userType === 'patient' && (
                    <>
                      <NavLink
                        onClick={() => setShowMenu(false)}
                        to="/my-appointments"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        Mes Rendez-vous
                      </NavLink>
                      <NavLink
                        onClick={() => setShowMenu(false)}
                        to="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        Mon Profil
                      </NavLink>
                    </>
                  )}
                  
                  {userType === 'doctor' && (
                    <>
                      <NavLink
                        onClick={() => setShowMenu(false)}
                        to="/doctor/dashboard"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        Tableau de Bord
                      </NavLink>
                      <NavLink
                        onClick={() => setShowMenu(false)}
                        to="/doctor/appointments"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        Mes Rendez-vous
                      </NavLink>
                    </>
                  )}
                  
                  {userType === 'admin' && (
                    <NavLink
                      onClick={() => setShowMenu(false)}
                      to="/admin"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Administration
                    </NavLink>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md text-left flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              ) : (
                // Not logged in - show login/register buttons
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 bg-[#ff5a5f] hover:bg-[#e04a50] text-white font-medium rounded-md transition-colors shadow-sm flex items-center justify-center gap-2 mb-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 border-2 border-[#ff5a5f] text-[#ff5a5f] hover:bg-[#ff5a5f] hover:text-white font-medium rounded-md transition-all flex items-center justify-center gap-2"
                  >
                    Inscription
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;