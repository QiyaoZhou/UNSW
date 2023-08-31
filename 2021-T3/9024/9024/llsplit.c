#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

typedef struct node
{
    int data;
    struct node *next;
}NodeT , *list;

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
    NodeT *list1 = (NodeT *)malloc(sizeof(NodeT));
    assert(list1 != 0);
	list1->next = NULL;	
    NodeT *list2 = (NodeT *)malloc(sizeof(NodeT));
    assert(list2 != 0);
	list2->next = NULL;	
    int count = 0;
	NodeT *ptail1, *ptail2;
	NodeT *pnew;
	while (list)
	{
		count++;
		pnew = list;
		if (count % 2 )
		{
			if (NULL == list1)
			{
				*list1 = *pnew;
				ptail1 = pnew;
			}
			else 
            {
				ptail1->next = pnew;
				ptail1 = pnew;;
			}
		}
		else 
        {
			if (NULL == list2)
			{
				*list2 = *pnew;
				ptail2 = pnew;
			}
			else {
				ptail2->next = pnew;
				ptail2 = pnew;;
			}
		}
		list = list->next;
	}
    printf("Odd-numbered elements are ");
	showLL(list1);
	printf("Even-numbered elements are ");
	showLL(list2);
    freeLL(list);
    freeLL(list1);
    freeLL(list2);
	return 0;
}