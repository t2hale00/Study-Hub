
const { sign, verify } = require('jsonwebtoken');
//Defina a secret key to sign the JWT token
const SECRET_JWT_KEY ='secret12345!!!!!';
//Function ot generate a JWT token
const createToken = (username) => {
    //Generate JWT with jsonwebtoken.sign method
    const token = sign({ username: username }, SECRET_JWT_KEY,
        { expiresIn: "1week"});
        //Return the token
        return token;
};// Function to verify a JWT token
const verifyToken = (req, res, next) => {
  // Get the token from the request
  const accessToken = req.cookies.token;
  if (!accessToken) {
    // If there is no token, return an error
    return res.status(401).send("Access denied!");
  }
  // We have the token -> check if it's valid
  try {
    // Verify the token
    const validToken = verify(accessToken, SECRET_JWT_KEY);
    // If the token is valid, call next() to continue
    if (validToken) {
      next();
    }
  } catch (error) {
    // If the token is not valid, return an error
    return res.status(401).send("Access denied!");
  }

  console.log(accessToken);
};

// Export the functions so that they can be used in other files
module.exports = { createToken, verifyToken };
