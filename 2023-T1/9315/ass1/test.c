#include <stdio.h>
#include <string.h>
#include <stdlib.h>

typedef struct geocoord *GeoCoord;

struct geocoord{
    char *loc;
    int lat_m;
    int lon_m;
    float lat;
    float lon;
    char *mark;
} geocoord;

void *to_split(char *input){
    char *token, **tokens;
    int num_tokens = 0;

    tokens = malloc(sizeof(char*) * 5);

    token = strtok(input, ",");
    while (token != NULL) {
        tokens[num_tokens] = malloc(strlen(token) + 1); 
        strcpy(tokens[num_tokens], token);
        num_tokens++;
        token = strtok(NULL, ",");
    }
    char *city, *degree1, *degree2, **result;
    result = malloc(sizeof(char*) * 5);
    if (num_tokens==2){
        city = tokens[0];
        char *token2, **tokens2;
        int num_tokens2 = 0;
        tokens2 = malloc(sizeof(char*) * 5);
        token2 = strtok(tokens[1], " ");
        while (token2 != NULL) {
            tokens2[num_tokens2] = malloc(strlen(token2) + 1); 
            strcpy(tokens2[num_tokens2], token2);
            num_tokens2++;
            token2 = strtok(NULL, " ");
        }
        if (num_tokens2==2){
            degree1 = tokens2[0];
            degree2 = tokens2[1];
            result[3] = " ";
            free(tokens2);
        }
        else{
            result[0] = "$";
            result[1] = "$";
            result[2] = "$";
            result[3] = ",";
            free(tokens2);
            free(tokens);    
            return result;
        }
    }
    else if (num_tokens==3){
        city = tokens[0];
        degree1 = tokens[1];
        degree2 = tokens[2];
        result[3] = ",";
    }
    else{
        result[0] = "$";
        result[1] = "$";
        result[2] = "$";
        result[3] = ",";
        free(tokens);    
        return result;
    }
    result[0] = city;
    result[1] = degree1;
    result[2] = degree2;
    free(tokens);    
    return result;
}

int locationname_check(char *str){
    regex_t regex;
    int ret;
    ret = regcomp(&regex, "^[A-Za-z ]+$", REG_EXTENDED);
    ret = regexec(&regex, str, 0, NULL, 0);
    regfree(&regex);
    if (ret == 0) {
        return 1;
    } else {
        return 0;
    }
}

int locationname_check(char *str){
    return 1;
}

int latitude_check(char *str){
    if (strlen(str) < 3) {
        return 0;
    }
    float value = strtod(str, NULL);
    if (value < 0 || value > 90) {
        return 0;
    }
    int len = strlen(str);
    if (strcmp(str + len - 3, "°S") != 0&& strcmp(str + strlen(str) - 3, "°N") != 0) {
        return 0;
    } 
    return 1;
}


int longitude_check(char *str){
    if (strlen(str) < 3) {
        return 0;
    }
    float value = strtod(str, NULL);
    if (value < 0 || value > 180) {
        return 0;
    }
    int len = strlen(str);
    if (strcmp(str + len - 3, "°W") != 0&& strcmp(str + strlen(str) - 3, "°E") != 0) {
        return 0;
    } 
    return 1;
}

int equal(GeoCoord coordinate1,GeoCoord coordinate2) {
    if(strcmp(coordinate1->loc,coordinate2->loc)==0&&coordinate1->lat==coordinate2->lat&&coordinate1->lon==coordinate2->lon&&coordinate1->lat_m==coordinate2->lat_m&&coordinate1->lon_m==coordinate2->lon_m){
        return 1;
    }else{
        return 0;
    }
}

int not_equal(GeoCoord coordinate1,GeoCoord coordinate2) {
    if(strcmp(coordinate1->loc,coordinate2->loc)==0&&coordinate1->lat==coordinate2->lat&&coordinate1->lon==coordinate2->lon&&coordinate1->lat_m==coordinate2->lat_m&&coordinate1->lon_m==coordinate2->lon_m){
        return 0;
    }else{
        return 1;
    }
}

