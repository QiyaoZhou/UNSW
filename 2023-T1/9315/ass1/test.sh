make
dropdb test
createdb test
psql test -f gcoord.sql
psql test -f test.sql