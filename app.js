const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/moneyTrackerDB', { useNewUrlParser: true, useUnifiedTopology: true });

const transactionSchema = new mongoose.Schema({
    text: String,
    amount: Number,
    date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.get('/', async (req, res) => {
    const transactions = await Transaction.find({});
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    const balance = income + expense;
    res.render('index', { transactions, income, expense, balance });
});

app.get('/add-transaction', (req, res) => {
    res.render('add-transaction');
});

app.post('/add-transaction', async (req, res) => {
    const { text, amount } = req.body;
    const transaction = new Transaction({ text, amount: parseFloat(amount) });
    await transaction.save();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
