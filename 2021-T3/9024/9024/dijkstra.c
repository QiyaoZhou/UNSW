// Starting code for Dijkstra's algorithm ... COMP9024 21T3

#include <stdio.h>
#include <stdbool.h>
#include "PQueue.h"

#define VERY_HIGH_VALUE 999999

typedef struct GraphRep {
   int **edges;  // adjacency matrix storing positive weights
		 // 0 if nodes not adjacent
   int nV;       // #vertices
   int nE;       // #edges
} GraphRep;

void dijkstraSSSP(Graph g, Vertex source) {
    int  dist[MAX_NODES];
    int  pred[MAX_NODES];
    bool vSet[MAX_NODES];  // vSet[v] = true <=> v has not been processed
    int s;

    PQueueInit();
    int nV = numOfVertices(g);
    for (s = 0; s < nV; s++) {
        joinPQueue(s);
        dist[s] = VERY_HIGH_VALUE;
        pred[s] = -1;
        vSet[s] = true;
    }
    dist[source] = 0;
    int v;
    while(PQueueIsEmpty() == false)
    {
        v = leavePQueue(dist);
        for(int i = 0;i < nV;i++)
        {
            if (g->edges[v][i] != 0 && g->edges[v][i] + dist[v] < dist[i] && vSet[i] == true)
            {
                dist[i] = dist[v] + g->edges[v][i];
                pred[i] = v;
            }
            else
            {
                continue;
            }
        }
        vSet[v] = false;
    }
    for(int j = 0;j < nV;j++)
    {
        if(dist[j] != VERY_HIGH_VALUE)
        {
            printf("%d: distance = %d, shortest path:",j,dist[j]);
            int k = j;
            int N = 1;
            while(k!=source)
            {
                k = pred[k];
                N++;
            }
            if (N == 1)
            {
                printf("%d",j);
            }
            else
            {
                int a[N];
                k = j;
                for(int x = 0;x<N;x++)
                {
                    a[x] = k;
                    k = pred[k];
                }
                for(int y = N-1;y >= 0;y--)
                {
                    if(y == N-1)
                    {
                        printf("%d",a[y]);
                    }
                    else
                    {
                        printf("-%d",a[y]);
                    }
                }
            }
        }
        else
        {
            printf("%d: no path",j);
        }
        printf("\n");
    }

}

void reverseEdge(Edge *e) {
    Vertex temp = e->v;
    e->v = e->w;
    e->w = temp;
}

int main(void) {
    Edge e;
    int  n, source;

    printf("Enter the number of vertices: ");
    scanf("%d", &n);
    Graph g = newGraph(n);

    printf("Enter the source node: ");
    scanf("%d", &source);
    printf("Enter an edge (from): ");
    while (scanf("%d", &e.v) == 1) {
        printf("Enter an edge (to): ");
        scanf("%d", &e.w);
        printf("Enter the weight: ");
        scanf("%d", &e.weight);
        insertEdge(g, e);
        reverseEdge(&e);               // ensure to add edge in both directions
        insertEdge(g, e);
        printf("Enter an edge (from): ");
    }
    printf("Finished.\n");
    dijkstraSSSP(g, source);
    freeGraph(g);
    return 0;
}