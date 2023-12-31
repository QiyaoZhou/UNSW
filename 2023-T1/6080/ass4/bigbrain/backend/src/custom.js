/*
 For a given data structure of a question, produce another
 object that doesn't contain any important meta data (e.g. the answer)
 to return to a "player"
*/
export const quizQuestionPublicReturn = question => {
  return question;
};

/*
 For a given data structure of a question, get the IDs of
 the correct answers (minimum 1).
*/
export const quizQuestionGetCorrectAnswers = question => {
  let answers = [];
  for (let i = 0; i < question.answersList.length; i++) {
    if (question.answersList[i]['correct'] === true) {
      answers.push(question.answersList[i]['answerContext']);
    }
  }

  return answers;
};

/*
 For a given data structure of a question, get the IDs of
 all of the answers, correct or incorrect.
*/
export const quizQuestionGetAnswers = question => {
  let answers = [];
  for (let i = 0; i < question.answersList.length; i++) {
    answers.push(question.answersList[i]['answerContext']);
  }

  return answers;
};

/*
 For a given data structure of a question, get the duration
 of the question once it starts. (Seconds)
*/
export const quizQuestionGetDuration = question => {
  return question.time;
};
