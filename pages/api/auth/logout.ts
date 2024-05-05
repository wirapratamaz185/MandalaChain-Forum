// pages/api/auth/logout.ts
import { NextApiRequest, NextApiResponse } from "next";
import { setCookie, getCookie } from 'cookies-next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Check if the user is logged in
    const token = getCookie('access_token', { req });

    if (!token) {
      // User is not logged in, return an error response
      return res.status(400).json({ message: 'No user is currently logged in or user has already logged out' });    }

    // Manually clear the session or token based cookie
    setCookie('access_token', '', { req, res, maxAge: -1, path: '/' });

    // Log to console
    console.log('User has logged out');

    // Redirect the user or send a JSON response
    res.status(200).json({ message: 'Logged out successfully' });
  } else {
    // Only POST method allowed
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}