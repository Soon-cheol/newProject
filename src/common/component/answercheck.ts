export interface IContentAnswer {
  basetype: number;
  subtype: number;
  basetypename: string;
  subtypename: string;
  matchType: number;
  answers: string[];
}
export interface IUserChoice {
  choicedIdx: number[];
  choicedValue: string[];
  correct: boolean;
  completed: boolean;
}

export interface IContentResult {
  studentid: string;
  contentSeq: number;
  contentAnswers: IContentAnswer[];
  userChoices: IUserChoice[];
  correct: boolean;
  tryCnt: number;
  completed: boolean;
}

function sortAlphaNum(a: string, b: string) {
  const reA = /[^a-zA-Z]/g;
  const reN = /[^0-9]/g;

  var aA = a.replace(reA, "");
  var bA = b.replace(reA, "");
  if (aA === bA) {
    var aN = parseInt(a.replace(reN, ""), 10);
    var bN = parseInt(b.replace(reN, ""), 10);
    return aN === bN ? 0 : aN > bN ? 1 : -1;
  } else {
    return aA > bA ? 1 : -1;
  }
}

function fromLetters(str: string) {
  var out = 0,
    len = str.length,
    pos = len;
  while ((pos -= 1) > -1) {
    out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - 1 - pos);
  }
  return out;
}

function toLetters(num: number): string {
  var mod = num % 26;
  var pow = (num / 26) | 0;
  var out = mod ? String.fromCharCode(64 + mod) : (pow--, "Z");
  return pow ? toLetters(pow) + out : out;
}

