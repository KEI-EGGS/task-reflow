package dev.keisuzuki.taskreflow.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    @NotBlank(message = "タスク名を入力してください")
    String title,

    String description,

    @Positive(message = "見積もり時間は1分以上にしてください")
    @Max(value = 1440, message = "見積もり時間は1日（1440分）以内にしてください")
    int minutes,

    @NotNull(message = "予定日を選んでください")
    LocalDate scheduledDate) {
}
