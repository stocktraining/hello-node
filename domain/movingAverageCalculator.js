function movingAverageForQuotes(quotes, studyPeriod) {
    // assume quotes come in the order to be averaged
    studyPeriod = studyPeriod >= 1 ? studyPeriod : 1;

    if (!quotes || studyPeriod > quotes.length) { return [];}

    var ma = [];
    var inputs = [];
    var accum = 0;

    var length = quotes.length;
    for (var i = 0; i < length; i++) {
        var input = quotes[i].close();
        accum += input;
        inputs.push(input);
        if (i < studyPeriod - 1) {
            ma[i] = 0;
        } else {
            ma[i] = Math.round(100 * (accum / studyPeriod))/100;
            accum -= inputs[i+1-studyPeriod];
        }
    }

    return ma;
}

exports.movingAverageForQuotes = movingAverageForQuotes;