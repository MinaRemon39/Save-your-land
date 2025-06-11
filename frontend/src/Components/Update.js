// import  Container  from 'react-bootstrap/Container';
// export default function Update(){
//     <script>
//     const passwordInput = document.getElementById("password");
//     const strengthText = document.getElementById("password-strength");

//     passwordInput.addEventListener("input", function () {
//         const password = passwordInput.value;
//         let strength = "Weak";
//         let color = "red";

//         if (password.length >= 12) {
//             strength = "Medium";
//             color = "orange";
//         }
//         if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^A-Za-z0-9]/)) {
//             strength = "Strong";
//             color = "green";
//         }

//         strengthText.textContent = `Strength: ${strength}`;
//         strengthText.style.color = color;
//     });
//     document.querySelector("form").addEventListener("submit", function(e) {
//     const password = document.querySelector("input[type='password']");
//     const confirmPassword = document.querySelector("input[name='confirm-password']");

//     if (password.value !== confirmPassword.value) {
//         e.preventDefault();
//         alert("Passwords do not match!");
//     } else if (password.value.length < 12) {
//         e.preventDefault();
//         alert("Password must be at least 12 characters long!");
//     } else {
//             // Redirect to the confirmation page
//             e.preventDefault(); // Prevent default submission to simulate
//             window.location.href = "done.html";
//     }
// });
// </script>
//     function toDone(event){
//         event.preventDefault();
//         window.location.href="/done";
//     }
//     return(
//         <Container className="bg-white py-5" style={{width: "70vw", margin: "60px auto", borderRadius: "15px",
//             boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.3)"
//         }}>
//             <h1 className="text-center mt-3 mb-5 fw-bold">Enter New Password</h1>
//             <form className="text-center mx-auto d-flex justify-content-center align-items-center">
//                 <p className="fs-5 text-black">Hint: the passwor should be at least tweleve characters long.To make it stronger,
//                 use upper and lowwer case letters, numbers and symbols like !*$%&</p>
//                 <h5 className="fw-bold">New Password</h5>
//                 <div className="input-field mb-2">
//                     <input type="password" id="password" required />
//                     <div id="password-strength" class="me-2"></div>
//                 </div>
//                 <h5 className="fw-bold">Confirm New Password</h5>
//                 <div className="input-field ">
//                     <input type="password" name="confirm-password" required />
//                 </div>
//                 <button type="submit" className="btn rounded-pill main-btn text-light mt-5 w-lg-50 w-m-50 w-sm-25 " onClick={toDone}>Submit</button>
//             </form>
//         </Container>
//     );
// }
// <Update />



import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Navigator from './Navigator';
import { useTranslation } from 'react-i18next';
import Footer from "./Footer";
export default function Update() {
       const { t } = useTranslation();
  const { reset_id } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [message, setMessage] = useState("");

  // Password strength checker
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword === '') {
    setPasswordStrength({ strength: '', color: '' });
    return;
  }

    let strength = t("password.strength.weak");
    let color = "red";

    if (newPassword.length >= 6) {
      strength = t("password.strength.medium");
      color = "orange";
    }
    if (
      newPassword.match(/[A-Z]/) &&
      newPassword.match(/[0-9]/) &&
      newPassword.match(/[^A-Za-z0-9]/)
    ) {
      strength = t("password.strength.strong");
      color = "green";
    }

    setPasswordStrength({ strength, color });
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage(t("alertsPass.passwordsDontMatch"));
      return;
    } else if (password.length < 6) {
      setMessage(t("alertsPass.passwordTooShort"));
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/reset-password/${reset_id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
         setMessage(t("alertsPass.passwordUpdated"));
        setTimeout(() => {
          navigate("/done");
        }, 1500);
      } else {
        setMessage(data.error || t("alertsPass.somethingWentWrong"));
      }
    } catch (error) {
      console.error("Error:", error);
       setMessage(t("alerts.serverError"));
    }
  };

  return (
    <diV>

      <Navigator />
      <Container
       className=" py-5"
      style={{
        width: "70vw",
        margin: "60px auto",
        borderRadius: "15px",
        boxShadow:
          "0 4px 20px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.3)",
      }}
    >
      <h1 className="text-center mt-3 mb-5 fw-bold">{t("reset.enterNewPassword")}</h1>
      <form
        className="text-center mx-auto d-flex flex-column justify-content-center align-items-center"
        onSubmit={handleSubmit}
      >


        <h5 className="fw-bold">{t("reset.newPassword")}</h5>
        <div className="input-field mb-2">
<input
  type="password"
  value={password}
  onChange={handlePasswordChange}
  required
  autoComplete="new-password"
/>

        </div>

        <h5 className="fw-bold">{t("reset.confirmPassword")}</h5>
        <div className="input-field">
<input
  type="password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  required
  autoComplete="new-password"
/>
        </div>

        <button
          type="submit"
          className="btn rounded-pill main-btn text-light mt-5 w-lg-50 w-m-50 w-sm-25"
        >
          {t("reset.submit")}
        </button>

        {message && <p className="text-danger mt-3">{message}</p>}
      </form>
    </Container>
    <Footer />
  </diV>
  );
}