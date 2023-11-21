package com.unsw.back_end.mapper;

import com.unsw.back_end.pojo.Commentofcarspace;

import java.util.LinkedList;

public interface CommentofcarspaceMapper {
    int deleteByPrimaryKey(Integer commitid);

    int insert(Commentofcarspace record);

    int insertSelective(Commentofcarspace record);

    Commentofcarspace selectByPrimaryKey(Integer commitid);

    LinkedList<String> selectAllComment(Integer carspaceid);

    int updateByPrimaryKeySelective(Commentofcarspace record);

    int updateByPrimaryKey(Commentofcarspace record);
}