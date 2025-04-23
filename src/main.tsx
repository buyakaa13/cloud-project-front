import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './Home';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_API_AUTHORITY,
  client_id: import.meta.env.VITE_API_CLIENT_ID,
  redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email aws.cognito.signin.user.admin',
  loadUserInfo: true,
  automaticSilentRenew: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

console.log("config: " + JSON.stringify(cognitoAuthConfig));

createRoot(document.getElementById('root')!).render(
  <AuthProvider {...cognitoAuthConfig}>  
      <BrowserRouter>
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/signup" element={<Signup />} /> */}
          {/* <Route path="/home" element={<Home />} /> */}
          <Route
            path="/"
            element={
                <Home />
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
)
