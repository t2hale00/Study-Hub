
const { sign, verify } = require('jsonwebtoken');
//Defina a secret key to sign the JWT token
const SECRET_JWT_KEY ='secret12345!!!!!';
//Function ot generate a JWT token
const createToken = (username) => {
    //Generate JWT with jsonwebtoken.sign method
    const token = sign({ username: username }, SECRET_JWT_KEY,
        { expiresIn: "1d"});
        //Return the token
        return token;
}
//Function to verify a JWT token


exports.createToken = createToken;