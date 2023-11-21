#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include "ro.h"
#include "db.h"
#include "bufpool.h"

//typedef struct page {
//    UINT64 page_id;
//    INT data[1];
//} *Page;

//typedef struct fileSave {
//    FILE * file;
//    char * filename;
//    UINT oid;
//} * FileSave;

typedef struct cache{
    FileSave * files;
    BufPool buffers;
} Cache;

Cache *cache = NULL;


void init(){
    // do some initialization here.

    // example to get the Conf pointer
    // Conf* cf = get_conf();

    // example to get the Database pointer
    // Database* db = get_db();
    Conf* cf = get_conf();
    cache = malloc(sizeof (Cache));
    cache->files = malloc(sizeof (FileSave) * cf->file_limit);
    for (int i = 0; i < cf->file_limit; i++) {
        cache->files[i] = malloc(sizeof (FileSave));
        cache->files[i]->file = NULL;
        cache->files[i]->tablename = NULL;
        cache->files[i]->oid = -1;
    }
    cache->buffers = initBufPool(cf->buf_slots,'C');
    printf("init() is invoked.\n");
}

void release(){
    // optional
    // do some end tasks here.
    // free space to avoid memory leak
    Conf* cf = get_conf();
    if (cache!=NULL) {
        for (int i = 0; i < cf->file_limit; i++) {
            if (cache->files[i]->file!= NULL) {
                fclose(cache->files[i]->file);
                log_close_file(cache->files[i]->oid);
            }
            free(cache->files[i]);
        }
        for(int j = 0; j < cf->buf_slots; j++){
            if(cache->buffers->bufs[j].data!=NULL){
                free(cache->buffers->bufs[j].data);
            }
        }
        if (cache->buffers->bufs!= NULL) {
            free(cache->buffers->bufs);
        }
        free(cache->buffers);
        free(cache);
    }
    printf("release() is invoked.\n");
}

_Table* sel(const UINT idx, const INT cond_val, const char* table_name){

    printf("sel() is invoked.\n");
    Table sel_table;
    char sel_path[128];
    int check = 0;
    int s;
    int ch;
    UINT page_cap;
    UINT page_sum;
    UINT tuple_sum;
    Tuple process = NULL;
    UINT tuple_output_count = 0;
    Database * db = get_db();
    Conf * cf = get_conf();
    for(INT i = 0;i<db->ntables;i++){
        if(strlen(db->tables[i].name)==strlen(table_name)){
            ch = 0;
            for(int q=0;q<strlen(table_name);q++){
                if(db->tables[i].name[q]!=table_name[q]){
                    break;
                }else{
                    ch++;
                }
            }
            if (ch==strlen(table_name)){
                sel_table = db->tables[i];
            }
        }
    }
    _Table* result = malloc(sizeof(_Table)+sel_table.ntuples*sizeof(Tuple));
//    sprintf(sel_path,"%s/%d",db->path,sel_table.oid);
//    FILE * file = fopen(sel_path,"rb");
//    log_open_file(sel_table.oid);
    for (s = 0; s < cf->file_limit; s++) {
        if(cache->files[s]->oid == -1){
            cache->files[s]->oid = sel_table.oid;
            cache->files[s]->tablename = strdup(sel_table.name);
            snprintf(sel_path,sizeof(sel_path),"%s/%d",db->path,sel_table.oid);
            cache->files[s]->file = fopen(sel_path,"rb");
            log_open_file(sel_table.oid);
            break;
        }else if(cache->files[s]->oid == sel_table.oid){
            break;
        }else{
            check++;
        }
    }
    if(check == cf->file_limit){
        s = 0;
        //fclose(cache->files[s]->file);
        log_close_file(cache->files[s]->oid);
        cache->files[s]->oid = sel_table.oid;
        cache->files[s]->tablename = strdup(sel_table.name);
        snprintf(sel_path,sizeof(sel_path),"%s/%d",db->path,sel_table.oid);
        cache->files[s]->file = fopen(sel_path,"rb");
        log_open_file(sel_table.oid);
    }
    //assert(check < cf->file_limit-1);
    page_cap = (cf->page_size-sizeof(UINT64))/(sizeof(INT)*sel_table.nattrs);
    page_sum = (sel_table.ntuples + page_cap - 1)/page_cap;
    for (UINT i = 0; i < page_sum; i++){
        Page sel_page = request_page_ro(sel_table.oid,i,cache->buffers,cache->files[s]->file,0);
        if(i==page_sum-1&&(sel_table.ntuples%page_cap!=0)){
            tuple_sum = sel_table.ntuples%page_cap;
        }else{
            tuple_sum = page_cap;
        }
        for (UINT j = 0; j < tuple_sum; j++){
            process = sel_page->data + j * sel_table.nattrs;
            if((INT)process[idx] == cond_val) {
                result->tuples[tuple_output_count] =  malloc(sizeof(INT)*sel_table.nattrs);
                INT k = 0;
                while(k<sel_table.nattrs){
                    result->tuples[tuple_output_count][k] = process[k];
                    k++;
                }
                tuple_output_count++;
            }
        }
        release_page_ro(sel_table.oid,i,cache->buffers);
        //free(sel_page);
    }
    result->nattrs = sel_table.nattrs;
    result->ntuples = tuple_output_count;
    return result;
}



