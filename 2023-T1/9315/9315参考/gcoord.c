#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>

#include "postgres.h"
#include "fmgr.h"
#include "libpq/pqformat.h"		
#include "access/hash.h"
#include "utils/builtins.h"

PG_MODULE_MAGIC;

typedef struct {
	int32 vl_len_;
	char gcoord[FLEXIBLE_ARRAY_MEMBER];
}GeoCoord;

typedef struct {
    char loc[256];
    double lat;
    double lon;
    char lat_m[2];
    char lon_m[2];
    int mark;
} GeoCoord_Split;


/*****************************************************************************
 * Internal functions
 *****************************************************************************/

void *to_split(char *str);
int locationname_check(char *str);
int latitude_check(char *str);
int longitude_check(char *str);
GeoCoord_Split restore(char *str);
int is_valid(char *str);
char *convert(double num);



void *to_split(char *input){
	char *process =strdup(input); 
    char *token;
    char **tokens;
    int num_tokens = 0;
    char *city = NULL;
    char *degree1 = NULL;
    char *degree2 = NULL;
    char **result = NULL;
    char *token2;
    char **tokens2;
    int num_tokens2 = 0;

    tokens = palloc(sizeof(char*) * 5);
    token = strtok(process, ",");
    while (token != NULL) {
        tokens[num_tokens] = palloc(strlen(token) + 1); 
        strcpy(tokens[num_tokens], token);
        num_tokens++;
        token = strtok(NULL, ",");
    }
    result = palloc(sizeof(char*) * 5);
    if (num_tokens==2){
        city = tokens[0];
        tokens2 = palloc(sizeof(char*) * 5);
        token2 = strtok(tokens[1], " ");
        while (token2 != NULL) {
            tokens2[num_tokens2] = palloc(strlen(token2) + 1); 
            strcpy(tokens2[num_tokens2], token2);
            num_tokens2++;
            token2 = strtok(NULL, " ");
        }
        if (num_tokens2==2){
            degree1 = tokens2[0];
            degree2 = tokens2[1];
        }
        else{
            result[0] = "$";
            result[1] = "$";
            result[2] = "$";
            return result;
        }
    }
    else if (num_tokens==3){
        city = tokens[0];
        degree1 = tokens[1];
        degree2 = tokens[2];
    }
    else{
        result[0] = "$";
        result[1] = "$";
        result[2] = "$";  
        return result;
    }
    result[0] = city;
    result[1] = degree1;
    result[2] = degree2;   
    return result;
}

int locationname_check(char *str){
    char *name= strdup(str);
    if(*name == ' '){		
		return 0;
	}
    if(strcmp(str + strlen(str) - 1, " ")==0){
        return 0;
    }
    for (int i = 0; i < strlen(str); i++){            
        if(isalpha(str[i])||str[i] ==' '){
        }else{
            return 0;
        }
    }
    return 1;
}

int latitude_check(char *str){
    char *ch = strdup(str);
    double value;
    int len;
	char *endpoint = NULL;
	
    if (strlen(str) < 3) {
        return 0;
    }
	len = strlen(ch);
    if (strcmp(ch + len - 3, "°N") != 0&& strcmp(ch + strlen(str) - 3, "°S") != 0) {
        return 0;
    } 
	*(ch + len - 3) = '\0';

	if(atof(ch)< 0||atof(ch)>90){
		return 0;
	}

    value = strtod(ch,&endpoint);
    if (*endpoint!='\0'&&value == value){		
        return 0;
    }

    
    return 1;
}


int longitude_check(char *str){
	char *ch = strdup(str);
    double value;
    int len;
	char *endpoint = NULL;
	
    if (strlen(str) < 3) {
        return 0;
    }
	len = strlen(ch);
    if (strcmp(ch + len - 3, "°W") != 0&& strcmp(ch + strlen(str) - 3, "°E") != 0) {
        return 0;
    } 
	*(ch + len - 3) = '\0';

	if(atof(ch)< 0||atof(ch)>180){
		return 0;
	}

    value = strtod(ch,&endpoint);
    if (*endpoint!='\0'&&value == value){		
        return 0;
    }

    
    return 1;
}

