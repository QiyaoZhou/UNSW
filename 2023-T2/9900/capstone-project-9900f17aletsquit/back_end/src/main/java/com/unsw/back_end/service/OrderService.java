package com.unsw.back_end.service;

import com.unsw.back_end.pojo.Order;

import java.time.LocalDate;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public interface OrderService {
    public LinkedList<Order> orderSearch(Integer customerId);

    public int addOrder(Order order);

    public int editOrder(Order order);

    public int removeOrder(int orderId);

    public List<String> returnDate(LocalDate curtime, Integer carspaceId);
}
