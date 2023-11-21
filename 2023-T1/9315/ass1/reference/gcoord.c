
#include "postgres.h"

#include "fmgr.h"
#include "libpq/pqformat.h"		

#include "access/hash.h"
#include "utils/builtins.h"

#include <string.h>
#include <ctype.h>
#include <math.h>
#include <stdbool.h>
#define DEGREE "°"
#define lat_dir_1 "N"
#define lat_dir_2 "S"
#define long_dir_1 "E"
#define long_dir_2 "W"
PG_MODULE_MAGIC;

typedef struct geoCoord
{
	int32 vl_len_;
	char gcoord[FLEXIBLE_ARRAY_MEMBER];
}GeoCoord;

typedef struct geoCoord_Info
{
	char longitude [20];
	char latitude [20];
	char location [20];
    char lat_dir[2];
    char long_dir[2];
}GeoCoord_Info;




void check_gcoord_in(char *location);
void check_gcoord_in(char *location){	
	char *location_name = strdup(location);
	char *position = strchr(location_name,',');
    char *latitude = NULL;
    char *longitude = NULL;
    //第三部分
    char *third = NULL;
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

/*****************************************************************************
 * Input/Output functions
 *****************************************************************************/
PG_FUNCTION_INFO_V1(gcoord_in);

Datum
gcoord_in(PG_FUNCTION_ARGS)
{
	char  *location = PG_GETARG_CSTRING(0);
	GeoCoord *result = NULL;
	int length = strlen(location)+1;
	printf("%d",length);
	//检测数据需自己实现
	check_gcoord_in(location);
	
	//allocate the variable size struct
	result = palloc(VARHDRSZ + length);
	//输出日志
	SET_VARSIZE(result,VARHDRSZ+length);
	memcpy(result->gcoord, PG_GETARG_CSTRING(0),length);
	PG_RETURN_POINTER(result);
}

PG_FUNCTION_INFO_V1(gcoord_out);

Datum
gcoord_out(PG_FUNCTION_ARGS)
{
	GeoCoord    *geoCoord = (GeoCoord *) PG_GETARG_POINTER(0);
	char	   *result;
	result = psprintf("%s", geoCoord->gcoord);
	PG_RETURN_CSTRING(result);
}

GeoCoord_Info string_to_struct(char *full_location);
GeoCoord_Info string_to_struct(char *full_location){
	char* location_name = strdup(full_location);
	GeoCoord_Info G1;
	char *position = strchr(location_name,',');
 	char *latitude = NULL;
    char *longitude = NULL;
    char *third = NULL;
	char *location = NULL;
	third = strchr(position+1,',');
	
    if (third == NULL) {
        third = strchr(position, ' ');
    }
	
	if(strchr(third,'W')!=NULL || strchr(third,'E')){
		latitude = position;
		
		longitude = third;
		
		*latitude ='\0';
		latitude++;
		
		*longitude ='\0';
		longitude++;
        location = location_name;
		
        *(latitude+strlen(latitude)- 3) ='\0';
        *(longitude+strlen(longitude)- 3) ='\0';

		for(int i = 0; i<strlen(location); i++) {
            location[i] = tolower(location[i]);
        }
        strcpy(G1.latitude,latitude);
        strcpy(G1.location,location);
        strcpy(G1.longitude, longitude);
        strcpy(G1.lat_dir, latitude+strlen(latitude)+2); 
        strcpy(G1.long_dir, longitude+strlen(longitude)+2);
        
	}else if(strchr(third,'N')!=NULL || strchr(third,'S')){
		latitude = third;
		longitude = position;

		*longitude ='\0';
		longitude++;
		*latitude ='\0';
		latitude++;
		location = location_name;

		for(int i = 0; i<strlen(location); i++) {
            location[i] = tolower(location[i]);
        }
		strcpy(G1.latitude,latitude);
        strcpy(G1.location,location);
        strcpy(G1.lat_dir, latitude+strlen(latitude)-1);
        strcpy(G1.long_dir, longitude+strlen(longitude)-1);
        strcpy(G1.longitude, longitude);

		
    }
	return G1;
}



static int
gcoord_abs_cmp_internal(GeoCoord * a, GeoCoord * b)
{
	//自己实现比较函数
	GeoCoord_Info g1 = string_to_struct(a->gcoord);
	GeoCoord_Info g2 = string_to_struct(b->gcoord);
	//第一个维度小于第二个维度
	if(atof(g1.latitude)<atof(g2.latitude)){
		return 1;
	//第一个维度大于第二个维度
	}else if(atof(g1.latitude)<atof(g2.latitude)){
		return 1;
	//第一个维度等于第二个维度
	}else{
		//第一个纬度方向为N第二个维度方向为S
		if(strcmp(g1.lat_dir,g2.lat_dir)<0){	
			return 1;
		//第一个纬度方向为S第二个维度方向为N
		}else if (strcmp(g1.lat_dir,g2.lat_dir)>0){
			return -1;
		//第一个纬度方向与第二个维度方向相同
		}else{
			//第一个经度小于第二个经度
			if(atof(g1.longitude)<atof(g2.longitude)){
				return 1;
			////第一个经度大于第二个经度
			}else if(atof(g1.longitude)>atof(g2.longitude)){
				return -1;
			//第一个经度等于第二个经度
			}else{
				//第一个经度方向为E第二个经度方向为W
				if(strcmp(g1.long_dir,g2.long_dir)<0){
					return 1;
				//第一个经度方向为W第二个经度方向为E
				}else if (strcmp(g1.long_dir,g2.long_dir)>0){
					return -1;
				//第一个经度方向与第二个经度方向相同
				}else{
					if(strcmp(g1.location,g2.location)>0){
						return 1;
					}else if(strcmp(g1.location,g2.location)<0){
						return -1;
					}else{
						return 0;
					}
					
				}
			}
		}
	}
}






PG_FUNCTION_INFO_V1(gcoord_abs_lt);

Datum
gcoord_abs_lt(PG_FUNCTION_ARGS)
{
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);
	
	
	
	PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b)<0);
}

