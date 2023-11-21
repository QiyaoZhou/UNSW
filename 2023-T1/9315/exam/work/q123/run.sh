rm ./data/*
make
# binary_file page_size buffer_slots max_opened_files buffer_replacement_policy database_folder input_data queries output_log

test_folder='test'

# project test
./main 50 10 3 CLS ./data ./$test_folder/test6/data_6.txt ./$test_folder/test6/query_6.txt ./$test_folder/test6/log_6.txt 

# ins test
./main 50 10 3 CLS ./data ./$test_folder/test7/data_7.txt ./$test_folder/test7/query_7.txt ./$test_folder/test7/log_7.txt 

# calculate_sort_io test
./main 100 100 100 CLS ./data ./$test_folder/test8/data_8.txt ./$test_folder/test8/query_8.txt ./$test_folder/test8/log_8.txt 