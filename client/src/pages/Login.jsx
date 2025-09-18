// src/pages/Login.jsx
import GoogleLoginButton from "../components/button/GoogleLoginButton";
// import FacebookLoginButton from "../components/button/FacebookLoginButton";

const Login = () => {
  function handleLogin(data) {
    if (data.success) {
      // Save JWT in localStorage or context
      localStorage.setItem("token", data.token);
      // Redirect or show user profile, etc.
    } else {
      alert(data.message || "Authentication failed.");
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <GoogleLoginButton onLogin={handleLogin} />
      {/* <FacebookLoginButton onLogin={handleLogin} /> */}
    </div>
  );
};

export default Login;
