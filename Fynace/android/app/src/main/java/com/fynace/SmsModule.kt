package com.fynace

import android.content.ContentResolver
import android.database.Cursor
import android.net.Uri
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONObject

class SmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SmsModule"
    }

    @ReactMethod
    fun listSms(filter: String, errorCallback: Callback, successCallback: Callback) {
        try {
            val jsonFilter = JSONObject(filter)
            val box = if (jsonFilter.has("box")) jsonFilter.getString("box") else "inbox"
            val uri = Uri.parse("content://sms/$box")
            
            val cr: ContentResolver = reactApplicationContext.contentResolver
            
            // Default selection: all
            var selection = ""
            val selectionArgs = mutableListOf<String>()

            if (jsonFilter.has("minDate")) {
                selection += "date >= ?"
                selectionArgs.add(jsonFilter.getLong("minDate").toString())
            }
            if (jsonFilter.has("maxDate")) {
                if (selection.isNotEmpty()) selection += " AND "
                selection += "date <= ?"
                selectionArgs.add(jsonFilter.getLong("maxDate").toString())
            }

            val cursor: Cursor? = cr.query(
                uri,
                arrayOf("_id", "thread_id", "address", "person", "date", "body", "read", "type"),
                if (selection.isEmpty()) null else selection,
                if (selectionArgs.isEmpty()) null else selectionArgs.toTypedArray(),
                "date DESC"
            )

            val smsList = JSONArray()
            cursor?.use {
                var count = 0
                val maxCount = if (jsonFilter.has("maxCount")) jsonFilter.getInt("maxCount") else 100
                
                while (it.moveToNext() && count < maxCount) {
                    val sms = JSONObject()
                    sms.put("_id", it.getString(it.getColumnIndexOrThrow("_id")))
                    sms.put("address", it.getString(it.getColumnIndexOrThrow("address")))
                    sms.put("date", it.getLong(it.getColumnIndexOrThrow("date")))
                    sms.put("body", it.getString(it.getColumnIndexOrThrow("body")))
                    smsList.put(sms)
                    count++
                }
            }

            successCallback.invoke(smsList.length(), smsList.toString())
            
        } catch (e: Exception) {
            errorCallback.invoke(e.message)
        }
    }
}
