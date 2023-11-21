package com.unsw.back_end;

import com.unsw.back_end.mapper.OrderMapper;
import com.unsw.back_end.mapper.UserMapper;
import com.unsw.back_end.pojo.User;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@SpringBootTest
@RunWith(SpringRunner.class)

class BackEndApplicationTests {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private OrderMapper orderMapper;



}
