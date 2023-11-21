package com.unsw.back_end.pojo;

import java.io.Serializable;
import lombok.Data;

/**
 * commentofcarspace
 * @author 
 */
@Data
public class Commentofcarspace implements Serializable {
    private Integer commitid;

    private Integer carspaceid;

    private String comment;

    private static final long serialVersionUID = 1L;
}