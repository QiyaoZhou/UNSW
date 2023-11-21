import sys
import numpy as np
import re
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from nltk import PorterStemmer


def stemming_words(sentence):
    words = sentence.split(' ')
    stem_words = []
    for i in words:
        stem_words.append(PorterStemmer().stem(i))
    stemmed_sentence = ' '.join(stem_words)
    return stemmed_sentence


lines = []
rank_list = []
text_list = []
id_list = []
for line in sys.stdin:
    lines.append(line.strip().split('\t'))
    id_list.append(lines[-1][0])
    rank_list.append(lines[-1][1])
    text_list.append(lines[-1][2])
xt = int(len(lines)*0.8)
train_text = np.array(text_list[0:xt])
test_text = np.array(text_list[xt:])
train_rank = np.array(rank_list[0:xt])
test_rank = np.array(rank_list[xt:])
limit = re.compile(r'(?:~)|(-)\1+|(.)\1{2,}')
label = re.compile(r'\<.*?\>')
word_pattern = re.compile(r'[^-/$%\sa-zA-Z\d]')
satisfy_sentence = []
for text in train_text:
    text1 = re.sub(limit, ' ', text)
    text2 = re.sub(label, '', text1)
    text3 = re.sub(word_pattern, '', text2)
    text4 = stemming_words(text3)
    satisfy_sentence.append(' '.join(text4.split()))
satisfy_sentence_train = np.array(satisfy_sentence)
satisfy_sentence = []
for text in test_text:
    text1 = re.sub(limit, ' ', text)
    text2 = re.sub(label, '', text1)
    text3 = re.sub(word_pattern, '', text2)
    text4 = stemming_words(text3)
    satisfy_sentence.append(' '.join(text4.split()))
satisfy_sentence_test = np.array(satisfy_sentence)

count = CountVectorizer(lowercase=True, token_pattern='[-/$%\da-zA-Z\w]{2,}',min_df=0.002)
X_train_bag_of_words = count.fit_transform(satisfy_sentence_train)
X_test_bag_of_words = count.transform(satisfy_sentence_test)
clf = MultinomialNB()
model = clf.fit(X_train_bag_of_words, train_rank)
predicted_y = model.predict(X_test_bag_of_words)
for i in range(0, len(test_text)):
    print(id_list[xt + i], predicted_y[i])


