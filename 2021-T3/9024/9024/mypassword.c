#include <stdio.h>
#include <stdlib.h>

int main(int argc,char **argv)
{
	int seed = atoi(argv[1]);
	int length = atoi(argv[2]);
	srand(seed);
	char* s = (char*)malloc(sizeof(char) * (length + 1));
	s[length] = '\0';
	for (int i = 0; i < length; i++)
	{
		s[i] = (char)(33 + rand() % 94 );
	}
	printf("%s", s);
	free(s);
	return 0;
}