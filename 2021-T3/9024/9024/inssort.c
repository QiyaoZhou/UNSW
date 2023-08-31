// Insertion sort ... COMP9024 21T3

#include <stdio.h>

#define SIZE 7

void insertionSort(int array1[],int array2[],int array3[], int n) {
   int i;
   for (i = 1; i < n; i++) {
      int element1 = array1[i];
      int element2 = array2[i];
      int element3 = array3[i];
      int j = i-1;
      while (j >= 0 && array1[j] > element1) { 
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

int main(void) {

   int a1[]={0,1,2,3,4,5};
   int a3[]={1,1,1,1,1,2};
   int a2[]={1,1,0,1,0,4};
   int i;
   int j;
   int element1;
   int element3;
   
   insertionSort(a2,a1,a3, 6);
   for (i = 0;i<6;i++)
   {
      for(j = 0;j<6;j++)
      {
         while(a2[i]==a2[j] && a1[i]>a1[j])
         {
            element1 = a1[j];
            element3 = a3[j];
            a1[j] = a1[i];
            a3[j] = a3[i];
            a1[i] = element1;
            a3[i] = element3;
         }
      }
   }
   for (i = 5; i >=0; i--)
      printf("%d,%d,%d\n", a1[i],a2[i],a3[i]);

   return 0;
}