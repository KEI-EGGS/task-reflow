package dev.keisuzuki.taskreflow.task;

import java.time.LocalDate;

/**
 * タスク作成リクエストの本文．クライアントが決めてよい項目だけを持つ．
 *
 * <p>id・userId・position・status・createdAt は受け取らない．
 * id と createdAt は DB が，userId と position はサーバーが決め，status は DB の DEFAULT が 'todo' を入れる．
 *
 * @param title         タスク名
 * @param description   補足．省略可（null）
 * @param minutes       見積もり時間（分）
 * @param scheduledDate 予定日
 */
public record TaskCreateRequest(
    String title,
    String description,
    int minutes,
    LocalDate scheduledDate) {
}