PG_FUNCTION_INFO_V1(gcoord_abs_le);

Datum
gcoord_abs_le(PG_FUNCTION_ARGS)
{
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);

	PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b) <= 0);
}

PG_FUNCTION_INFO_V1(gcoord_abs_eq);

Datum
gcoord_abs_eq(PG_FUNCTION_ARGS)
{
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);

	PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b) == 0);
}

PG_FUNCTION_INFO_V1(gcoord_abs_ge);

Datum
gcoord_abs_ge(PG_FUNCTION_ARGS)
{
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);

	PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b) >= 0);
}

PG_FUNCTION_INFO_V1(gcoord_abs_gt);

Datum
gcoord_abs_gt(PG_FUNCTION_ARGS)
{
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);

	PG_RETURN_BOOL(gcoord_abs_cmp_internal(a, b) > 0);
}
/////////////////////////////////////////////////////////////////////////////////////////////
PG_FUNCTION_INFO_V1(gcoord_abs_neq);

Datum
gcoord_abs_neq(PG_FUNCTION_ARGS)
{
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);

	PG_RETURN_INT32(gcoord_abs_cmp_internal(a, b)!=0);
}
/////////////////////////////////////////////////////////////////////////////////////////////
PG_FUNCTION_INFO_V1(gcoord_abs_wave);

Datum
gcoord_abs_wave(PG_FUNCTION_ARGS)
{
	//GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	//GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);

	PG_RETURN_BOOL(1>0);
}
/////////////////////////////////////////////////////////////////////////////////////////////
PG_FUNCTION_INFO_V1(gcoord_abs_nwave);

Datum
gcoord_abs_nwave(PG_FUNCTION_ARGS)
{
	//GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	//GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);

	PG_RETURN_BOOL(1>0);
}
/////////////////////////////////////////////////////////////////////////////////////////////


PG_FUNCTION_INFO_V1(gcoord_abs_cmp);

Datum
gcoord_abs_cmp(PG_FUNCTION_ARGS)
{
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);

	PG_RETURN_INT32(gcoord_abs_cmp_internal(a, b));
}

PG_FUNCTION_INFO_V1(convert2dms);
Datum
convert2dms(PG_FUNCTION_ARGS)
{
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	GeoCoord    *b = (GeoCoord *) PG_GETARG_POINTER(1);
	

	PG_RETURN_INT32(gcoord_abs_cmp_internal(a, b));
}

//需要先把location（string)转为结构体 统一成一样的格式再用
PG_FUNCTION_INFO_V1(hash_gcoord);

Datum
hash_gcoord(PG_FUNCTION_ARGS)
{
	int hash_code = 0;
	GeoCoord    *a = (GeoCoord *) PG_GETARG_POINTER(0);
	//将family name 和 given name取出来再hash
	//todo
	hash_code = DatumGetUInt32(hash_any((const unsigned char *) a->gcoord, strlen(a->gcoord)));

	

	PG_RETURN_INT32(hash_code);
}