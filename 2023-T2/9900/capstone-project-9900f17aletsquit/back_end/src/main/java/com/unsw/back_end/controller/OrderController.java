package com.unsw.back_end.controller;
import com.unsw.back_end.mapper.OrderMapper;
import com.unsw.back_end.pojo.Order;
import com.unsw.back_end.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/order")
@CrossOrigin(origins = "*")
public class OrderController {
    @Autowired
    OrderService orderService;

    @GetMapping("/orderSearch")
    public ResponseEntity<?> orderSearch(@RequestParam("customerId")Integer customerId){

        LinkedList<Order> orders = orderService.orderSearch(customerId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/addOrder")
    public ResponseEntity<?> addOrder(@RequestBody Order order){
        int i = orderService.addOrder(order);
        if(i==0){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add your order");
        }else if(i==2){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Sorry, your extra isn't enough");
        }
        return ResponseEntity.ok("Add your order successfully");
    }

    @PutMapping("/rankYourOrder")
    public ResponseEntity<?> rankYourOrder(@RequestBody Order order){
        int i = orderService.editOrder(order);
        if(i==0){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Sorry,it's too early to evaluate your order.");
        }else if(i==1){
            return ResponseEntity.ok("Thank your for your comment and we will continue to improve us");
        }else if(i==2){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Sorry, you have evaluated your order");
        }else if(i==3){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Sorry,due to system reasons, comments are temporarily unavailable.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to edit your order");
        }
    }

    @DeleteMapping("/deleteOrder")
    public ResponseEntity<?> deleteOrder(@RequestParam("orderid") Integer orderId){
        int i = orderService.removeOrder(orderId);
        if(i==0){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Sorry,it's too late to delete it.");
        }
        return ResponseEntity.ok("Delete your order success.");
    }

    @GetMapping("/returnreserveddateofsingle")
    public ResponseEntity<?> returnreserveddateofsingle(@RequestParam("carspaceid")Integer carspaceid) throws ParseException {
        LocalDate currentDate = LocalDate.now();
        List<String> strings = orderService.returnDate(currentDate,carspaceid);
        return ResponseEntity.ok(strings);
    }

}
