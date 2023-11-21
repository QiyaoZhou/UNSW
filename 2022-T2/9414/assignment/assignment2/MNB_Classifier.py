import sys
import numpy as np
import re

import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.naive_bayes import MultinomialNB

filename = 'D:/UNSW/2022-T2/9414/assignment/assignment2/reviews.tsv'
df_training = pd.read_csv(filename, sep='\t', header=None, names=['number', 'rank', 'text'], nrows=2000)
df_testing = pd.read_csv(filename, sep='\t', header=None, names=['number', 'rank', 'text'], skiprows=2000)
sentence_to_train = np.array(df_training['text'])
sentence_to_test = np.array(df_testing['text'])
train_attitude = np.array(df_training['rank'])
test_attitude = np.array(df_testing['rank'])

train_sentiment = []
test_sentiment = []
for i in train_attitude:
    if i == 1 or i == 2 or i == 3:
        train_sentiment.append('negative')
    elif i == 4:
        train_sentiment.append('neutral')
    else:
        train_sentiment.append('positive')
for j in test_attitude:
    if j == 1 or j == 2 or j == 3:
        test_sentiment.append('negative')
    elif j == 4:
        test_sentiment.append('neutral')
    else:
        test_sentiment.append('positive')
train_sentiment = np.array(train_sentiment)
test_sentiment = np.array(test_sentiment)
limit = re.compile(r'(?:~)|(-)\1+|(.)\1{2,}')
label = re.compile(r'\<.*?\>')
word_pattern = re.compile(r'[^-/$%\sa-zA-Z\d]')
satisfy_sentence = []
for text in sentence_to_train:
    text1 = re.sub(limit, ' ', text)
    text2 = re.sub(label, '', text1)
    text3 = re.sub(word_pattern, '', text2)
    satisfy_sentence.append(' '.join(text3.split()))
satisfy_sentence_train = np.array(satisfy_sentence)
satisfy_sentence = []
for text in sentence_to_test:
    text1 = re.sub(limit, ' ', text)
    text2 = re.sub(label, '', text1)
    text3 = re.sub(word_pattern, '', text2)
    satisfy_sentence.append(' '.join(text3.split()))
satisfy_sentence_test = np.array(satisfy_sentence)

count = CountVectorizer(lowercase=False, token_pattern='[-/$%\da-zA-Z\w]{2,}', max_features=1000)
X_train_bag_of_words = count.fit_transform(satisfy_sentence_train)
X_test_bag_of_words = count.transform(satisfy_sentence_test)
clf = MultinomialNB()
model = clf.fit(X_train_bag_of_words, train_sentiment)


def predict_and_test(model, bag_of_words):
    num_dec_point = 3
    predicted_y = model.predict(bag_of_words)
    a_mic = accuracy_score(test_sentiment, predicted_y)
    p_mic, r_mic, f1_mic, _ = precision_recall_fscore_support(test_sentiment, predicted_y,average='micro',warn_for=())
    p_mac, r_mac, f1_mac, _ = precision_recall_fscore_support(test_sentiment, predicted_y,average='macro',warn_for=())
    res = [round(a_mic,num_dec_point), round(p_mac,num_dec_point), round(r_mac,num_dec_point), round(f1_mac,num_dec_point)]
    return res


print(predict_and_test(model, X_test_bag_of_words))
