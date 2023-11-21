# Data Description

There are three basic sets of files to help you get started. 
The engagement data are based on [LearnPlatform](https://learnplatform.com/)’s Student Chrome Extension. 
The extension collects page load events of over 10K education technology products in our product library, 
including websites, apps, web apps, software programs, extensions, ebooks, hardwares, and services used in educational institutions. 
The engagement data have been aggregated at school district level, and each file represents data from one school district. 
The product file includes information about the characteristics of the top 372 products with most users in 2020. 
The district file includes information about the characteristics of school districts,
 including data from [National Center for Education Statistics (NCES)](https://nces.ed.gov/),
 [The Federal Communications Commission (FCC)](https://www.fcc.gov/), and [Edunomics Lab](https://edunomicslab.org/). 
In addition to the files provided, we encourage you to use other public data sources such as examples listed below.

## Dataset File Structure

The organization of data sets is described below:

```
Root/
  -engagement_data/
    -1000.csv
    -1039.csv
    -...
  -districts_info.csv
  -products_info.csv

# Code Description
The main code of this project consists of four parts, corresponding to sections 4, 5.1, 5.2 and 6 of the report.

1.observation.py is for dataset base data observation.
2.SGD_model.py contains the pre-processing of the data from the dataset and the construction of the SGD model, 
including the evaluation of the model and the resulting parameter weights.
3.DT_model.py contains the pre-processing of the data from the dataset and the construction of the DT model,
 including the evaluation of the model.
4. result.py is primarily a visualisation of the relationship between the target values and the individual eigenvalues.

## Code File Structure

The organization of data sets is described below:

```
Root/
 -observation.py
 -SGD_model.py
 -DT_model.py
 -result.py

# Modules involved in the code
-os
-glob
-numpy
-pandas
-warnings
-sklearn
-seaborn
