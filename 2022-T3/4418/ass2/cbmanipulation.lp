%Count number of alternatives and voters
alternativeNumber(N):-N=#max{K:rank(I,A,K)}.
voterNumber(Z):-Z=#max{I:rank(I,A,K)}.
alternative(X):-rank(I,X,K).

%Comparing the preferences of two alternatives at the same voter
compare(I,X,Y,1):-rank(I,X,K1),rank(I,Y,K2),K1<K2.
compare(I,X,Y,-1):-rank(I,X,K1),rank(I,Y,K2),K1>K2.

%Get the direction of the edges in the majority graph
major(1,X,Y,K):-compare(1,X,Y,K).
major(M+1,X,Y,K1+K2):-major(M,X,Y,K1),compare(M+1,X,Y,K2),alternativeNumber(N),M<N.
majority(X,Y):-major(M,X,Y,K),K>0,voterNumber(Z),M=Z.

%Output the condorcetWinner or UNSATISFIABLE
condorcetWinner(X):-alternative(X),A=#count{Y:majority(X,Y)},alternativeNumber(N),A=N-1.

%Check if the correct condorcetwinner is generated
check(ncw):-A=#count{X:condorcetWinner(X)},A!=1.

%Compute the borda value of all alternatives
score(I,X,N-K+1):-check(ncw),rank(I,X,K),alternativeNumber(N).
total(1,X,K):-score(1,X,K).
total(M+1,X,K1+K2):-total(M,X,K1),score(M+1,X,K2),check(ncw),alternativeNumber(N),M<N.
borda(X,K):-total(M,X,K),voterNumber(Z),M=Z,check(ncw).

%Generate bordawinner comes first in alphabetical order
bordaMaxvalue(A):-A=#max{K:borda(_,K)},check(ncw).
bordaset(X):-borda(X,K),bordaMaxvalue(A),K=A,check(ncw).
bordaWinner(H):-H=#min{X:bordaset(X)},check(ncw).

%Get condorcetWinner or bordawinner as winner
winner(X):-condorcetWinner(X).
winner(X):-bordaWinner(X),check(ncw).

%Choose a voter
1 {voter(I):rank(I,A,K)} 1.

%Remove cases where the voter has the ultimate winner as their preference first
:-voter(I),rank(I,X,1),winner(X).

%Generate false ranking
chescore(X,A):-alternative(X),A=#count{Y:majority(X,Y)},alternativeNumber(N),A<=N-1,not check(ncw).
chescore(X,K):-borda(X,K),check(ncw).
be(A):-voter(I),rank(I,A,X),rank(I,B,Y),X<Y,winner(B).
1 {better(X):be(X)} 1.
morethan(A,B):-chescore(A,K1),chescore(B,K2),K1>K2,better(C),A!=C,B!=C.
morethan(A,B):-chescore(A,K1),chescore(B,K2),K1=K2,A<B,better(C),A!=C,B!=C.
falserank(I,A,1):-voter(I),better(A).
falserank(I,A,N+1):-falserank(I,B,N),voter(I),alternativeNumber(M),N<=M-1,alternative(A),C=#count{Y:morethan(A,Y)},C=N-1,better(D),A!=D.

%Generate true ranking by original preference
truerank(I,A,K):-rank(I,A,K),voter(I).

%Recomputing winner with false preferences using the previously used method
compare2(I,X,Y,1):-voter(I),falserank(I,X,K1),falserank(I,Y,K2),K1<K2.
compare2(I,X,Y,-1):-voter(I),falserank(I,X,K1),falserank(I,Y,K2),K1>K2.
compare2(I,X,Y,1):-rank(I,X,K1),rank(I,Y,K2),K1<K2,not voter(I).
compare2(I,X,Y,-1):-rank(I,X,K1),rank(I,Y,K2),K1>K2,not voter(I).
major2(1,X,Y,K):-compare2(1,X,Y,K).
major2(M+1,X,Y,K1+K2):-major2(M,X,Y,K1),compare2(M+1,X,Y,K2),alternativeNumber(N),M<N.
majority2(X,Y):-major2(M,X,Y,K),K>0,voterNumber(Z),M=Z.
condorcetWinner2(X):-alternative(X),A=#count{Y:majority2(X,Y)},alternativeNumber(N),A=N-1.
check2(ncw):-not condorcetWinner2(_).
score2(I,X,N-K+1):-check2(ncw),falserank(I,X,K),alternativeNumber(N),voter(I).
score2(I,X,N-K+1):-check2(ncw),rank(I,X,K),alternativeNumber(N),not voter(I).
total2(1,X,K):-score2(1,X,K).
total2(M+1,X,K1+K2):-total2(M,X,K1),score2(M+1,X,K2),check2(ncw),alternativeNumber(N),M<N.
borda2(X,K):-total2(M,X,K),voterNumber(Z),M=Z,check2(ncw).
bordaMaxvalue2(A):-A=#max{K:borda2(_,K)},check2(ncw).
bordaset2(X):-borda2(X,K),bordaMaxvalue2(A),K=A,check2(ncw).
bordaWinner2(H):-H=#min{X:bordaset2(X)}.
falsewinner(X):-condorcetWinner2(X).
falsewinner(X):-bordaWinner2(X),check2(ncw).

%Excluding cases where the new winner is still not the voter's first choice
:-falsewinner(X),better(Y),X!=Y.

#show falserank/3.
#show truerank/3.
