package dev.keisuzuki.taskreflow.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * タスク更新リクエストの本文．省略された項目は null として扱うので，
 * クライアントは変えない項目も現在の値を入れて送る．
 *
 * <p>scheduled_date と position は含めない．日をまたぐ移動と並べ替えは
 * 同じ日の他の行の position も触るため，1件の書き換えでは完結しない．
 *
 * @param title       タスク名
 * @param description 補足．省略可（null）
 * @param minutes     見積もり時間（分）
 * @param status      todo / done / carryover
 */
public record TaskUpdateRequest(
    @NotBlank(message = "タスク名を入力してください")
    String title,

    String description,

    @Positive(message = "見積もり時間は1分以上にしてください")
    @Max(value = 1440, message = "見積もり時間は1日（1440分）以内にしてください")
    int minutes,

    @NotNull(message = "状態を選んでください")
    TaskStatus status) {
}
