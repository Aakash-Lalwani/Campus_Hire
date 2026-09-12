package com.campushire.util;

import com.campushire.dto.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class ResponseUtil {

    public static void sendJson(HttpServletResponse response, int statusCode, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);
        PrintWriter out = response.getWriter();
        out.print(JsonUtil.toJson(data));
        out.flush();
    }

    public static <T> void sendSuccess(HttpServletResponse response, int statusCode, T data) throws IOException {
        sendJson(response, statusCode, ApiResponse.success(data));
    }

    public static <T> void sendSuccess(HttpServletResponse response, int statusCode, T data, int count) throws IOException {
        sendJson(response, statusCode, ApiResponse.success(data, count));
    }

    public static void sendError(HttpServletResponse response, int statusCode, String message, String errorCode) throws IOException {
        sendJson(response, statusCode, ApiResponse.error(message, errorCode));
    }
}
