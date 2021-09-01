const mongoose = require('mongoose');
const Account = mongoose.model('accounts');

const argon2i = require('argon2-ffi').argon2i;
const crypto = require('crypto');

module.exports = app => {
    //Routes
    app.post('/account/login', async(req, res) => {

        var response = {};

        const { rUsername, rPassword } = req.body;
        if(rUsername == null || rPassword == null)
        {
            response.code = 1;
            response.msg = "Invalid credentials";
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({ username: rUsername}, 'username adminFlag password');
        console.log(userAccount);
        if(userAccount != null){
           argon2i.verify(userAccount.password, rPassword).then(async (success) => {
                if(success){
                    userAccount.lastAuthentication = Date.now();
                    await userAccount.save();

                    response.code = 0;
                    response.msg = "Account found";
                    response.data = ( ({ username, adminFlag }) => ({ username, adminFlag }) )(userAccount);
                    res.send(response);

                    return;
                }
                else{
                    response.code = 1;
                    response.msg = "Invalid credentials";
                    res.send(response);
                    return;
                }
           });
        }
        else{
            response.code = 1;
            response.msg = "Invalid credentials";
            res.send(response);
            return;
        }
    });

    app.post('/account/create', async(req, res) => {

        var response = {};

        const { rUsername, rPassword } = req.body;
        if(rUsername == null || rPassword == null)
        {
            response.code = 1;
            response.msg = "Invalid credentials";
            res.send(response);
            return;
        }

        var userAccount = await Account.findOne({ username: rUsername}, '_id');
        if(userAccount == null)
        {
            //Create new Account
            console.log("Create new account...");

            //Generate a unique access tocken
            crypto.randomBytes(32, function(err, salt) {
                if(err){
                    console.log(err);
                }

                argon2i.hash(rPassword, salt).then(async (hash) => {
                    var newAccount = new Account({
                        username : rUsername,
                        password : hash,
                        salt : salt,
        
                        lastAuthentication : Date.now()
                    });
                    await newAccount.save();
                    response.code = 0;
                    response.msg = "Account found";
                    response.data = ( ({ username }) => ({ username }) )(newAccount);
                    res.send(response);
                    return;
                });
            });

        }else {
            response.code = 2;
            response.msg = "Username is already taken";
            res.send(response);
        }

        return;
    });
}