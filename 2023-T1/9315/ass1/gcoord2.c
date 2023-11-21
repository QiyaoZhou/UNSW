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

typedef struct geoCoord
{
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
    char text[300];
} GeoCoord_Split;

void *to_split(char *str);
int locationname_check(char *str);
int latitude_check(char *str);
int longitude_check(char *str);
GeoCoord_Split restore(char *str);
char *return_dms_format(double num);



void *to_split(char *input){
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
    token = strtok(input, ",");
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

void check_gcoord_in(char *location);
void check_gcoord_in(char *location){	
	char *location_name = strdup(location);
	char *position = strchr(location_name,',');
    char *latitude = NULL;
    char *longitude = NULL;
    //第三部分
    char *third = NULL;
	double num = 0.0;
	char *endpoint = NULL;
	
	
	if(*location_name == ' '){		
		ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
	}
	//报错，用于判断location最后一位是否是空格
	if ( *(position - 1) == ' ') {
            ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
    }
	third = strchr(position+1,',');
	//用于判断第三部分内容是否用逗号来分割
    if (third == NULL) {
        //若第三部分不是用逗号分隔判断是否用空格分割
        third = strchr(position, ' ');
        //若第三部分不是用逗号分隔也不是用空格分割则报错
        if (third == NULL) {
            //报错
            ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
        }
    }
	//若第三部分是经度
	if(strchr(third,'W')!=NULL || strchr(third,'E')){
		latitude = position;
		//将第三部分给经度
		longitude = third;
		//先分割纬度与locationname
		*latitude ='\0';
		latitude++;
		//再分割纬度于经度
		*longitude ='\0';
		longitude++;
		//再次判断latitude是否是经度 若是则报错
		if (strchr(latitude,'W')||strchr(latitude,'E')){
			ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
			
		}else{
			printf("%s\n",latitude);
			printf("%s\n",longitude);
			//判断经纬度是否含有度数符号
			if (strncmp(latitude+strlen(latitude)- 3, DEGREE, 2) != 0 || strncmp(longitude+strlen(longitude)- 3, DEGREE, 2) != 0 ) {
				ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
			}else{
				*(latitude+strlen(latitude)- 3) ='\0';
				printf("%s\n",latitude);
				*(longitude+strlen(longitude)- 3) ='\0';
				if(atoi(latitude)<0 || fabs(atoi(latitude)-(int)atoi(latitude))>=1e-8 || atoi(latitude)>90 || atoi(longitude)<0 || fabs(atoi(longitude)-(int)atoi(longitude))>=1e-8 || atoi(longitude)>180){
					//经度数值为负数或者不为整数  报错！！！！！！！！
					ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
				//有度数则取出数字部分
				}else{					
					num = strtod(latitude,&endpoint);
					if (*endpoint!='\0'&&num==num){
						ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
					}
					
				}
			}
		}

	}else if(strchr(third,'N')!=NULL || strchr(third,'S')){
		latitude = third;
		longitude = position;

		*longitude ='\0';
		longitude++;
		*latitude ='\0';
		latitude++;
		//再次判断longitude是否有纬度 若是则报错
		if(strchr(longitude,'N')||strchr(longitude,'S')){
			ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
			
		}else{
			//判断经纬度是否含有度数符号
			if (strncmp(latitude+strlen(latitude)- 3, DEGREE, 2) != 0 || strncmp(longitude+strlen(longitude)- 3, DEGREE, 2) != 0 ) {
				ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
			}else{
				*(latitude+strlen(latitude)- 3) ='\0';
				printf("%s\n",latitude);
				*(longitude+strlen(longitude)- 3) ='\0';
				if(atoi(latitude)<0 || fabs(atoi(latitude)-(int)atoi(latitude))>=1e-8 || atoi(latitude)>90 || atoi(longitude)<0 || fabs(atoi(longitude)-(int)atoi(longitude))>=1e-8 || atoi(longitude)>180){
					//经度数值为负数或者不为整数  报错！！！！！！！！
				ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
				
				//有度数则取出数字部分
				}else{					
					num = strtod(latitude,&endpoint);
					if (*endpoint!='\0'&&num==num){
						ereport(ERROR,
						(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
						errmsg("invalid input syntax for type %s: \"%s\"",
						"GeoCoord", location)));
					}
					
				}
			}
		}
	}else{
            //既没有经度也没有纬度则报错
        ereport(ERROR,
				(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
					errmsg("invalid input syntax for type %s: \"%s\"",
					"GeoCoord", location)));
    }
	//遍历location_name 判断locationname中是否含有非字母字符（空格除外，前后空格之前已经判断）
    for (int i = 0; i < strlen(location_name); i++){
            
        if(isalpha(location_name[i])||location_name[i] ==' '){
        }else{
            //报错
            ereport(ERROR,
				(errcode(ERRCODE_INVALID_TEXT_REPRESENTATION),
					errmsg("invalid input syntax for type %s: \"%s\"",
					"GeoCoord", location)));
        }
    }
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
    for(int i = 0; i<strlen(city); i++) {
            city[i] = tolower(city[i]);
        }
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
    strcat(input, ",");
    strcat(input, check[1]);
    strcat(input, ",");
    strcat(input, check[2]);
    strcpy(coordinate.text,input);
    return coordinate;
}

static int
gcoord_abs_cmp_internal(GeoCoord * a, GeoCoord * b)
{
	GeoCoord_Split g1 = restore(a->gcoord);
	GeoCoord_Split g2 = restore(b->gcoord);
	if(g1.lat<g2.lat){
		return 1;
	}else if(g1.lat>g2.lat){
		return -1;
	}else{
		if(strcmp(g1.lat_m,g2.lat_m)<0){	
			return 1;
		}else if (strcmp(g1.lat_m,g2.lat_m)>0){
			return -1;
		}else{
			if(g1.lon<g2.lon){
				return 1;
			}else if(g1.lon>g2.lon){
				return -1;
			}else{
				if(strcmp(g1.lon_m,g2.lon_m)<0){
					return 1;
				}else if (strcmp(g1.lon_m,g2.lon_m)>0){
					return -1;
				}else{
					if(strcmp(g1.loc,g2.loc)>0){
						return 1;
					}else if(strcmp(g1.loc,g2.loc)<0){
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


char *return_dms_format(double num){
	int D;
	int M;
	int S;
	char *dms_format = NULL;
	double num2;
	double num3;
    num = floor(num * 10000.0 + 0.5) / 10000.0;
    D = (int)num;
    num2 = floor((num - (double)D)*60* 10000.0 + 0.5)/ 10000.0;
	M = (int)num2;
	num3 = floor((3600*(num - D)-60*M)* 10000.0 + 0.5)/ 10000.0;
	S = (int)num3;
    if (S<0){
        S = 0;
    }
	if(D!=0 && M !=0 && S!=0){
		dms_format = psprintf("%d°%d'%d\"", D, M, S);
		return dms_format;
	}else if (D!=0 && M !=0 && S==0){
		dms_format = psprintf("%d°%d'", D, M);
		return dms_format;
	}else if(D!=0 && M ==0 && S!=0){
		dms_format = psprintf("%d°%d\"", D, S);
		return dms_format;
	}else if(D!=0 && M ==0 && S==0){
		dms_format = psprintf("%d°", D);
		return dms_format;
	}else if(D==0 && M !=0 && S!=0){
		dms_format = psprintf("%d°%d'%d\"",D, M, S);
		return dms_format;
	}else if(D==0 && M ==0 && S!=0){
		dms_format = psprintf("%d°%d\"",D, S);
		return dms_format;
	}else{
		dms_format = psprintf("%d°",D);
		return dms_format;
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
	check_gcoord_in(input);
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
PG_FUNCTION_INFO_V1(compare_equal);

Datum
compare_equal(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b) == 0);
}

PG_FUNCTION_INFO_V1(compare_not_equal);

Datum
compare_not_equal(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b)!=0);
}

PG_FUNCTION_INFO_V1(compare_more);

Datum
compare_more(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b) > 0);
}

PG_FUNCTION_INFO_V1(compare_less);

Datum
compare_less(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b) < 0);
}

PG_FUNCTION_INFO_V1(compare_more_or_equal);

Datum
compare_more_or_equal(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);

    PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b) >= 0);
}

