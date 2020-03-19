package com.getcapacitor.plugin.http;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class FormUploader {
  private final String boundary;
  private static final String LINE_FEED = "\r\n";
  private HttpURLConnection httpConn;
  private String charset = "UTF-8";
  private OutputStream outputStream;
  private PrintWriter writer;

  /**
   * This constructor initializes a new HTTP POST request with content type
   * is set to multipart/form-data
   *
   * @param requestURL
   * @throws java.io.IOException
   */
  public FormUploader(String requestURL) throws IOException {
    // creates a unique boundary based on time stamp
    UUID uuid = UUID.randomUUID();
    boundary = uuid.toString();
    URL url = new URL(requestURL);
    httpConn = (HttpURLConnection) url.openConnection();
    httpConn.setUseCaches(false);
    httpConn.setDoOutput(true);    // indicates POST method
    httpConn.setDoInput(true);
    httpConn.setRequestProperty("Content-Type",
      "multipart/form-data; boundary=" + boundary);
    outputStream = httpConn.getOutputStream();
    writer = new PrintWriter(new OutputStreamWriter(outputStream, charset),
      true);
  }

  /**
   * Adds a form field to the request
   *
   * @param name  field name
   * @param value field value
   */
  public void addFormField(String name, String value) {
    writer.append("--" + boundary).append(LINE_FEED);
    writer.append("Content-Disposition: form-data; name=\"" + name + "\"")
      .append(LINE_FEED);
    writer.append("Content-Type: text/plain; charset=" + charset).append(
      LINE_FEED);
    writer.append(LINE_FEED);
    writer.append(value).append(LINE_FEED);
    writer.flush();
  }

  /**
   * Adds a upload file section to the request
   *
   * @param fieldName  name attribute in <input type="file" name="..." />
   * @param uploadFile a File to be uploaded
   * @throws IOException
   */
  public void addFilePart(String fieldName, File uploadFile)
    throws IOException {
    String fileName = uploadFile.getName();
    writer.append(LINE_FEED);
    writer.append("--" + boundary).append(LINE_FEED);
    writer.append(
      "Content-Disposition: form-data; name=\"" + fieldName
        + "\"; filename=\"" + fileName + "\"")
      .append(LINE_FEED);
    writer.append(
      "Content-Type: "
        + URLConnection.guessContentTypeFromName(fileName))
      .append(LINE_FEED)
      .append(LINE_FEED);
    //writer.append("Content-Transfer-Encoding: binary").append(LINE_FEED);
    // writer.append(LINE_FEED);
    writer.flush();

    FileInputStream inputStream = new FileInputStream(uploadFile);
    byte[] buffer = new byte[4096];
    int bytesRead = -1;
    while ((bytesRead = inputStream.read(buffer)) != -1) {
      outputStream.write(buffer, 0, bytesRead);
    }
    outputStream.flush();
    inputStream.close();
    writer.append(LINE_FEED).append("--" + boundary + "--").append(LINE_FEED);
    writer.flush();
  }

  /**
   * Adds a header field to the request.
   *
   * @param name  - name of the header field
   * @param value - value of the header field
   */
  public void addHeaderField(String name, String value) {
    writer.append(name + ": " + value).append(LINE_FEED);
    writer.flush();
  }

  /**
   * Completes the request and receives response from the server.
   *
   * @return a list of Strings as response in case the server returned
   * status OK, otherwise an exception is thrown.
   * @throws IOException
   */
  public List<String> finish() throws IOException {
    List<String> response = new ArrayList<>();
    writer.append(LINE_FEED).flush();
    writer.append("--" + boundary + "--").append(LINE_FEED);
    writer.close();

    // checks server's status code first
    int status = httpConn.getResponseCode();
    if (status == HttpURLConnection.HTTP_OK) {
      BufferedReader reader = new BufferedReader(new InputStreamReader(
        httpConn.getInputStream()));
      String line = null;
      while ((line = reader.readLine()) != null) {
        response.add(line);
      }
      reader.close();
      httpConn.disconnect();
    } else {
      throw new IOException("Server returned non-OK status: " + status);
    }
    return response;
  }
}
