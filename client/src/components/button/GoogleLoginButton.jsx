// src/components/GoogleLoginButton.jsx
import React, { useEffect, useRef } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleLoginButton = ({ onLogin }) => {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "signin_with",
            shape: "rectangular",
            width: 250,
          });
        } catch (error) {
          console.error("Google Sign-In initialization error:", error);
        }
      }
    };

    // Wait for Google script to load
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      // Clean up interval after 10 seconds
      setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
    }
  }, []);

  const handleCredentialResponse = (response) => {
    if (response.credential) {
      fetch("http://localhost:5000/api/v1/social-auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId: response.credential }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("Login successful:", data);
            onLogin(data);
          } else {
            console.error("Login failed:", data.message);
          }
        })
        .catch((err) => {
          console.error("Login error:", err);
        });
    }
  };

  return <div ref={googleButtonRef} id="googleSignInDiv"></div>;
};

export default GoogleLoginButton;
