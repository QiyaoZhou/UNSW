package com.unsw.back_end.service;

import com.unsw.back_end.mapper.UserMapper;
import com.unsw.back_end.pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImp implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    @CachePut(value = "UserCache", key = "#result.userId",condition = "#result!=null")
    public User login(String username, String password) {
        User user = userMapper.selectByUsername(username);
        if(user==null){
            return null;
        }
        if(password.equals(user.getUPassword())){
            user.setCurStatus(true);
            userMapper.updateByPrimaryKeySelective(user);
            return user;
        }
        return null;
    }


    @Override
    @CachePut(value = "UserCache", key = "#user.userId",condition = "#result!=null")
    public User register(User user) {
        User user1 = userMapper.selectByUsername(user.getUsername());
        User user2 = userMapper.selectByEmail(user.getEmail());
        User user3 = userMapper.selectByEmail(user.getInvited());
        if(user.getInvited()==null){
            int insert = userMapper.insertSelective(user);
            User result = userMapper.selectByPrimaryKey(user.getUserId());
            return result;
        }
        if(user1== null && user2 == null&&user3!=null){
            int insert = userMapper.insertSelective(user);
            User result = userMapper.selectByPrimaryKey(user.getUserId());
            return result;
        }
        return null;
    }

    @Override
    @CachePut(value = "UserCache", key = "#userId",condition = "#result!=null")
    public User logout(int userId) {
        User user = userMapper.selectByPrimaryKey(userId);
        if(!user.getCurStatus()){
            return null;
        }
        user.setCurStatus(false);
        userMapper.updateByPrimaryKeySelective(user);
        return user;
    }


    @Override
    @Cacheable(value = "UserCache", key = "#token")
    public User sendProfile(int token) {
        User user = userMapper.selectByPrimaryKey(token);
        return user;
    }

    @Override
    @CachePut(value = "UserCache", key = "#user.userId",condition = "#result!=null")
    public User editProfile(User user) {
        User user1 = userMapper.selectByUsername(user.getUsername());
        User user2 = userMapper.selectByEmail(user.getEmail());
        if(user1== null && user2 == null){
            userMapper.updateByPrimaryKeySelective(user);
            return userMapper.selectByPrimaryKey(user.getUserId());
        }else{
            return null;
        }
    }


}
