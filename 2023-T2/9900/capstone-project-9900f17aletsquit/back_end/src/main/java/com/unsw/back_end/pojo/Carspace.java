package com.unsw.back_end.pojo;

import java.io.Serializable;
import lombok.Data;

/**
 * carspace
 * @author 
 */
@Data
public class Carspace implements Serializable {
    private Integer carSpaceId;

    private Integer userId;

    private Double price;

    private String address;

    private String size;

    /**
     * type为0时代表车库类型未知;type为true为1代表的是车位;type为2代表车库。
     */
    private Integer type;

    private String carspaceimage;

    private Double totalrank;

    private Integer ranknum;


    private static final long serialVersionUID = 1L;
}