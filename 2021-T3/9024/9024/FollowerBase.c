#include "WGraph.h"
#include <assert.h>
#include <stdlib.h>
#include <stdio.h>


void insertionSort(int array1[],int array2[],int array3[], int n) 
{
    int i;
    for (i = 1; i < n; i++) 
    {
        int element1 = array1[i];
        int element2 = array2[i];
        int element3 = array3[i];
        int j = i-1;
        while (j >= 0 && array1[j] > element1)
        { 
            array1[j+1] = array1[j]; 
            array2[j+1] = array2[j];
            array3[j+1] = array3[j];              
            j--;
        }
    array1[j+1] = element1; 
    array2[j+1] = element2;
    array3[j+1] = element3;
    }
}


int main(void)
{
    int v;
    printf("Enter the number of users:");
    scanf("%d",&v);
    Graph g1 =newGraph(v);
    Graph g2 =newGraph(v);
    int m;
    int n;
    while(1)
    {
        printf("Enter a user (follower):");
        if(scanf("%d\n",&m)==1)
        {
            printf("Enter a user (followed by %d):",m);
            if(scanf("%d\n",&n)==1)
            {
                Edge e1;
                e1.v = m;
                e1.w = n;
                e1.weight = 1;
                insertEdge(g1,e1);
                Edge e2;
                e2.v = n;
                e2.w = m;
                e2.weight = 1;
                insertEdge(g2,e2);
            }
        }
        else
        {
            printf("Done.\n");
            break;
        }
    }
    int i;
    int j;
    int x = 0;
    int y = 0;
    int a[v];
    int b[v];
    int c[v];
    for(i=0;i<v;i++)
    {
        for(j=0;j<v;j++)
        {
            if(adjacent(g1,i,j)==1 && adjacent(g2,i,j)==0)
            {
                x++;
            }
            else if(adjacent(g1,i,j)==0 && adjacent(g2,i,j)==1)
            {
                y++;
            }
            else if(adjacent(g1,i,j)==1 && adjacent(g2,i,j)==1)
            {
                x++;
                y++;
            }
        }
        a[i]=i;
        b[i]=x;
        c[i]=y;
        x = 0;
        y = 0;
    }
    freeGraph(g1);
    freeGraph(g2);
    int element1;
    int element2;   
    insertionSort(c,a,b,v);
    for (i = 0;i<v;i++)
    {
        for(j = 0;j<v;j++)
        {
           while(c[i]==c[j] && b[i]<b[j])
            {
                element1 = a[j];
                element2 = b[j];
                a[j] = a[i];
                b[j] = b[i];
                a[i] = element1;
                b[i] = element2;
            } 
        }
    }
    for (i = 0;i<v;i++)
    {
        for(j = 0;j<v;j++)
        {
            while(c[i]==c[j] && b[i]==b[j] && a[i]>a[j])
            {
                element1 = a[j];
                a[j] = a[i];
                a[i] = element1;
            }
        }
    }
    printf("\nRanking by follower base:\n");
    for (i = v-1;i>=0;i--)
    {
        printf("%d has %d follower(s) and follows %d user(s).\n",a[i],c[i],b[i]);
    }
    return 0;
}