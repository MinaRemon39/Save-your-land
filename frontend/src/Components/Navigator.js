import { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Form } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from "react-router-dom";
import Imge_1 from './Images/photo_2024-10-29_21-03-55.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons';
import { useTranslation } from 'react-i18next';
export default function Navigator(){
const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

useEffect(() => {
  if (isDarkMode) {
    document.body.classList.add("dark-theme");
    document.body.classList.remove("light-theme");
  } else {
    document.body.classList.add("light-theme");
    document.body.classList.remove("dark-theme");
  }
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}, [isDarkMode]);


  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

    function loginbtn(event){
        window.location.href ='/signpage';
    }

    const scrollToAbout = () => {
    navigate("/");  
    setTimeout(() => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });  // Scroll to the about section
      }
    }, 100); // Delay to ensure the page loads before scrolling
  };
    return(
        <Navbar expand="lg" className={`navbar ${isDarkMode ? 'navbar-dark' : 'custom-light-navbar'}`}>
          <Container>
            <Navbar.Brand href="#home">
              <img src={Imge_1} width="30" height="30" alt="Logo" />
            </Navbar.Brand>
        
            <Navbar.Toggle aria-controls="main" />
            <Navbar.Collapse id="main" className="flex-lg-row flex-column align-items-start">
              {/* Links */}
<Nav className="custom-nav w-100 me-4 ">
  {i18n.language === 'ar' ? (
    <>
      <Nav.Link onClick={scrollToAbout} className={location.pathname === '/about' ? 'active' : ''}>
        {t('about')}
      </Nav.Link>
      <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''}>
        {t('home')}
      </Nav.Link>
    </>
  ) : (
    <>
      <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''}>
        {t('home')}
      </Nav.Link>
      <Nav.Link onClick={scrollToAbout} className={location.pathname === '/about' ? 'active' : ''}>
        {t('about')}
      </Nav.Link>
    </>
  )}
</Nav>

        
              {/* Icons + logout (stay right on lg, go below on small) */}
              <div className="ms-3 mt-lg-2 d-flex align-items-center ms-lg-auto gap-3 mt-5">
                
                        
            <button
            onClick={toggleTheme}
            className="btn bg-transparent border-0 p-0 theme-icon-btn"
            aria-label="Toggle theme"
          >
            <FontAwesomeIcon
  icon={isDarkMode ? faSun : faMoon}
  className="fs-4"
  style={{ color: isDarkMode ? 'white' : 'black' }}
/>

          </button>

                        <button onClick={loginbtn} className="btn main-btn rounded-pill">
                          {t("loginBtn")}
                        </button>
                
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
}