GeoCoord_Split restore(char *input){
    GeoCoord_Split coordinate;
    void **check = to_split(input);
    char *city = NULL;
    char *degree1 = NULL;
    char *degree2 = NULL;
    city = check[0];
    degree1 = check[1];
    degree2 = check[2];
    strcpy(coordinate.loc,city);
    if(latitude_check(degree1)==1){
        coordinate.mark = 1;
        if(strcmp(degree1 + strlen(degree1) - 3, "°N") == 0){
            strcpy(coordinate.lat_m,"N");
            coordinate.lat = strtod(degree1, NULL);
        }else{
            strcpy(coordinate.lat_m,"S");
            coordinate.lat = strtod(degree1, NULL);
        }
        if(strcmp(degree2 + strlen(degree2) - 3, "°W") == 0){
            strcpy(coordinate.lon_m,"W");
            coordinate.lon = strtod(degree2, NULL);
        }else{
            strcpy(coordinate.lon_m,"E");
            coordinate.lon = strtod(degree2, NULL);
        }
    }else{
        coordinate.mark = 2;
        if(strcmp(degree2 + strlen(degree2) - 3, "°N") == 0){
            strcpy(coordinate.lat_m,"N");
            coordinate.lat = strtod(degree2, NULL);
        }else{
            strcpy(coordinate.lat_m,"S");
            coordinate.lat = strtod(degree2, NULL);
        }
        if(strcmp(degree1 + strlen(degree1) - 3, "°W") == 0){
            strcpy(coordinate.lon_m,"W");
            coordinate.lon = strtod(degree1, NULL);
        }else{
            strcpy(coordinate.lon_m,"E");
            coordinate.lon = strtod(degree1, NULL);
        }
    }
    return coordinate;
}

int is_valid(char *str){
    void **check = to_split(str);
    char *city = NULL;
    char *degree1 = NULL;
    char *degree2 = NULL;
    city = check[0];
    degree1 = check[1];
    degree2 = check[2];
	
    if (locationname_check(city)==0){
		
        return 0;
    }
    if (!((latitude_check(degree1)==1&&longitude_check(degree2)==1)||(latitude_check(degree2)==1&&longitude_check(degree1)==1))){

        return 0;
    }
    return 1;
}

static int compare_internal(GeoCoord * a, GeoCoord * b){
	GeoCoord_Split coordinate1 = restore(a->gcoord);
	GeoCoord_Split coordinate2 = restore(b->gcoord);
	if(coordinate1.lat<coordinate2.lat){
		return 1;
	}else if(coordinate1.lat>coordinate2.lat){
		return -1;
	}else{
		if(strcmp(coordinate1.lat_m,coordinate2.lat_m)<0){	
			return 1;
		}else if (strcmp(coordinate1.lat_m,coordinate2.lat_m)>0){
			return -1;
		}else{
			if(coordinate1.lon<coordinate2.lon){
				return 1;
			}else if(coordinate1.lon>coordinate2.lon){
				return -1;
			}else{
				if(strcmp(coordinate1.lon_m,coordinate2.lon_m)<0){
					return 1;
				}else if (strcmp(coordinate1.lon_m,coordinate2.lon_m)>0){
					return -1;
				}else{
					if(strcmp(coordinate1.loc,coordinate2.loc)>0){
						return 1;
					}else if(strcmp(coordinate1.loc,coordinate2.loc)<0){
						return -1;
					}else{
						return 0;
					}
					
				}
			}
		}
	}
	return 0;
}

static int time_zone_check(GeoCoord * a, GeoCoord * b){
	GeoCoord_Split coordinate1 = restore(a->gcoord);
	GeoCoord_Split coordinate2 = restore(b->gcoord);
	if(strcmp(coordinate1.lon_m,coordinate2.lon_m)==0&&(int)floor(coordinate1.lon/15)==(int)floor(coordinate2.lon/15)){
		return 1;
	}else{
		return 0;
	}
}


char *convert(double num){
	int deg;
	int min;
	int sec;
	char *res = NULL;
	double process_a;
	double process_b;
    num = floor(num * 10000.0 + 0.5) / 10000.0;
    deg = (int)num;
    process_a = floor((num - (double)deg)*60* 10000.0 + 0.5)/ 10000.0;
	min = (int)process_a;
	process_b = floor((3600*(num - deg)-60*min)* 10000.0 + 0.5)/ 10000.0;
	sec = (int)process_b;
    if (sec<0){
        sec = 0;
    }
	if(deg!=0 && min !=0 && sec!=0){
		res = psprintf("%d°%d'%d\"", deg, min, sec);
	}else if (deg!=0 && min !=0 && sec==0){
		res = psprintf("%d°%d'", deg, min);
	}else if(deg!=0 && min ==0 && sec!=0){
		res = psprintf("%d°%d\"", deg, sec);
	}else if(deg!=0 && min ==0 && sec==0){
		res = psprintf("%d°", deg);
	}else if(deg==0 && min !=0 && sec!=0){
		res = psprintf("%d°%d'%d\"",deg, min, sec);
	}else if(deg==0 && min ==0 && sec!=0){
		res = psprintf("%d°%d\"",deg, sec);
	}else{
		res = psprintf("%d°",deg);
	}
	return res;
}

