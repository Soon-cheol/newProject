(function () {
    var idx = util_o.getQuery('idx');

    // for choice / choice
    var ids = [];
    ids.push("choice1");
    ids.push("choice2");
    ids.push("choice3");
    ids.push("choice4");
    ids.push("choice5");
    ids.push("choice6");
    ids.push("choice7");
    ids.push("choice8");
    choicebtn_o.init(idx, ids);

    current_o.init(idx);
})();