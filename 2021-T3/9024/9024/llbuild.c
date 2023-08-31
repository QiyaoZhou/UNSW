#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

typedef struct node
{
    int data;
    struct node *next;
}NodeT;

NodeT *makeNode(int v)
{
    NodeT *new = malloc(sizeof(NodeT));
    assert(new != NULL);
    new->data = v;
    new->next = NULL;
    return new;
}

void freeLL(NodeT *list)
{
    NodeT *p ,*temp;
    p = list;
    while(p != NULL)
    {
        temp = p->next;
        free(p);
        p = temp;
    }
}

void showLL(NodeT *list)
{
    NodeT *p;
    p = list;
    p = p->next;
    printf("%d", p->data);
    for(p = p->next;p != NULL;p = p->next)
    {
        printf("-->%d", p->data);
    }
}


NodeT *tailLL(NodeT *list)
{	
    while(list->next) 
    {
        list = list->next;
    }
    return list;
}

NodeT *joinLL(NodeT *list, int v)
{
    NodeT *p = (NodeT *)malloc(sizeof(NodeT));
    p->data = v;
    p->next = NULL;
    NodeT *tail = tailLL(list);
    tail->next = p;
    return 0;
}

int main()
{
    NodeT *list = (NodeT *)malloc(sizeof(NodeT));
    assert(list != 0);
    list->next = NULL;	
    int v;
    printf("Enter a number: ");
    if(scanf("%d", &v)==1)
        {
            joinLL(list,v);
            while(1)
            {
                printf("Enter a number: ");
                if(scanf("%d", &v)==1)
                {
                    joinLL(list,v);
                }
                else
                {
                    break;
                }
            }
            printf("Done. List is ");
	    showLL(list);
        }
    else
    {
        printf("Done.");
    }
    freeLL(list);
    return 0;
}