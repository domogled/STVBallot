function STV() {
}

STV.aggregatePile = function(pile) {
    var ap = {};
    var ballots = pile.ballots;
    for (var i = 0; i < ballots.length; i++) {
        var ballot = ballots[i];
        var key;
        if (ballot.invalid) {
            key = '_invalid';
        }
        else if (ballot.empty) {
            key = '_empty';
        }
        else {
            key = ballot.entries.join(':');
        }
        if (ap[key] == undefined) ap[key] = 0;
        ap[key] += 1;
    }
    return ap;
}

STV.prototype.validate = function(ballot) {
    if (ballot.invalid || ballot.empty) return "";    
    var last = 0;
    var sorted = ballot.entries.sort();
    for (var i = 0; i < sorted.length; i++) {
        var e = sorted[i];
        if (e) {
            if (e != ++last) return e > last ? 'Chybí pořadí: ' + last : 'Duplicitní pořadí: ' + e;           
        }
    }
    return "ok";
}

STV.prototype.crosscheck = function(pileGroup) {
    var piles = pileGroup.piles;
    var aggregatedPiles = [];
    for (var i = 0; i < piles.length; i++) {
        aggregatedPiles.push(STV.aggregatePile(piles[i]));
    }
    var first = aggregatedPiles[0];
    var firstkeys = Object.keys(first).sort();
    for (var i = 1; i < aggregatedPiles.length; i++) {
        var ipile = aggregatedPiles[i];
        var ikeys = Object.keys(ipile).sort();
        if (ikeys.length != firstkeys.length) return {status: "error", message: "length mismatch"};
        for (var j = 0; j < firstkeys.length; j++) {
            var key = firstkeys[j];
            if (key != ikeys[j]) return {status: "error", message: "Expected " + key};
            if (first[key] != ipile[key]) return {status: "error", message: "Mismatch in " + key};
        }
    }
    return {status: "ok", message: "ok"};
}
