const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route to update admin profile
router.put('/update-profile/:user_id', (req, res) => {
    const { username, email, role } = req.body;
    const userId = req.params.user_id;
    const query = 'UPDATE users SET username = ?, email = ?, role = ? WHERE user_id = ?';

    db.query(query, [username, email, role,userId], (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.status(500).json({ error: 'Failed to update profile' });
        }
        res.json({ message: 'Profile updated successfully' });
    });
});

module.exports = router;
