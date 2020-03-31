package com.covid19.util.csv;

import static java.util.stream.Collectors.toCollection;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import com.opencsv.bean.ComplexFieldMapEntry;
import com.opencsv.bean.FieldMapByName;
import com.opencsv.bean.FieldMapByNameEntry;
import lombok.Getter;
import lombok.Setter;

public class CustomFieldMapByName<T> extends FieldMapByName<T> {

  @Getter
  @Setter
  private Comparator writeOrder;

  public CustomFieldMapByName(Locale errorLocale) {
    super(errorLocale);
  }

  @Override
  public List<FieldMapByNameEntry<T>> determineMissingRequiredHeaders(
      final String[] headersPresent) {

    // Start with collections of all required headers
    final List<String> requiredStringList =
        simpleMap.entrySet().stream().filter(e -> e.getValue().isRequired()).map(Map.Entry::getKey)
            .collect(toCollection(LinkedList::new));
    final List<ComplexFieldMapEntry<String, String, T>> requiredRegexList = complexMapList.stream()
        .filter(r -> r.getBeanField().isRequired()).collect(Collectors.toList());

    // Now remove the ones we found
    for (String h : headersPresent) {
      if (!requiredStringList.remove(h.toUpperCase())) {
        final ListIterator<ComplexFieldMapEntry<String, String, T>> requiredRegexListIterator =
            requiredRegexList.listIterator();
        boolean found = false;
        while (!found && requiredRegexListIterator.hasNext()) {
          final ComplexFieldMapEntry<String, String, T> r = requiredRegexListIterator.next();
          if (r.contains(h)) {
            found = true;
            requiredRegexListIterator.remove();
          }
        }
      }
    }

    // Repackage what remains
    List<FieldMapByNameEntry<T>> missingRequiredHeaders = new LinkedList<>();
    // for (String s : requiredStringList) {
    // missingRequiredHeaders.add(new FieldMapByNameEntry<T>(s, simpleMap.get(s), false));
    // }
    for (ComplexFieldMapEntry<String, String, T> r : requiredRegexList) {
      missingRequiredHeaders
          .add(new FieldMapByNameEntry<T>(r.getInitializer(), r.getBeanField(), true));
    }

    return missingRequiredHeaders;
  }
}
