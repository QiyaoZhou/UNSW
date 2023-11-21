package com.unsw.back_end.pojo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * user
 * @author 
 */
@Data
public class User implements Serializable {
    private Integer userId;

    private String uPassword;

    private String email;

    private String username;

    private Double walletExtra;

    private Date vipDeadline;

    /**
     * false代表登出，true代表登入
     */
    private Boolean curStatus;

    private String userimage;

    private Date birthday;

    private String invited;

    private static final long serialVersionUID = 1L;
}