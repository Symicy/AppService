package com.example.backend.specification;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.backend.domain.Client;

import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

public class ClientSpecification {

    public static Specification<Client> filterClients(String searchTerm, String type) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Filtrare după tip
            if (StringUtils.hasText(type) && !type.equals("all")) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }
            
            // Filtrare după termen de căutare (name, surname, email, phone, cui)
            if (StringUtils.hasText(searchTerm)) {
                String searchPattern = "%" + searchTerm.toLowerCase() + "%";
                List<Predicate> searchPredicates = new ArrayList<>();
                
                searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern));
                searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("surname")), searchPattern));
                searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchPattern));
                searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), searchPattern));
                searchPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("cui")), searchPattern));
                
                // Combinăm criteriile de căutare cu OR
                predicates.add(criteriaBuilder.or(searchPredicates.toArray(new Predicate[0])));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
