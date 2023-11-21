package com.unsw.back_end.service;

import com.unsw.back_end.pojo.User;

public interface UserService {
    public User login(String username, String password);

    public User register(User user);

    public User logout(int userId);

    public User sendProfile(int token);

    public User editProfile(User user);

}
