package com.covid19.util.csv;

import java.io.IOException;
import java.io.Serializable;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.Set;
import org.apache.commons.collections4.ListValuedMap;
import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import com.opencsv.CSVReader;
import com.opencsv.ICSVParser;
import com.opencsv.bean.AbstractBeanField;
import com.opencsv.bean.AbstractCsvConverter;
import com.opencsv.bean.BeanField;
import com.opencsv.bean.BeanFieldJoinStringIndex;
import com.opencsv.bean.BeanFieldSingleValue;
import com.opencsv.bean.BeanFieldSplit;
import com.opencsv.bean.CsvBindAndJoinByName;
import com.opencsv.bean.CsvBindAndSplitByName;
import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvConverter;
import com.opencsv.bean.CsvCustomBindByName;
import com.opencsv.bean.FieldMapByNameEntry;
import com.opencsv.bean.HeaderNameBaseMappingStrategy;
import com.opencsv.exceptions.CsvBadConverterException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;

/**
 * Maps data to objects using the column names in the first row of the CSV file as reference. This
 * way the column order does not matter.
 *
 * @param <T> Type of the bean to be returned
 */
public class HeaderAnnotationMappingStrategy<T> extends HeaderNameBaseMappingStrategy<T> {

  private boolean skipHeader = false;

  /**
   * Default constructor.
   */
  public HeaderAnnotationMappingStrategy() {
    super();
  }

  public HeaderAnnotationMappingStrategy(boolean skipHeader) {
    super();
    this.skipHeader = skipHeader;
  }

  @Override
  protected void initializeFieldMap() {
    fieldMap = new CustomFieldMapByName<>(errorLocale);
    fieldMap.setColumnOrderOnWrite(writeOrder);
  }

  @Override
  public void captureHeader(CSVReader reader) throws IOException, CsvRequiredFieldEmptyException {
    // Validation
    if (type == null) {
      throw new IllegalStateException(ResourceBundle
          .getBundle(ICSVParser.DEFAULT_BUNDLE_NAME, errorLocale).getString("type.unset"));
    }

    // Read the header
    String[] header =
        ObjectUtils.defaultIfNull(reader.readNextSilently(), ArrayUtils.EMPTY_STRING_ARRAY);
    header =
        Arrays.asList(header).stream().map(h -> h.replaceAll("\\p{C}", "")).toArray(String[]::new);
    headerIndex.initializeHeaderIndex(header);

    // Throw an exception if any required headers are missing
    List<FieldMapByNameEntry<T>> missingRequiredHeaders =
        fieldMap.determineMissingRequiredHeaders(header);
    if (!missingRequiredHeaders.isEmpty()) {
      String[] requiredHeaderNames = new String[missingRequiredHeaders.size()];
      List<Field> requiredFields = new ArrayList<>(missingRequiredHeaders.size());
      for (int i = 0; i < missingRequiredHeaders.size(); i++) {
        FieldMapByNameEntry<T> fme = missingRequiredHeaders.get(i);
        if (fme.isRegexPattern()) {
          requiredHeaderNames[i] =
              String.format(ResourceBundle.getBundle(ICSVParser.DEFAULT_BUNDLE_NAME, errorLocale)
                  .getString("matching"), fme.getName());
        } else {
          requiredHeaderNames[i] = fme.getName();
        }
        requiredFields.add(fme.getField().getField());
      }
      String missingRequiredFields = String.join(", ", requiredHeaderNames);
      String allHeaders = String.join(",", header);
      CsvRequiredFieldEmptyException e = new CsvRequiredFieldEmptyException(type, requiredFields,
          String.format(ResourceBundle.getBundle(ICSVParser.DEFAULT_BUNDLE_NAME, errorLocale)
              .getString("header.required.field.absent"), missingRequiredFields, allHeaders));
      e.setLine(header);
      throw e;
    }
  }

