package com.unsw.back_end.mapper;

import com.unsw.back_end.pojo.Carspace;

import java.util.LinkedList;

public interface CarspaceMapper {
    int deleteByPrimaryKey(Integer carSpaceId);

    int insert(Carspace record);

    int insertSelective(Carspace record);

    Carspace selectByPrimaryKey(Integer carSpaceId);

    Carspace selectByAddress(String address);

    LinkedList<Carspace> selectByUserId(Integer userId);

    LinkedList<Carspace> selectAllSpace();

    int updateByPrimaryKeySelective(Carspace record);

    int updateByPrimaryKey(Carspace record);

    LinkedList<Carspace> selectByAddressAndPriceAsc(String city, String suburb, String street);

    LinkedList<Carspace> selectByAddressAndPriceDes(String city, String suburb, String street);

    LinkedList<Carspace> selectByAddressAndRankAsc(String city, String suburb, String street);

    LinkedList<Carspace> selectByAddressAndRankDes(String city, String suburb, String street);

}