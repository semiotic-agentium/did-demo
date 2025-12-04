import { GoogleOAuthProvider } from '@react-oauth/google';
import MainPage from './pages/MainPage';
import './App.css';
import { GOOGLE_CLIENT_ID } from './config';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <MainPage />
    </GoogleOAuthProvider>
  );
}

export default App;
