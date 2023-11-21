/*
 For a given data structure of a question, produce another
 object that doesn't contain any important meta data (e.g. the answer)
 to return to a "player"
*/
export const quizQuestionPublicReturn = question => {
  console.log('See question: ', question);
  return question;
};

/*
 For a given data structure of a question, get the IDs of
 the correct answers (minimum 1).
*/
export const quizQuestionGetCorrectAnswers = question => {
  let count = 0;
  let correctAnswers = []
  for (const answer of question.answersList) {
    if (answer.correct) {
      correctAnswers.push(count)
    } else {
      count += 1;
    }
  }
  return correctAnswers; // For a single answer
};

/*
 For a given data structure of a question, get the IDs of
 all of the answers, correct or incorrect.
*/
export const quizQuestionGetAnswers = question => {
  let answers = [];
  let id = 0;
  for (const answer of question.answersList) {
    answers.push(id);
    id += 1;
  }
  return answers; // For a single answer
};

/*
 For a given data structure of a question, get the duration
 of the question once it starts. (Seconds)
*/
export const quizQuestionGetDuration = question => {
  return question.time;
};
