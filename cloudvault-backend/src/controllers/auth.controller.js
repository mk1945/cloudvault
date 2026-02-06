const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/jwt');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please include all fields' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const user = await User.create({
            username,
            email,
            password,
        });

        // Generate Activation Token
        const activationToken = crypto.randomBytes(20).toString('hex');
        user.verificationToken = crypto
            .createHash('sha256')
            .update(activationToken)
            .digest('hex');
        user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        await user.save();

        // Create Activation URL
        // Example: http://localhost:5173/activate/3b9...
        const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate/${activationToken}`;

        const message = `
            <h1>Activate your account</h1>
            <p>Please go to this link to activate your account:</p>
            <a href=${activationUrl} clicktracking=off>${activationUrl}</a>
        `;

        // Log for development/testing if email fails
        console.log('------------------------------------------');
        console.log('ACTIVATION URL:', activationUrl);
        console.log('------------------------------------------');

        try {
            await sendEmail({
                email: user.email,
                subject: 'CloudVault Account Activation',
                message,
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (error) {
            console.error('Email send failed (Check logs for activation link):', error.message);
            // DO NOT delete the token. Allow manual activation via console log link.
            // user.verificationToken = undefined;
            // user.verificationTokenExpire = undefined;
            // await user.save();

            // Return SUCCESS anyway so UI doesn't hang.
            // The user (admin) can get the link from the logs.
            return res.status(200).json({
                success: true,
                message: 'Email failed to send, but account created. Please check server logs for activation link.'
            });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Activate User
// @route   PUT /api/auth/activate/:token
// @access  Public
const activateUser = async (req, res) => {
    const verificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            verificationToken,
            verificationTokenExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Account activated. You can now login.' }); // Send JSON, handled by frontend
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {

            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please activate your account first. Check your email.' });
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        // Get Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash it and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/resetpassword/${resetToken}`;

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password:</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `;

        // Log for development
        console.log('------------------------------------------');
        console.log('RESET PASSWORD URL:', resetUrl);
        console.log('------------------------------------------');

        try {
            await sendEmail({
                email: user.email,
                subject: 'CloudVault Password Reset Token',
                message,
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            console.error(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(201).json({
            success: true,
            data: 'Password reset success',
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    activateUser,
    forgotPassword,
    resetPassword,
};
