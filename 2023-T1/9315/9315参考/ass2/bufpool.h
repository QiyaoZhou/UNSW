#include "db.h"
// bufpool.h ... buffer pool interface
#define MAXID 1000

typedef struct page {
    UINT64 page_id;
    INT data[1];
} *Page;

typedef struct fileSave {
    FILE * file;
    char * tablename;
    UINT oid;
} * FileSave;

struct buffer {
    char  id[MAXID];
    int   pin;
    int   dirty;
    int   priority;
    Page  data;
};

//typedef struct bufPool *BufPool;
typedef struct bufPool {
    UINT   nbufs;         // how many buffers
    char  strategy;
    struct buffer *bufs;
}*BufPool;

BufPool initBufPool(UINT, char);
Page request_page_ro(UINT, UINT, BufPool, FILE *, int);
void release_page_ro(UINT, UINT, BufPool);