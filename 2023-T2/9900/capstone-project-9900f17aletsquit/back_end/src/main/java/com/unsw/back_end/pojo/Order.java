package com.unsw.back_end.pojo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * order
 * @author 
 */
@Data
public class Order implements Serializable {
    private Integer orderId;

    private Date fromTime;

    private Date toTime;

    private Integer customerId;

    private Integer providerId;

    private Integer carSpaceId;

    private Double sum;

    private Double curRank;

    private String historyComment;

    private static final long serialVersionUID = 1L;
}