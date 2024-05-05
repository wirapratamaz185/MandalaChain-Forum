// components/Navbar/RightContent/LogOutButton.tsx
import { Button } from "@chakra-ui/react";
import React from "react";

/**
 * Displays a log out button which signs out the currently logged in user.
 * @returns {React.FC} - Log out button
 */
const LogOutButton: React.FC = () => {

  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Making a POST request to the logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      // Handle response here if needed
      if (response.ok) {
        // Optionally do a window reload or redirect to home page etc.
        window.location.href = '/';
      } else {
        // Handle error (show message or toast if needed)
        console.error('Failed to log out');
      }
    } catch (error) {
      // Handle error (e.g., display a notification or toast)
      console.error('Error logging out:', error);
    }
  };

  return (
    <Button
      height="28px"
      display={{ base: "none", md: "flex" }} // on mobile, this button is not displayed
      width={{ base: "70px", md: "110px" }} // on mobile the width is 70px, on desktop 110px
      mr={2}
      ml={2}
      onClick={handleLogout}
    >
      Log Out
    </Button>
  );
};

export default LogOutButton;