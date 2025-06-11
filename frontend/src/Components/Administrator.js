import React, { useState, useEffect } from 'react';
import NavbarWithNotification from './NavbarWithNotification';
import { useNavigate } from 'react-router-dom';
import InputField from './InputField';
import { useTranslation } from 'react-i18next'; 

export default function Administrator() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(null);

  const [signUpInputs, setSignUpInputs] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    userType: 'administrator',
  });

  const [passwordStrength, setPasswordStrength] = useState({
    strength: '',
    color: 'black',
  });

  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    //console.log('user from localStorage:', user);

    if (!user || user.user_type !== "administrator") {
     alert(`${t("adminSignUp.accessDeniedTitle")}\n${t("adminSignUp.accessDeniedMessage")}`);

      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (authorized === false) {
      navigate('/homein');
    }
  }, [authorized, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (signUpInputs.password !== signUpInputs.confirmPassword) {
      alert(t('adminSignUp.passwordsDoNotMatch'));
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/create-administrator/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(signUpInputs),
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('adminSignUp.savedSuccess'));
        setSignUpInputs({
          userName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
          userType: 'administrator',
        });
      } else {
      alert(data.error || t('adminSignUp.somethingWentWrong'));

      }
    } catch (error) {
      console.error('Error:', error);
      alert(t('adminSignUp.saveFailed'));
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setSignUpInputs((prev) => ({ ...prev, password }));

    let strength = '';
    let color = 'red';
if (password.length > 8 && /[A-Z]/.test(password) && /\d/.test(password)) {
  strength = t('adminSignUp.passwordStrength.strong');
  color = 'green';
} else if (password.length >= 6) {
  strength = t('adminSignUp.passwordStrength.medium');
  color = 'orange';
} else {
  strength = t('adminSignUp.passwordStrength.weak');
  color = 'red';
}


    setPasswordStrength({ strength, color });
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    if (!/^\d*$/.test(phone)) {
      setPhoneError(t('adminSignUp.phoneDigitsOnly'));
    } else {
      setPhoneError('');
    }
    setSignUpInputs((prev) => ({ ...prev, phoneNumber: phone }));
  };

  if (authorized === null) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (authorized === false) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Access Denied. You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div>
      <NavbarWithNotification />
      <div className="container py-5" style={{
        width: "70vw", margin: "60px auto", borderRadius: "15px",
        boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.3)"
      }}>
        <h2 className="text-center mb-4">{t('admin.createTitle')}</h2>
        <form onSubmit={handleSignUp} autoComplete="off"
          className="text-center mx-auto d-flex flex-column justify-content-center align-items-center w-75">
                   <InputField iconClass="fas fa-user" placeholderKey="login.username" value={signUpInputs.userName} onChange={(e) => setSignUpInputs({ ...signUpInputs, userName: e.target.value })} />
          <InputField iconClass="fas fa-envelope" type="email" placeholderKey="login.email" value={signUpInputs.email} onChange={(e) => setSignUpInputs({ ...signUpInputs, email: e.target.value })} />
          <InputField type="password" iconClass="fas fa-lock" placeholderKey="login.password"  autoComplete="new-password" value={signUpInputs.password} onChange={handlePasswordChange} showStrengthBar={true} strength={passwordStrength} />
          <InputField type="password" iconClass="fas fa-lock" placeholderKey="login.confirmPassword" value={signUpInputs.confirmPassword} onChange={(e) => setSignUpInputs({ ...signUpInputs, confirmPassword: e.target.value })} />
          <InputField iconClass="fas fa-phone" type="tel" placeholderKey="login.phone" value={signUpInputs.phoneNumber} onChange={handlePhoneChange} maxLength={11} error={phoneError} />

          <input type="hidden" value={signUpInputs.userType} />

          <button type="submit" className="btn main-btn w-75">
  {t('admin.saveButton')}
</button>

        </form>
      </div>
    </div>
  );
}