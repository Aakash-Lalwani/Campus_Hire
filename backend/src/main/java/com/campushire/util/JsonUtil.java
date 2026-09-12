package com.campushire.util;

import com.google.gson.*;
import java.lang.reflect.Type;
import java.sql.Date;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;

public class JsonUtil {
    private static final Gson gson;
    private static final String DATE_FORMAT = "yyyy-MM-dd";
    private static final String TIMESTAMP_FORMAT = "yyyy-MM-dd HH:mm:ss";

    static {
        gson = new GsonBuilder()
                .registerTypeAdapter(Date.class, new JsonSerializer<Date>() {
                    @Override
                    public JsonElement serialize(Date src, Type typeOfSrc, JsonSerializationContext context) {
                        return new JsonPrimitive(new SimpleDateFormat(DATE_FORMAT).format(src));
                    }
                })
                .registerTypeAdapter(Date.class, new JsonDeserializer<Date>() {
                    @Override
                    public Date deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
                        try {
                            String s = json.getAsString();
                            if (s == null || s.isBlank()) return null;
                            return new Date(new SimpleDateFormat(DATE_FORMAT).parse(s).getTime());
                        } catch (Exception e) {
                            throw new JsonParseException(e);
                        }
                    }
                })
                .registerTypeAdapter(Timestamp.class, new JsonSerializer<Timestamp>() {
                    @Override
                    public JsonElement serialize(Timestamp src, Type typeOfSrc, JsonSerializationContext context) {
                        return new JsonPrimitive(new SimpleDateFormat(TIMESTAMP_FORMAT).format(src));
                    }
                })
                .registerTypeAdapter(Timestamp.class, new JsonDeserializer<Timestamp>() {
                    @Override
                    public Timestamp deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
                        try {
                            String s = json.getAsString();
                            if (s == null || s.isBlank()) return null;
                            // Support ISO T or space format
                            s = s.replace("T", " ");
                            if (s.length() == 10) s = s + " 00:00:00";
                            return new Timestamp(new SimpleDateFormat(TIMESTAMP_FORMAT).parse(s).getTime());
                        } catch (Exception e) {
                            throw new JsonParseException(e);
                        }
                    }
                })
                .setPrettyPrinting()
                .create();
    }

    public static String toJson(Object obj) {
        return gson.toJson(obj);
    }

    public static <T> T fromJson(String json, Class<T> classOfT) {
        return gson.fromJson(json, classOfT);
    }

    public static <T> T fromJson(String json, Type typeOfT) {
        return gson.fromJson(json, typeOfT);
    }
}
