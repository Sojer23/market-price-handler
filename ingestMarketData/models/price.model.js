const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const priceSchema = new Schema({
    data_id: { type: Number, required: true, unique: true },
    currency: { type: String, required: true, enum: ['EUR/USD', 'GBP/USD', 'EUR/JPY'] },
    ask: { type: Number, required: true, set: addComission },
    bid: { type: Number, required: true, set: substractComission },
    timestamp: { type: String, required: true, set: timestampToISODate, default: Date.now() }
}, { _id: false });

//Setters


//Substract
function substractComission(value) {
    return Number(value) - Number((value * 0.01));
}

//Add
function addComission(value) {
    return Number(value) + Number((value * 0.01));
};

//Format Date
function timestampToISODate(value) {
    return new Date(value).toISOString();
}

const Price = mongoose.model('Price', priceSchema);
module.exports = Price;