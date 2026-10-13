package dev.keisuzuki.taskreflow.task;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * タスクの状態．DB の tasks.status と 1 対 1 で対応する．
 *
 * <p>DB と JSON では小文字（'todo' など），Java の定数名は大文字という慣習の差があるため，
 * 対応する文字列を value として持つ．
 */
public enum TaskStatus {
    TODO("todo"),
    DONE("done"),
    CARRYOVER("carryover");

    private final String value;

    TaskStatus(String value) {
        this.value = value;
    }

    /** DB の status 列と JSON の両方で使う文字列を返す． */
    @JsonValue
    public String value() {
        return value;
    }

    /**
     * DB から読んだ文字列を enum に戻す．
     *
     * @throws IllegalArgumentException CHECK 制約にない値だったとき
     */
    public static TaskStatus from(String value) {
        for (TaskStatus status : values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("未知の status: " + value);
    }
}
