const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');



// REGISTER
router.post('/register', authController.register);


// LOGIN
router.post('/login', authController.login);


// LOGOUT
router.get('/logout', authController.logout);


// CURRENT USER (Session Based)
router.get('/me', (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.json({
        success: true,
        user: req.session.user
    });

});



module.exports = router;
