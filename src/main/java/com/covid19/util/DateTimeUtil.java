package com.covid19.util;

import static java.time.format.DateTimeFormatter.ISO_DATE;
import static java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME;
import static org.springframework.util.StringUtils.isEmpty;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.joda.time.format.PeriodFormatter;
import org.joda.time.format.PeriodFormatterBuilder;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DateTimeUtil extends DateUtils {

  private static final DateTimeFormatter HUMAN_READABLE_DATE_TIME_FORMAT =
      DateTimeFormatter.ofPattern("dd.MM.yyyy - HH:mm:ss");

  private static final DateTimeFormatter TRACK_A_BUS_DATE_TIME_FORMAT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

  private static final DateTimeFormatter SIMPLE_TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

  private static final DateTimeFormatter GTFS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

  private static final DateTimeFormatter FILE_DATE_FORMAT =
      DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

  private static final PeriodFormatter TIME_DURATION_FORMAT = new PeriodFormatterBuilder()
      .appendHours().appendSuffix("h ").appendMinutes().appendSuffix("m").toFormatter();

  private static final DateTimeFormatter TIME_AM_PM_FORMAT =
      new DateTimeFormatterBuilder().appendPattern("h:mm a").toFormatter();

  private static final DateTimeFormatter TRIP_ID_TIME_FORMAT =
      new DateTimeFormatterBuilder().appendPattern("HH:mm").toFormatter();

  private DateTimeUtil() {
    throw new IllegalStateException("Cannot instantiate this static class");
  }

  public static LocalDate toLocalDate(long timestampMillis) {
    if (timestampMillis != 0) {
      return Instant.ofEpochMilli(getTimestampInMillis(timestampMillis)).atZone(ZoneId.of("UTC"))
          .toLocalDate();
    }
    return null;
  }

  public static LocalTime toLocalTime(long timestampMillis) {
    if (timestampMillis != 0) {
      return Instant.ofEpochMilli(getTimestampInMillis(timestampMillis)).atZone(ZoneId.of("UTC"))
          .toLocalTime();
    }
    return null;
  }

  public static LocalDateTime toLocalDateTime(long timestampMillis, String zone) {
    if (timestampMillis != 0 && zone != null) {
      return LocalDateTime.ofInstant(Instant.ofEpochMilli(getTimestampInMillis(timestampMillis)),
          ZoneId.of(zone));
    }
    return null;
  }

  public static ZonedDateTime parseOffsetDateTimeWithMillistoLocalTime(String dateTimeString) {
    if (dateTimeString != null) {
      return ZonedDateTime.parse(dateTimeString, TRACK_A_BUS_DATE_TIME_FORMAT);
    }
    return null;
  }

  public static ZonedDateTime parseToZonedDateTime(String dateTimeString) {
    try {
      return ZonedDateTime.parse(dateTimeString, RFC_1123_DATE_TIME);
    } catch (DateTimeParseException ex1) {
      try {
        LocalDate date = ISO_DATE.parse(dateTimeString, LocalDate::from);
        return date.atStartOfDay(ZoneId.of("UTC"));
      } catch (DateTimeParseException ex2) {
        log.warn("Cannot parse date {}", dateTimeString, ex2);
      }
    }
    return null;
  }

  public static LocalDate toLocalDate(String dateString) {
    if (dateString != null) {
      return ISO_DATE.parse(dateString, LocalDate::from);
    }
    return null;
  }

  public static LocalDate toLocalDateFromGtfsDate(String dateString) {
    if (dateString != null) {
      try {
        return GTFS_DATE_FORMAT.parse(dateString, LocalDate::from);
      } catch (DateTimeParseException ex) {
        return ISO_DATE.parse(dateString, LocalDate::from);
      }
    }
    return null;
  }

  public static String formatToTripIdTime(LocalTime time) {
    if (time != null) {
      return TRIP_ID_TIME_FORMAT.format(time);
    }
    return null;
  }

  public static String formatToSimpleTime(LocalTime time) {
    if (time != null) {
      return SIMPLE_TIME_FORMAT.format(time);
    }
    return null;
  }

  public static long formatToFileStamp(LocalDateTime time) {
    if (time != null) {
      return Long.valueOf(FILE_DATE_FORMAT.format(time));
    }
    return 0;
  }

  public static String formatToHumanReadable(LocalDateTime localDateTime) {
    if (localDateTime != null) {
      return HUMAN_READABLE_DATE_TIME_FORMAT.format(localDateTime);
    }
    return null;
  }

  public static String formatToHumanReadable(long timestampMillis, String zone) {
    if (timestampMillis != 0 && zone != null) {
      return HUMAN_READABLE_DATE_TIME_FORMAT
          .format(toLocalDateTime(getTimestampInMillis(timestampMillis), zone));
    }
    return null;
  }

  public static long getTimestampInMillis(long timestamp) {
    if (timestamp == 0) {
      log.trace("Timestamp is not set");
      return timestamp;
    }
    int numberOfDigits = (int) (Math.log10(timestamp) + 1);

    if (numberOfDigits < 10) {
      log.trace("Timestamp is far in the past or cannot be parsed");
    } else if (numberOfDigits == 10 || numberOfDigits == 11) {
      log.trace("Timestamp is in Seconds");
      return timestamp * 1000;
    } else if (numberOfDigits == 13 || numberOfDigits == 14) {
      log.trace("Timestamp is already in Milli Seconds");
      return timestamp;
    } else if (numberOfDigits == 16 || numberOfDigits == 17) {
      log.trace("Timestamp is in Micro Seconds");
      return timestamp / 1000;
    }
    return timestamp;
  }


  // Possible duplicate methods
  public static String toStringLocalDateTime(final LocalDateTime localDateTime) {
    if (!isEmpty(localDateTime)) {
      return localDateTime.toString();
    }
    return null;
  }

  public static LocalDateTime fromStringLocalDateTime(final String stringLocalDateTime) {
    if (!isEmpty(stringLocalDateTime)) {
      try {
        return LocalDateTime.parse(stringLocalDateTime);
      } catch (Exception e) {
        return null;
      }
    }
    return null;
  }

  public static String toStringLocalTime(final LocalTime localTime) {
    if (!isEmpty(localTime)) {
      return localTime.toString();
    }
    return null;
  }

  public static LocalTime fromStringLocalTime(final String stringLocalTime) {
    if (!isEmpty(stringLocalTime)) {
      try {
        return LocalTime.parse(stringLocalTime);
      } catch (Exception e) {
        return null;
      }
    }
    return null;
  }

  public static String formatToSimpleDate(LocalDate date) {
    if (date != null) {
      return ISO_DATE.format(date);
    }
    return null;
  }

  public static Duration parseDurationString(String timeDurationString) {
    return Duration.ofMillis(TIME_DURATION_FORMAT.parsePeriod(timeDurationString).getMillis());
  }

  public static LocalTime parseTimeAmPmString(String timeAmPmString) {
    return LocalTime.from(TIME_AM_PM_FORMAT
        .parse(timeAmPmString.toLowerCase().replace("p", " p").replace("a", " a").toUpperCase()));
  }

  public static LocalTime parseGtfsTime(String gtfsTime) {
    if (!StringUtils.isBlank(gtfsTime)) {
      String[] hoursMinutesSeconds = gtfsTime.split(":");
      int hours = new Integer(hoursMinutesSeconds[0]);
      int minutes = new Integer(hoursMinutesSeconds[1]);
      int seconds = new Integer(hoursMinutesSeconds[2]);
      hours = (hours >= 24) ? (hours - 24) : hours;
      return LocalTime.of(hours, minutes, seconds);
    }
    return LocalTime.MIDNIGHT;
  }

}
