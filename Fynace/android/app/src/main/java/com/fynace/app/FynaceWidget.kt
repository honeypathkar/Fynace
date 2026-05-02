package com.fynace.app
import com.fynace.app.R

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.TypedValue
import android.view.View
import android.widget.RemoteViews

class FynaceWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        private fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val prefs = context.getSharedPreferences("FynaceWidget", Context.MODE_PRIVATE)
            val amount = prefs.getString("amount", "₹0") ?: "₹0"
            
            val cat1 = prefs.getString("cat1", "") ?: ""
            val cat2 = prefs.getString("cat2", "") ?: ""
            val cat3 = prefs.getString("cat3", "") ?: ""
            
            val weight1 = prefs.getFloat("weight1", 0f)
            val weight2 = prefs.getFloat("weight2", 0f)
            val weight3 = prefs.getFloat("weight3", 0f)

            val views = RemoteViews(context.packageName, R.layout.fynace_widget)
            views.setTextViewText(R.id.widget_amount, amount)
            
            // Category Names and Visibility
            if (cat1.isNotEmpty()) {
                views.setViewVisibility(R.id.dot1, View.VISIBLE)
                views.setTextViewText(R.id.cat1_name, cat1)
            } else {
                views.setViewVisibility(R.id.dot1, View.GONE)
                views.setTextViewText(R.id.cat1_name, "")
            }

            if (cat2.isNotEmpty()) {
                views.setViewVisibility(R.id.dot2, View.VISIBLE)
                views.setTextViewText(R.id.cat2_name, cat2)
            } else {
                views.setViewVisibility(R.id.dot2, View.GONE)
                views.setTextViewText(R.id.cat2_name, "")
            }

            if (cat3.isNotEmpty()) {
                views.setViewVisibility(R.id.dot3, View.VISIBLE)
                views.setTextViewText(R.id.cat3_name, cat3)
            } else {
                views.setViewVisibility(R.id.dot3, View.GONE)
                views.setTextViewText(R.id.cat3_name, "")
            }
            
            // Segmented Progress Bar logic removed due to lack of standard RemoteViews weight support.
            // We can implement dynamic widths in the future if needed using setViewLayoutWidth on API 31+.

            // Create an Intent to launch MainActivity
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 
                0, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
