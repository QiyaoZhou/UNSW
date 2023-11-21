package com.unsw.back_end.mapper;

import com.unsw.back_end.pojo.Order;

import java.time.LocalDate;
import java.util.Date;
import java.util.LinkedList;
import java.util.Map;

public interface OrderMapper {
    int deleteByPrimaryKey(Integer orderId);

    int insert(Order record);

    int insertSelective(Order record);

    Order selectByPrimaryKey(Integer orderId);

    int updateByPrimaryKeySelective(Order record);

    int updateByPrimaryKey(Order record);

    LinkedList<Order> dateSearch(Integer carspaceid, Date fromtime, Date totime);

    LinkedList<Order> orderSearch(Integer customerId);

    int selectByCustomerID(Integer customerId);

    LinkedList<Map> returnDateBycarspaceid(LocalDate curtime, Integer carspaceId);

    int selectByOrderID(Integer OrderId);
}