int compare_more(GeoCoord coordinate1,GeoCoord coordinate2) {
    if(coordinate1->lat>coordinate2->lat){
        return 1;
    }else if(coordinate1->lat==coordinate2->lat){
        if(coordinate1->lat_m>coordinate2->lat_m){
            return 1;
        }else if(coordinate1->lat_m==coordinate2->lat_m){
            if(coordinate1->lon>coordinate2->lon){
                return 1;
            }else if(coordinate1->lon==coordinate2->lon){
                if(coordinate1->lon_m>coordinate2->lon_m){
                    return 1;
                }else if(coordinate1->lon_m==coordinate2->lon_m){
                    if(strcmp(coordinate1->loc,coordinate2->loc)>0){
                        return 1;
                    }else{
                        return 0;
                    }
                }else{
                    return 0;
                }
            }else{
                return 0;
            }
        }else{
            return 0;
        }
    }else{
        return 0;
    }
}

int compare_less(GeoCoord coordinate1,GeoCoord coordinate2) {
    if(coordinate1->lat<coordinate2->lat){
        return 1;
    }else if(coordinate1->lat==coordinate2->lat){
        if(coordinate1->lat_m<coordinate2->lat_m){
            return 1;
        }else if(coordinate1->lat_m==coordinate2->lat_m){
            if(coordinate1->lon<coordinate2->lon){
                return 1;
            }else if(coordinate1->lon==coordinate2->lon){
                if(coordinate1->lon_m<coordinate2->lon_m){
                    return 1;
                }else if(coordinate1->lon_m==coordinate2->lon_m){
                    if(strcmp(coordinate1->loc,coordinate2->loc)<0){
                        return 1;
                    }else{
                        return 0;
                    }
                }else{
                    return 0;
                }
            }else{
                return 0;
            }
        }else{
            return 0;
        }
    }else{
        return 0;
    }
}

int compare_more_or_equal(GeoCoord coordinate1,GeoCoord coordinate2) {
    if(strcmp(coordinate1->loc,coordinate2->loc)==0&&coordinate1->lat==coordinate2->lat&&coordinate1->lon==coordinate2->lon&&coordinate1->lat_m==coordinate2->lat_m&&coordinate1->lon_m==coordinate2->lon_m){
        return 1;
    }
    if(coordinate1->lat>coordinate2->lat){
        return 1;
    }else if(coordinate1->lat==coordinate2->lat){
        if(coordinate1->lat_m>coordinate2->lat_m){
            return 1;
        }else if(coordinate1->lat_m==coordinate2->lat_m){
            if(coordinate1->lon>coordinate2->lon){
                return 1;
            }else if(coordinate1->lon==coordinate2->lon){
                if(coordinate1->lon_m>coordinate2->lon_m){
                    return 1;
                }else if(coordinate1->lon_m==coordinate2->lon_m){
                    if(strcmp(coordinate1->loc,coordinate2->loc)>0){
                        return 1;
                    }else{
                        return 0;
                    }
                }else{
                    return 0;
                }
            }else{
                return 0;
            }
        }else{
            return 0;
        }
    }else{
        return 0;
    }
}

int compare_less_or_equal(GeoCoord coordinate1,GeoCoord coordinate2) {
    if(strcmp(coordinate1->loc,coordinate2->loc)==0&&coordinate1->lat==coordinate2->lat&&coordinate1->lon==coordinate2->lon&&coordinate1->lat_m==coordinate2->lat_m&&coordinate1->lon_m==coordinate2->lon_m){
        return 1;
    }
    if(coordinate1->lat<coordinate2->lat){
        return 1;
    }else if(coordinate1->lat==coordinate2->lat){
        if(coordinate1->lat_m<coordinate2->lat_m){
            return 1;
        }else if(coordinate1->lat_m==coordinate2->lat_m){
            if(coordinate1->lon<coordinate2->lon){
                return 1;
            }else if(coordinate1->lon==coordinate2->lon){
                if(coordinate1->lon_m<coordinate2->lon_m){
                    return 1;
                }else if(coordinate1->lon_m==coordinate2->lon_m){
                    if(strcmp(coordinate1->loc,coordinate2->loc)<0){
                        return 1;
                    }else{
                        return 0;
                    }
                }else{
                    return 0;
                }
            }else{
                return 0;
            }
        }else{
            return 0;
        }
    }else{
        return 0;
    }
}

int same_time_zone(GeoCoord coordinate1,GeoCoord coordinate2){
    if(coordinate1->lon_m==coordinate2->lon_m&&(int)(coordinate1->lon/15)==(int)(coordinate2->lon/15)){
        return 1;
    }else{
        return 0;
    }
}

int not_same_time_zone(GeoCoord coordinate1,GeoCoord coordinate2){
    if(coordinate1->lon_m!=coordinate2->lon_m||(int)(coordinate1->lon/15)!=(int)(coordinate2->lon/15)){
        return 1;
    }else{
        return 0;
    }
}

