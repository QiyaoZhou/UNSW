package com.unsw.back_end.controller;

import com.unsw.back_end.pojo.Carspace;
import com.unsw.back_end.service.CarSpaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedList;

@RestController
@RequestMapping("/carspace")
@CrossOrigin(origins = "*")
public class CarSpaceController {
    @Autowired
    CarSpaceService carSpaceService;

    @PostMapping("/add")
    public ResponseEntity<?> addNewSpace(@RequestHeader("token") String headerValue, @RequestBody Carspace carspace){
        carspace.setUserId(Integer.parseInt(headerValue));
        Carspace carspace1 = carSpaceService.addCarSpace(carspace);
        if(carspace1!=null){
            return ResponseEntity.ok("Adding a new car space successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Faild to add a new car space");
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateSPace(@RequestHeader("token") String headerValue, @RequestBody Carspace carspace){
        carspace.setUserId(Integer.parseInt(headerValue));
        if(carspace.getRanknum()!=null || carspace.getTotalrank()!=null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Faild to update your car space");
        }
        Carspace carspace1 = carSpaceService.updateCarSpace(carspace);
        if(carspace1!=null){
            return ResponseEntity.ok("You have updated your car space successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Faild to update your car space");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSPace(@PathVariable("id") Integer carSpaceId){
        int i = carSpaceService.deleteCarSpace(carSpaceId);
        if(i!=0){
            return ResponseEntity.ok("You have deleted your car space successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Faild to delete your car space");
    }

    @GetMapping("/queryOwned")
    public ResponseEntity<?> queryYourOwnedSPace(@RequestHeader("token") String headerValue){
        int i = Integer.parseInt(headerValue);
        return ResponseEntity.ok().body(carSpaceService.queryYourOwnedSpace(i));
    }

    @GetMapping("/queryAll")
    public ResponseEntity<?> queryAllSpace() {
        return ResponseEntity.ok().body(carSpaceService.queryAllSpace());
    }

    @GetMapping("/query/{id}")
    public ResponseEntity<?> querySingleSpace(@PathVariable("id") Integer carSpaceId) {
        Carspace carspace = carSpaceService.querySingleSpace(carSpaceId);
        if(carspace==null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Sorry,we don't get what you want");
        }
        return ResponseEntity.ok().body(carspace);
    }

    @GetMapping("/queryByAddress")
    public ResponseEntity<?> queryByAddressAndOrder(@RequestHeader("order") String orderValue, @RequestParam("city") String cityname, @RequestParam("suburb") String suburbname, @RequestParam("street") String streetname) {
        return ResponseEntity.ok(carSpaceService.queryByAddressAndOrder(cityname,suburbname,streetname, Integer.parseInt(orderValue)));
    }

    @GetMapping("/searchAllComment/{carspaceid}")
    public ResponseEntity<?> searchAllCommentforSingle(@PathVariable("carspaceid") Integer carspaceid) {
        return ResponseEntity.ok(carSpaceService.queryAllCommentForSingleCarSpace(carspaceid));
    }
}
