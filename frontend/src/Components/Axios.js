import axios from 'axios';

const response = await fetch('http://localhost:8000/api/register/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: signUpInputs.userName,
    email: signUpInputs.email,
    password: signUpInputs.password,
    cpassword: signUpInputs.confirmPassword, 
    phone: signUpInputs.phoneNumber,
    user_type: signUpInputs.userType,
  }),
});

axios.post('http://localhost:8000/api/login/', {
  username: signInInputs.name,
  password: signInInputs.password
})
.then(response => {
  console.log('Success:', response.data);
})
.catch(error => {
  console.log('Error:', error.response ? error.response.data : error.message);
});

export const sendResetLink = async (email) => {
  try {
    const response = await axios.post('http://localhost:8000/api/forgot-password/', {
      email: email,
    });
    console.log('Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};


export const updatePassword = async (resetId, newPassword, confirmPassword) => {
  try {
    const response = await axios.post(`http://localhost:8000/api/reset-password/${resetId}/`, {
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    console.log('Password updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error.response ? error.response.data : error.message);
    throw error;
  }
};