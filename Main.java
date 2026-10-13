package org.example;

import com.fastcgi.FCGIInterface;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Main {
    private static final List<String> results = new ArrayList<>();

    public static void main(String[] args) throws IOException{
        FCGIInterface fcgi = new FCGIInterface();

        while (fcgi.FCGIaccept() >= 0) {
            long start = System.nanoTime();
            Properties requestParams = FCGIInterface.request.params;
            String requestMethod = requestParams.getProperty("REQUEST_METHOD");

            if ("GET".equals(requestMethod)) {
                System.out.println("HTTP/1.1 200 OK");
                System.out.println("Content-Type: application/json; charset=UTF-8");
                System.out.println();

                System.out.println("{");
                System.out.println("\"serverTime\": " + System.currentTimeMillis() + ",");
                System.out.println("\"execMs\": " + (System.nanoTime() - start) / 1_000_000.0 + ",");
                System.out.println("\"results\": [");
                for (int i = 0; i < results.size(); i++) {
                    System.out.print("\"" + results.get(i) + "\"");
                    if (i < results.size() - 1) {
                        System.out.print(",");
                    }
                }

                System.out.println();
                System.out.println("]");
                System.out.println("}");
                continue;
            }

            if (!"POST".equals(requestMethod)) {
                System.out.println("HTTP/1.1 405 Method Not Allowed");
                System.out.println("Allow: POST");
                System.out.println("Content-Type: text/plain; charset=UTF-8");
                System.out.println();
                System.out.println("Method not allowed");

                continue;
            }

            String contentLength = requestParams.getProperty("CONTENT_LENGTH");

            int length;
            try {
                length = Integer.parseInt(contentLength);
            } catch (NumberFormatException | NullPointerException e) {
                System.out.println("HTTP/1.1 400 Bad Request");
                System.out.println("Content-Type: text/plain; charset=UTF-8");
                System.out.println();
                System.out.println("Invalid Content-Length");
                continue;
            }

            if (length <= 0) {
                System.out.println("HTTP/1.1 400 Bad Request");
                System.out.println("Content-Type: text/plain; charset=UTF-8");
                System.out.println();
                System.out.println("Empty request body");
                continue;
            }

            byte[] bodyBytes = System.in.readNBytes(length);
            String body = new String(bodyBytes, StandardCharsets.UTF_8);

            String[] parts = body.split("&");

            if (parts.length != 3) {
                System.out.println("HTTP/1.1 400 Bad Request");
                System.out.println("Content-Type: text/plain; charset=UTF-8");
                System.out.println();
                System.out.println("Invalid input");
                continue;
            }

            String[] xPair = parts[0].split("=", -1);
            String[] yPair = parts[1].split("=", -1);
            String[] rPair = parts[2].split("=", -1);

            if (xPair.length != 2 || yPair.length != 2 || rPair.length != 2
                    || !xPair[0].equals("x")
                    || !yPair[0].equals("y")
                    || !rPair[0].equals("r")
                    || xPair[1].isEmpty()
                    || yPair[1].isEmpty()
                    || rPair[1].isEmpty()) {
                System.out.println("HTTP/1.1 400 Bad Request");
                System.out.println("Content-Type: text/plain; charset=UTF-8");
                System.out.println();
                System.out.println("Invalid input");
                continue;
            }

            double x;
            double y;
            double r;

            try {
                x = Double.parseDouble(xPair[1]);
                y = Double.parseDouble(yPair[1]);
                r = Double.parseDouble(rPair[1]);
            } catch (NumberFormatException e) {
                System.out.println("HTTP/1.1 400 Bad Request");
                System.out.println("Content-Type: text/plain; charset=UTF-8");
                System.out.println();
                System.out.println("Invalid input");
                continue;
            }


            double[] allowedX = {-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2};
            boolean validX = false;
            for (double Xi : allowedX) {
                if(x == Xi) {
                    validX = true;
                }
            }

            boolean validY = y >= -3 && y <= 3;

            double[] allowedR = { 1, 1.5, 2, 2.5, 3};
            boolean validR = false;
            for (double Ri : allowedR) {
                if(r == Ri) {
                    validR = true;
                }
            }

            if (!validX || !validY || !validR) {
                System.out.println("HTTP/1.1 400 Bad Request");
                System.out.println("Content-Type: text/plain");
                System.out.println();
                System.out.println("Invalid input");
                continue;
            }

            boolean hit = isHit(x, y, r);
            String timestamp = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss"));

            double execMs = (System.nanoTime() - start) / 1_000_000.0;
            results.add(x + "," + y + "," + r + "," + hit + "," + System.currentTimeMillis() + "," + execMs);


            System.out.println("HTTP/1.1 200 OK");
            System.out.println("Content-Type: application/json; charset=UTF-8");
            System.out.println();

            System.out.println("{");
            System.out.println("\"x\": " + x + ",");
            System.out.println("\"y\": " + y + ",");
            System.out.println("\"r\": " + r + ",");
            System.out.println("\"hit\": " + hit + ",");
            System.out.println("\"serverTime\": " + System.currentTimeMillis() + ",");
            System.out.println("\"execMs\": " + (System.nanoTime() - start) / 1_000_000.0 + ",");
            System.out.println("\"results\": [");

            for (int i = 0; i < results.size(); i++) {
                System.out.print("\"" + results.get(i) + "\"");
                if (i < results.size() - 1) {
                    System.out.print(",");
                }
            }

            System.out.println();
            System.out.println("]");
            System.out.println("}");

        }
    }
    public static boolean isInRectangle(double x, double y, double r) {
        return x >= -r && x <= 0 && y >= -r / 2 && y <= 0;
    }

    public static boolean isInCircle(double x, double y, double r) {
        return x >= 0 && y >= 0 && x * x + y * y <= r * r;
    }

    public static boolean isInTriangle(double x, double y, double r) {
        return x >= 0 && y <= 0 && y >= 2 * x - r;
    }

    public static boolean isHit(double x, double y, double r) {
        return isInRectangle(x, y, r) || isInCircle(x, y, r) || isInTriangle(x, y, r);
    }
}

