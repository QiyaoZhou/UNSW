import sys
import numpy as np
import re
import pandas as pd
from matplotlib import pyplot as plt
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report
from sklearn.naive_bayes import MultinomialNB
from nltk import PorterStemmer

filename = 'D:/UNSW/2022-T2/9414/assignment/assignment2/reviews.tsv'
df_training = pd.read_csv(filename, sep='\t', header=None, names=['number', 'rank', 'text'], nrows=2000)
df_testing = pd.read_csv(filename, sep='\t', header=None, names=['number', 'rank', 'text'], skiprows=2000)
sentence_to_train = np.array(df_training['text'])
sentence_to_test = np.array(df_testing['text'])
train_attitude = np.array(df_training['rank'])
test_attitude = np.array(df_testing['rank'])


def stemming_words(sentence):
    words = sentence.split(' ')
    stem_words = [PorterStemmer().stem(w) for w in words]
    stemmed_sentence = ' '.join(w for w in stem_words)
    return stemmed_sentence


limit = re.compile(r'(?:~)|(-)\1+|(.)\1{2,}')
label = re.compile(r'\<.*?\>')
word_pattern = re.compile(r'[^-/$%\sa-zA-Z\d]')
satisfy_sentence1 = []
for text in sentence_to_train:
    text1 = re.sub(limit, ' ', text)
    text2 = re.sub(label, '', text1)
    text3 = re.sub(word_pattern, '', text2)
    text4 = stemming_words(text3)
    satisfy_sentence1.append(' '.join(text4.split()))
satisfy_sentence_train = np.array(satisfy_sentence1)
satisfy_sentence2 = []
for text in sentence_to_test:
    text1 = re.sub(limit, ' ', text)
    text2 = re.sub(label, '', text1)
    text3 = re.sub(word_pattern, '', text2)
    text4 = stemming_words(text3)
    satisfy_sentence2.append(' '.join(text4.split()))
satisfy_sentence_test = np.array(satisfy_sentence2)

count1 = CountVectorizer(lowercase=False, token_pattern='[-/$%\da-zA-Z\w]{2,}',min_df=0.001)
X_train_bag_of_words1 = count1.fit_transform(satisfy_sentence_train)
X_test_bag_of_words1 = count1.transform(satisfy_sentence_test)
clf1 = MultinomialNB()
model1 = clf1.fit(X_train_bag_of_words1, train_attitude)

count2 = CountVectorizer(lowercase=False, token_pattern='[-/$%\da-zA-Z\w]{2,}',min_df=0.002)
X_train_bag_of_words2 = count2.fit_transform(satisfy_sentence_train)
X_test_bag_of_words2 = count2.transform(satisfy_sentence_test)
clf2 = MultinomialNB()
model2 = clf2.fit(X_train_bag_of_words2, train_attitude)

count3 = CountVectorizer(lowercase=False, token_pattern='[-/$%\da-zA-Z\w]{2,}',min_df=0.005)
X_train_bag_of_words3 = count3.fit_transform(satisfy_sentence_train)
X_test_bag_of_words3 = count3.transform(satisfy_sentence_test)
clf3 = MultinomialNB()
model3 = clf3.fit(X_train_bag_of_words3, train_attitude)


def predict_and_test(model, bag_of_words):
    num_dec_point = 3
    predicted_y = model.predict(bag_of_words)
    a_mic = accuracy_score(test_attitude, predicted_y)
    p_mic, r_mic, f1_mic, _ = precision_recall_fscore_support(test_attitude, predicted_y,average='micro',warn_for=())
    p_mac, r_mac, f1_mac, _ = precision_recall_fscore_support(test_attitude, predicted_y,average='macro',warn_for=())
    res = [round(a_mic,num_dec_point), round(p_mac,num_dec_point), round(r_mac,num_dec_point), round(f1_mac,num_dec_point)]
    return res


res1 = predict_and_test(model1, X_test_bag_of_words1)
res2 = predict_and_test(model2, X_test_bag_of_words2)
res3 = predict_and_test(model3, X_test_bag_of_words3)

name = ['accuracy','mac_precision','mac_recall','mac_f1']
index = np.arange(len(name))
width = 0.2
plt.bar(index,res1,width,color='blue',label='0.001')
plt.bar(index+width,res2,width,color='red',label='0.002')
plt.bar(index+2*width,res3,width,color='green',label='0.005')
plt.xticks(index, labels=name)
for a,b in zip(index,res1):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')
for a,b in zip(index+width,res2):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')
for a,b in zip(index+2*width,res3):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')

plt.xlabel('metrics')
plt.ylabel('value')
plt.legend()
plt.show()
predicted_y = model2.predict(X_test_bag_of_words2)
print(classification_report(test_attitude,predicted_y))
