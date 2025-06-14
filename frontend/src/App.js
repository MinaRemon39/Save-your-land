import React from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Home from './Components/Home';
import SignPage from './Components/SignPage';
import Forget from './Components/Forget';
import SendLink from './Components/SendLink';
import Update from './Components/Update';
import Done from './Components/Done';
import HomeIn from './Components/HomeIn';
import { Routes, Route } from 'react-router-dom';
import ArticlesPage from './Components/ArticlesPage';
import Profile from './Components/Profile';
import OpenedArticlePage from './Components/OpenedArticlePage';
import EditProfile from './Components/EditProfile';
import PublishArticle from './Components/PublishArticle';
import Chat from './Components/Chat';
import DiseaseDetection from './Components/DiseaseDetection';
import LandS from './Components/Lands';
import ChatBot from './Components/ChatBot';
import PrivateRoute from './Components/PrivateRoute';
import EditPublish from './Components/EditPublish'; 
import Notification from './Components/Notification'; 
import HardwarePurchasePage from './Components/HardwarePurchasePage'; 
import Administrator from './Components/Administrator'; 
import {
  createTheme
} from '@mui/material/styles';
import { ThemeProvider } from './Components/ThemeContext';
import { CssBaseline } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe('pk_test_51RXRENQN84BybSyKaaQVSPflizT1tCFwhrdDpAZEnpyUXpgyz9DHU7ZNvlT4K0lNCsBiZyJqrtpCDcG6OmZ3E8n300W0bxrz1X');
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
function App() {
  return (
    <div className='App'>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Routes>
          <Route path="/update/:reset_id" element={<Update />} />
          <Route path="/" element={<Home />} />
          <Route path="signpage" element={<SignPage />} />
          <Route path="forget" element={<Forget />} />
          <Route path="/sendlink" element={<PrivateRoute><SendLink /></PrivateRoute>} />
          <Route path="/done" element={<PrivateRoute><Done /></PrivateRoute>} />
          <Route path="/homein" element={<PrivateRoute><HomeIn /></PrivateRoute>} />
          <Route path="/articlespage" element={<PrivateRoute><ArticlesPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/articlespage/openedarticlepage/:articleId" element={<PrivateRoute><OpenedArticlePage /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
          <Route path="/publish" element={<PrivateRoute><PublishArticle /></PrivateRoute>} />
          <Route path="/editpublish/:articleId" element={<PrivateRoute><EditPublish /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/disease" element={<PrivateRoute><DiseaseDetection /></PrivateRoute>} />
          <Route path="/chat/lands" element={<PrivateRoute><LandS /></PrivateRoute>} />
          <Route path="/chat/chatbot" element={<PrivateRoute><ChatBot /></PrivateRoute>} />
          <Route path="/notification" element={<PrivateRoute><Notification /></PrivateRoute>} />
          
          
<Route path="/shop" element={
  <Elements stripe={stripePromise}>
    <PrivateRoute>
      <HardwarePurchasePage />
    </PrivateRoute>
  </Elements>
} />
          
          <Route path="/admin" element={<PrivateRoute><Administrator /></PrivateRoute>} />
      </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;