_Table* join(const UINT idx1, const char* table1_name, const UINT idx2, const char* table2_name){

    printf("join() is invoked.\n");
    Table sel_table1;
    Table sel_table2;
    char sel_path1[128];
    char sel_path2[128];
    int check = 0;
    int s;
    int t;
    int ch;
    UINT outer_index;
    UINT inner_index;
    UINT page_cap1;
    UINT page_sum1;
    UINT page_cap2;
    UINT page_sum2;
    UINT page_cap_inner;
    UINT page_sum_inner;
    UINT page_cap_outer;
    UINT page_sum_outer;
    UINT tuple_sum_inner;
    UINT tuple_sum_outer;
    UINT tuple_sum1;
    UINT tuple_sum2;
    Table sel_table_inner;
    Table sel_table_outer;
    FILE *file_outer = NULL;
    FILE *file_inner = NULL;
    Tuple process1 = NULL;
    Tuple process2 = NULL;
    UINT tuple_output_count = 0;
    Database * db = get_db();
    Conf * cf = get_conf();
    for(INT i = 0;i<db->ntables;i++){
        if(strlen(db->tables[i].name)==strlen(table1_name)){
            ch = 0;
            for(int q=0;q<strlen(table1_name);q++){
                if(db->tables[i].name[q]!=table1_name[q]){
                    break;
                }else{
                    ch++;
                }
            }
            if (ch==strlen(table1_name)){
                sel_table1 = db->tables[i];
            }
        }
        if(strlen(db->tables[i].name)==strlen(table2_name)){
            ch = 0;
            for(int q=0;q<strlen(table2_name);q++){
                if(db->tables[i].name[q]!=table2_name[q]){
                    break;
                }else{
                    ch++;
                }
            }
            if (ch==strlen(table2_name)){
                sel_table2 = db->tables[i];
            }
        }
    }
    _Table* result = malloc(sizeof(_Table)+(sel_table1.ntuples+sel_table2.ntuples)*sizeof(Tuple));

    for (s = 0; s < cf->file_limit; s++) {
        if(cache->files[s]->oid == -1){
            cache->files[s]->oid = sel_table1.oid;
            cache->files[s]->tablename = strdup(sel_table1.name);
            snprintf(sel_path1,sizeof(sel_path1),"%s/%d",db->path,sel_table1.oid);
            cache->files[s]->file = fopen(sel_path1,"rb");
            log_open_file(sel_table1.oid);
            break;
        }else if(cache->files[s]->oid == sel_table1.oid){
            break;
        }else{
            check++;
        }
    }
    if(check == cf->file_limit){
        s = 0;
        //fclose(cache->files[s]->file);
        log_close_file(cache->files[s]->oid);
        cache->files[s]->oid = sel_table1.oid;
        cache->files[s]->tablename = strdup(sel_table1.name);
        snprintf(sel_path1,sizeof(sel_path1),"%s/%d",db->path,sel_table1.oid);
        cache->files[s]->file = fopen(sel_path1,"rb");
        log_open_file(sel_table1.oid);
    }
    //assert(check < cf->file_limit-1);
    check = 0;
    for (t = 0; t < cf->file_limit; t++) {
        if(cache->files[t]->oid == -1){
            cache->files[t]->oid = sel_table2.oid;
            cache->files[t]->tablename = strdup(sel_table2.name);
            snprintf(sel_path2,sizeof(sel_path2),"%s/%d",db->path,sel_table2.oid);
            cache->files[t]->file = fopen(sel_path2,"rb");
            log_open_file(sel_table2.oid);
            break;
        }else if(cache->files[t]->oid == sel_table2.oid){
            break;
        }else{
            check++;
        }
    }
    if(check == cf->file_limit){
        for(t = 0; t < cf->file_limit; t++){
            if(t!=s){
                //fclose(cache->files[t]->file);
                log_close_file(cache->files[t]->oid);
                cache->files[t]->oid = sel_table2.oid;
                cache->files[t]->tablename = strdup(sel_table2.name);
                snprintf(sel_path2,sizeof(sel_path2),"%s/%d",db->path,sel_table2.oid);
                cache->files[s]->file = fopen(sel_path2,"rb");
                log_open_file(sel_table2.oid);
                break;
            }
        }
    }
    //assert(check < cf->file_limit-1);
    page_cap1 = (cf->page_size-sizeof(UINT64))/(sizeof(INT)*sel_table1.nattrs);
    page_sum1 = (sel_table1.ntuples + page_cap1 - 1)/page_cap1;
    page_cap2 = (cf->page_size-sizeof(UINT64))/(sizeof(INT)*sel_table2.nattrs);
    page_sum2 = (sel_table2.ntuples + page_cap2 - 1)/page_cap2;
    if(cf->buf_slots>page_sum1+page_sum2){
        int table1[sel_table1.ntuples][sel_table1.nattrs];
        int table2[sel_table2.ntuples][sel_table2.nattrs];
        int index1 = 0;
        int index2 = 0;
        for (UINT y = 0; y < page_sum1; y++){
            Page sel_page1 = request_page_ro(sel_table1.oid,y,cache->buffers,cache->files[s]->file,0);
            if(y==page_sum1-1&&(sel_table1.ntuples%page_cap1!=0)){
                tuple_sum1 = sel_table1.ntuples%page_cap1;
            }else{
                tuple_sum1 = page_cap1;
            }
            for (UINT u = 0; u < tuple_sum1; u++) {
                process1 = sel_page1->data + u * sel_table1.nattrs;
                for(int va = 0; va<sel_table1.nattrs;va++){
                    table1[index1][va] = process1[va];
                }
                index1++;
            }
            release_page_ro(sel_table1.oid,y,cache->buffers);
        }
        for (UINT z = 0; z < page_sum2; z++){
            Page sel_page2 = request_page_ro(sel_table2.oid,z,cache->buffers,cache->files[t]->file,0);
            if(z==page_sum2-1&&(sel_table2.ntuples%page_cap2!=0)){
                tuple_sum2 = sel_table2.ntuples%page_cap2;
            }else{
                tuple_sum2 = page_cap2;
            }
            for (UINT v = 0; v < tuple_sum2; v++) {
                process2 = sel_page2->data + v * sel_table2.nattrs;
                for(INT vb = 0; vb<sel_table2.nattrs;vb++){
                    table2[index2][vb] = process2[vb];
                }
                index2++;
            }
            release_page_ro(sel_table2.oid,z,cache->buffers);
        }
        int temp1[sel_table1.nattrs];
        for (int ci = 1; ci < sel_table1.ntuples; ci++) {
            for (int cj = 0; cj < sel_table1.nattrs; cj++) {
                temp1[cj] = table1[ci][cj];
            }

            int ck = ci - 1;
            while (ck >= 0 && table1[ck][idx1] > temp1[idx1]) {
                for (int cj = 0; cj < sel_table1.nattrs; cj++) {
                    table1[ck + 1][cj] = table1[ck][cj];
                }
                ck--;
            }
            for (int cj = 0; cj < sel_table1.nattrs; cj++) {
                table1[ck + 1][cj] = temp1[cj];
            }
        }
        int temp2[sel_table2.nattrs];
        for (int ci = 1; ci < sel_table2.ntuples; ci++) {
            for (int cj = 0; cj < sel_table2.nattrs; cj++) {
                temp2[cj] = table2[ci][cj];
            }

            int ck = ci - 1;
            while (ck >= 0 && table2[ck][idx2] > temp2[idx2]) {
                for (int cj = 0; cj < sel_table2.nattrs; cj++) {
                    table2[ck + 1][cj] = table2[ck][cj];
                }
                ck--;
            }
            for (int cj = 0; cj < sel_table2.nattrs; cj++) {
                table2[ck + 1][cj] = temp2[cj];
            }
        }
//        for(int i=0;i<sel_table2.ntuples;i++){
//            for(int j=0;j<sel_table2.nattrs;j++){
//                printf("%d ",table2[i][j]);
//            }
//            printf("\n");
//        }
        int fd = 0, fk = 0;
        while (fd < sel_table1.ntuples && fk < sel_table2.ntuples) {
            if(table1[fd][idx1]==table2[fk][idx2]){
                result->tuples[tuple_output_count] = malloc(sizeof(INT)*sel_table1.nattrs+sizeof(INT)*sel_table2.nattrs);
                for (int ak = 0; ak < sel_table1.nattrs; ak++) {
                    result->tuples[tuple_output_count][ak] = (INT)table1[fd][ak];
                }
                for (int bk = 0; bk < sel_table2.nattrs; bk++) {
                    result->tuples[tuple_output_count][bk+sel_table1.nattrs] = (INT)table2[fk][bk];
                }
                tuple_output_count++;
                if(table1[fd+1][idx1]==table2[fk][idx2]){
                    fd++;
                }else if(table1[fd][idx1]==table2[fk+1][idx2]){
                    fk++;
                }else{
                    fd++;
                    fk++;
                }
            }else if (table1[fd][idx1] < table2[fk][idx2]) {
                fd++;
            } else {
                fk++;
            }
        }
        result->nattrs = sel_table1.nattrs+sel_table2.nattrs;

    }else{
        if(page_sum1>page_sum2){
            page_sum_outer = page_sum1;
            page_cap_outer = page_cap1;
            sel_table_outer = sel_table1;
            file_outer = cache->files[s]->file;
            page_sum_inner = page_sum2;
            page_cap_inner = page_cap2;
            sel_table_inner = sel_table2;
            file_inner = cache->files[t]->file;
            outer_index = idx1;
            inner_index = idx2;

        }else{
            page_sum_outer = page_sum2;
            page_cap_outer = page_cap2;
            sel_table_outer = sel_table2;
            file_outer = cache->files[t]->file;
            page_sum_inner = page_sum1;
            page_cap_inner = page_cap1;
            sel_table_inner = sel_table1;
            file_inner = cache->files[s]->file;
            outer_index = idx2;
            inner_index = idx1;
        }
        for (UINT a = 0; a < page_sum_outer; a++){
            Page sel_page_outer = request_page_ro(sel_table_outer.oid,a,cache->buffers,file_outer,0);
            if(a==page_sum_outer-1&&(sel_table_outer.ntuples%page_cap_outer!=0)){
                tuple_sum_outer = sel_table_outer.ntuples%page_cap_outer;
            }else{
                tuple_sum_outer = page_cap_outer;
            }
            for (UINT b = 0; b < page_sum_inner; b++){
                Page sel_page_inner = request_page_ro(sel_table_inner.oid,b,cache->buffers,file_inner,1);
                if(b==page_sum_inner-1&&(sel_table_inner.ntuples%page_cap_inner!=0)){
                    tuple_sum_inner = sel_table_inner.ntuples%page_cap_inner;
                }else{
                    tuple_sum_inner = page_cap_inner;
                }
                for (UINT m = 0; m < tuple_sum_outer; m++) {
                    process1 = sel_page_outer->data + m * sel_table_outer.nattrs;
                    for (UINT n = 0; n < tuple_sum_inner; n++) {
                        process2 = sel_page_inner->data + n * sel_table_inner.nattrs;
                        if(process1[outer_index] == process2[inner_index]) {
                            result->tuples[tuple_output_count] = malloc(sizeof(INT)*sel_table_outer.nattrs+sizeof(INT)*sel_table_inner.nattrs);
                            for(INT k = 0; k<sel_table_outer.nattrs;k++){
                                result->tuples[tuple_output_count][k] = process1[k];
                            }
                            for(INT h = 0; h<sel_table_inner.nattrs;h++){
                                result->tuples[tuple_output_count][h+sel_table_outer.nattrs] = process2[h];
                            }
                            tuple_output_count++;
                        }
                    }
                }
                release_page_ro(sel_table_inner.oid,b,cache->buffers);
            }
            release_page_ro(sel_table_outer.oid,a,cache->buffers);
        }
        result->nattrs = sel_table_inner.nattrs+sel_table_outer.nattrs;
    }

    result->ntuples = tuple_output_count;
    return result;
}