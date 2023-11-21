#ifndef RO_H
#define RO_H
#include "db.h"

void init();
void release();

// equality test for one attribute
// idx: index of the attribute for comparison, 0 <= idx < nattrs
// cond_val: the compared value
// table_name: table name
_Table* sel(const UINT idx, const INT cond_val, const char* table_name);

_Table* join(const UINT idx1, const char* table1_name, const UINT idx2, const char* table2_name);

_Table* proj(const UINT idx, const char* table_name);

void ins(INT* tuple, const char* table2_name);

UINT calculate_sort_time(const UINT nattrs, const UINT ntuples, const UINT page_size, const UINT nslots);


#endif