export function answercheck(result: any, msg: any): number {
  console.log("=========> answercheck result", result);
  console.log("=========> answercheck msg", msg);
  if (!msg || result.length < 0) return -1;
  const contentresult = result as IContentResult;
  if (!contentresult) return -1;

  if (msg.basetype === 0 && msg.subtype === 1) {
    // Gap/multi group
    console.log("=========> answercheck gap2", contentresult.contentAnswers);
    let mgroup_answers: IContentAnswer[] = [];
    let mgroup_idxs: number[] = [];
    contentresult.contentAnswers.map((answer, idx) => {
      if (answer.basetype === msg.basetype && answer.subtype === msg.subtype) {
        mgroup_answers.push(answer);
        mgroup_idxs.push(idx);
      }
    });
    // console.log('=========> answercheck gap2 mgroup_answers', mgroup_answers, mgroup_idxs);
    mgroup_answers.map((answer, idx) => {
      let gidx = mgroup_idxs[idx];
      const userChoice_gx = contentresult.userChoices[gidx];
      if (answer.matchType === 2) {
        userChoice_gx.correct = false;
        for (let i = 0; i < answer.answers.length; i++) {
          if (answer.answers[i] === msg.choicedValue[idx])
            userChoice_gx.correct = true;
        }
      } else {
        if (answer.answers[0] === msg.choicedValue[idx])
          userChoice_gx.correct = true;
        else userChoice_gx.correct = false;
      }
      userChoice_gx.choicedIdx = msg.choicedIdx[idx];
      userChoice_gx.choicedValue = msg.choicedValue[idx];
      userChoice_gx.completed = true;
      // console.log('=========> answercheck gap2', userChoice_gx)
    });
    return mgroup_idxs.length > 0 ? mgroup_idxs[mgroup_idxs.length - 1] : -1;
  } else if (msg.basetype === 0 && msg.subtype === 2) {
    // Gap/vertical count
    console.log("=========> answercheck gap3", contentresult.contentAnswers);
    let mgroup_answers: IContentAnswer[] = [];
    let mgroup_idxs: number[] = [];
    contentresult.contentAnswers.map((answer, idx) => {
      if (answer.basetype === msg.basetype && answer.subtype === msg.subtype) {
        mgroup_answers.push(answer);
        mgroup_idxs.push(idx);
      }
    });
    // console.log('=========> answercheck gap3 mgroup_answers', mgroup_answers, mgroup_idxs);
    mgroup_answers.map((answer, idx) => {
      let gidx = mgroup_idxs[idx];
      const userChoice_gx = contentresult.userChoices[gidx];
      if (answer.matchType === 2) {
        userChoice_gx.correct = false;
        for (let i = 0; i < answer.answers.length; i++) {
          if (
            JSON.stringify(answer.answers[i]) ===
            JSON.stringify(msg.choicedValue[idx])
          )
            userChoice_gx.correct = true;
        }
      } else {
        // console.log('=========> answercheck gap3 compare', JSON.stringify(answer.answers), JSON.stringify(msg.choicedValue[idx]));
        if (
          JSON.stringify(answer.answers) ===
          JSON.stringify(msg.choicedValue[idx])
        )
          userChoice_gx.correct = true;
        else userChoice_gx.correct = false;
      }
      userChoice_gx.choicedIdx = msg.choicedIdx[idx];
      userChoice_gx.choicedValue = msg.choicedValue[idx];
      userChoice_gx.completed = true;
      // console.log('=========> answercheck gap3', userChoice_gx)
    });
    return mgroup_idxs.length > 0 ? mgroup_idxs[mgroup_idxs.length - 1] : -1;
  }

  let idx = contentresult.contentAnswers.findIndex(
    (answer) =>
      answer.basetype === msg.basetype && answer.subtype === msg.subtype
  );
  if (idx < 0) return -1;
  console.log(
    "=========> answercheck answer idx",
    idx,
    contentresult.contentAnswers[idx]
  );

  const contentanswer = contentresult.contentAnswers[idx];
  const userChoice = contentresult.userChoices[idx];
  if (!userChoice) return -1;

  if (msg.basetype === 0 && msg.subtype === 0) {
    // Gap/gap
    console.log("=========> answercheck gap", contentanswer);
    if (contentanswer.matchType === 2) {
      let choices = msg.choicedValue.join(",");
      console.log("=========> answercheck gap choices", choices);
      let correct = false;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        if (contentanswer.answers[i] === choices) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck gap",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck gap", contentanswer, userChoice);
  } else if (msg.basetype === 1 && msg.subtype === 0) {
    // Choice/choice
    if (contentanswer.matchType === 2) {
      const answerIdx = contentanswer.answers.findIndex(
        (answer) => answer + "" === msg.choicedValue[0]
      );
      if (answerIdx < 0) userChoice.correct = false;
      else userChoice.correct = true;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck choice",
        contentanswer.answers[0],
        msg.choicedValue[0]
      );
      if (contentanswer.answers[0] + "" === msg.choicedValue[0])
        userChoice.correct = true;
      else userChoice.correct = false;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck choice", contentanswer, userChoice);
  } else if (msg.basetype === 1 && msg.subtype === 1) {
    // Choice/mult choice
    if (contentanswer.matchType === 2) {
      let cho = msg.choicedValue.sort();
      console.log(
        "=========> answercheck choice/multi compare2",
        cho,
        cho.join()
      );
      const answerIdx = contentanswer.answers.findIndex(
        (answer) => answer === cho.join()
      );
      if (answerIdx < 0) userChoice.correct = false;
      else userChoice.correct = true;
    } else if (contentanswer.matchType === 1) {
      let ans = contentanswer.answers.slice().sort();
      let cho = msg.choicedValue.sort();
      console.log("=========> answercheck choice/multi compare", ans, cho);

      if (JSON.stringify(ans) === JSON.stringify(cho))
        userChoice.correct = true;
      else userChoice.correct = false;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck choice/multi",
      contentanswer,
      userChoice
    );
  } else if (msg.basetype === 1 && msg.subtype === 2) {
    // Choice/group choice
    if (contentanswer.matchType === 2) {
      let isPossible = true;

      for (let i = 0; i < contentanswer.answers.length; i++) {
        const answer = contentanswer.answers[i];
        if (answer.indexOf(",") == -1) {
          userChoice.choicedIdx = msg.choicedIdx;
          userChoice.choicedValue = msg.choicedValue;
          userChoice.completed = true;
          return -1;
        }
      }
      for (let i = 0; i < contentanswer.answers.length; i++) {
        let ans = contentanswer.answers[i].split(",").sort();
        let cho = msg.choicedValue.sort();
        console.log(
          "=========> answercheck choice/group match one compare",
          ans,
          cho
        );
        console.log(
          "JSON.stringify(ans),JSON.stringify(cho)",
          JSON.stringify(ans),
          JSON.stringify(cho)
        );
        if (JSON.stringify(ans) === JSON.stringify(cho)) {
          userChoice.correct = true;
          break;
        } else {
          userChoice.correct = false;
        }
      }
    } else if (contentanswer.matchType === 1) {
      if (contentanswer.answers[0].indexOf(",") == -1) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = true;
        return -1;
      }
      let ans = contentanswer.answers[0].split(",").sort();
      let cho = msg.choicedValue.sort();
      console.log("=========> answercheck choice/group compare", ans, cho);
      console.log(
        "JSON.stringify(ans),JSON.stringify(cho)",
        JSON.stringify(ans),
        JSON.stringify(cho)
      );
      if (JSON.stringify(ans) === JSON.stringify(cho))
        userChoice.correct = true;
      else userChoice.correct = false;
    }
    console.log(
      "=========> answercheck choice/group userChoice.correct",
      userChoice.correct
    );
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck choice/group",
      contentanswer,
      userChoice
    );
  } else if (msg.basetype === 2) {
    // Drag&Drop/dragdrop
    //copy group math one...
    if (contentanswer.matchType === 2 && contentanswer.subtype === 5) {
      
      const choicedValue = msg.choicedValue;
      const answers = contentanswer.answers;
      console.log('copy group math one choicedValue', choicedValue);
      console.log('copy group math one answers', answers);

      const arrAnswers = Array.from(answers);            
      const arrGroupAnswers: any = [];

      arrAnswers.forEach(answer => {
        let arrAnswers = [];
        if(answer.indexOf(",") != -1){
          arrAnswers = answer.split(',');
        }else{
          arrAnswers.push(answer);
        }
        arrGroupAnswers.push(arrAnswers);
      });
      console.log('copy group math one arrGroupAnswers', arrGroupAnswers);
      let correct = false;

      for (let i = 0; i < arrGroupAnswers.length; i++) {
        console.log('copy group math one', 'arrGroupAnswers[i]',JSON.stringify(arrGroupAnswers[i]),'choicedValue',JSON.stringify(choicedValue));
        if (JSON.stringify(arrGroupAnswers[i]) == JSON.stringify(choicedValue)) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 2 && contentanswer.subtype === 4) {
      const onesetlen = msg.choicedValue.length;
      const totallen = contentanswer.answers.length;
      console.log();
      const setlen = Math.round(totallen / onesetlen);
      let tmp = [];

      for (let j = 0; j < setlen; j++) {
        let start = onesetlen * j;
        let end = onesetlen * (j + 1);
        if (end > totallen) end = totallen;
        tmp.push(contentanswer.answers.slice(start, end));
      }
      console.log("===> answercheck dragdrop tmp", tmp);
      let correct = false;
      for (let j = 0; j < tmp.length; j++) {
        let local_correct = true;
        for (let i = 0; i < tmp[j].length; i++) {
          let answerArr = tmp[j][i].split(",").sort();
          let choicedValueArr = msg.choicedValue[i].split(",").sort();
          if (answerArr.length !== choicedValueArr.length) {
            local_correct = false;
            break;
          }
          if (JSON.stringify(answerArr) !== JSON.stringify(choicedValueArr)) {
            local_correct = false;
            break;
          }
        }
        if (local_correct) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 2 && msg.subtype === 1) {
      let correct = false;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        let answerArr = contentanswer.answers[i].split(",");
        let choicedValue = msg.choicedValue[0].split(",");
        if (answerArr.length !== choicedValue.length) break;

        console.log("JSON.stringify(answerArr)", JSON.stringify(answerArr));
        console.log(
          "JSON.stringify(choicedValue)",
          JSON.stringify(choicedValue)
        );
        if (JSON.stringify(answerArr) === JSON.stringify(choicedValue)) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 2 && msg.subtype !== 4) {
      let correct = false;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        let answerArr = contentanswer.answers[i].split(",");
        if (answerArr.length !== msg.choicedValue.length) break;
        console.log(
          "===> answercheck dragdrop check",
          msg.subtype,
          contentanswer.matchType,
          i,
          answerArr,
          msg.choicedValue
        );
        if (JSON.stringify(answerArr) === JSON.stringify(msg.choicedValue)) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck dragdrop",
        msg.subtype,
        contentanswer.matchType,
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      console.log(
        "=========> answers.length/",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        console.log(
          "=========> answercheck dragdrop",
          msg.subtype,
          contentanswer.matchType,
          i,
          contentanswer.answers[i],
          msg.choicedValue[i],
          contentanswer.answers[i] === msg.choicedValue[i]
        );
        // 답이 배열
        let answerArr = contentanswer.answers[i].split(",").sort();

        if (answerArr.length > 1) {
          let choicedValueArr = msg.choicedValue[i].split(",").sort();
          if (answerArr.length !== choicedValueArr.length) {
            correct = false;
            break;
          } else if (answerArr.join() !== choicedValueArr.join()) {
            correct = false;
            break;
          }
        } else if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck dragdrop",
      msg.subtype,
      contentanswer.matchType,
      contentanswer,
      userChoice
    );
  } else if (msg.basetype === 3 && msg.subtype === 0) {
    // Shade/shade
    if (contentanswer.matchType === 3) {
      //
    } else if (contentanswer.matchType === 2) {
      //
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck shade",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        console.log(
          "=========> answercheck shade",
          i,
          contentanswer.answers[i],
          msg.choicedValue[i],
          contentanswer.answers[i] === msg.choicedValue[i]
        );
        // 답이 배열
        let answerArr = contentanswer.answers[i].split(",").sort();
        if (answerArr.length > 1) {
          let choicedValueArr = msg.choicedValue[i].split(",").sort();
          if (answerArr.length !== choicedValueArr.length) {
            correct = false;
            break;
          } else if (answerArr.join() !== choicedValueArr.join()) {
            correct = false;
            break;
          }
        } else if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck shade", contentanswer, userChoice);
  } else if (msg.basetype === 3 && msg.subtype === 1) {
    // Shade/match
    if (contentanswer.matchType === 3) {
      let correct = true;
      if (msg.choicedValue.length === 0) correct = false;
      else {
        let same = false;
        if (msg.choicedValue.length > 1) {
          for (let i = 1; i < msg.choicedValue.length; i++) {
            if (msg.choicedValue[0] === msg.choicedValue[i]) {
              same = true;
              break;
            }
          }
        }
        // 같은 선택들 존재하면 오답
        if (same) correct = false;
        else {
          for (let i = 0; i < msg.choicedValue.length; i++) {
            let arr = msg.choicedValue[i].split(",");
            // 다른 사이즈 존재하면 오답
            if (contentanswer.answers.length !== arr.length) {
              correct = false;
              break;
            } // 정답과 일치하는 선택값이면 오답
            else if (
              contentanswer.answers.slice().sort().join(",") ===
              msg.choicedValue[i]
            ) {
              correct = false;
              break;
            }
          }
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 2) {
      //
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck shade",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        console.log("contentanswer.answers[i]", i, contentanswer.answers[i]);
        console.log("msg.choicedValue[i]", i, msg.choicedValue[i]);
        if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck shade", contentanswer, userChoice);
  } else if (msg.basetype === 4 && msg.subtype === 0) {
    // Add/remove items/add
    if (contentanswer.matchType === 2) {
      let cho = msg.choicedValue;
      console.log("=========> answercheck dragadd", cho, cho.join());
      const answerIdx = contentanswer.answers.findIndex(
        (answer) => answer === cho.join()
      );
      if (answerIdx < 0) userChoice.correct = false;
      else userChoice.correct = true;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck dragadd",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        console.log(
          "=========> answercheck dragadd",
          i,
          contentanswer.answers[i],
          msg.choicedValue[i],
          contentanswer.answers[i] !== msg.choicedValue[i]
        );
        if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck dragadd", contentanswer, userChoice);
  } else if (msg.basetype === 4 && msg.subtype === 2) {
    // Add/remove tally chart
    if (contentanswer.matchType === 2) {
      let cho = msg.choicedValue;
      console.log("=========> answercheck tally chart", cho, cho.join());
      const answerIdx = contentanswer.answers.findIndex(
        (answer) => answer === cho.join()
      );
      if (answerIdx < 0) userChoice.correct = false;
      else userChoice.correct = true;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck tally chart",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        console.log(
          "=========> answercheck tally chart",
          i,
          contentanswer.answers[i],
          msg.choicedValue[i],
          contentanswer.answers[i] !== msg.choicedValue[i]
        );
        if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck tally chart",
      contentanswer,
      userChoice
    );
  } else if (
    (msg.basetype === 4 && msg.subtype === 3) ||
    (msg.basetype === 0 && msg.subtype === 3)
  ) {
    // Add/remove and Gap gap plus
    if (contentanswer.matchType === 2) {
      let cho = msg.choicedValue;
      console.log("=========> answercheck gapplus", cho, cho.join());
      const answerIdx = contentanswer.answers.findIndex(
        (answer) => answer === cho.join()
      );
      if (answerIdx < 0) userChoice.correct = false;
      else userChoice.correct = true;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck gapplus",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        console.log(
          "=========> answercheck gapplus",
          i,
          contentanswer.answers[i],
          msg.choicedValue[i],
          contentanswer.answers[i] !== msg.choicedValue[i]
        );
        if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;

    // 최종 비교..
    if (msg.basetype === 4) {
      let gapidx = contentresult.contentAnswers.findIndex(
        (answer) => answer.basetype === 0 && answer.subtype === 3
      );
      if (gapidx < 0) {
        userChoice.completed = false;
        return -2;
      }
      const userChoice2 = contentresult.userChoices[gapidx];
      if (userChoice2 && userChoice2.completed && userChoice2.correct) {
        if (
          JSON.stringify(userChoice.choicedValue) !==
          JSON.stringify(userChoice2.choicedValue)
        ) {
          console.log("=========> final compare1 contentanswer.matchType", contentanswer.matchType);
          userChoice.correct = false;
          return idx;
        }
      }
    } else {
      let addidx = contentresult.contentAnswers.findIndex(
        (answer) => answer.basetype === 4 && answer.subtype === 3
      );
      if (addidx < 0) {
        userChoice.completed = false;
        return -2;
      }
      const userChoice2 = contentresult.userChoices[addidx];
      if (userChoice2 && userChoice2.completed && userChoice2.correct) {
        if (
          JSON.stringify(userChoice.choicedValue) !==
          JSON.stringify(userChoice2.choicedValue)
        ) {
          console.log("=========> final compare2 contentanswer.matchType", contentanswer.matchType);
          userChoice.correct = false;
          return idx;
        }
      }
    }
    // console.log('=========> answercheck gapplus', contentanswer, userChoice);
    console.log("=========> answercheck gapplus contentresult", contentresult);
  } else if (msg.basetype === 5) {
    // Connection
    if (contentanswer.matchType === 2) {
      const onesetlen = msg.choicedValue.length;
      const totallen = contentanswer.answers.length;
      const setlen = Math.round(totallen / onesetlen);
      let tmp = [];

      console.log(
        "===> answercheck connection len",
        onesetlen,
        totallen,
        setlen
      );
      for (let j = 0; j < setlen; j++) {
        let start = onesetlen * j;
        let end = onesetlen * (j + 1);
        if (end > totallen) end = totallen;
        tmp.push(contentanswer.answers.slice(start, end));
      }
      console.log("===> answercheck connection tmp", tmp);
      let correct = false;
      for (let j = 0; j < tmp.length; j++) {
        let local_correct = true;
        if (tmp[j].length !== msg.choicedValue.length) {
          local_correct = false;
          continue;
        }
        for (let i = 0; i < tmp[j].length; i++) {
          if (tmp[j][i] !== msg.choicedValue[i]) {
            local_correct = false;
            break;
          }
        }
        if (local_correct) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck connection",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        console.log(
          "=========> answercheck connection",
          i,
          contentanswer.answers[i],
          msg.choicedValue[i],
          contentanswer.answers[i] !== msg.choicedValue[i]
        );
        if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck dragadd", contentanswer, userChoice);
  } else if (msg.basetype === 6) {
    // Number line/ number line
    if (contentanswer.matchType === 2) {
      let correct = false;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        let answerArr = contentanswer.answers[i].split(",");
        if (answerArr.length !== msg.choicedValue.length) break;
        console.log(
          "===> answercheck number line check",
          msg.subtype,
          contentanswer.matchType,
          i,
          answerArr,
          msg.choicedValue
        );
        if (JSON.stringify(answerArr) === JSON.stringify(msg.choicedValue)) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 1) {
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      console.log(
        "=========> answercheck number line",
        contentanswer.answers,
        msg.choicedValue
      );
      if (
        JSON.stringify(contentanswer.answers) ===
        JSON.stringify(msg.choicedValue)
      )
        userChoice.correct = true;
      else userChoice.correct = false;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck number line",
      contentanswer,
      userChoice
    );
  } else if (msg.basetype === 7) {
    // Picture graph / picture graph
    if (contentanswer.matchType === 2) {
      let correct = false;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        let answerArr = contentanswer.answers[i].split(",");
        if (answerArr.length !== msg.choicedValue.length) break;
        console.log(
          "===> answercheck picture graph check",
          msg.subtype,
          contentanswer.matchType,
          i,
          answerArr,
          msg.choicedValue
        );
        if (JSON.stringify(answerArr) === JSON.stringify(msg.choicedValue)) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 1) {
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      console.log(
        "=========> answercheck picture graph",
        contentanswer.answers,
        msg.choicedValue
      );
      if (
        JSON.stringify(contentanswer.answers) ===
        JSON.stringify(msg.choicedValue)
      )
        userChoice.correct = true;
      else userChoice.correct = false;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck picture graph",
      contentanswer,
      userChoice
    );
  } else if (msg.basetype === 8) {
    // Bar graph / bar graph
    if (contentanswer.matchType === 2) {
      let correct = false;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        let answerArr = contentanswer.answers[i].split(",");
        if (answerArr.length !== msg.choicedValue.length) break;
        console.log(
          "===> answercheck bar graph check",
          msg.subtype,
          contentanswer.matchType,
          i,
          answerArr,
          msg.choicedValue
        );
        if (JSON.stringify(answerArr) === JSON.stringify(msg.choicedValue)) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 1) {
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      console.log(
        "=========> answercheck bar graph",
        contentanswer.answers,
        msg.choicedValue
      );
      if (
        JSON.stringify(contentanswer.answers) ===
        JSON.stringify(msg.choicedValue)
      )
        userChoice.correct = true;
      else userChoice.correct = false;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck bar graph", contentanswer, userChoice);
  } else if (msg.basetype === 9) {
    // Line plot / line plot
    if (contentanswer.matchType === 2) {
      let correct = false;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        let answerArr = contentanswer.answers[i].split(",");
        if (answerArr.length !== msg.choicedValue.length) break;
        console.log(
          "===> answercheck line plot check",
          msg.subtype,
          contentanswer.matchType,
          i,
          answerArr,
          msg.choicedValue
        );
        if (JSON.stringify(answerArr) === JSON.stringify(msg.choicedValue)) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 1) {
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      console.log(
        "=========> answercheck line plot",
        contentanswer.answers,
        msg.choicedValue
      );
      if (
        JSON.stringify(contentanswer.answers) ===
        JSON.stringify(msg.choicedValue)
      )
        userChoice.correct = true;
      else userChoice.correct = false;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck line plot", contentanswer, userChoice);
  } else if (msg.basetype === 10) {
    // Clock Hands
    if (contentanswer.matchType === 2) {
      // let correct = false;
      // for (let i = 0; i < contentanswer.answers.length; i++) {
      //   let answerArr = contentanswer.answers[i].split(",");
      //   if (answerArr.length !== msg.choicedValue.length) break;
      //   console.log(
      //     "===> answercheck line plot check",
      //     msg.subtype,
      //     contentanswer.matchType,
      //     i,
      //     answerArr,
      //     msg.choicedValue
      //   );
      //   if (JSON.stringify(answerArr) === JSON.stringify(msg.choicedValue)) {
      //     correct = true;
      //     break;
      //   }
      // }
      // userChoice.correct = correct;
    } else if (contentanswer.matchType === 1 && msg.subtype === 0) {
      //clock hand single
      //시침, 분침 움직임 없어도 정답 제출이 가능하기때문에 주석처리.
      // if (contentanswer.answers.length !== msg.choicedValue.length) {
      //   userChoice.choicedIdx = msg.choicedIdx;
      //   userChoice.choicedValue = msg.choicedValue;
      //   userChoice.completed = false;
      //   return -2;
      // }
      console.log(
        "=========> answercheck clock hands",
        Object.assign({}, contentanswer.answers),
        msg.choicedValue
      );

      // const arrAnswers = Array.from(contentanswer.answers);
      
      
      // const arrGroupAnswers: any = [];

      // arrAnswers.forEach(answer => {
      //   let arrAnswers = [];
      //   if(answer.indexOf(",") != -1){
      //     arrAnswers = answer.split(',');
      //   }else{
      //     arrAnswers.push(answer);
      //   }
      //   arrGroupAnswers.push(arrAnswers);
      // });

      console.log('arrGroupAnswers', JSON.stringify(contentanswer.answers),'/',JSON.stringify(msg.choicedValue[0]));
      if (
        JSON.stringify(contentanswer.answers) ===
        JSON.stringify(msg.choicedValue[0])
      )
        userChoice.correct = true;
      else userChoice.correct = false;
    } else if (contentanswer.matchType === 1 && msg.subtype === 1) {
      //clock hand group
      //시침, 분침 움직임 없어도 정답 제출이 가능하기때문에 주석처리.
      // if (contentanswer.answers.length !== msg.choicedValue.length) {
      //   userChoice.choicedIdx = msg.choicedIdx;
      //   userChoice.choicedValue = msg.choicedValue;
      //   userChoice.completed = false;
      //   return -2;
      // }
      console.log(
        "=========> answercheck clock hands group",
        Object.assign({}, contentanswer.answers),
        msg.choicedValue
      );

      const arrAnswers = Array.from(contentanswer.answers);
      
      
      const arrGroupAnswers: any = [];

      arrAnswers.forEach(answer => {
        let arrAnswers = [];
        if(answer.indexOf(",") != -1){
          arrAnswers = answer.split(',');
        }else{
          arrAnswers.push(answer);
        }
        arrGroupAnswers.push(arrAnswers);
      });

      console.log('arrGroupAnswers', JSON.stringify(arrGroupAnswers),'/',JSON.stringify(msg.choicedValue));
      if (
        JSON.stringify(arrGroupAnswers) ===
        JSON.stringify(msg.choicedValue)
      )
        userChoice.correct = true;
      else userChoice.correct = false;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck clock hands",
      contentanswer,
      userChoice
    );
  } else if (msg.basetype === 11 && msg.subtype === 0) {
    // Radio button / radio button
    if (contentanswer.matchType === 2) {
      // const answerIdx = contentanswer.answers.findIndex((answer) => answer === msg.choicedValue);
      // if(answerIdx < 0) userChoice.correct = false;
      // else userChoice.correct = true;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck radio",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        console.log(
          "=========> answercheck radio",
          i,
          contentanswer.answers[i],
          msg.choicedValue[i],
          contentanswer.answers[i] !== msg.choicedValue[i]
        );
        if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck dragadd", contentanswer, userChoice);
  } else if (msg.basetype === 12 && msg.subtype === 0) {
    // Check box / checkbox
    if (contentanswer.matchType === 2) {
      // const answerIdx = contentanswer.answers.findIndex((answer) => answer === msg.choicedValue);
      // if(answerIdx < 0) userChoice.correct = false;
      // else userChoice.correct = true;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck checkbox",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = true;
        userChoice.correct = false;
        return idx;
      }
      let correct = true;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        console.log(
          "=========> answercheck checkbox",
          i,
          contentanswer.answers[i],
          msg.choicedValue[i],
          contentanswer.answers[i] !== msg.choicedValue[i]
        );
        if (contentanswer.answers[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log("=========> answercheck", contentanswer, userChoice);
  } else if (msg.basetype === 13 && msg.subtype === 0) {
    // Grid and Chart / grid and chart
    if (contentanswer.matchType === 2) {
      let correct = false;
      for (let i = 0; i < contentanswer.answers.length; i++) {
        let answerArr = contentanswer.answers[i].split(",");
        if (answerArr.length !== msg.choicedValue.length) break;
        const ans = answerArr.sort(sortAlphaNum);
        console.log(
          "===> answercheck grid and chart check",
          msg.subtype,
          contentanswer.matchType,
          i,
          answerArr,
          ans,
          msg.choicedValue
        );
        if (JSON.stringify(ans) === JSON.stringify(msg.choicedValue)) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck grid and chart",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = true;
        userChoice.correct = false;
        return idx;
      }
      let correct = true;
      const ans = contentanswer.answers.sort(sortAlphaNum);
      console.log("=========> answercheck grid and chart sorted ans", ans);
      for (let i = 0; i < ans.length; i++) {
        console.log(
          "=========> answercheck grid and chart",
          i,
          ans[i],
          msg.choicedValue[i],
          ans[i] !== msg.choicedValue[i]
        );
        if (ans[i] !== msg.choicedValue[i]) {
          correct = false;
          break;
        }
      }
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck grid and chart",
      contentanswer,
      userChoice
    );
  } else if (msg.basetype === 13 && msg.subtype === 1) {
    // Grid and Chart / start end
    if (contentanswer.matchType === 2) {
      let correct = false;
      if (msg.choicedValue.length < 2) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = true;
        userChoice.correct = false;
        return idx;
      }
      let uchoice = msg.choicedValue.slice(0, msg.choicedValue.length - 1);
      let maxvalue = msg.choicedValue.slice(msg.choicedValue.length - 1);

      let maxcol = fromLetters(maxvalue[0].substring(0, 1));
      let maxrow = parseInt(maxvalue[0].substring(1));

      for (let i = 0; i < contentanswer.answers.length; i++) {
        let answerArr = contentanswer.answers[i].split(",");
        if (answerArr.length !== 2) {
          userChoice.choicedIdx = msg.choicedIdx;
          userChoice.choicedValue = msg.choicedValue;
          userChoice.completed = false;
          userChoice.correct = false;
          return -1;
        }
        let answermin = answerArr[0];
        let answermin_col = fromLetters(answermin.substring(0, 1));
        let answermin_row = parseInt(answermin.substring(1));
        let answermax = answerArr[1];
        let answermax_col = fromLetters(answermax.substring(0, 1));
        let answermax_row = parseInt(answermax.substring(1));

        if (
          isNaN(answermin_col) ||
          isNaN(answermin_row) ||
          isNaN(answermax_col) ||
          isNaN(answermax_row)
        ) {
          userChoice.choicedIdx = msg.choicedIdx;
          userChoice.choicedValue = msg.choicedValue;
          userChoice.completed = true;
          userChoice.correct = false;
          return idx;
        }

        let aswerstmp = [];
        if (answermin_col === answermax_col) {
          for (let j = answermin_row; j <= answermax_row; j++) {
            aswerstmp.push(toLetters(answermin_col) + j);
          }
        } else {
          for (let i = answermin_col; i <= answermax_col; i++) {
            if (i == answermin_col) {
              for (let j = answermin_row; j <= maxrow; j++) {
                aswerstmp.push(toLetters(i) + j);
              }
            } else if (i > answermin_col && i < answermax_col) {
              for (let j = 1; j <= maxrow; j++) {
                aswerstmp.push(toLetters(i) + j);
              }
            } else if (i == answermax_col) {
              for (let j = 1; j <= answermax_row; j++) {
                aswerstmp.push(toLetters(i) + j);
              }
            }
          }
        }
        if (JSON.stringify(aswerstmp) === JSON.stringify(uchoice)) {
          correct = true;
          break;
        }
      }
      userChoice.correct = correct;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck grid and chart 2",
        contentanswer.answers.length,
        msg.choicedValue.length
      );
      if (contentanswer.answers.length !== 2) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        userChoice.correct = false;
        return -1;
      }
      if (msg.choicedValue.length < 2) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = true;
        userChoice.correct = false;
        return idx;
      }
      let uchoice = msg.choicedValue.slice(0, msg.choicedValue.length - 1);
      let maxvalue = msg.choicedValue.slice(msg.choicedValue.length - 1);

      let maxcol = fromLetters(maxvalue[0].substring(0, 1));
      let maxrow = parseInt(maxvalue[0].substring(1));
      let answermin = contentanswer.answers[0];
      let answermin_col = fromLetters(answermin.substring(0, 1));
      let answermin_row = parseInt(answermin.substring(1));
      let answermax = contentanswer.answers[1];
      let answermax_col = fromLetters(answermax.substring(0, 1));
      let answermax_row = parseInt(answermax.substring(1));

      if (
        isNaN(answermin_col) ||
        isNaN(answermin_row) ||
        isNaN(answermax_col) ||
        isNaN(answermax_row)
      ) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = true;
        userChoice.correct = false;
        return idx;
      }

      let aswerstmp = [];
      if (answermin_col === answermax_col) {
        for (let j = answermin_row; j <= answermax_row; j++) {
          aswerstmp.push(toLetters(answermin_col) + j);
        }
      } else {
        for (let i = answermin_col; i <= answermax_col; i++) {
          if (i == answermin_col) {
            for (let j = answermin_row; j <= maxrow; j++) {
              aswerstmp.push(toLetters(i) + j);
            }
          } else if (i > answermin_col && i < answermax_col) {
            for (let j = 1; j <= maxrow; j++) {
              aswerstmp.push(toLetters(i) + j);
            }
          } else if (i == answermax_col) {
            for (let j = 1; j <= answermax_row; j++) {
              aswerstmp.push(toLetters(i) + j);
            }
          }
        }
      }

      let correct = false;
      if (JSON.stringify(aswerstmp) === JSON.stringify(uchoice)) correct = true;
      userChoice.correct = correct;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck grid and chart 2",
      contentanswer,
      userChoice
    );
  } else if (msg.basetype === 13 && msg.subtype === 2) {
    // Grid and Chart / count
    if (contentanswer.matchType === 2) {
      console.log(
        "=========> answercheck grid and chart 3",
        contentanswer.answers,
        msg.choicedValue[0]
      );
      const answerIdx = contentanswer.answers.findIndex(
        (answer) => answer + "" === msg.choicedValue[0]
      );
      if (answerIdx < 0) userChoice.correct = false;
      else userChoice.correct = true;
    } else if (contentanswer.matchType === 1) {
      console.log(
        "=========> answercheck grid and chart 3",
        contentanswer.answers[0],
        msg.choicedValue[0]
      );
      if (contentanswer.answers.length !== msg.choicedValue.length) {
        userChoice.choicedIdx = msg.choicedIdx;
        userChoice.choicedValue = msg.choicedValue;
        userChoice.completed = false;
        return -2;
      }
      if (contentanswer.answers[0] + "" === msg.choicedValue[0])
        userChoice.correct = true;
      else userChoice.correct = false;
    }
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> answercheck grid and chart 3",
      contentanswer,
      userChoice
    );
  } else if (msg.basetype === 14) {
    // coordinate
    console.log(
      "=========> coordinate",
      contentanswer.answers,
      msg.choicedValue
    );
    for(let i=0; i < contentanswer.answers.length; i++){
      let answerXYs = [];
    let XYs:string[] = [];
    let answer = contentanswer.answers[i];
    if(msg.subtype === 0) {
      answer = answer.replace(/ /gi, "");
      answer = answer.replace(/\),\(/gi, "/");
      answer = answer.replace(/\(/gi, "");
      answer = answer.replace(/\)/gi, "");      
      console.log('answer re', answer);
      if(answer.indexOf("/")) {
        const arrAnswerXY = answer.split('/');
        arrAnswerXY.forEach(answerXY => {
          XYs.push(answerXY);
        });
      }else{
        XYs.push(answer);
      }
      answerXYs.push(XYs);
    }else if(msg.subtype === 1) {
      answer = answer.replace(/ /gi, "");
      answer = answer.replace(/\),/gi, "/");
      if(answer.indexOf("/")) {
        const arrAnswerXY = answer.split('/');
        arrAnswerXY.forEach(answerXY => {
          answerXY = answerXY.replace(/\(/gi, "");
          answerXY = answerXY.replace(/\)/gi, ""); 
          XYs.push(answerXY);
        });
      }else{
        answer = answer.replace(/\(/gi, "");
        answer = answer.replace(/\)/gi, ""); 
        XYs.push(answer);
      }
      answerXYs.push(XYs);
      answer = answer.replace(/\(/gi, "");
      answer = answer.replace(/\)/gi, "");      
      console.log('answer re', answer);
    }
      
      
    const sortedAnswerXYs = answerXYs[0].sort();
    const sortedChoicedValue = msg.choicedValue.sort();

    console.log('JSON.stringify(sortedAnswerXYs)',JSON.stringify(sortedAnswerXYs));
    console.log('JSON.stringify(sortedChoicedValue)',JSON.stringify(sortedChoicedValue));
    
    if(JSON.stringify(sortedAnswerXYs) == JSON.stringify(sortedChoicedValue)) {
      userChoice.correct = true;
      if (contentanswer.matchType === 2){
          break;
      }
    }else{
      userChoice.correct = false;
    }
    if (contentanswer.matchType === 1 && idx === 0) {
      break;
    }
      
    };
    
      
    
    userChoice.choicedIdx = msg.choicedIdx;
    userChoice.choicedValue = msg.choicedValue;
    userChoice.completed = true;
    console.log(
      "=========> coordinate",
      contentanswer,
      userChoice
    );
  }
  return idx;
}
