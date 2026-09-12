package com.campushire.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.io.InputStream;
import java.util.Properties;

public class DBUtil {
    private static String url = "jdbc:mysql://localhost:3306/campushire?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static String username = "root";
    private static String password = "root";

    static {
        try {
            // Explicitly load MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            // Try loading db.properties if available
            try (InputStream input = DBUtil.class.getClassLoader().getResourceAsStream("db.properties")) {
                if (input != null) {
                    Properties prop = new Properties();
                    prop.load(input);
                    if (prop.getProperty("db.url") != null) url = prop.getProperty("db.url");
                    if (prop.getProperty("db.username") != null) username = prop.getProperty("db.username");
                    if (prop.getProperty("db.password") != null) password = prop.getProperty("db.password");
                }
            } catch (Exception ignored) {}

            // Override with environment variables if specified
            String envUrl = System.getenv("DB_URL");
            String envUser = System.getenv("DB_USER");
            String envPass = System.getenv("DB_PASS");

            if (envUrl != null && !envUrl.isBlank()) url = envUrl;
            if (envUser != null && !envUser.isBlank()) username = envUser;
            if (envPass != null && !envPass.isBlank()) password = envPass;

        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver not found in classpath: " + e.getMessage());
        }
    }

    /**
     * Obtains a direct database connection via DriverManager.
     * Callers MUST manage connections using try-with-resources.
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }
}
