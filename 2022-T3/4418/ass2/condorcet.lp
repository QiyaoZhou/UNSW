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
:-A=#count{X:condorcetWinner(X)},A!=1.

#show condorcetWinner/1.
