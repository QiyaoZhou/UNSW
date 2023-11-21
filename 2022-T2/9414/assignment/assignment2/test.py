import re

label = re.compile(r'(.)\1{2,}')
text = 'bnd.a~~ugb <b..h-uwb>ndu......qb'
print(re.sub(label, ' ', text))
