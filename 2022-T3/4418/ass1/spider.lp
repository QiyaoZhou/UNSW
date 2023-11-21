%Count number of vertex
vertexnum(N):-N =#count{X:vertex(X)}.

%Generate all spanning trees(N vertices with (N - 1) edges)
(N-1){subedge(X,Y):edge(X,Y)} (N-1):-vertexnum(N).

%Find the center of a spider
subedge(X,Y):-subedge(Y,X).
degree(X,Y):- vertex(X),Y= #count{Z:subedge(X,Z)}.
center_acc(X):-A=#max{N : degree(M,N)},A>=3,degree(X,Y),Y>=3.
%center_acc(X):-A=#max{N : degree(M,N)},A<3,vertex(X).
1 {center(X) : center_acc(X)} 1.

%Get the spider's legs and detect the reachability of all vertices
leg_guess(X,Y):- subedge(X,Y),center(X).
leg_guess(X,Y):- leg_guess(Z,X), subedge(X, Y).
reachable(X):-center(X).
reachable(X):-leg_guess(Y,X).
:- vertex(X),not reachable(X).

%Exclusion of spider leg splitting
degree_leg(X,Y):- vertex(X),Y= #count{Z:leg_guess(X,Z)}.
:- vertex(X),degree_leg(X,Y),Y>2, not center(X).

%Get the standard output of the leg based on the input
leg(X,Y):-leg_guess(X,Y),edge(X,Y).

#show center/1.
#show leg/2.