PG_FUNCTION_INFO_V1(compare_less_or_equal);

Datum
compare_less_or_equal(PG_FUNCTION_ARGS){
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    

    PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b) <= 0);
}

PG_FUNCTION_INFO_V1(same_time_zone);

Datum
same_time_zone(PG_FUNCTION_ARGS){
    int result;
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    GeoCoord_Split coordinate1 = restore(a->gcoord);
    GeoCoord_Split coordinate2 = restore(b->gcoord);
    if(strcmp(coordinate1.lon_m,coordinate2.lon_m)==0&&(int)floor(coordinate1.lon/15)==(int)floor(coordinate2.lon/15)){
        result = 1;
    }else{
        result = 0;
    }

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(not_same_time_zone);

Datum
not_same_time_zone(PG_FUNCTION_ARGS){
    int result;
    GeoCoord* a = (GeoCoord*)PG_GETARG_POINTER(0);
    GeoCoord* b = (GeoCoord*)PG_GETARG_POINTER(1);
    GeoCoord_Split coordinate1 = restore(a->gcoord);
    GeoCoord_Split coordinate2 = restore(b->gcoord);
    if(coordinate1.lon_m==coordinate2.lon_m&&(int)(coordinate1.lon/15)==(int)(coordinate2.lon/15)){
        result = 0;
    }else{
        result = 1;
    }

    PG_RETURN_BOOL(result);
}

PG_FUNCTION_INFO_V1(convert2dms);

Datum
convert2dms(PG_FUNCTION_ARGS){
    GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord_Split G1 = restore(a->gcoord);
	text *result_dms;
	if(G1.mark ==1){
		char *result = psprintf("%s,%s%s,%s%s",G1.loc,return_dms_format(G1.lat),G1.lat_m,return_dms_format(G1.lon),G1.lon_m);
		result_dms = cstring_to_text(result);
	}else {
		char *result = psprintf("%s,%s%s,%s%s",G1.loc,return_dms_format(G1.lon),G1.lon_m,return_dms_format(G1.lat),G1.lat_m);
		result_dms = cstring_to_text(result);
	}
	PG_RETURN_TEXT_P(result_dms);
}

PG_FUNCTION_INFO_V1(hash_gcoord);

Datum
hash_gcoord(PG_FUNCTION_ARGS)
{
	int hash_code = 0;
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
    int len=VARSIZE_ANY_EXHDR(a);
	char *result;
	result=(char *)palloc(len);
	snprintf(result, len, "%s", a->gcoord);
	hash_code = DatumGetUInt32(hash_any((const unsigned char *)result, len));
	PG_RETURN_INT32(hash_code);
}