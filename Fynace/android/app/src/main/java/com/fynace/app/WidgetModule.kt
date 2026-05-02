package com.fynace.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class WidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "WidgetModule"

    @ReactMethod
    fun updateWidget(data: ReadableMap) {
        val context = reactApplicationContext
        val prefs = context.getSharedPreferences("FynaceWidget", Context.MODE_PRIVATE)
        val editor = prefs.edit()

        if (data.hasKey("amount")) editor.putString("amount", data.getString("amount"))
        if (data.hasKey("range")) editor.putString("range", data.getString("range"))
        if (data.hasKey("progress")) editor.putInt("progress", data.getInt("progress"))
        
        if (data.hasKey("cat1")) editor.putString("cat1", data.getString("cat1"))
        if (data.hasKey("cat2")) editor.putString("cat2", data.getString("cat2"))
        if (data.hasKey("cat3")) editor.putString("cat3", data.getString("cat3"))
        
        if (data.hasKey("weight1")) editor.putFloat("weight1", data.getDouble("weight1").toFloat())
        if (data.hasKey("weight2")) editor.putFloat("weight2", data.getDouble("weight2").toFloat())
        if (data.hasKey("weight3")) editor.putFloat("weight3", data.getDouble("weight3").toFloat())

        editor.apply()

        // Trigger widget update
        val intent = Intent(context, FynaceWidget::class.java)
        intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val componentName = ComponentName(context, FynaceWidget::class.java)
        val ids = appWidgetManager.getAppWidgetIds(componentName)
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        context.sendBroadcast(intent)
    }
}
