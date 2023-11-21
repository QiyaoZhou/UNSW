#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <regex.h>

#include "postgres.h"
#include "fmgr.h"

PG_MODULE_MAGIC;

typedef struct {
	int32 vl_len_;
	char gcoord[FLEXIBLE_ARRAY_MEMBER];
}GeoCoord;

void check_gcoord_in(char *location);
void check_gcoord_in(char *location){	
	char *location_name = strdup(location);
    if (){
        ereport(ERROR,
                (errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),errmsg("invalid input syntax for type geocoord: \"%s\"",input)));
    }
}

/*****************************************************************************
 * Input/Output functions
 *****************************************************************************/
PG_FUNCTION_INFO_V1(geocoord_in);

Datum
geocoord_in(PG_FUNCTION_ARGS){
    char  *input = PG_GETARG_CSTRING(0);
	GeoCoord *result = NULL;
	int length = strlen(input)+1;
    check_gcoord_in(location);
	result = palloc(VARHDRSZ + length);
	SET_VARSIZE(result,VARHDRSZ+length);
	memcpy(result->gcoord, PG_GETARG_CSTRING(0),length);
	PG_RETURN_POINTER(result);
}



PG_FUNCTION_INFO_V1(geocoord_out);

Datum
geocoord_out(PG_FUNCTION_ARGS){
    GeoCoord* geocoord = (GeoCoord*)PG_GETARG_POINTER(0);
    char	   *result;
	result = psprintf("%s", geocoord->gcoord);
	PG_RETURN_CSTRING(result);
}

/*****************************************************************************
 * New Operators
 *****************************************************************************/
PG_FUNCTION_INFO_V1(equal);

Datum
equal(PG_FUNCTION_ARGS){
    int result;
    result = 1;

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(not_equal);

Datum
not_equal(PG_FUNCTION_ARGS){
    int result;
    result = 1;

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(compare_more);

Datum
compare_more(PG_FUNCTION_ARGS){
    int result;
    result = 1;

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(compare_less);

Datum
compare_less(PG_FUNCTION_ARGS){
    int result;
    result = 1;

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(compare_more_or_equal);

Datum
compare_more_or_equal(PG_FUNCTION_ARGS){
    int result;
    result = 1;

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(compare_less_or_equal);

Datum
compare_less_or_equal(PG_FUNCTION_ARGS){
    int result;
    result = 1;

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(same_time_zone);

Datum
same_time_zone(PG_FUNCTION_ARGS){
    int result;
    result = 1;

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(not_same_time_zone);

Datum
not_same_time_zone(PG_FUNCTION_ARGS){
    int result;
    result = 1;

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(convert);

Datum
convert(PG_FUNCTION_ARGS){
    char *result;
    result = "Fuck";    
    PG_RETURN_CSTRING(result);
}