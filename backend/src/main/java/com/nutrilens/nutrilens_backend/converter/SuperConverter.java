package com.nutrilens.nutrilens_backend.converter;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public abstract class SuperConverter<D, E> {
    public List<D> convertEntitiesToDTOs(final List<E> entities) {
        if (entities.isEmpty()) {
            return new ArrayList<>();
        }
        return entities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<E> convertDTOsToEntities(final List<D> dtos) {
        if (dtos.isEmpty()) {
            return new ArrayList<>();
        }
        return dtos.stream().map(this::convertToEntity).collect(Collectors.toList());
    }


    public abstract D convertToDTO(final E entity);

    public abstract E convertToEntity(final D dto);

}
