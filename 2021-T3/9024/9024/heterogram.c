#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#define N 30

bool isHeterogram(char A[N])
{
	int i;
	int j;
	int k=0;
	int len=strlen(A);
	for(i=0;i<len-1;i++)
	{
		for(j=i+1;j<len;j++)
		{
			if(A[i]==A[j])
			{
				k=1;
			}
		}
	}
	if(k==0)
	{
		return false;
	}
	else
	{
		return true;
	}
}

int main()
{
	printf("Enter a word:");
	char str[N];
	scanf("%s",str);
	if(isHeterogram(str)==true)
	{
		printf("no");
	}
	else
	{
		printf("yes");
	}
	return 0;
}