  @Override
  public String[] generateHeader(T bean) throws CsvRequiredFieldEmptyException {
    // Default
    if (type == null) {
      throw new IllegalStateException(ResourceBundle
          .getBundle(ICSVParser.DEFAULT_BUNDLE_NAME, errorLocale).getString("type.before.header"));
    }

    // Always take what's been given or previously determined first.
    if (headerIndex.isEmpty()) {
      String[] header = getFieldMap().generateHeader(bean);
      headerIndex.initializeHeaderIndex(header);
      // return header;
    }

    int numColumns = headerIndex.findMaxIndex();
    // final int numColumns = FieldUtils.getAllFields(bean.getClass()).length;
    // super.setColumnMapping(new String[numColumns]);

    if (numColumns == -1) {
      return super.generateHeader(bean);
    }
    if (skipHeader) {
      return ArrayUtils.EMPTY_STRING_ARRAY;
    }


    // Otherwise, put headers in the right places.
    return headerIndex.getHeaderIndex();
  }

  /**
   * Creates a map of annotated fields in the bean to be processed.
   * <p>
   * This method is called by {@link #loadFieldMap()} when at least one relevant annotation is found
   * on a member variable.
   * </p>
   */
  @Override
  protected void loadAnnotatedFieldMap(ListValuedMap<Class<?>, Field> fields) {
    boolean required;
    // .replaceAll("\\p{C}", "")
    for (Map.Entry<Class<?>, Field> classField : fields.entries()) {
      Class<?> localType = classField.getKey();
      Field localField = classField.getValue();
      String columnName, locale, writeLocale, capture, format;

      // Always check for a custom converter first.
      if (localField.isAnnotationPresent(CsvCustomBindByName.class)) {
        CsvCustomBindByName annotation = localField.getAnnotation(CsvCustomBindByName.class);
        columnName = annotation.column().replaceAll("\\p{C}", "").trim();
        if (StringUtils.isEmpty(columnName)) {
          columnName = localField.getName().replaceAll("\\p{C}", "");
        }
        @SuppressWarnings("unchecked")
        Class<? extends AbstractBeanField<T, String>> converter =
            (Class<? extends AbstractBeanField<T, String>>) localField
                .getAnnotation(CsvCustomBindByName.class).converter();
        BeanField<T, String> bean = instantiateCustomConverter(converter);
        bean.setType(localType);
        bean.setField(localField);
        required = annotation.required();
        bean.setRequired(required);
        fieldMap.put(columnName, bean);
      }

      // Then check for a collection
      else if (localField.isAnnotationPresent(CsvBindAndSplitByName.class)) {
        CsvBindAndSplitByName annotation = localField.getAnnotation(CsvBindAndSplitByName.class);
        required = annotation.required();
        columnName = annotation.column().replaceAll("\\p{C}", "").trim();
        locale = annotation.locale();
        writeLocale = annotation.writeLocaleEqualsReadLocale() ? locale : annotation.writeLocale();
        String splitOn = annotation.splitOn();
        String writeDelimiter = annotation.writeDelimiter();
        Class<? extends Collection> collectionType = annotation.collectionType();
        Class<?> elementType = annotation.elementType();
        Class<? extends AbstractCsvConverter> splitConverter = annotation.converter();
        capture = annotation.capture();
        format = annotation.format();

        CsvConverter converter =
            determineConverter(localField, elementType, locale, writeLocale, splitConverter);
        if (StringUtils.isEmpty(columnName)) {
          fieldMap.put(localField.getName().replaceAll("\\p{C}", ""),
              new BeanFieldSplit<>(localType, localField, required, errorLocale, converter, splitOn,
                  writeDelimiter, collectionType, capture, format));
        } else {
          fieldMap.put(columnName, new BeanFieldSplit<>(localType, localField, required,
              errorLocale, converter, splitOn, writeDelimiter, collectionType, capture, format));
        }
      }

      // Then for a multi-column annotation
      else if (localField.isAnnotationPresent(CsvBindAndJoinByName.class)) {
        CsvBindAndJoinByName annotation = localField.getAnnotation(CsvBindAndJoinByName.class);
        required = annotation.required();
        String columnRegex = annotation.column();
        locale = annotation.locale();
        writeLocale = annotation.writeLocaleEqualsReadLocale() ? locale : annotation.writeLocale();
        Class<?> elementType = annotation.elementType();
        Class<? extends MultiValuedMap> mapType = annotation.mapType();
        Class<? extends AbstractCsvConverter> joinConverter = annotation.converter();
        capture = annotation.capture();
        format = annotation.format();

        CsvConverter converter =
            determineConverter(localField, elementType, locale, writeLocale, joinConverter);
        if (StringUtils.isEmpty(columnRegex)) {
          fieldMap.putComplex(localField.getName(), new BeanFieldJoinStringIndex<>(localType,
              localField, required, errorLocale, converter, mapType, capture, format));
        } else {
          fieldMap.putComplex(columnRegex, new BeanFieldJoinStringIndex<>(localType, localField,
              required, errorLocale, converter, mapType, capture, format));
        }
      }

      // Otherwise it must be CsvBindByName.
      else {
        CsvBindByName annotation = localField.getAnnotation(CsvBindByName.class);
        required = annotation.required();
        columnName = annotation.column().replaceAll("\\p{C}", "").trim();
        locale = annotation.locale();
        writeLocale = annotation.writeLocaleEqualsReadLocale() ? locale : annotation.writeLocale();
        capture = annotation.capture();
        format = annotation.format();
        CsvConverter converter =
            determineConverter(localField, localField.getType(), locale, writeLocale, null);

        if (StringUtils.isEmpty(columnName)) {
          fieldMap.put(localField.getName().replaceAll("\\p{C}", ""), new BeanFieldSingleValue<>(
              localType, localField, required, errorLocale, converter, capture, format));
        } else {
          fieldMap.put(columnName, new BeanFieldSingleValue<>(localType, localField, required,
              errorLocale, converter, capture, format));
        }
      }
    }
  }

