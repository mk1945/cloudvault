const express = require('express');
const {
    registerUser,
    loginUser,
    activateUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/activate/:token', activateUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
