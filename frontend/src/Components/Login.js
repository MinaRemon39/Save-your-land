import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import InputField from './InputField';

export default function Login() {
  const { t } = useTranslation();
  const [signInInputs, setSignInInputs] = useState({
    name: '',
    password: '',
  });

  const [signUpInputs, setSignUpInputs] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    userType: 'user',
    Link: '',
  });
  
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);  // Added state for tracking sign-up success

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setSignUpInputs({ ...signUpInputs, password: newPassword });
if (newPassword === '') {
  setPasswordStrength({ strength: '', color: '' });
  return;
}

    let strength = 'Weak';
    let color = 'red';

    if (newPassword.length >= 12) {
      strength = 'Medium';
      color = 'orange';
    }
    if (
      newPassword.match(/[A-Z]/) &&
      newPassword.match(/[0-9]/) &&
      newPassword.match(/[^A-Za-z0-9]/)
    ) {
      strength = 'Strong';
      color = 'green';
    }

    setPasswordStrength({ strength, color });
  };


  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setSignUpInputs({ ...signUpInputs, phoneNumber: newPhone });
  
    const phoneRegex = /^[0-9]{11}$/;
    const isValid = phoneRegex.test(newPhone);
  
    if (!isValid) {
      setPhoneError('Phone number must be exactly 11 digits.');
    } else {
      t('login.phoneError')
    }
  };

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signInInputs.name,
          password: signInInputs.password,
        }),
        credentials: 'include', 
      });
  
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Server returned non-JSON response");
      }
  
      if (response.ok) {
        //console.log("Login successful", data);
        
        localStorage.setItem('token', data.token);  // Save token
        localStorage.setItem('user_type', data.user_type);  // Save user type
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('user_name', signInInputs.name); 

        localStorage.setItem('user', JSON.stringify(data));

                                                                                                                                                
        navigate('/homein');  // Redirect to home page after login
      } else {
        if (data.error === 'Invalid username or password') {
      alert(t('login.invalidCredentials'));
    } else {
      alert(t('login.generalError') + data.error);
    }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Something went wrong!");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
  
    const phoneRegex = /^[0-9]{11}$/;
    const isPhoneValid = phoneRegex.test(signUpInputs.phoneNumber);
  
    if (!signUpInputs.phoneNumber) {
      alert(t('login.enterPhone'))
      return;
    }
  
    if (!isPhoneValid) {
      alert(t('login.invalidPhone'))
      return;
    }
  
    if (signUpInputs.password !== signUpInputs.confirmPassword) {
      alert(t('login.passwordMismatch'))
    } else if (signUpInputs.password.length < 6) {
      alert(t('login.passwordShort'))
    } else {
      try {
        const payload = {
            username: signUpInputs.userName,
            email: signUpInputs.email,
            password: signUpInputs.password,
            cpassword: signUpInputs.confirmPassword,
            phone: signUpInputs.phoneNumber,
            user_type: signUpInputs.userType,
};


if (signUpInputs.userType === 'publisher') {
  if (!signUpInputs.Link) {
    alert("Please provide a valid article link for publisher registration.");
    return;
  }
  payload.article_link = signUpInputs.Link;
}
        const response = await fetch('http://127.0.0.1:8000/api/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (response.ok) {
          const data = await response.json();
          if (signUpInputs.userType === 'publisher') {
  alert(t('login.publisherWait'));
} else {
  alert(t('login.signUpSuccess'));
  setIsSignUpSuccess(true);
}
          setSignUpInputs({
            userName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            userType: 'user',
            Link: '',
          });
            
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Unknown error occurred';
          if (errorMessage === 'Username already exists.') {
          alert(t('login.usernameExists'));
        } else if (errorMessage === 'Email already in use.') {
          alert(t('login.emailExists'));
        } else if (errorMessage === 'An application with this email or username already exists for publisher.') {
          alert(t('login.publisherExists'));
        } else {
          alert(t('login.signUpError') + errorMessage);
        }
        }
      } catch (error) {
        alert(t('login.signUpError') + error.message);
      }
    }
  };


  useEffect(() => {
    const signInBtn = document.querySelector('#sign-in-btn');
    const signUpBtn = document.querySelector('#sign-up-btn');
    const container = document.querySelector('.containeer');

    if (signUpBtn && container) {
      signUpBtn.addEventListener('click', () => {
        container.classList.add('sign-up-mode');
      });
    }

    if (signInBtn && container) {
      signInBtn.addEventListener('click', () => {
        container.classList.remove('sign-up-mode');
      });
    }

    // Automatically switch to sign-in mode after successful sign-up
    if (isSignUpSuccess && container) {
      container.classList.remove('sign-up-mode');
    }

    return () => {
      if (signUpBtn) signUpBtn.removeEventListener('click', () => {});
      if (signInBtn) signInBtn.removeEventListener('click', () => {});
    };
  }, [isSignUpSuccess]);  // Add isSignUpSuccess as dependency

  const handleLinkChange = (e) => {
    const value = e.target.value;
    setSignUpInputs({ ...signUpInputs, Link: value });
  
    const isValidUrl = /^https?:\/\/.+$/.test(value);
    if (!isValidUrl) {
      setLinkError('Please enter a valid link starting with http:// or https://');
    } else {
      t('login.linkError')
    }
  };
  
  const [linkError, setLinkError] = useState('');
  
  return (
<div className="containeer ">
      <div className="signin-signup">
        <form className="sign-in-form" onSubmit={handleSignIn} autoComplete="off">
          <h2 className="title">{t("login.signInTitle")}</h2>
          <InputField
            type="text"
            iconClass="fas fa-user"
            placeholderKey="login.username"
            value={signInInputs.name}
            onChange={(e) => setSignInInputs({ ...signInInputs, name: e.target.value })}
          />
          <InputField
            autoComplete="new-password"
            type="password"
            iconClass="fas fa-lock"
            placeholderKey="login.password"
            value={signInInputs.password}
            onChange={(e) => setSignInInputs({ ...signInInputs, password: e.target.value })}
          />
          <Link to="/forget" className="forgot" style={{ textDecoration: 'none' }}>{t("login.forgotPassword")}</Link>
          <div className="bttn d-flex gap-2">
            <button
              type="submit"
              className={!signInInputs.name || !signInInputs.password ? 'disabled' : 'but'}
              disabled={!signInInputs.name || !signInInputs.password}
            >{t("login.signInTitle")}</button>
          </div>
          <p className="account-text">
            {t("login.noAccount")}{" "}
            <a
              href="#"
              id="sign-up-btn2"
              onClick={(e) => {
                e.preventDefault(); 
                document.querySelector('.containeer')?.classList.add('sign-up-mode2');
              }}
            >
              {t("login.signUp")}
            </a>
          </p>
        </form>

        {/* Sign Up Form */}
        <form className="sign-up-form" onSubmit={handleSignUp} autoComplete="off">
          <h2 className="title">{t("login.signUpTitle")}</h2>
          <InputField iconClass="fas fa-user" placeholderKey="login.username" value={signUpInputs.userName} autoComplete="new-password" onChange={(e) => setSignUpInputs({ ...signUpInputs, userName: e.target.value })} />
          <InputField iconClass="fas fa-envelope" type="email" placeholderKey="login.email" value={signUpInputs.email} onChange={(e) => setSignUpInputs({ ...signUpInputs, email: e.target.value })} />
          <InputField type="password" iconClass="fas fa-lock" placeholderKey="login.password" value={signUpInputs.password} autoComplete="new-password" onChange={handlePasswordChange} 
            />
          
<InputField type="password" iconClass="fas fa-lock" placeholderKey="login.confirmPassword" value={signUpInputs.confirmPassword} onChange={(e) => setSignUpInputs({ ...signUpInputs, confirmPassword: e.target.value })} />
          <InputField iconClass="fas fa-phone" type="tel" placeholderKey="login.phone" value={signUpInputs.phoneNumber} onChange={handlePhoneChange} maxLength={11} error={phoneError} />
{signUpInputs.userType === 'publisher' && (
  <InputField
    type="url"
    iconClass="fas fa-link"
    placeholderKey="login.link"
    value={signUpInputs.Link}
    onChange={handleLinkChange}
    error={linkError}
    pattern="https?://.+"
  />
)}

<div className="bttn d-flex gap-2">
  <input
    type="hidden"
    name="user_type"
    id="user_type"
    value={signUpInputs.userType}
  />


            <button type="submit" name="signup" className="but" onClick={() => setSignUpInputs({ ...signUpInputs, userType: 'user' })}>{t("login.signUpUser")}</button>
            <button type="submit" name="signup" className="but" onClick={() => setSignUpInputs({ ...signUpInputs, userType: 'publisher' })}>{t("login.signUpPublisher")}</button>
          </div>
          <p className="account-text">{t("login.haveAccount")}
              <a href="#signin" id="sign-in-btn2" onClick={() => {
              document.querySelector('.containeer')?.classList.remove('sign-up-mode2');}}>
            {t("login.signIn")}
            </a>
          </p>
        </form>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>{t("panels.welcome")}</h3>
            <p>{t("panels.signUpMessage")}</p>
            <button className="but" id="sign-in-btn">{t("login.signIn")}</button>
          </div>
          <img src="/images/signin.svg" alt="" className="image" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>{t("panels.welcome")}</h3>
            <p>{t("panels.signInMessage")}</p>
            <button className="but" id="sign-up-btn">{t("login.signUp")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
