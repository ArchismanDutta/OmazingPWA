// src/components/FacebookLoginButton.jsx
import React, { useEffect } from "react";

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

const FacebookLoginButton = ({ onLogin }) => {
  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
    };

    // Load Facebook SDK script
    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  const loginWithFB = () => {
    window.FB.login(
      function (response) {
        if (response.authResponse) {
          const { accessToken, userID } = response.authResponse;

          fetch("http://localhost:5000/api/v1/social-auth/facebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, userID }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                onLogin(data);
              } else {
                console.error("Facebook login failed:", data.message);
              }
            })
            .catch((err) => {
              console.error("Facebook login error:", err);
            });
        }
      },
      { scope: "email" }
    );
  };

  return (
    <button
      onClick={loginWithFB}
      style={{
        backgroundColor: "#1877f2",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Login with Facebook
    </button>
  );
};

export default FacebookLoginButton;