/*****************************************************************************
 * Input/Output functions
 *****************************************************************************/
PG_FUNCTION_INFO_V1(geocoord_in);

Datum
geocoord_in(PG_FUNCTION_ARGS){
    char  *input = PG_GETARG_CSTRING(0);
	GeoCoord *result = NULL;
	char **get = NULL;
	char *store;
    char *city;
	int length = strlen(input)+1;
    if(is_valid(input)==0){
        ereport(ERROR,
                (errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),errmsg("invalid input syntax for type GeoCoord: \"%s\"",input)));
    }
	result = palloc(VARHDRSZ + length);
	get = to_split(input);
    city = get[0];
    for(int i = 0; i<strlen(city); i++) {
            city[i] = tolower(city[i]);
        }
	if(strcmp(get[1] + strlen(get[1]) - 1, "N") == 0||strcmp(get[1] + strlen(get[1]) - 1, "S") == 0){
		store = psprintf("%s,%s,%s",city,get[1],get[2]);
	}else{
		store = psprintf("%s,%s,%s",city,get[2],get[1]);
	}
	SET_VARSIZE(result,VARHDRSZ+length);
	memcpy(result->gcoord,store,length);
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
 * Operators and functions
 *****************************************************************************/
PG_FUNCTION_INFO_V1(compare_equal);

Datum
compare_equal(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(compare_internal(a, b) == 0);
}

PG_FUNCTION_INFO_V1(compare_not_equal);

Datum
compare_not_equal(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(compare_internal(a, b)!=0);
}

PG_FUNCTION_INFO_V1(compare_more);

Datum
compare_more(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(compare_internal(a, b) > 0);
}

PG_FUNCTION_INFO_V1(compare_less);

Datum
compare_less(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(compare_internal(a, b) < 0);
}

PG_FUNCTION_INFO_V1(compare_more_or_equal);

Datum
compare_more_or_equal(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);

    PG_RETURN_BOOL(compare_internal(a, b) >= 0);
}

PG_FUNCTION_INFO_V1(compare_less_or_equal);

Datum
compare_less_or_equal(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(compare_internal(a, b) <= 0);
}

PG_FUNCTION_INFO_V1(same_time_zone);

Datum
same_time_zone(PG_FUNCTION_ARGS){
	GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
	GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);


	PG_RETURN_BOOL(time_zone_check(a,b)==1);
}

PG_FUNCTION_INFO_V1(not_same_time_zone);

Datum
not_same_time_zone(PG_FUNCTION_ARGS){
	GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
	GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);

	PG_RETURN_BOOL(time_zone_check(a,b)==0);
}

PG_FUNCTION_INFO_V1(convert2dms);

Datum
convert2dms(PG_FUNCTION_ARGS){
    GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord_Split coordinate = restore(a->gcoord);
	text *result_dms;
	char *result;
	if(coordinate.mark ==1){
		result = psprintf("%s,%s%s,%s%s",coordinate.loc,convert(coordinate.lat),coordinate.lat_m,convert(coordinate.lon),coordinate.lon_m);
	}else {
		result = psprintf("%s,%s%s,%s%s",coordinate.loc,convert(coordinate.lon),coordinate.lon_m,convert(coordinate.lat),coordinate.lat_m);
	
	}
	result_dms = cstring_to_text(result);
	PG_RETURN_TEXT_P(result_dms);
}

PG_FUNCTION_INFO_V1(compare);

Datum
compare(PG_FUNCTION_ARGS)
{
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);

	PG_RETURN_INT32(compare_internal(a, b));
}

PG_FUNCTION_INFO_V1(hash_gcoord);

Datum
hash_gcoord(PG_FUNCTION_ARGS)
{
	int hash_code = 0;
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	hash_code = DatumGetUInt32(hash_any((const unsigned char *) a->gcoord, strlen(a->gcoord)));
	PG_RETURN_INT32(hash_code);
}