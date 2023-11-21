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

#show condorcetWinner/1.
#show bordaWinner/1.
