const User = require("../models/UserModel");

const getAll = (req, res) => {
    User.find().then(user => {
        if (!user) {
            return res.status(404).json({
                "message": "User doesn't exist"
            });
        }

        return res.status(200).json({
            user
        });
    }).catch(() => {
        return res.status(404).json({
            "message": "Error while finding user"
        });
    });
}

module.exports = {
    getAll
}