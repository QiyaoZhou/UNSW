// COMP9315 22T1 Final Exam Q1
// Count tuples in a no-frills file

#include <stdlib.h>
#include <stdio.h>
#include <fcntl.h>
#include <string.h>
#include <sys/types.h>
#include <unistd.h>
#include "no-frills.h"
#include <assert.h>
#include <math.h>

int main(int argc, char **argv)
{
	if (argc < 2) {
		printf("Usage: %s DataFile\n", argv[0]);
		exit(1);
	}
	int fd = open(argv[1],O_RDONLY);
	if (fd < 0) {
		printf("Can't open file %s\n", argv[1]);
		exit(1);
	}
	int ntuples = 0;
  // printf("%s\n",argv[1]);
	// Add variables and code here to work out
	// the total number of tuples
  char* file_name_path = argv[1];
  FILE * file = fopen(file_name_path,"rb");
  unsigned char n_tuples_per_page;
  unsigned char datas;
//    typedef struct page {
//        unsigned char n_tuples_per_page;
//        int data[1];
//    } *Page;
//    Page page = malloc(PAGESIZE);

	int page_id = 0;
	while(1){
		fseek(file, page_id * PAGESIZE, SEEK_SET);
		int tuple_state = fread(&n_tuples_per_page, sizeof(unsigned char), 1, file);
		if(tuple_state==0){
			printf("-1\n");
			return 0;
		}
		fseek(file, (page_id+1) * PAGESIZE-1, SEEK_SET);
		int check = fread(&datas, sizeof(unsigned char), 1, file);
		if(check==0){
			printf("-1\n");
			return 0;
		}
		if((int)n_tuples_per_page>0){
			int i = fseek(file, (page_id+1) * PAGESIZE+1, SEEK_SET);
			assert(i==0);
			int j = fread(&datas, sizeof(unsigned char), 1, file);
			ntuples +=(int)n_tuples_per_page;
			page_id++;
			if(j ==0 ){
				break;		
			}
		} else if((int)n_tuples_per_page==0){
				break;
		}
	}

	printf("%d\n",ntuples);
	return 0;
}
