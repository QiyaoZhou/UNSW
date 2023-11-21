package com.unsw.back_end.service;

import com.unsw.back_end.pojo.Carspace;
import org.springframework.cache.annotation.CachePut;

import java.util.LinkedList;

public interface CarSpaceService {
    public Carspace addCarSpace(Carspace carspace);

    public Carspace updateCarSpace(Carspace carspace);

    public LinkedList<Carspace> queryYourOwnedSpace(int userId);

    public LinkedList<Carspace> queryAllSpace();

    public Carspace querySingleSpace(int carSpaceId);

    public int deleteCarSpace(int carSpaceId);

    public LinkedList<Carspace> queryByAddressAndOrder(String city, String suburb, String street, int orderValue);

    public LinkedList<String> queryAllCommentForSingleCarSpace(int carspaceid);

}
