const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
});

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;