import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import CountVectorizer
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
    satisfy_sentence1.append(' '.join(text3.split()))
satisfy_sentence_train = np.array(satisfy_sentence1)
satisfy_sentence2 = []
for text in sentence_to_test:
    text1 = re.sub(limit, ' ', text)
    text2 = re.sub(label, '', text1)
    text3 = re.sub(word_pattern, '', text2)
    satisfy_sentence2.append(' '.join(text3.split()))
satisfy_sentence_test = np.array(satisfy_sentence2)

count = CountVectorizer(lowercase=False, token_pattern='[-/$%\da-zA-Z\w]{2,}', max_features=1000)
X_train_bag_of_words = count.fit_transform(satisfy_sentence_train)
X_test_bag_of_words = count.transform(satisfy_sentence_test)
clf1 = tree.DecisionTreeClassifier(min_samples_leaf=
                                  int(0.01 * (len(sentence_to_train))), criterion='entropy', random_state=0)
model1 = clf1.fit(X_train_bag_of_words, train_sentiment)


clf2 = tree.DecisionTreeClassifier(criterion='entropy', random_state=0)
model2 = clf2.fit(X_train_bag_of_words, train_sentiment)


def predict_and_test(model, bag_of_words):
    num_dec_point = 3
    predicted_y = model.predict(bag_of_words)
    a_mic = accuracy_score(test_sentiment, predicted_y)
    p_mic, r_mic, f1_mic, _ = precision_recall_fscore_support(test_sentiment, predicted_y,average='micro',warn_for=())
    p_mac, r_mac, f1_mac, _ = precision_recall_fscore_support(test_sentiment, predicted_y,average='macro',warn_for=())
    res = [round(a_mic,num_dec_point), round(p_mac,num_dec_point), round(r_mac,num_dec_point), round(f1_mac,num_dec_point)]
    return res


res1 = predict_and_test(model1, X_test_bag_of_words)
res2 = predict_and_test(model2, X_test_bag_of_words)
name = ['accuracy','mac_precision','mac_recall','mac_f1']
index = np.arange(len(name))
width = 0.3
plt.bar(index,res1,width,color='blue',label='model(a)')
plt.bar(index+width,res2,width,color='red',label='model(b)')
plt.xticks(index, labels=name)
for a,b in zip(index,res1):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')
for a,b in zip(index+width,res2):
    plt.text(a,b,'%.2f'%b,ha='center',va='bottom')

plt.xlabel('metrics')
plt.ylabel('value')
plt.legend()
plt.show()

