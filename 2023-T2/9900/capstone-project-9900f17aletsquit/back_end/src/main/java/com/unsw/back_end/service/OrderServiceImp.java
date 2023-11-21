package com.unsw.back_end.service;

import com.unsw.back_end.mapper.CarspaceMapper;
import com.unsw.back_end.mapper.CommentofcarspaceMapper;
import com.unsw.back_end.mapper.OrderMapper;
import com.unsw.back_end.mapper.UserMapper;
import com.unsw.back_end.pojo.Carspace;
import com.unsw.back_end.pojo.Commentofcarspace;
import com.unsw.back_end.pojo.Order;
import com.unsw.back_end.pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class OrderServiceImp implements OrderService {
    @Autowired
    OrderMapper orderMapper;
    @Autowired
    CarspaceMapper carspaceMapper;
    @Autowired
    UserMapper userMapper;
    @Autowired
    CommentofcarspaceMapper commentofcarspaceMapper;

    @Autowired
    private CacheManager cacheManager;

    @Override
    public LinkedList<Order> orderSearch(Integer customerId) {
        LinkedList<Order> orders = orderMapper.orderSearch(customerId);
        return orders;

    }

    @Override
    public int addOrder(Order order) {
        Double sum = order.getSum();
        Integer customerId = order.getCustomerId();
        Integer providerId = order.getProviderId();
        User customer = userMapper.selectByPrimaryKey(customerId);
        User provider = userMapper.selectByPrimaryKey(providerId);
        Double walletExtra1 = customer.getWalletExtra();
        Double walletExtra2 = provider.getWalletExtra();
        Double new_wallet1 = walletExtra1-sum;
        if(new_wallet1<0.0){
            return 2;
        }
        Double new_wallet2 = walletExtra2+sum;
        customer.setWalletExtra(new_wallet1);
        provider.setWalletExtra(new_wallet2);
        userMapper.updateByPrimaryKeySelective(customer);
        userMapper.updateByPrimaryKeySelective(provider);
        int i = orderMapper.insertSelective(order);
        int i1 = orderMapper.selectByCustomerID(order.getCustomerId());
        if(i1==1){
            User user = userMapper.selectByPrimaryKey(order.getCustomerId());
            if(user.getInvited()!=null){
                String invited = user.getInvited();
                user.setWalletExtra(user.getWalletExtra()+5);
                User invitedUser = userMapper.selectByEmail(invited);
                invitedUser.setWalletExtra(invitedUser.getWalletExtra()+5);
                userMapper.updateByPrimaryKeySelective(invitedUser);
                userMapper.updateByPrimaryKeySelective(user);

                Cache userCache = cacheManager.getCache("UserCache");
                userCache.put(order.getCustomerId(), user);
                userCache.put(order.getProviderId(), invitedUser);
            }
        }
        Cache userCache = cacheManager.getCache("UserCache");
        userCache.put(order.getCustomerId(), customer);
        userCache.put(order.getProviderId(), provider);
        return i;
    }

    @Override
    public int editOrder(Order order) {
        Date date = new Date();
        System.out.println(date);
        Order order1 = orderMapper.selectByPrimaryKey(order.getOrderId());
        Date fromTime = order1.getFromTime();
        if(order1.getCurRank()!=null && order1.getHistoryComment()!=null){
            System.out.println(2);
            return 2;
        }
        if(date.compareTo(fromTime)>=0){
            Carspace carspace = carspaceMapper.selectByPrimaryKey(order1.getCarSpaceId());
            Integer ranknum = carspace.getRanknum();
            Double totalrank = carspace.getTotalrank()*ranknum;
            String historyComment = order.getHistoryComment();
            Double new_rank = (totalrank+order.getCurRank())/(ranknum+1);
            carspace.setRanknum(ranknum+1);
            carspace.setTotalrank(new_rank);
            Commentofcarspace commentofcarspace = new Commentofcarspace();
            commentofcarspace.setCarspaceid(carspace.getCarSpaceId());
            commentofcarspace.setComment(historyComment);
            commentofcarspaceMapper.insert(commentofcarspace);
            carspaceMapper.updateByPrimaryKeySelective(carspace);
            return orderMapper.updateByPrimaryKeySelective(order);
        }else {
            return 0;
        }
    }

    @Override
    public int removeOrder(int orderId) {
        Date date = new Date(System.currentTimeMillis() + 7*24*3600*1000);
        Order order1 = orderMapper.selectByPrimaryKey(orderId);
        Date fromTime = order1.getFromTime();
        if(date.compareTo(fromTime)>=0){
            return 0;
        }else{
            Double sum = order1.getSum();
            Integer customerId = order1.getCustomerId();
            Integer providerId = order1.getProviderId();
            User customer = userMapper.selectByPrimaryKey(customerId);
            User provider = userMapper.selectByPrimaryKey(providerId);
            Double walletExtra1 = customer.getWalletExtra();
            Double walletExtra2 = provider.getWalletExtra();
            Double new_wallet1 = sum+walletExtra1;
            Double new_wallet2 = walletExtra2-sum;
            customer.setWalletExtra(new_wallet1);
            provider.setWalletExtra(new_wallet2);
            userMapper.updateByPrimaryKeySelective(customer);
            userMapper.updateByPrimaryKeySelective(provider);
            orderMapper.deleteByPrimaryKey(orderId);
            Cache userCache = cacheManager.getCache("UserCache");
            userCache.put(customer.getUserId(), customer);
            userCache.put(provider.getUserId(), provider);
            return 1;
        }

    }

    @Override
    public List<String> returnDate(LocalDate curtime, Integer carspaceId) {
        LinkedList<Map> maps = orderMapper.returnDateBycarspaceid(curtime,carspaceId);
        SimpleDateFormat inputFormat = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
        SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd");
        List<String> allDates = new ArrayList<>();
        for(int i = 0; i<maps.size();i++){
            Object[] objects = maps.get(i).values().toArray();
            Date to_time = (Date)objects[0];
            Date from_time = (Date)objects[1];
            long timestampDiff = to_time.getTime() - from_time.getTime();
            long daysBetween = timestampDiff / (24 * 60 * 60 * 1000);
            long oneDayMillis = 24 * 60 * 60 * 1000;
            for (int l = 0; l <= daysBetween; l++) {
                Date currentDate = new Date(from_time.getTime() + l * oneDayMillis);
                String formattedDate = outputFormat.format(currentDate);
                allDates.add(formattedDate);
            }
        }
        return allDates;
    }



}
