#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include "bufpool.h"

int slot = 0;


static
int pageInPool(BufPool pool, UINT rel, UINT page)
{
	int i;  char id[MAXID];
	sprintf(id,"%d-%d",rel,page);
	for (i = 0; i < pool->nbufs; i++) {
		if (strcmp(id,pool->bufs[i].id) == 0) {
			return i;
		}
	}
	return -1;
}

BufPool initBufPool(UINT nbufs, char strategy)
{
	BufPool newPool;

	newPool = malloc(sizeof(struct bufPool));
	assert(newPool != NULL);
	newPool->nbufs = nbufs;
	newPool->strategy = strategy;
	newPool->bufs = malloc(nbufs * sizeof(struct buffer));
	assert(newPool->bufs != NULL);

	int i;
	for (i = 0; i < nbufs; i++) {
		newPool->bufs[i].id[0] = '\0';
		newPool->bufs[i].pin = 0;
		newPool->bufs[i].dirty = 0;
        newPool->bufs[i].priority = 0;
	}
	return newPool;
}

Page request_page_ro(UINT oid, UINT p_num, BufPool pool, FILE *f, int pri){
    int s;
    //printf("Request %d-%d\n", oid,p_num);
    s = pageInPool(pool,oid,p_num);
    Conf* cf = get_conf();
    if (s >= 0){
        //slot = (slot+1)%cf->buf_slots;
        return pool->bufs[s].data;
    }else {
        while (1>0){
            if(pool->bufs[slot].pin==0 && pool->bufs[slot].dirty==0 &&pool->bufs[slot].priority<=pri){
                slot =slot;
                s = slot;
                sprintf(pool->bufs[s].id,"%d-%d",oid,p_num);
                pool->bufs[s].data = malloc(cf->page_size);
                int page_state = fseek(f, p_num * cf->page_size, SEEK_SET);
                assert(page_state == 0);
                int tuple_state = fread(pool->bufs[s].data, 1, cf->page_size, f);
                assert(tuple_state > 0);
                log_read_page(p_num);
                // printf("page:%s\n",pool->bufs[s].id);
                // printf("slot:%d\n",s);
                pool->bufs[slot].pin = 1;
                pool->bufs[slot].dirty = 1;
                pool->bufs[slot].priority = pri;
                slot = (slot+1)%cf->buf_slots;
                return pool->bufs[s].data;
            }else{
                if(pool->bufs[slot].dirty>0){
                    pool->bufs[slot].dirty--;
                }
                slot = (slot+1)%cf->buf_slots;
            }
        }
    }
}

void release_page_ro(UINT oid, UINT p_num, BufPool pool){
    //printf("Release %d-%d\n", oid, p_num);
    int i;
    i = pageInPool(pool,oid,p_num);
    assert(i >= 0);
    pool->bufs[i].pin = 0;
    log_release_page(p_num);
}