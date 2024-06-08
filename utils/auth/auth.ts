// utils/auth/auth.ts
import { useState, useEffect } from "react";

type User = {
  id: string;
  email: string;
  username: string;
};

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUserFromStorage = () => {
    const userCookie = localStorage.getItem("access_token");
    if (userCookie) {
      try {
        const base64Url = userCookie.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const parsedUser = JSON.parse(jsonPayload);
        setUser({
          id: parsedUser.id,
          email: parsedUser.email,
          username: parsedUser.username,
        });
      } catch (error) {
        console.log("Error Parsing Token", error);
      }
    }
  };

  useEffect(() => {
    fetchUserFromStorage();
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return { user, logout };
};

export default useAuth;