  /**
   * Returns a set of the annotations that are used for binding in this mapping strategy.
   * <p>
   * In this mapping strategy, those are currently:
   * <ul>
   * <li>{@link CsvBindByName}</li>
   * <li>{@link CsvCustomBindByName}</li>
   * <li>{@link CsvBindAndJoinByName}</li>
   * <li>{@link CsvBindAndSplitByName}</li>
   * </ul>
   * </p>
   */
  @Override
  protected Set<Class<? extends Annotation>> getBindingAnnotations() {
    // With Java 9 this can be done more easily with Set.of()
    return new HashSet<>(Arrays.asList(CsvBindByName.class, CsvCustomBindByName.class,
        CsvBindAndSplitByName.class, CsvBindAndJoinByName.class));
  }

  protected String getColumnName(int col) {
    // headerIndex is never null because it's final
    return headerIndex.getByPosition(col);
  }

  @Override
  protected BeanField<T, String> findField(int col) throws CsvBadConverterException {
    BeanField<T, String> beanField = null;
    String columnName = getColumnName(col);
    if (columnName == null) {
      return null;
    }
    columnName = columnName.trim();
    if (!columnName.isEmpty()) {
      beanField = fieldMap.get(columnName);
    }
    return beanField;
  }

  @Override
  protected void loadUnadornedFieldMap(ListValuedMap<Class<?>, Field> fields) {
    for (Map.Entry<Class<?>, Field> classFieldEntry : fields.entries()) {
      if (!(Serializable.class.isAssignableFrom(classFieldEntry.getKey())
          && "serialVersionUID".equals(classFieldEntry.getValue().getName()))) {
        CsvConverter converter = determineConverter(classFieldEntry.getValue(),
            classFieldEntry.getValue().getType(), null, null, null);
        fieldMap.put(classFieldEntry.getValue().getName(),
            new BeanFieldSingleValue<>(classFieldEntry.getKey(), classFieldEntry.getValue(), false,
                errorLocale, converter, null, null));
      }
    }
  }
}
