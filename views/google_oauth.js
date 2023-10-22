// Middleware function for authentication


const checkAuthentication = (req, res, next) => {
  if (req.cookies.user === 'authenticated') {
      return next(); // User is authenticated, proceed to the next middleware
  } else {
      res.redirect('/auth/google'); // User is not authenticated, redirect to login
  }
};



export {checkAuthentication};