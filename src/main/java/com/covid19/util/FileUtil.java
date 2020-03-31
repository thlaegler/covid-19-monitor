package com.covid19.util;

import static java.util.stream.Collectors.toList;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Writer;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import lombok.extern.slf4j.Slf4j;


@Slf4j
public class FileUtil {

  public static String buildFilePath(String fileExtension, String... segments) {
    String pathName = buildPath(segments);
    if (!StringUtils.isBlank(fileExtension)) {
      pathName = String.join(".", pathName, fileExtension);
    }
    return pathName;
  }

  public static String buildPath(String... segments) {
    return String.join(File.separator, segments);
  }

  public static InputStream downloadFileAsStream(String urlString) {
    log.trace("Downloading latest GTFS ZIP file from " + urlString);
    try {
      URL url = new URL(urlString);
      URLConnection urlConnect = url.openConnection();
      urlConnect.setDoInput(true);
      urlConnect.setDoOutput(true);
      InputStream in = urlConnect.getInputStream();
      log.trace("Successfully downloaded GTFS ZIP file from {}", urlString);
      return in;
    } catch (IOException ex) {
      log.error("Cannot read/open download link {}", urlString, ex);
    }
    return null;
  }

  public static void saveStringToFileName(String jsonString, String fileName) {
    try {
      Path path = Paths.get(fileName);
      byte[] strToBytes = jsonString.getBytes();
      Files.write(path, strToBytes);
    } catch (Exception ex) {
      log.error("Cannot serialize data to file {}", fileName, ex);
    }
  }

  public static void downloadFileNative(String urlString, String targetfilePath,
      String authHeader) {
    try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
      URL url = new URL(urlString);
      HttpGet httpGet = new HttpGet(url.toString());
      if (authHeader != null) {
        httpGet.addHeader("authorization", authHeader);
      }
      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);
      HttpEntity entity = httpResponse.getEntity();

      if (entity != null) {
        FileUtils.copyInputStreamToFile(entity.getContent(), new File(targetfilePath));
      }

      httpGet.releaseConnection();
    } catch (Exception ex) {
      log.error("Cannot save file {} to {}", targetfilePath, urlString);
    }
  }

  public static List<String> getListOfSubDirs(String dirPath) {
    try {
      return Files.walk(Paths.get(dirPath).toAbsolutePath()).filter(Files::isDirectory)
          .map(x -> x.getFileName().toString()).collect(toList());
    } catch (IOException ex) {
      log.error("Cannot find dir {}", dirPath);
      return Collections.emptyList();
    }
  }

  public static List<String> getListOfDirFiles(String dirPath, String fileEnding) {
    try {
      return Files.walk(Paths.get(dirPath).toAbsolutePath())
          .filter(
              x -> !Files.isDirectory(x) && (fileEnding != null ? x.endsWith(fileEnding) : true))
          .map(x -> x.getFileName().toString()).collect(toList());
    } catch (IOException ex) {
      log.error("Cannot find dir {}", dirPath);
      return Collections.emptyList();
    }
  }

  public static ByteArrayOutputStream cloneByteArray(InputStream input) throws IOException {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    byte[] buffer = new byte[1024];
    int len;
    while ((len = input.read(buffer)) > -1) {
      baos.write(buffer, 0, len);
    }
    baos.flush();
    return baos;
  }

  public static Writer getFileWriter(String filePath) {
    Writer fileWriter = null;
    File file = createFile(filePath);
    try {
      fileWriter = Files.newBufferedWriter(Paths.get(file.toURI()));
    } catch (IOException ex) {
      log.error("Cannot write to file {}", filePath);
    }
    return fileWriter;
  }

  public static File createFile(String filePath) {
    File file = new File(filePath);
    try {
      if (file.getParentFile() != null && !file.getParentFile().exists())
        file.getParentFile().mkdirs();
      if (!file.exists())
        file.createNewFile();
      if (!file.canWrite()) {
        throw new IOException("File not writable");
      }
    } catch (IOException ex) {
      log.error("Cannot write to file {}", filePath);
    }
    return file;

  }
}
