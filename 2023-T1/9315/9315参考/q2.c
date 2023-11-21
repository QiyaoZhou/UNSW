// COMP9315 22T1 Final Exam Q1
// Find longest tuple in a no-frills file

#include <stdlib.h>
#include <stdio.h>
#include <fcntl.h>
#include <string.h>
#include <sys/types.h>
#include <unistd.h>
#include "no-frills.h"

int main(int argc, char **argv)
{
	if (argc < 2) {
		printf("Usage: %s DataFile\n", argv[0]);
		exit(1);
	}
	int fd = open(argv[2],O_RDONLY);
	if (fd < 0) {
		printf("Can't open file %s\n", argv[1]);
		exit(1);
	}
	char longest[MAXTUPLEN];

	// Add variables and code here to find
	// the longest tuple in the data file
    char* file_name_path = argv[2];
    FILE * file = fopen(file_name_path,"rb");
    typedef struct page {
        unsigned char * data;
    } *Page;
    Page page = malloc(sizeof(page));
    page->data = malloc(PAGESIZE);
    int page_id = 0;
    int max_tuple_length = 0;
    int length = 0;
    while(1){
        fseek(file, page_id * PAGESIZE, SEEK_SET);
        int j = fread(page->data, sizeof(unsigned char), PAGESIZE, file);
        if(j==0){
            break;
        }
        int start_point = 1;
        for (int i = 1; i < PAGESIZE; i++) {
            if((char)page->data[i] == '\0'){
                length = i-start_point;
                if(length>max_tuple_length){
                    max_tuple_length = length;
                    for(int l = 0;l<length;l++){
                        longest[l]= (char)page->data[start_point+l];
                    }
                }
                start_point = i+1;
            }
        }
        page_id++;
    }
    for(int x = 0;x<max_tuple_length;x++){
        printf("%c",longest[x]);
    }
    printf("\n");
	return 0;
}
