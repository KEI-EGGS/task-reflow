package dev.keisuzuki.taskreflow.task;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * tasks テーブルの1行．DB から読み出した値をそのまま持つ．
 *
 * <p>生成されるのは DB から読んだときだけなので，全フィールドが埋まっている前提で扱える．
 *
 * @param id            DB が採番した ID
 * @param userId        所有者．認証を入れるまではサーバー側の固定値が入る
 * @param title         タスク名
 * @param description   補足．未入力なら null
 * @param position      同じ user_id・同じ scheduled_date の中での並び順（1 始まり）
 * @param minutes       見積もり時間（分）
 * @param scheduledDate 予定日
 * @param status        タスクの状態
 * @param createdAt     作成時刻．DB の DEFAULT now() が入れる
 */
public record Task(
    long id,
    long userId,
    String title,
    String description,
    int position,
    int minutes,
    LocalDate scheduledDate,
    TaskStatus status,
    LocalDateTime createdAt) {
}
