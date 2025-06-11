// src/Components/NavbarWithNotification.js
// import React, { useState, useEffect } from "react";
// import { Container, Nav, Navbar } from "react-bootstrap";
// import { Link, useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faMoon, faBell } from "@fortawesome/free-regular-svg-icons";
// import Imge_1 from "./Images/photo_2024-10-29_21-03-55.jpg";
// import LogoutButton from "./LogoutButton";
// import { redirectToChatOrLands } from "./redirectToChatOrLands";

// export default function NavbarWithNotification() {
//   const navigate = useNavigate();
//   const userType = localStorage.getItem("user_type");
//   const [isBellClicked, setIsBellClicked] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);

//   const updateUnreadCount = () => {
//     const count = localStorage.getItem("unreadNotifications");
//     setUnreadCount(parseInt(count) || 0);
//   };

// useEffect(() => {
//   const fetchUnreadCount = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const response = await fetch("http://localhost:8000/api/unread-publisher-count/", {
//         headers: {
//           "Authorization": `Token ${token}`,
//         },
//       });
//       const data = await response.json();
//       setUnreadCount(data.unread_count || 0);
//       localStorage.setItem("unreadNotifications", data.unread_count || 0); 
//     } catch (error) {
//       console.error("Failed to fetch unread count", error);
//     }
//   };

//   fetchUnreadCount();
// }, []);

//   const scrollToAbout = () => {
//     navigate("/homein");  // Navigate to the homein page
//     setTimeout(() => {
//       const aboutSection = document.getElementById("about");
//       if (aboutSection) {
//         aboutSection.scrollIntoView({ behavior: "smooth" });  // Scroll to the about section
//       }
//     }, 100); // Delay to ensure the page loads before scrolling
//   };

//   return (
//     <Navbar expand="lg" className="navbar">
//       <Container>
//         <Navbar.Brand href="#home">
//           <img
//             src={Imge_1}
//             width="30"
//             height="30"
//             className="d-inline-block align-top"
//             alt="Logo"
//           />
//         </Navbar.Brand>
//         <Navbar.Toggle className="toggle" aria-controls="main" />
//         <Navbar.Collapse id="main">
//           <Nav className="ms-auto mb-2 mb-lg-0">
//             <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
//               <li className="nav-item">
//                 <Link className="nav-link p-2 p-lg-3" to="/homein">
//                   Home
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <a
//                   className="nav-link p-2 p-lg-3"
//                   onClick={scrollToAbout}
//                   style={{ cursor: "pointer" }}
//                 >
//                   About
//                 </a>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link p-2 p-lg-3" to="/articlespage">
//                   Articles
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link p-2 p-lg-3 " to="/shop">Shop</Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link p-2 p-lg-3" to="/chat" onClick={() => redirectToChatOrLands(navigate)}>
//                   Chat
//                 </Link>
//               </li>
//               <li className="nav-item">
//                 <Link className="nav-link p-2 p-lg-3" to="/disease">
//                   Disease detection
//                 </Link>
//               </li>
//               {userType === "publisher" && (
//                 <li className="nav-item">
//                   <Link className="nav-link p-2 p-lg-3" to="/publish">
//                     Publish
//                   </Link>
//                 </li>
//               )}
//               <li className="nav-item">
//                 <Link className="nav-link p-2 p-lg-3" to="/profile">
//                   Profile
//                 </Link>
//               </li>
//             </ul>
//           </Nav>

//           {/* Notification Button */}
//           <button
//             className="d-none d-lg-block ps-2 pe-3 fs-5 position-relative"
//             style={{
//               cursor: "pointer",
//               color: isBellClicked ? "black" : "#00000080",
//               background: "none",
//               border: "none",
//               padding: 0,
//               fontSize: "inherit",
//             }}
// onClick={() => {
//   setIsBellClicked(true);
//   const token = localStorage.getItem("token");
//   fetch("http://localhost:8000/api/mark-requests-read/", {
//     method: "PATCH",
//     headers: {
//       "Authorization": `Token ${token}`,
//     },
//   })
//     .then(() => {
//       setUnreadCount(0);
//       localStorage.setItem("unreadNotifications", 0);
//       navigate("/notification");
//     })
//     .catch(err => console.error("Failed to mark as read", err));
// }}
//           >
//             <FontAwesomeIcon icon={faBell} />
//             {unreadCount > 0 && (
//               <span
//                 className="position-absolute badge bg-danger"
//                 style={{ fontSize: "0.7rem", top: 0, right: 0 }}
//               >
//                 {unreadCount}
//               </span>
//             )}
//           </button>

