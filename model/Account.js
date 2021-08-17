const mongoose = require('mongoose');
const {Schema} = mongoose;

const accountSchema = new Schema({
    username: String,
    password: String,

    lastAuthentication: Date,//마지막 인증 날짜
});

mongoose.model('accounts', accountSchema);