#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include "ro.h"
#include "db.h"

typedef struct page{
    UINT64 page_id;
    INT data[1];
} *Page;

void init(){
    // do some initialization here.

    // example to get the Conf pointer
    // Conf* cf = get_conf();

    // example to get the Database pointer
    // Database* db = get_db();
    
    printf("init() is invoked.\n");
}

void release(){
    // optional
    // do some end tasks here.
    // free space to avoid memory leak
    printf("release() is invoked.\n");
}

_Table* sel(const UINT idx, const INT cond_val, const char* table_name){

    // *** you do not need to implement this function in the final exam ***
    
    // printf("sel() is invoked.\n");

    // invoke log_read_page() every time a page is read from the hard drive.
    // invoke log_release_page() every time a page is released from the memory.

    // invoke log_open_file() every time a page is read from the hard drive.
    // invoke log_close_file() every time a page is released from the memory.

    // testing
    // the following code constructs a synthetic _Table with 10 tuples and each tuple contains 4 attributes
    // examine log.txt to see the example outputs
    // replace all code with your implementation

    // UINT ntuples = 10;
    // UINT nattrs = 4;

    // _Table* result = malloc(sizeof(_Table)+ntuples*sizeof(Tuple));
    // result->nattrs = nattrs;
    // result->ntuples = ntuples;

    // INT value = 0;
    // for (UINT i = 0; i < result->ntuples; i++){
    //     Tuple t = malloc(sizeof(INT)*result->nattrs);
    //     result->tuples[i] = t;
    //     for (UINT j = 0; j < result->nattrs; j++){
    //         t[j] = value;
    //         ++value;
    //     }
    // }
    
    // return result;

    return NULL;
}

_Table* join(const UINT idx1, const char* table1_name, const UINT idx2, const char* table2_name){


    // *** you do not need to implement this function in the final exam ***


    // printf("join() is invoked.\n");
    // write your code to join two tables
    // invoke log_read_page() every time a page is read from the hard drive.
    // invoke log_release_page() every time a page is released from the memory.

    // invoke log_open_file() every time a page is read from the hard drive.
    // invoke log_close_file() every time a page is released from the memory.

    return NULL;
}


_Table* proj(const UINT idx, const char* table_name){

    // implement your proj operation in this function
    Table sel_table;
    char sel_path[128];
    UINT page_cap;
    UINT page_sum;
    UINT tuple_sum;
    Tuple process = NULL;
    UINT tuple_output_count = 0;
    Database *db = get_db();
    Conf * cf = get_conf();
    for(INT i = 0;i<db->ntables;i++){
        if(strcmp(db->tables[i].name,table_name)==0){
            sel_table = db->tables[i];
        }
    }
    _Table* result = malloc(sizeof(_Table)+1*sizeof(Tuple));
    snprintf(sel_path,sizeof(sel_path),"%s/%d",db->path,sel_table.oid);
    FILE *file = fopen(sel_path,"rb");
    page_cap = (cf->page_size-sizeof(UINT64)/(sizeof(INT)*sel_table.nattrs));
    page_sum = (sel_table.ntuples +page_cap -1)/page_cap;
    for (UINT i = 0;i<page_sum;i++){
        Page sel_page = malloc(cf->page_size);
        int page_state = fseek(file,i*cf->page_size,SEEK_SET);
        assert(page_state==0);
        int tuple_state = fread(sel_page,1,cf->page_size,file);
        assert(tuple_state==cf->page_size);
        if(i==page_sum-1&&(sel_table.ntuples%page_cap!=0)){
            tuple_sum = sel_table.ntuples%page_cap;
        }else{
            tuple_sum = page_cap;
        }
        for (UINT j=0;i<tuple_sum;j++){
            result->tuples[tuple_output_count] = malloc(sizeof(INT)*sel_table.nattrs);
            process = sel_page->data +j * sel_table.nattrs;
            int check = 0;
            for(UINT k=0;k<tuple_output_count;k++){
                if(result->tuples[k]==process[idx]){
                    check = 1;
                }
            }
            if(check==0){
                result->tuples[tuple_output_count] = process[idx];
                tuple_output_count++;
            }
        }
        free(sel_page);
    }
    result->nattrs = 1;
    result->ntuples = tuple_output_count;
    return result;
}

void ins(INT* tuple, const char* table2_name){

    // implement your ins operation in this function
     Table sel_table;
    char sel_path[128];
    UINT page_cap;
    UINT page_sum;
    UINT tuple_sum;
    Tuple process = NULL;
    UINT tuple_output_count = 0;
    Database *db = get_db();
    Conf * cf = get_conf();
    for(INT i = 0;i<db->ntables;i++){
        if(strcmp(db->tables[i].name,table2_name)==0){
            sel_table = db->tables[i];
        }
    }
    snprintf(sel_path,sizeof(sel_path),"%s/%d",db->path,sel_table.oid);
    FILE *file = fopen(sel_path,"rb");
    page_cap = (cf->page_size-sizeof(UINT64)/(sizeof(INT)*sel_table.nattrs));
    page_sum = (sel_table.ntuples +page_cap -1)/page_cap;
    for (UINT i = 0;i<page_sum;i++){
        Page sel_page = malloc(cf->page_size);
        int page_state = fseek(file,i*cf->page_size,SEEK_SET);
        assert(page_state==0);
        int tuple_state = fread(sel_page,1,cf->page_size,file);
        assert(tuple_state==cf->page_size);
        if(i==page_sum-1&&(sel_table.ntuples%page_cap!=0)){
            tuple_sum = sel_table.ntuples%page_cap;
        }else{
            tuple_sum = page_cap;
        }
        for (UINT j=0;i<tuple_sum;j++){
        }
        free(sel_page);
    }

}


UINT calculate_sort_time(const UINT nattrs, const UINT ntuples, const UINT page_size, const UINT nslots){
    // nattrs: number of attributes in each tuple (type of all attributes is INT32)
    // ntuples: number of tuples
    // nslots: number of slots in the buffer pool


    return 0;
}