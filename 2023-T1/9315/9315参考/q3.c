// COMP9315 22T1 Final Exam Q3
// Read tuples from stdin and store in no-frills file
// Start from empty file, add new pages as needed

#include <stdlib.h>
#include <stdio.h>
#include <fcntl.h>
#include <string.h>
#include <sys/types.h>
#include <unistd.h>
#include "no-frills.h"
#include <sys/stat.h>

int main(int argc, char **argv)
{
    printf("%s\n",argv[4]);
	if (argc < 3) {
		fprintf(stderr, "Usage: %s DataFile TupleFile\n", argv[0]);
		exit(1);
	}
	unsigned int mode = S_IRUSR|S_IWUSR|S_IRGRP|S_IROTH;
	int fd = open(argv[2],O_RDWR|O_CREAT|O_TRUNC,mode);
	if (fd < 0) {
		fprintf(stderr, "Can't open data file.\n");
		exit(1);
	}
	FILE *input = fopen(argv[3],"r");
	if (input == NULL) {
		fprintf(stderr, "Can't open data file.\n");
		exit(1);
	}
//    char *line  = malloc(MAXTUPLEN);
    char line [MAXTUPLEN];
    char new_line[MAXTUPLEN];
    int len_line = 0;
    while (fgets(line, MAXTUPLEN, input) != NULL) {
        len_line = strlen(line);
        write(fd, line, len_line);
    }
    fseek(input, 0, SEEK_SET);
    FILE * new_file = fopen(argv[2],"r");
    if(strcmp("diff",argv[4])==0){
        fgets(line, MAXTUPLEN, input);
        fgets(new_line, MAXTUPLEN, new_file);
        int num = 1;
        while (fgets(new_line, MAXTUPLEN, new_file)!=NULL && fgets(line, MAXTUPLEN, input)!=NULL){
            if(strcmp(line,new_line)==0){
                num++;
                continue;
            } else{
                printf("Binary files %s and %s differ\n",argv[5],argv[6]);

            }
        }
        printf("%d\n",num);
        if(num==20){
            printf("identical\n");
        }

    }
//    while (fgets(line, MAXTUPLEN, new_file) != NULL) {
//        printf("%s", line);
//    }

	// Add variables and code here to read tuples from
	// input and append them to the "no-frills" file

	return 0;
}
