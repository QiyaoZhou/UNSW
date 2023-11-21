#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <regex.h>

typedef struct geocoord* GeoCoord;

struct geocoord {
    int len;
    char set;
} geocoord;

void* is_valid(char* input) {
    char* token, ** tokens;
    int num_tokens = 0;

    tokens = malloc(sizeof(char*) * 5);

    token = strtok(input, ",");
    while (token != NULL) {
        tokens[num_tokens] = malloc(strlen(token) + 1);
        strcpy(tokens[num_tokens], token);
        num_tokens++;
        token = strtok(NULL, ",");
    }
    char* city, * degree1, * degree2, ** result;
    result = malloc(sizeof(char*) * 5);
    if (num_tokens == 2) {
        city = tokens[0];
        char* token2, ** tokens2;
        int num_tokens2 = 0;
        tokens2 = malloc(sizeof(char*) * 5);
        token2 = strtok(tokens[1], " ");
        while (token2 != NULL) {
            tokens2[num_tokens2] = malloc(strlen(token2) + 1);
            strcpy(tokens2[num_tokens2], token2);
            num_tokens2++;
            token2 = strtok(NULL, " ");
        }
        if (num_tokens2 == 2) {
            degree1 = tokens2[0];
            degree2 = tokens2[1];
            free(tokens2);
        }
        else {
            return 0;
        }
    }
    else if (num_tokens == 3) {
        city = tokens[0];
        degree1 = tokens[1];
        degree2 = tokens[2];
    }
    else {
        free(tokens);
        return 0;
    }
    result[0] = city;
    result[1] = degree1;
    result[2] = degree2;
    free(tokens);
    return result;
}

int locationname_check(char* str) {
    regex_t regex;
    int ret;
    ret = regcomp(&regex, "^[A-Za-z ]+$", REG_EXTENDED);
    ret = regexec(&regex, str, 0, NULL, 0);
    regfree(&regex);
    if (ret == 0) {
        return 1;
    }
    else {
        return 0;
    }

}

int main() {
    char input[] = "Melbourne,37.84°„S,144.95°„E";
    char input2[] = "Melbourne,37.84°„S 144.92°„E";
    void** check = is_valid(input);
    for (int i = 0; i < 3; i++) {
        printf("%s\n", check[i]);
    }
    char* city = check[0];
    printf("%d\n", locationname_check(city));
    check = is_valid(input2);
    for (int i = 0; i < 3; i++) {
        printf("%s\n", check[i]);
    }
    city = check[0];
    printf("%d\n", locationname_check(city));
    return 0;
}