//           <a className="d-none d-lg-block ps-3 pe-3 fs-5 text-black" href="/#">
//             <FontAwesomeIcon icon={faMoon} />
//           </a>

//           <LogoutButton />
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// }


import React, { useState, useEffect } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faBell, faSun } from "@fortawesome/free-regular-svg-icons";
import Imge_1 from "./Images/photo_2024-10-29_21-03-55.jpg";
import LogoutButton from "./LogoutButton";
import { redirectToChatOrLands } from "./redirectToChatOrLands";
import { useTranslation } from 'react-i18next';

export default function NavbarWithNotification() {
  const location = useLocation();
  const navigate = useNavigate();
  const userType = localStorage.getItem("user_type");
  const [isBellClicked, setIsBellClicked] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadHardwareCount, setUnreadHardwareCount] = useState(0);
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
      const { i18n, t } = useTranslation();
      const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
      const isRTL = i18n.language === 'ar';

useEffect(() => {
  const fetchUnreadCounts = async () => {
    const token = localStorage.getItem("token");

    try {
      if (userType === "administrator" ) {
        const responsePublisher = await fetch("http://localhost:8000/api/unread-publisher-count/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (responsePublisher.ok) {
          const dataPublisher = await responsePublisher.json();
          setUnreadCount(dataPublisher.unread_count || 0);
          localStorage.setItem("unreadNotifications", dataPublisher.unread_count || 0);
        } else {
          setUnreadCount(0);
        }


        const responseHardware = await fetch("http://localhost:8000/api/unread-hardware-count/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (responseHardware.ok) {
          const dataHardware = await responseHardware.json();
          setUnreadHardwareCount(dataHardware.unread_count || 0);
        } else {
          setUnreadHardwareCount(0);
        }
      } else {
        setUnreadCount(0);
        setUnreadHardwareCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch unread counts", error);
      setUnreadCount(0);
      setUnreadHardwareCount(0);
    }
  };

  fetchUnreadCounts();
}, [userType]);



  const scrollToAbout = () => {
    navigate("/homein"); // Navigate to the homein page
    setTimeout(() => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" }); // Scroll to the about section
      }
    }, 100); // Delay to ensure the page loads before scrolling
  };

  return (
    // <Navbar expand="lg" className="navbar">
    //   <Container>
    //     <Navbar.Brand href="#home">
    //       <img
    //         src={Imge_1}
    //         width="30"
    //         height="30"
    //         className="d-inline-block align-top"
    //         alt="Logo"
    //       />
    //     </Navbar.Brand>
    //     <Navbar.Toggle className="toggle" aria-controls="main" />
    //     <Navbar.Collapse id="main">
    //       <Nav className="ms-auto mb-2 mb-lg-0">
    //         <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
    //           <li className="nav-item">
    //             <Link className={`nav-link p-2 p-lg-3 ${location.pathname === "/homein" ? "active" : ""}`} to="/homein">
    //               Home
    //             </Link>
    //           </li>
    //           <li className="nav-item">
    //             <a
    //               className="nav-link p-2 p-lg-3"
    //               onClick={scrollToAbout} // Use the custom function here
    //             >
    //               About
    //             </a>
    //           </li>
    //           <li className="nav-item">
    //             <Link className={`nav-link p-2 p-lg-3 ${location.pathname === "/articlespage" ? "active" : ""}`} to="/articlespage">
    //               Articles
    //             </Link>
    //           </li>
    //           <li className="nav-item">
    //             <Link className={`nav-link p-2 p-lg-3 ${location.pathname === "/shop" ? "active" : ""}`} to="/shop">
    //               Shop
    //             </Link>
    //           </li>
    //           <li className="nav-item">
    //             <Link className={`nav-link p-2 p-lg-3 ${location.pathname === "/chat" ? "active" : ""}`} to="/chat" onClick={() => redirectToChatOrLands(navigate)}>
    //               Chat
    //             </Link>
    //           </li>
    //           <li className="nav-item">
    //             <Link className={`nav-link p-2 p-lg-3 ${location.pathname === "/disease" ? "active" : ""}`} to="/disease">
    //               Disease detection
    //             </Link>
    //           </li>
    //           {(userType === "publisher" || userType === "administrator") && (
    //             <li className="nav-item">
    //               <Link className={`nav-link p-2 p-lg-3 ${location.pathname === "/publish" ? "active" : ""}`} to="/publish">
    //                 Publish
    //               </Link>
    //             </li>
    //           )}
    //           <li className="nav-item">
    //             <Link className={`nav-link p-2 p-lg-3 ${location.pathname === "/profile" ? "active" : ""}`} to="/profile">
    //               Profile
    //             </Link>
    //           </li>
    //           {userType === "administrator" && (
    //             <li className="nav-item">
    //               <Link className={`nav-link p-2 p-lg-3 ${location.pathname === "/admin" ? "active" : ""}`} to="/admin">
    //                 New Administrator
    //               </Link>
    //             </li>
    //           )}
    //         </ul>
    //       </Nav>

    //       {/* Notification Button */}
    //       {userType === "administrator" && (
    //         <button
    //           className="d-none d-lg-block ps-2 pe-3 fs-5 position-relative"
    //           style={{
    //             cursor: "pointer",
    //             color: isBellClicked ? "black" : "#00000080",
    //             background: "none",
    //             border: "none",
    //             padding: 0,
    //             fontSize: "inherit",
    //           }}
    //           onClick={() => {
    //             setIsBellClicked(true);
    //             const token = localStorage.getItem("token");
    //             fetch("http://localhost:8000/api/mark-requests-read/", {
    //               method: "PATCH",
    //               headers: {
    //                 Authorization: `Token ${token}`,
    //               },
    //             })
    //               .then(() => {
    //                 setUnreadCount(0);
    //                 setUnreadHardwareCount(0);
    //                 localStorage.setItem("unreadNotifications", 0);
    //                 navigate("/notification");
    //               })
    //               .catch((err) => console.error("Failed to mark as read", err));
    //           }}
    //         >
    //           <FontAwesomeIcon icon={faBell} />
    //           {(unreadCount + unreadHardwareCount) > 0 && (
    //             <span
    //               className="position-absolute badge bg-danger"
    //               style={{ fontSize: "0.7rem", top: 0, right: 0 }}
    //             >
    //               {unreadCount + unreadHardwareCount}
    //             </span>
    //           )}
    //         </button>
    //       )}

    //       <a className="d-none d-lg-block ps-3 pe-3 fs-5 text-black" href="/#j">
    //         <FontAwesomeIcon icon={faMoon} />
    //       </a>

    //       <LogoutButton />
    //     </Navbar.Collapse>
    //   </Container>
    // </Navbar>
    <Navbar expand="lg" className={`navbar ${isDarkMode ? 'navbar-dark' : 'custom-light-navbar'}`}>
  <Container>
    <Navbar.Brand href="#home">
      <img src={Imge_1} width="30" height="30" alt="Logo" />
    </Navbar.Brand>

<Navbar.Toggle aria-controls="main" className={isRTL ? 'ms-auto' : ''}
    style={{ zIndex: 1051 }}/>
    <Navbar.Collapse id="main"   className={`flex-lg-row flex-column align-items-start ${isRTL ? 'rtl-collapse' : ''}`}
     >
      {/* Links */}
      <Nav className="custom-nav w-100 me-4">
        <Nav.Link as={Link} to="/homein" className={location.pathname === "/homein" ? "active" : ""}>{t("navbar.home")}</Nav.Link>
        <Nav.Link onClick={scrollToAbout} className={location.pathname === "/about" ? "active" : ""}>{t("navbar.about")}</Nav.Link>
        <Nav.Link as={Link} to="/articlespage" className={location.pathname.startsWith("/articlespage") ? "active" : ""}>{t("navbar.articles")}</Nav.Link>
        <Nav.Link as={Link} to="/shop" className={location.pathname === "/shop" ? "active" : ""}>{t("navbar.shop")}</Nav.Link>
        <Nav.Link as={Link} to="/chat" onClick={() => redirectToChatOrLands(navigate)} className={location.pathname.startsWith( "/chat" ) ? "active" : ""}>{t("navbar.chat")}</Nav.Link>
        <Nav.Link as={Link} to="/disease" className={location.pathname === "/disease" ? "active" : ""}>{t("navbar.disease")}</Nav.Link>
        {(userType === "publisher" || userType === "administrator") && (
          <Nav.Link as={Link} to="/publish" className={location.pathname === "/publish" ? "active" : ""}>{t("navbar.publish")}</Nav.Link>
        )}
        <Nav.Link as={Link} to="/profile" className={location.pathname.startsWith('/profile')  ? "active" : ""}>{t("navbar.profile")}</Nav.Link>
        {userType === "administrator" && (
          <Nav.Link as={Link} to="/admin" className={location.pathname === "/admin" ? "active" : ""}>{t("navbar.admin")}</Nav.Link>
        )}
      </Nav>

      {/* Icons + logout (stay right on lg, go below on small) */}
      <div className="ms-3 mt-lg-2 d-flex align-items-center ms-lg-auto gap-3">
        {/* Notification icon */}
        {/* {userType === "administrator" && (
          <button
            className="position-relative bg-transparent border-0 fs-5"
            style={{ color: isBellClicked ? "black" : "#00000080" }}
            onClick={() => {
              setIsBellClicked(true);
              const token = localStorage.getItem("token");
              fetch("http://localhost:8000/api/mark-requests-read/", {
                method: "PATCH",
                headers: {
                  Authorization: `Token ${token}`,
                },
              })
                .then(() => {
                  setUnreadCount(0);
                  localStorage.setItem("unreadNotifications", 0);
                  navigate("/notification");
                })
                .catch(err => console.error("Failed to mark as read", err));
            }}
          >
            <FontAwesomeIcon icon={faBell} />
            {unreadCount > 0 && (
              <span className="position-absolute badge bg-danger" style={{ fontSize: "0.7rem", top:0, right: 0 }}>
                {unreadCount}
              </span>
            )}
          </button>
        )} */}
                {/* Notification icon */}

           {userType === "administrator" && (
            <button
              className="position-relative bg-transparent border-0 fs-5"
style={{ color: isDarkMode ? 'white' : 'black' }}
              onClick={() => {
                setIsBellClicked(true);
                const token = localStorage.getItem("token");
                fetch("http://localhost:8000/api/mark-requests-read/", {
                  method: "PATCH",
                  headers: {
                    Authorization: `Token ${token}`,
                  },
                })
                  .then(() => {
                    setUnreadCount(0);
                    setUnreadHardwareCount(0);
                    localStorage.setItem("unreadNotifications", 0);
                    navigate("/notification");
                  })
                  .catch((err) => console.error("Failed to mark as read", err));
              }}
            >
              <FontAwesomeIcon icon={faBell} />
              {(unreadCount + unreadHardwareCount) > 0 && (
<span className="position-absolute badge bg-danger" style={{ fontSize: "0.7rem", top:0, right: 0 }}>
                  {unreadCount + unreadHardwareCount}
                </span>
              )}
            </button>
          )}

        {/* Moon icon */}
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

        {/* Logout Button */}
        <LogoutButton />
      </div>
    </Navbar.Collapse>
  </Container>
</Navbar>
  );
}

