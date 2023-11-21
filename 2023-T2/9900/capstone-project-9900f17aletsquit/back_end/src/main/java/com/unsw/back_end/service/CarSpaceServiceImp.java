package com.unsw.back_end.service;

import com.unsw.back_end.mapper.CarspaceMapper;
import com.unsw.back_end.mapper.CommentofcarspaceMapper;
import com.unsw.back_end.pojo.Carspace;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.LinkedList;
import java.util.List;


@Service
public class CarSpaceServiceImp implements CarSpaceService {
    @Autowired
    CarspaceMapper carspaceMapper;

    @Autowired
    CommentofcarspaceMapper commentofcarspaceMapper;

    @Override
    @CachePut(key = "#result.carSpaceId",value = "myCarSpace",condition = "#result!=null")
    public Carspace addCarSpace(Carspace carspace) {
        Carspace carspace1 = carspaceMapper.selectByAddress(carspace.getAddress());
        if(carspace1==null){
            carspaceMapper.insertSelective(carspace);
            System.out.println(carspace);
            return carspace;
        }
        return null;

    }

    @Override
    @CachePut(key = "#carspace.carSpaceId", value = "myCarSpace")
    public Carspace updateCarSpace(Carspace carspace) {
        Integer carSpaceId = carspace.getCarSpaceId();
        LinkedList<Carspace> carspaces = carspaceMapper.selectByUserId(carspace.getUserId());
        Carspace carspace2 = carspaceMapper.selectByPrimaryKey(carSpaceId);
        if(carspaces.contains(carspace2)){
            carspaceMapper.updateByPrimaryKeySelective(carspace);
            Carspace carspace3 = carspaceMapper.selectByPrimaryKey(carSpaceId);
            return carspace3;

        }

        return null;
    }



    @Override
    public LinkedList<Carspace> queryYourOwnedSpace(int userId) {
        return carspaceMapper.selectByUserId(userId);
    }



    @Override
    public LinkedList<Carspace> queryAllSpace() {
        return carspaceMapper.selectAllSpace();
    }

    @Override
    @Cacheable(key = "#carSpaceId",value = "myCarSpace")
    public Carspace querySingleSpace(int carSpaceId) {
        return carspaceMapper.selectByPrimaryKey(carSpaceId);
    }

    @Override
    @CacheEvict(key = "#carSpaceId",value = "myCarSpace")
    public int deleteCarSpace(int carSpaceId) {

        return carspaceMapper.deleteByPrimaryKey(carSpaceId);
    }

    @Override
    public LinkedList<Carspace> queryByAddressAndOrder(String city, String suburb, String street, int orderValue) {
        switch (orderValue){
            case 1:
                return carspaceMapper.selectByAddressAndPriceAsc(city,suburb,street);
            case 2:
                return  carspaceMapper.selectByAddressAndPriceDes(city,suburb,street);
            case 3:
                return carspaceMapper.selectByAddressAndRankAsc(city,suburb,street);
            case 4:
                return carspaceMapper.selectByAddressAndRankDes(city,suburb,street);
            default:
                return null;
        }
    }

    @Override
    public LinkedList<String> queryAllCommentForSingleCarSpace(int carspaceid) {
        return commentofcarspaceMapper.selectAllComment(carspaceid);
    }


}
