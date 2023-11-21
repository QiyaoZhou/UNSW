% encoding

% Residence capacity
room(1,101).
room(1,102).
room(1,103).
room(2,201).
room(2,202).
room(2,203).

% basic rule No1: Total N students will be registrated.
% If the number of registrants is greater than the capacity of the hostel, 
%priority will be given to the full occupancy.

N1{registration(Room1,ID1) : room(_,Room1), student(_,ID1)}N1 :- N1=#count{X:student(_,X)},N2=#count{X:room(_,X)},N1<=2*N2.

2*N2{registration(Room1,ID1) : room(_,Room1), student(_,ID1)}2*N2 :- N1=#count{X:student(_,X)},N2=#count{X:room(_,X)},N1>2*N2.

% basic rule No2: one student cannot be assigned to two rooms.
:- registration(Room1,ID1),registration(Room2,ID1), Room1!=Room2.

% 1.Gender constraint:Students of different genders cannot be allocated to the same room.
:- registration(Room1,ID1),gender(ID1,G1),
  registration(Room1,ID2),gender(ID2,G2),
  ID1!=ID2, G1!=G2.

% 2.Room capacity constraint: Each room can have maximum 2 students
:- registration(Room1,ID1),registration(Room1,ID2),registration(Room1,ID3),
  ID1!=ID2,ID1!=ID3,ID2!=ID3.

% 3.Matching degree calculation: Matching degree will plus one if two students have the same hobby.
roommate(ID1, ID2) :- registration(Room1, ID1), registration(Room1, ID2), ID1!=ID2.
roommate_hobby(ID1, ID2, X):- hobby(ID1,X), hobby(ID2, X), roommate(ID1, ID2).
total_degree(N):- N = #count{(ID1,ID2,X): roommate_hobby(ID1,ID2,X)}.

% 4.Pet ownership constraints: Students who do not like pets will not be allocated to the same unit with students who have pets.
:- registration(X,ID1),room(X,U1),pet(ID1,Preference1), 
   registration(Y,ID2),room(Y,U1),pet(ID2,Preference2),
   ID1!=ID2, Preference1!=Preference2.

% 5.Cook constraints: One unit can have at most 3 students who want to cook in their dormitory.
:- #count{X: cook(ID1,X), registration(Room1,ID1),room(Unit1,Room1),X=yes}>3.

% 6.Sleeping time constraint: Only students whose bedtime and wake-up time 
% are all within 1 hour of each other will be grouped together.
:- registration(Room1,ID1), bedtime(ID1,Time1), 
   registration(Room1,ID2), bedtime(ID2,Time2),
   Time1>Time2+1.
   
:- registration(Room1,ID1), bedtime(ID1,Time1), 
   registration(Room1,ID2), bedtime(ID2,Time2),
   Time1<Time2-1.

:- registration(Room1,ID1), waketime(ID1,Time1), 
   registration(Room1,ID2), waketime(ID2,Time2),
   Time1>Time2+1.

:- registration(Room1,ID1), waketime(ID1,Time1), 
   registration(Room1,ID2), waketime(ID2,Time2),
   Time1<Time2-1.


% display
#maximize{N: total_degree(N)}.
#show total_degree/1.
#show registration/2.
