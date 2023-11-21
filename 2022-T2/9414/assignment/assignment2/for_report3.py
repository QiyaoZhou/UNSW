import pandas as pd
import numpy as np
import re
from nltk import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import BernoulliNB, MultinomialNB
from sklearn import tree
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, classification_report
import matplotlib.pyplot as plt

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

count1 = CountVectorizer(lowercase=False, token_pattern='[-/$%\da-zA-Z\w]{2,}', max_features=1000, stop_words='english')
X_train_bag_of_words1 = count1.fit_transform(satisfy_sentence_train)
X_test_bag_of_words1 = count1.transform(satisfy_sentence_test)
clf1 = tree.DecisionTreeClassifier(min_samples_leaf=
                                  int(0.01 * (len(sentence_to_train))), criterion='entropy', random_state=0)
model_1 = clf1.fit(X_train_bag_of_words1, train_attitude)

count2 = CountVectorizer(lowercase=False,token_pattern='[-/$%\da-zA-Z\w]{2,}', stop_words='english')
X_train_bag_of_words2 = count2.fit_transform(satisfy_sentence_train)
X_test_bag_of_words2 = count2.transform(satisfy_sentence_test)

clf2 = BernoulliNB()
model_2 = clf2.fit(X_train_bag_of_words2, train_attitude)

clf3 = MultinomialNB()
model_3 = clf3.fit(X_train_bag_of_words2, train_attitude)


def predict_and_test(model, bag_of_words):
    num_dec_point = 3
    predicted_y = model.predict(bag_of_words)
    a_mic = accuracy_score(test_attitude, predicted_y)
    p_mic, r_mic, f1_mic, _ = precision_recall_fscore_support(test_attitude, predicted_y,average='micro',warn_for=())
    p_mac, r_mac, f1_mac, _ = precision_recall_fscore_support(test_attitude, predicted_y,average='macro',warn_for=())
    res = [round(a_mic,num_dec_point), round(p_mac,num_dec_point), round(r_mac,num_dec_point), round(f1_mac,num_dec_point)]
    return res


res_dt2 = predict_and_test(model_1, X_test_bag_of_words1)
res_bnb2 = predict_and_test(model_2, X_test_bag_of_words2)
res_mnb2 = predict_and_test(model_3, X_test_bag_of_words2)

'''res_dt1 = [0.626, 0.445, 0.416, 0.415]
res_bnb1 = [0.626, 0.486, 0.468, 0.474]
res_mnb1 = [0.666, 0.546, 0.533, 0.537]'''

res_dt1 = [0.602, 0.269, 0.245, 0.243]
res_bnb1 = [0.578, 0.353, 0.309, 0.315]
res_mnb1 = [0.6, 0.349, 0.335, 0.338]

name = ['accuracy','mac_precision','mac_recall','mac_f1']
index = np.arange(len(name))
width = 0.1
plt.bar(index,res_dt1,width,color='black',label='DT_model(a)')
plt.bar(index+width,res_dt2,width,color='yellow',label='DT_model(a)')
plt.bar(index+2*width,res_bnb1,width,color='blue',label='BNB_model(a)')
plt.bar(index+3*width,res_bnb2,width,color='red',label='BNB_model(b)')
plt.bar(index+4*width,res_mnb1,width,color='green',label='MNB_model(a)')
plt.bar(index+5*width,res_mnb2,width,color='orange',label='MNB_model(b)')
plt.xticks(index, labels=name)
for a,b in zip(index,res_dt1):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')
for a,b in zip(index+width,res_dt2):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')
for a,b in zip(index+2*width,res_bnb1):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')
for a,b in zip(index+3*width,res_bnb2):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')
for a,b in zip(index+4*width,res_mnb1):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')
for a,b in zip(index+5*width,res_mnb2):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')

plt.xlabel('metrics')
plt.ylabel('value')
plt.legend()
plt.show()
