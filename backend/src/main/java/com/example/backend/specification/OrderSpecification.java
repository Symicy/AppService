package com.example.backend.specification;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.backend.domain.Order;
import com.example.backend.domain.Client;
import com.example.backend.domain.Device;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    public static Specification<Order> filterOrders(String searchTerm, String status, Long deviceId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Filtrare după status
            if (StringUtils.hasText(status) && !status.equals("all")) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            
            // Filtrare după termen de căutare (id, client name, status)
            if (StringUtils.hasText(searchTerm)) {
                String searchPattern = "%" + searchTerm.toLowerCase() + "%";
                List<Predicate> searchPredicates = new ArrayList<>();
                
                // Caută în ID-ul comenzii
                searchPredicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("id").as(String.class)), 
                    searchPattern
                ));
                
                // Caută în client name și surname
                Join<Order, Client> clientJoin = root.join("client");
                searchPredicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(clientJoin.get("name")), 
                    searchPattern
                ));
                searchPredicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(clientJoin.get("surname")), 
                    searchPattern
                ));
                
                // Caută în status
                searchPredicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("status")), 
                    searchPattern
                ));
                
                // Combinăm criteriile de căutare cu OR
                predicates.add(criteriaBuilder.or(searchPredicates.toArray(new Predicate[0])));
            }
            
            // Filtrare după deviceId
            if (deviceId != null) {
                // Folosim o subquery pentru a verifica dacă comanda are un device cu ID-ul specificat
                Subquery<Long> deviceSubquery = query.subquery(Long.class);
                Root<Device> deviceRoot = deviceSubquery.from(Device.class);
                deviceSubquery.select(deviceRoot.get("order").get("id"))
                    .where(criteriaBuilder.equal(deviceRoot.get("id"), deviceId));
                
                predicates.add(criteriaBuilder.in(root.get("id")).value(deviceSubquery));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