void *convert(GeoCoord coordinate){
    char *result = coordinate->loc;
    char dms1[]="";
    char dms2[]="";
    strcat(result, ",");
    int deg1 = (int)(coordinate->lat);
    int min1 = (int)((coordinate->lat-deg1)*60);
    int sec1 = (int)(((coordinate->lat-deg1)*60-min1)*60);
    sprintf(dms1, "%d°%d'%d\"", deg1, min1, sec1);
    strcat(result, dms1);
    if(coordinate->lat_m==1){
        strcat(result, "S");
    }else{
        strcat(result, "N");
    }
    strcat(result, coordinate->mark);
    int deg2 = (int)(coordinate->lon);
    int min2 = (int)((coordinate->lon-deg2)*60);
    int sec2 = (int)(((coordinate->lon-deg2)*60-min2)*60);
    sprintf(dms2, "%d°%d'%d\"", deg2, min2, sec2);
    strcat(result, dms2);
    if(coordinate->lon_m==1){
        strcat(result, "W");
    }else{
        strcat(result, "E");
    }
    return result;
}

int main() {
    char input[] = "Melbourne,37.84°N 144.95°E";
    char input2[] = "Melbourne,37.84°N 144.92°E";
    void **check = to_split(input);
    char *city = check[0];
    char *degree1 = check[1];
    char *degree2 = check[2];
    if (locationname_check(city)==0||(!((latitude_check(degree1)==1&&longitude_check(degree2)==1)||(latitude_check(degree2)==1&&longitude_check(degree1)==1)))){
        printf("Error!\n");
    }

    GeoCoord geocoord = malloc(sizeof(GeoCoord));
    geocoord->mark = check[3];
    geocoord->loc = city;
    if(latitude_check(degree1)==1){
        if(strcmp(degree1 + strlen(degree1) - 3, "°N") == 0){
            geocoord->lat_m = 2;
            geocoord->lat = strtod(degree1, NULL);
        }else{
            geocoord->lat_m = 1;
            geocoord->lat = strtod(degree1, NULL);
        }
        if(strcmp(degree2 + strlen(degree2) - 3, "°W") == 0){
            geocoord->lon_m = 1;
            geocoord->lon = strtod(degree2, NULL);
        }else{
            geocoord->lon_m = 2;
            geocoord->lon = strtod(degree2, NULL);
        }
    }else{
        if(strcmp(degree2 + strlen(degree2) - 3, "°N") == 0){
            geocoord->lat_m = 2;
            geocoord->lat = strtod(degree2, NULL);
        }else{
            geocoord->lat_m = 1;
            geocoord->lat = strtod(degree2, NULL);
        }
        if(strcmp(degree1 + strlen(degree1) - 3, "°W") == 0){
            geocoord->lon_m = 1;
            geocoord->lon = strtod(degree1, NULL);
        }else{
            geocoord->lon_m = 2;
            geocoord->lon = strtod(degree1, NULL);
        }
    }
    strcat(input, ",");
    strcat(input, check[1]);
    strcat(input, geocoord->mark);
    strcat(input, check[2]);
    printf("%s\n",input);
    printf("%s\n",geocoord->loc);
    printf("%d\n",geocoord->lat_m);
    printf("%d\n",geocoord->lon_m);
    printf("%f\n",geocoord->lat);
    printf("%f\n",geocoord->lon);

    GeoCoord geocoord2 = malloc(sizeof(GeoCoord));
    geocoord2->mark = " ";
    geocoord2->loc = "Melbourne";
    geocoord2->lat_m = 2;
    geocoord2->lon_m = 2;
    geocoord2->lat = 37.84;
    geocoord2->lon = 144.95;
    printf("equal:%d\n",equal(geocoord,geocoord2));
    printf("not equal:%d\n",not_equal(geocoord,geocoord2));
    printf("compare_more:%d\n",compare_more(geocoord,geocoord2));
    printf("compare_less:%d\n",compare_less(geocoord,geocoord2));
    printf("more or equal:%d\n",compare_more_or_equal(geocoord,geocoord2));
    printf("less or equal:%d\n",compare_less_or_equal(geocoord,geocoord2));
    printf("same time zone:%d\n",same_time_zone(geocoord,geocoord2));
    printf("not same time zone:%d\n",not_same_time_zone(geocoord,geocoord2));
    char *res=convert(geocoord);
    printf("%s\n",res);
    return 0;
}